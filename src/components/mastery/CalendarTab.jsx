import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, Clock, Trash2, CheckCircle, Target, Brain, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import masteryService from '../../services/masteryService';
import { useAuth } from '../../contexts/AuthContext';
import { useMasteryRefresh } from '../../pages/Mastery';

const CalendarTab = () => {
  const { user, fetchProfile } = useAuth();
  const { triggerRefresh } = useMasteryRefresh();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [habits, setHabits] = useState([]);
  const [view, setView] = useState('month');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completionPopup, setCompletionPopup] = useState(null);


  // Helper function to get appropriate color for habits
  const getHabitColor = (title) => {
    const titleLower = title.toLowerCase();
    const root = document.documentElement;
    const computedStyle = window.getComputedStyle(root);
    
    if (titleLower.includes('read') || titleLower.includes('book')) {
      return computedStyle.getPropertyValue('--color-success').trim() || '#10b981';
    } else if (titleLower.includes('workout') || titleLower.includes('exercise') || titleLower.includes('gym')) {
      return computedStyle.getPropertyValue('--color-secondary').trim() || '#8b5cf6';
    } else if (titleLower.includes('build') || titleLower.includes('code') || titleLower.includes('program')) {
      return computedStyle.getPropertyValue('--color-info').trim() || '#3b82f6';
    } else if (titleLower.includes('meditation') || titleLower.includes('mindfulness')) {
      return computedStyle.getPropertyValue('--color-warning').trim() || '#f59e0b';
    } else if (titleLower.includes('journal') || titleLower.includes('write')) {
      return computedStyle.getPropertyValue('--color-error').trim() || '#ef4444';
    } else {
      return computedStyle.getPropertyValue('--text-secondary').trim() || '#6b7280';
    }
  };

  // Load habits data and convert to calendar events
  useEffect(() => {
    const loadHabitsAndEvents = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Load user habits
        const { data: userHabits, error: userHabitsError } = await masteryService.getUserHabits(user.id);
        if (userHabitsError) throw userHabitsError;

        // Load calendar events for current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

        // Transform user habits to include completion data
        const transformedHabits = await Promise.all(
          (userHabits || []).map(async (habit) => {
            // Get completions for the entire current month
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const { data: completions } = await masteryService.getHabitCompletions(
              user.id,
              habit.id,
              firstDayOfMonth.toISOString().split('T')[0],
              lastDayOfMonth.toISOString().split('T')[0]
            );

            // Calculate streak
            const { data: streak } = await masteryService.calculateHabitStreak(user.id, habit.id);

            // Get completion dates
            const completedDates = (completions || []).map(c => c.completed_at.split('T')[0]);
            const todayString = today.toISOString().split('T')[0];

            return {
              ...habit,
              completed_dates: completedDates,
              completed_today: completedDates.includes(todayString),
              streak: streak || 0,
              color: getHabitColor(habit.title)
            };
          })
        );

        // Store habits for virtual calendar generation (no pre-generated events)
        setHabits(transformedHabits);

        // No events stored - all habit events generated virtually on-demand
        setEvents([]);
      } catch (error) {
        console.error('Error loading habits and events:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHabitsAndEvents();
  }, [user]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Virtual event generation - creates habit events on-demand
  const getVirtualHabitEvents = (date) => {
    if (!date || !habits) return [];
    const dateStr = date.toISOString().split('T')[0];
    const virtualEvents = [];

    // Check if this date is within completion range (current day + 2 days prior)
    const today = new Date();
    const targetDate = new Date(dateStr);
    const daysDiff = Math.floor((today - targetDate) / (1000 * 60 * 60 * 24));
    const isClickable = daysDiff >= 0 && daysDiff <= 2;

    habits.forEach(habit => {
      // For daily habits, create virtual event for any date
      if (habit.frequency_type === 'daily') {
        const isCompleted = habit.completed_dates.includes(dateStr);
        virtualEvents.push({
          id: `habit-${habit.id}|${dateStr}`,
          title: habit.title,
          date: dateStr,
          startTime: '09:00',
          endTime: '09:30',
          color: habit.color,
          completed: isCompleted,
          source: 'habit',
          habitId: habit.id,
          description: habit.description,
          xp_reward: habit.xp_reward,
          isClickable: isClickable
        });
      } else {
        // For non-daily habits, only show if completed on this date
        if (habit.completed_dates.includes(dateStr)) {
          virtualEvents.push({
            id: `habit-${habit.id}|${dateStr}`,
            title: habit.title,
            date: dateStr,
            startTime: '09:00',
            endTime: '09:30',
            color: habit.color,
            completed: true,
            source: 'habit',
            habitId: habit.id,
            description: habit.description,
            xp_reward: habit.xp_reward,
            isClickable: isClickable
          });
        }
      }
    });

    return virtualEvents;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    
    // Get real events from database
    const realEvents = events.filter(event => event.date === dateStr);
    
    // Get virtual habit events for this date
    const virtualHabitEvents = getVirtualHabitEvents(date);
    
    // Combine real events with virtual habit events
    return [...realEvents, ...virtualHabitEvents];
  };

  // Calculate events for the selected day using virtual events
  const selectedDayEvents = getEventsForDate(selectedDay);
  const today = new Date();
  const isSelectedToday = selectedDay.toDateString() === today.toDateString();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handlePrevDay = () => {
    const newDay = new Date(selectedDay);
    newDay.setDate(newDay.getDate() - 1);
    setSelectedDay(newDay);
  };

  const handleNextDay = () => {
    const newDay = new Date(selectedDay);
    newDay.setDate(newDay.getDate() + 1);
    setSelectedDay(newDay);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setView('day');
  };

  const toggleEventCompletion = async (eventId) => {
    if (!user) return;
    
    // Parse the event ID to get habit info (format: habit-{habitId}|{date})
    if (eventId.startsWith('habit-')) {
      // Remove 'habit-' prefix and split by the pipe separator
      const withoutPrefix = eventId.substring(6); // Remove 'habit-'
      const pipeIndex = withoutPrefix.indexOf('|');
      const habitId = withoutPrefix.substring(0, pipeIndex);
      const fullDateString = withoutPrefix.substring(pipeIndex + 1);
      
      // Check if completion is allowed (current day + 2 days prior)
      const today = new Date();
      const targetDate = new Date(fullDateString);
      const daysDiff = Math.floor((today - targetDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 2) {
        toast.error('You can only complete habits for today and up to 2 days prior.');
        return;
      }
      
      if (daysDiff < 0) {
        toast.error('You cannot complete habits for future dates.');
        return;
      }
      
      try {
        // Check if habit is already completed for this date
        const habit = habits.find(h => h.id === habitId);
        const isAlreadyCompleted = habit?.completed_dates?.includes(fullDateString);
        const xpReward = habit?.xp_reward || 10;
        
        let result;
        if (isAlreadyCompleted) {
          // Uncomplete the habit
          result = await masteryService.removeHabitCompletion(user.id, habitId, fullDateString);
          if (result.error) throw result.error;
          
          // Show uncompletion popup
          setCompletionPopup({
            habit: habit?.title || 'Habit',
            date: fullDateString,
            xp: xpReward,
            action: 'uncompleted'
          });
          toast('Completion undone', {
            icon: '↺',
            duration: 3000,
            style: {
              background: 'rgba(30, 41, 59, 0.95)',
              color: '#fff',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '13px',
              fontWeight: 500,
            },
          });
        } else {
          // Complete the habit
          result = await masteryService.completeHabit(user.id, habitId, fullDateString);
          if (result.error) throw result.error;
          
          // Get habit details including skill tags for popup
          const { data: habitDetails } = await supabase
            .from('user_habits')
            .select(`
              title,
              xp_reward,
              habits_library (
                skill_tags
              )
            `)
            .eq('id', habitId)
            .single();
          
          const skillTags = habitDetails?.habits_library?.skill_tags || [];
          const statsPoints = skillTags.length > 0 ? (skillTags.length * 0.1).toFixed(1) : 0;
          
          // Show completion popup with XP and stats
          setCompletionPopup({
            habit: habit?.title || 'Habit',
            date: fullDateString,
            xp: xpReward,
            statsPoints: parseFloat(statsPoints),
            skillTags: skillTags,
            action: 'completed'
          });
          toast.success(`Task Completed! ${habit?.title || 'Task'} • +${xpReward} XP earned`, {
            duration: 4000,
            style: {
              background: 'color-mix(in srgb, var(--bg-secondary, #1e293b) 95%, transparent)',
              color: '#fff',
              border: '1px solid color-mix(in srgb, var(--color-success, #10b981) 30%, transparent)',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: 500,
            },
            iconTheme: {
              primary: 'var(--color-success, #10B981)',
              secondary: '#fff',
            },
          });
        }

        // Update the specific habit in our habits state (virtual calendar approach)
        setHabits(prevHabits => 
          prevHabits.map(habit => {
            if (habit.id === habitId) {
              const updatedCompletedDates = [...habit.completed_dates];
              
              if (isAlreadyCompleted) {
                // Remove completion date
                const index = updatedCompletedDates.indexOf(fullDateString);
                if (index > -1) {
                  updatedCompletedDates.splice(index, 1);
                }
              } else {
                // Add completion date if not already present
                if (!updatedCompletedDates.includes(fullDateString)) {
                  updatedCompletedDates.push(fullDateString);
                }
              }
              
              return {
                ...habit,
                completed_dates: updatedCompletedDates,
                completed_today: updatedCompletedDates.includes(new Date().toISOString().split('T')[0]),
                streak: isAlreadyCompleted ? Math.max(0, (habit.streak || 0) - 1) : (habit.streak || 0) + 1
              };
            }
            return habit;
          })
        );
        
        // Trigger refresh to update other tabs
        triggerRefresh();
        
        // Refresh profile to update XP, level, and streak - wait a bit for DB to update
        if (user?.id) {
          setTimeout(async () => {
            console.log('🔄 Refreshing profile after completion...');
            await fetchProfile(user.id);
            console.log('✅ Profile refreshed');
          }, 500); // Small delay to ensure DB updates are complete
        }
      } catch (error) {
        console.error('Error completing habit:', error);
        setError(error.message);
        toast.error('Failed to update habit. Please try again.', {
          duration: 3000,
          style: {
          background: 'color-mix(in srgb, var(--color-error, #ef4444) 95%, transparent)',
          color: '#fff',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '13px',
          },
        });
      }
    } else {
      // Handle regular events (find in events array)
      const event = events.find(e => e.id === eventId);
      if (event) {
        setEvents(events.map(e => 
          e.id === eventId ? { ...e, completed: !e.completed } : e
        ));
      }
    }
  };

  const deleteEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.source === 'habit') {
      // For habits, we don't delete the event, we just mark it as incomplete
      toggleEventCompletion(eventId);
    } else {
      // For regular events, delete them
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  // Add habit completion for today
  const addHabitCompletion = async (habitId, date) => {
    if (!user) return;
    
    try {
      const { error } = await masteryService.completeHabit(user.id, habitId);
      if (error) throw error;

      // Update the specific habit in our habits state (virtual calendar approach)
      setHabits(prevHabits => 
        prevHabits.map(habit => {
          if (habit.id === habitId) {
            const todayString = new Date().toISOString().split('T')[0];
            const updatedCompletedDates = [...habit.completed_dates];
            
            // Add today's completion if not already present
            if (!updatedCompletedDates.includes(todayString)) {
              updatedCompletedDates.push(todayString);
            }
            
            return {
              ...habit,
              completed_dates: updatedCompletedDates,
              completed_today: true,
              streak: (habit.streak || 0) + 1
            };
          }
          return habit;
        })
      );
      
      // Trigger refresh to update other tabs
      triggerRefresh();
    } catch (error) {
      console.error('Error completing habit:', error);
      setError(error.message);
    }
  };


  const formatTime = (startTime, endTime) => {
    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };
    
    return `${formatTime(startTime)}-${formatTime(endTime)}`;
  };


  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const days = getDaysInMonth(currentDate);
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <>
    <div className="h-full flex flex-col">
      {/* Mobile Header - Simplified */}
      <div className="mb-4">
        {/* Month/Year Header with Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={view === 'month' ? handlePrevMonth : view === 'week' ? handlePrevWeek : handlePrevDay}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Previous ${view === 'month' ? 'month' : view === 'week' ? 'week' : 'day'}`}
          >
            <ChevronLeft size={20} className="text-white" aria-hidden="true" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {view === 'month' ? currentMonth : view === 'week' ? 'Week' : 'Day'}
            </h2>
            <p className="text-sm text-slate-400">
              {currentYear}
            </p>
          </div>
          
          <button
            onClick={view === 'month' ? handleNextMonth : view === 'week' ? handleNextWeek : handleNextDay}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Next ${view === 'month' ? 'month' : view === 'week' ? 'week' : 'day'}`}
          >
            <ChevronRight size={20} className="text-white" aria-hidden="true" />
          </button>
        </div>

        {/* View Switcher - Mobile Optimized */}
        <div className="flex bg-slate-800/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-xl">
          <button
            onClick={() => setView('month')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              view === 'month' 
                ? 'text-white shadow-lg' 
                : 'text-slate-300 hover:text-white'
            }`}
            style={view === 'month' ? { background: 'var(--gradient-primary)' } : {}}
            aria-label="Switch to month view"
            aria-pressed={view === 'month'}
          >
            <Grid3X3 size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Month</span>
          </button>
          <button
            onClick={() => setView('week')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              view === 'week' 
                ? 'text-white shadow-lg' 
                : 'text-slate-300 hover:text-white'
            }`}
            style={view === 'week' ? { background: 'var(--gradient-primary)' } : {}}
            aria-label="Switch to week view"
            aria-pressed={view === 'week'}
          >
            <CalendarIcon size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Week</span>
          </button>
          <button
            onClick={() => setView('day')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              view === 'day' 
                ? 'text-white shadow-lg' 
                : 'text-slate-300 hover:text-white'
            }`}
            style={view === 'day' ? { background: 'var(--gradient-primary)' } : {}}
            aria-label="Switch to day view"
            aria-pressed={view === 'day'}
          >
            <Clock size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Day</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-xs"
            aria-label="Dismiss error message"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      )}

      {/* Main Content Area */}
      {!loading && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Calendar Content */}
        <div className="flex-1">

          {/* Calendar Content */}
          {view === 'month' ? (
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          <div className="grid grid-cols-7 border-b border-slate-700/50 bg-slate-900/50">
            {dayNames.map(day => (
              <div key={day} className="p-2 sm:p-4 text-center text-xs sm:text-sm font-medium text-slate-400 border-r border-slate-700/50 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isToday = day && day.toDateString() === new Date().toDateString();
              const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();
              
              return (
                <div
                  key={index}
                  className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-slate-700/50 last:border-r-0 cursor-pointer ${
                    !isCurrentMonth ? 'bg-slate-900/40 text-slate-500' : ''
                  } hover:bg-slate-700/30 transition-colors`}
                  style={isToday ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', borderColor: 'var(--color-primary)' } : {}}
                  onClick={() => day && handleDayClick(day)}
                >
                  {day && (
                    <>
                      <div className={`text-xs sm:text-sm font-semibold mb-1 ${
                        isToday ? 'text-indigo-400' : 'text-white'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="p-1 sm:p-2 rounded-lg text-[10px] sm:text-xs cursor-pointer transition-colors relative group"
                            style={{
                              backgroundColor: event.completed ? `${event.color}60` : `${event.color}`,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className={`font-medium truncate ${event.completed ? 'line-through' : ''} text-white`}>
                              {event.title}
                            </div>
                            <div className="text-[9px] sm:text-xs text-white/80">
                              +{event.xp_reward} XP
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] sm:text-xs text-slate-400 text-center">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : view === 'week' ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {getWeekDays(currentDate).map((day, index) => (
              <div key={index} className="p-4 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {dayNames[index]}
                </div>
                <div 
                  className={`text-lg font-semibold ${
                    day.toDateString() === new Date().toDateString() 
                      ? ''
                      : 'text-gray-900 dark:text-white'
                  }`}
                  style={day.toDateString() === new Date().toDateString() ? { color: 'var(--color-primary)' } : {}}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 min-h-[400px]">
            {getWeekDays(currentDate).map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className="p-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                  style={isToday ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' } : {}}
                >
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="p-2 rounded text-xs cursor-pointer transition-colors relative group"
                        style={{
                          backgroundColor: event.completed ? `${event.color}40` : event.color,
                          borderLeft: `3px solid ${event.color}`
                        }}
                        onClick={() => event.source !== 'habit' && console.log('Edit event:', event)}
                      >
                        <div className="flex items-center space-x-1">
                          {event.source === 'habit' && (
                            <Target size={10} className="text-white/80" />
                          )}
                          <div className={`font-medium truncate ${
                            event.completed 
                              ? 'text-white line-through' 
                              : 'text-white'
                          }`}>
                            {event.title}
                          </div>
                        </div>
                        <div className="text-xs text-white/80">
                          {event.source === 'habit' ? `+${event.xp_reward} XP` : formatTime(event.startTime, event.endTime)}
                        </div>
                        
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEventCompletion(event.id);
                            }}
                            className={`p-1 rounded text-xs ${
                              event.completed 
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                            aria-label={event.completed ? `Mark ${event.title} as incomplete` : `Mark ${event.title} as complete`}
                            title={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            <CheckCircle size={12} aria-hidden="true" />
                          </button>
                          {event.source !== 'habit' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.id);
                              }}
                              className="p-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs"
                              aria-label={`Delete event ${event.title}`}
                              title="Delete event"
                            >
                              <Trash2 size={12} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Add habit completion for today */}
                    {day.toDateString() === new Date().toDateString() && (
                      <div className="mt-2">
                        {habits.filter(habit => {
                          const today = new Date().toISOString().split('T')[0];
                          return !habit.completed_dates.includes(today);
                        }).map(habit => (
                          <button
                            key={habit.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              addHabitCompletion(habit.id, day.toISOString().split('T')[0]);
                            }}
                            className="w-full p-1 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                            aria-label={`Complete habit: ${habit.name}`}
                          >
                            <Target size={10} />
                            <span>+ {habit.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header with date navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevDay}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                onClick={handleNextDay}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Next day"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {isSelectedToday ? 'Today' : selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
            </div>
          </div>

          {/* Horizontal Date Selector */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2 overflow-x-auto">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date(selectedDay);
                date.setDate(date.getDate() - 3 + i);
                const isSelected = date.toDateString() === selectedDay.toDateString();
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(date)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    aria-label={`Select ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    aria-pressed={isSelected}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-sm">
                        {date.getDate()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Activities List */}
          <div className="p-4 space-y-3">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p>No activities for this day</p>
              </div>
            ) : (
              selectedDayEvents.map(event => {
                const getEventIcon = (event) => {
                  if (event.source === 'habit') {
                    return <Target size={20} style={{ color: 'var(--color-primary)' }} />;
                  }
                  // Add more icon logic based on event type
                  return <CalendarIcon size={20} className="text-gray-500" />;
                };

                const getEventColor = (event) => {
                  if (event.completed) return 'bg-gray-100 dark:bg-gray-800';
                  if (event.source === 'habit') return '';
                  return 'bg-purple-50 dark:bg-purple-900/20';
                };

                const getLastUpdated = (event) => {
                  if (event.completed) {
                    return `Completed: ${new Date(event.completed_at || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  }

                  if (event.last_completed_at) {
                    return `Last completed: ${new Date(event.last_completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  }

                  return 'Not completed yet';
                };

                return (
                  <div
                    key={event.id}
                    className={`rounded-xl p-4 transition-all duration-200 hover:shadow-md ${getEventColor(event)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getEventIcon(event)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className="inline-flex h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                            <span className={`text-xs font-medium ${event.completed ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {event.completed ? 'Completed' : 'Pending'}
                            </span>
                            {event.source === 'habit' && (
                              <span className="text-xs font-semibold text-yellow-400">
                                +{event.xp_reward} XP
                              </span>
                            )}
                          </div>
                          <h3 className={`font-semibold text-lg ${
                            event.completed 
                              ? 'text-gray-500 dark:text-gray-400 line-through' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {event.description || 'Complete this activity'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {getLastUpdated(event)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEventCompletion(event.id);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                            event.completed 
                              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30' 
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/60'
                          }`}
                          aria-label={event.completed ? `Mark ${event.title} as incomplete` : `Mark ${event.title} as complete`}
                          aria-pressed={event.completed}
                        >
                          {event.completed ? '✓ Done' : 'Complete'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-50 dark:bg-blue-900/20 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Today</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          {/* Mini Calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex space-x-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  aria-label="Previous month in mini calendar"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  aria-label="Next month in mini calendar"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            
            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-1">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                const isToday = day && day.toDateString() === new Date().toDateString();
                const isSelected = day && day.toDateString() === selectedDay.toDateString();
                const hasEvents = day && getEventsForDate(day).length > 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => day && handleDayClick(day)}
                    disabled={!day}
                    className={`text-sm p-1 rounded transition-colors ${
                      !day 
                        ? 'text-gray-300 dark:text-gray-600' 
                        : isSelected
                        ? 'text-white'
                        : isToday
                        ? ''
                        : hasEvents
                        ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={isSelected ? { background: 'var(--gradient-primary)' } : isToday ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' } : {}}
                    aria-label={day ? `Select ${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${hasEvents ? ' (has events)' : ''}` : ''}
                    aria-pressed={isSelected}
                  >
                    {day ? day.getDate() : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Events</h3>
            <div className="space-y-2">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => event.source !== 'habit' && console.log('Edit event:', event)}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.color }}
                      ></div>
                      {event.source === 'habit' && (
                        <Target size={12} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        event.completed 
                          ? 'text-gray-500 dark:text-gray-400 line-through' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {event.source === 'habit' ? `+${event.xp_reward} XP` : formatTime(event.startTime, event.endTime)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon size={32} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No events today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      )}

      {/* Completion Popup */}
      {completionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              {completionPopup.action === 'completed' ? (
                <>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Habit Completed! 🎉
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    <span className="font-medium">{completionPopup.habit}</span> completed on {completionPopup.date}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-lg">
                          +{completionPopup.xp} XP Earned!
                        </p>
                      </div>
                    </div>
                    {completionPopup.statsPoints > 0 && (
                      <div className="bg-violet-100 dark:bg-violet-900 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          <p className="text-violet-800 dark:text-violet-200 font-semibold text-lg">
                            +{completionPopup.statsPoints} Stats Points
                          </p>
                        </div>
                        {completionPopup.skillTags && completionPopup.skillTags.length > 0 && (
                          <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                            Applied to {completionPopup.skillTags.length} skill{completionPopup.skillTags.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Habit Uncompleted! 🔄
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    <span className="font-medium">{completionPopup.habit}</span> uncompleted for {completionPopup.date}
                  </p>
                  <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-3 mb-4">
                    <p className="text-orange-800 dark:text-orange-200 font-medium">
                      -{completionPopup.xp} XP Removed
                    </p>
                  </div>
                </>
              )}
              <button
                onClick={() => setCompletionPopup(null)}
                className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors"
                style={{ background: 'var(--gradient-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {completionPopup.action === 'completed' ? 'Awesome!' : 'Got it!'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default CalendarTab;