import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, Clock, X } from 'lucide-react';
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
  const [showDayModal, setShowDayModal] = useState(false);
  const [modalDay, setModalDay] = useState(null);
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

  // Load habits and events - Optimized to load all completions in parallel
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

        if (!userHabits || userHabits.length === 0) {
          setHabits([]);
          setLoading(false);
          return;
        }

        // Get date range for the visible month (based on currentDate)
        const baseDate = currentDate || new Date();
        const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];

        // Load all completions in parallel
        const completionPromises = userHabits.map(habit => 
          masteryService.getHabitCompletions(user.id, habit.id, startDate, endDate)
            .then(({ data }) => ({
              habitId: habit.id,
              completedDates: (data || []).map(c => c.completed_at.split('T')[0])
            }))
            .catch(() => ({ habitId: habit.id, completedDates: [] }))
        );

        const completionsData = await Promise.all(completionPromises);
        const completionsMap = new Map(completionsData.map(c => [c.habitId, c.completedDates]));

        const transformedHabits = userHabits.map(habit => ({
          ...habit,
          completed_dates: completionsMap.get(habit.id) || [],
          color: getHabitColor(habit.title)
        }));

        setHabits(transformedHabits);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, currentDate]);

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

  // Helpers for week/day rendering
  const startOfWeek = (date) => {
    const d = new Date(date);
    // Use Monday as first day of week
    const day = d.getDay(); // 0=Sun, 1=Mon...
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const weekDays = useMemo(() => {
    const base = selectedDay || currentDate || new Date();
    const start = startOfWeek(base);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedDay, currentDate]);

  // Get virtual events for a date (only habits with show_on_calendar !== false)
  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    const virtualEvents = [];

    habits.forEach(habit => {
      // Only show habits that are visible on calendar (default to true if not set)
      if (habit.show_on_calendar === false) return;
      
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Navigation (changes based on view) */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            if (view === 'month') {
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
            } else if (view === 'week') {
              const d = new Date(selectedDay);
              d.setDate(d.getDate() - 7);
              setSelectedDay(d);
              setCurrentDate(d);
            } else {
              const d = new Date(selectedDay);
              d.setDate(d.getDate() - 1);
              setSelectedDay(d);
              setCurrentDate(d);
            }
          }}
          className="p-3 hover:bg-slate-700/50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Previous"
        >
          <ChevronLeft size={20} className="text-slate-300" />
        </button>

        <div className="text-center">
          {view === 'month' ? (
            <>
              <h2 className="text-2xl font-bold text-white">
                {monthNames[currentDate.getMonth()]}
              </h2>
              <p className="text-sm text-slate-400">{currentDate.getFullYear()}</p>
            </>
          ) : view === 'week' ? (
            <>
              <h2 className="text-xl font-bold text-white">
                {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h2>
              <p className="text-sm text-slate-400">{weekDays[0].getFullYear()}</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white">
                {selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}
              </h2>
              <p className="text-sm text-slate-400">
                {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </>
          )}
        </div>

        <button
          onClick={() => {
            if (view === 'month') {
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
            } else if (view === 'week') {
              const d = new Date(selectedDay);
              d.setDate(d.getDate() + 7);
              setSelectedDay(d);
              setCurrentDate(d);
            } else {
              const d = new Date(selectedDay);
              d.setDate(d.getDate() + 1);
              setSelectedDay(d);
              setCurrentDate(d);
            }
          }}
          className="p-3 hover:bg-slate-700/50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Next"
        >
          <ChevronRight size={20} className="text-slate-300" />
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex glass-effect rounded-2xl p-1.5 mb-6 shadow-lg border border-white/15">
        <button
          onClick={() => {
            setView('month');
            setSelectedDay(new Date());
          }}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
            view === 'month' ? 'text-white shadow-lg' : 'text-slate-400'
          }`}
          style={view === 'month' ? { background: 'var(--gradient-primary)' } : {}}
        >
          <Grid3X3 size={18} />
          <span>Month</span>
        </button>
        <button
          onClick={() => {
            setView('week');
            // Keep selection anchored to currentDate when switching views
            setSelectedDay(currentDate);
          }}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
            view === 'week' ? 'text-white shadow-lg' : 'text-slate-400'
          }`}
          style={view === 'week' ? { background: 'var(--gradient-primary)' } : {}}
        >
          <CalendarIcon size={18} />
          <span>Week</span>
        </button>
        <button
          onClick={() => {
            setView('day');
            setSelectedDay(currentDate);
          }}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
            view === 'day' ? 'text-white shadow-lg' : 'text-slate-400'
          }`}
          style={view === 'day' ? { background: 'var(--gradient-primary)' } : {}}
        >
          <Clock size={18} />
          <span>Day</span>
        </button>
      </div>

      {/* Calendar Body (changes based on view) */}
      {view === 'month' ? (
        <div className="glass-effect rounded-3xl border border-white/15 overflow-hidden mb-6 shadow-2xl">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
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
              const isSelected = day.toDateString() === selectedDay.toDateString();
              const dayNumber = day.getDate();
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDay(day);
                    setModalDay(day);
                    setShowDayModal(true);
                  }}
                  className={`aspect-square rounded-2xl p-1 flex flex-col items-center justify-start transition-all min-h-[44px] ${
                    isToday ? 'text-white' : 'hover:bg-white/10'
                  } ${isSelected && !isToday ? 'ring-2 ring-white/20' : ''}`}
                  style={isToday ? { background: 'var(--gradient-primary)' } : {}}
                >
                  <span className="text-sm font-bold mb-0.5" style={!isToday ? { color: 'var(--text-primary)' } : {}}>{dayNumber}</span>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={idx}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: event.completed ? 'var(--color-success, #10B981)' : event.color }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : view === 'week' ? (
        <div className="glass-effect rounded-3xl border border-white/15 overflow-hidden mb-6 shadow-2xl">
          <div className="p-3 space-y-2">
            {weekDays.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = day.toDateString() === selectedDay.toDateString();
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setSelectedDay(day);
                    setModalDay(day);
                    setShowDayModal(true);
                  }}
                  className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 transition-colors min-h-[56px] ${
                    isToday
                      ? 'text-white'
                      : isSelected
                        ? 'bg-white/10 text-white'
                        : 'hover:bg-white/10'
                  }`}
                  style={isToday ? { background: 'var(--gradient-primary)' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-sm font-semibold">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-xs opacity-80">
                        {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: event.completed ? 'var(--color-success, #10B981)' : event.color }}
                      />
                    ))}
                    <span className="text-xs text-slate-300 min-w-[28px] text-right">
                      {dayEvents.length}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-effect rounded-3xl border border-white/15 overflow-hidden mb-6 shadow-2xl">
          <div className="p-4">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-10">
                <CalendarIcon size={48} className="mx-auto mb-3 opacity-60" style={{ color: 'var(--text-secondary)' }} />
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No tasks for today</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tap another day or switch views.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map(event => (
                  <div
                    key={event.id}
                    className="glass-effect rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1"
                        style={{ backgroundColor: event.completed ? 'var(--color-success, #10B981)' : event.color }}
                      />
                      <div className="flex-1">
                        <div className={`font-semibold text-white ${event.completed ? 'line-through opacity-60' : ''}`}>
                          {event.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {event.type === 'habit' ? 'Habit' : 'Task'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Day Modal */}
      {showDayModal && modalDay && (
        <div 
          className="fixed inset-0 z-[100] flex items-end justify-center"
          onClick={() => setShowDayModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div 
            className="relative w-full max-w-md glass-effect rounded-t-3xl shadow-2xl border-t border-white/15 max-h-[80vh] overflow-y-auto safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 border-b border-white/10 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {modalDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button
                onClick={() => setShowDayModal(false)}
                className="glass-icon-btn min-w-[44px] min-h-[44px]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {getEventsForDate(modalDay).length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={48} className="mx-auto mb-3 opacity-60" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No tasks for this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getEventsForDate(modalDay).map(event => (
                    <div
                      key={event.id}
                      className="glass-effect rounded-2xl p-4 border border-white/10"
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
                            <span className="text-yellow-400 font-semibold">+{event.xp_reward} XP</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            toggleCompletion(event.id);
                            setShowDayModal(false);
                          }}
                          className={`ml-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                            event.completed
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                              : 'text-white'
                          }`}
                          style={!event.completed ? { background: 'var(--gradient-primary)' } : {}}
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
        </div>
      )}
    </div>
  );
};

export default CalendarTabMobile;

