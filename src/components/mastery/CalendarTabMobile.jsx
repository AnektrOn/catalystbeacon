import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import masteryService from '../../services/masteryService';
import { useAuth } from '../../contexts/AuthContext';
import { useMasteryRefresh } from '../../pages/Mastery';

/**
 * Modern Mobile-First Calendar Component
 * Inspired by modern calendar apps with dark aesthetic
 */
const CalendarTabMobile = () => {
  const { user, fetchProfile } = useAuth();
  const { triggerRefresh } = useMasteryRefresh();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [view, setView] = useState('month');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [loading, setLoading] = useState(true);
  // Removed unused error state (errors are logged directly)

  // Helper function to get appropriate color for habits
  const getHabitColor = (title) => {
    const titleLower = title?.toLowerCase() || '';
    
    const root = document.documentElement;
    const computedStyle = window.getComputedStyle(root);
    if (titleLower.includes('read') || titleLower.includes('book')) return computedStyle.getPropertyValue('--color-secondary').trim() || '#8B5CF6';
    if (titleLower.includes('workout') || titleLower.includes('exercise')) return computedStyle.getPropertyValue('--color-secondary').trim() || '#A78BFA';
    if (titleLower.includes('meditation') || titleLower.includes('mindfulness')) return computedStyle.getPropertyValue('--color-secondary').trim() || '#8B5CF6';
    return computedStyle.getPropertyValue('--text-secondary').trim() || '#6B7280';
  };

  // Load habits and events
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const { data: userHabits, error: habitsError } = await masteryService.getUserHabits(user.id);
        if (habitsError) throw habitsError;

        const transformedHabits = await Promise.all(
          (userHabits || []).map(async (habit) => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const { data: completions } = await masteryService.getHabitCompletions(
              user.id,
              habit.id,
              firstDay.toISOString().split('T')[0],
              lastDay.toISOString().split('T')[0]
            );

            const completedDates = (completions || []).map(c => c.completed_at.split('T')[0]);

            return {
              ...habit,
              completed_dates: completedDates,
              color: getHabitColor(habit.title)
            };
          })
        );

        setHabits(transformedHabits);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Get days in current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  // Get virtual events for a date
  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    const virtualEvents = [];

    habits.forEach(habit => {
      if (habit.frequency_type === 'daily') {
        const isCompleted = habit.completed_dates.includes(dateStr);
        virtualEvents.push({
          id: `habit-${habit.id}|${dateStr}`,
          title: habit.title,
          date: dateStr,
          color: habit.color,
          completed: isCompleted,
          source: 'habit',
          habitId: habit.id,
          xp_reward: habit.xp_reward || 10
        });
      }
    });

    return virtualEvents;
  };

  const toggleCompletion = async (eventId) => {
    if (!user || !eventId.startsWith('habit-')) {
      console.log('❌ toggleCompletion: Invalid user or eventId');
      return;
    }
    
    const withoutPrefix = eventId.substring(6);
    const pipeIndex = withoutPrefix.indexOf('|');
    const habitId = withoutPrefix.substring(0, pipeIndex);
    const dateStr = withoutPrefix.substring(pipeIndex + 1);
    
    const habit = habits.find(h => h.id === habitId);
    const isCompleted = habit?.completed_dates?.includes(dateStr);
    const xpReward = habit?.xp_reward || 10;
    
    console.log('🔄 toggleCompletion:', { habitId, dateStr, isCompleted, habitTitle: habit?.title });
    
    try {
      if (isCompleted) {
        await masteryService.removeHabitCompletion(user.id, habitId, dateStr);
      } else {
        const result = await masteryService.completeHabit(user.id, habitId, dateStr);
        console.log('✅ Habit completion result:', result);
        
        // Show success notification with XP reward - call immediately after successful completion
        console.log('✅ Showing completion toast for:', habit?.title, '+', xpReward, 'XP');
        toast.success(
          `Task Completed! ${habit?.title || 'Task'} • +${xpReward} XP earned`,
          {
            duration: 4000,
            style: {
              background: 'color-mix(in srgb, var(--bg-secondary, #1e293b) 95%, transparent)',
              color: '#fff',
              border: '1px solid color-mix(in srgb, var(--color-success, #10b981) 30%, transparent)',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '500',
              zIndex: 9999,
            },
            iconTheme: {
              primary: 'var(--color-success, #10B981)',
              secondary: '#fff',
            },
          }
        );
      }
      
      setHabits(prevHabits => 
        prevHabits.map(h => {
          if (h.id === habitId) {
            const dates = [...h.completed_dates];
            if (isCompleted) {
              const idx = dates.indexOf(dateStr);
              if (idx > -1) dates.splice(idx, 1);
            } else {
              if (!dates.includes(dateStr)) dates.push(dateStr);
            }
            return { ...h, completed_dates: dates };
          }
          return h;
        })
      );
      
      triggerRefresh();
      
      // Refresh profile to update XP, level, and streak - wait a bit for DB to update
      if (user?.id) {
        setTimeout(async () => {
          console.log('🔄 Refreshing profile after completion...');
          await fetchProfile(user.id);
          console.log('✅ Profile refreshed');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error toggling completion:', error);
      toast.error('Failed to update task. Please try again.', {
        duration: 3000,
        style: {
          background: 'color-mix(in srgb, var(--color-error, #ef4444) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days = getDaysInMonth(currentDate);
  const selectedDayEvents = getEventsForDate(selectedDay);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          className="p-3 hover:bg-slate-700/50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-slate-300" />
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            {monthNames[currentDate.getMonth()]}
          </h2>
          <p className="text-sm text-slate-400">{currentDate.getFullYear()}</p>
        </div>
        
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          className="p-3 hover:bg-slate-700/50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronRight size={20} className="text-slate-300" />
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex bg-slate-800/80 backdrop-blur-sm rounded-2xl p-1.5 mb-6 shadow-lg">
        <button
          onClick={() => setView('month')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
            view === 'month' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'
          }`}
        >
          <Grid3X3 size={18} />
          <span>Month</span>
        </button>
        <button
          onClick={() => setView('week')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
            view === 'week' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'
          }`}
        >
          <CalendarIcon size={18} />
          <span>Week</span>
        </button>
        <button
          onClick={() => setView('day')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
            view === 'day' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'
          }`}
        >
          <Clock size={18} />
          <span>Day</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700/30 overflow-hidden mb-6 shadow-2xl">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-slate-900/50 border-b border-slate-700/30">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-xs font-semibold text-slate-400">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 p-2 gap-1">
          {days.map((day, index) => {
            if (!day) return <div key={index} className="aspect-square" />;
            
            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const dayNumber = day.getDate();
            
            return (
              <button
                key={index}
                onClick={() => { setSelectedDay(day); setView('day'); }}
                className={`aspect-square rounded-2xl p-1 flex flex-col items-center justify-start transition-all min-h-[44px] ${
                  isToday ? 'bg-indigo-600 text-white' : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <span className="text-sm font-bold mb-0.5">{dayNumber}</span>
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: event.completed ? 'var(--color-success, #10B981)' : event.color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Tasks - Bottom Sheet Style */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700/30 p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Upcoming Tasks</h3>
        
        {selectedDayEvents.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon size={48} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 text-sm">No tasks for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayEvents.map(event => (
              <div
                key={event.id}
                className="bg-slate-700/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/30 hover:bg-slate-700/60 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <span className={`font-semibold text-white ${event.completed ? 'line-through opacity-60' : ''}`}>
                        {event.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span>Today, 10:00AM</span>
                      <span className="text-yellow-400 font-semibold">+{event.xp_reward} XP</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleCompletion(event.id)}
                    className={`ml-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                      event.completed
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {event.completed ? '✓ Done' : 'Start'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarTabMobile;

