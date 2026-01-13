import React, { useState, useEffect } from 'react';
import { Plus, Target, Flame, Trash2, Calendar, CalendarOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useMasteryRefresh } from '../../pages/Mastery';
import masteryService from '../../services/masteryService';

/**
 * Modern Mobile-First Habits Component
 * Clean card-based layout matching inspiration images
 */
const HabitsTabMobile = () => {
  const { user, fetchProfile } = useAuth();
  const { triggerRefresh } = useMasteryRefresh();
  const [activeTab, setActiveTab] = useState('my-habits');
  const [personalHabits, setPersonalHabits] = useState([]);
  const [habitsLibrary, setHabitsLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarVisibilitySupported, setCalendarVisibilitySupported] = useState(true);
  // Removed unused error state (errors are logged directly)

  useEffect(() => {
    const loadHabits = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Load library
        const { data: library } = await supabase.from('habits_library').select('*');
        setHabitsLibrary(library || []);

        // Load user habits (only active ones)
        const { data: userHabits } = await supabase
          .from('user_habits')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        // Transform with completion data
        const transformed = await Promise.all(
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
            const todayStr = today.toISOString().split('T')[0];

            return {
              ...habit,
              completed_dates: completedDates,
              completed_today: completedDates.includes(todayStr),
              streak: completedDates.length
            };
          })
        );

        setPersonalHabits(transformed);
      } catch (err) {
        console.error('Error loading habits:', err);
        // Error logged above
      } finally {
        setLoading(false);
      }
    };

    loadHabits();
  }, [user]);

  const toggleHabitToday = async (habitId) => {
    if (!user) {
      console.log('❌ toggleHabitToday: No user');
      return;
    }

    const habit = personalHabits.find(h => h.id === habitId);
    const todayStr = new Date().toISOString().split('T')[0];
    const isCompleted = habit?.completed_today;
    const xpReward = habit?.xp_reward || 10;

    console.log('🔄 toggleHabitToday:', { habitId, isCompleted, habitTitle: habit?.title });

    try {
      if (isCompleted) {
        await masteryService.removeHabitCompletion(user.id, habitId, todayStr);
      } else {
        const result = await masteryService.completeHabit(user.id, habitId, todayStr);
        console.log('✅ Habit completion result:', result);
        
        // Show success notification with XP reward - call immediately after successful completion
        console.log('✅ Showing completion toast for:', habit?.title, '+', xpReward, 'XP');
        toast.success(
          `Habit Completed! 🔥 ${habit?.title} • +${xpReward} XP earned`,
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

      setPersonalHabits(prev =>
        prev.map(h => {
          if (h.id === habitId) {
            const dates = [...h.completed_dates];
            if (isCompleted) {
              const idx = dates.indexOf(todayStr);
              if (idx > -1) dates.splice(idx, 1);
            } else {
              if (!dates.includes(todayStr)) dates.push(todayStr);
            }
            return { ...h, completed_dates: dates, completed_today: !isCompleted };
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
    } catch (err) {
      console.error('❌ Error toggling habit:', err);
      toast.error('Failed to update habit. Please try again.', {
        duration: 3000,
        style: {
          background: 'color-mix(in srgb, var(--color-error, #ef4444) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    }
  };

  const addHabitFromLibrary = async (libraryHabit) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_habits')
        .insert({
          user_id: user.id,
          habit_id: libraryHabit.id,
          title: libraryHabit.title,
          description: libraryHabit.description,
          frequency_type: libraryHabit.frequency_type || 'daily',
          xp_reward: libraryHabit.xp_reward || 10,
          is_active: true,
          show_on_calendar: true // Default to showing on calendar
        })
        .select()
        .single();

      if (error) throw error;

      setPersonalHabits(prev => [
        ...prev,
        {
          ...data,
          completed_dates: [],
          completed_today: false,
          streak: 0
        }
      ]);

      setActiveTab('my-habits');
      toast.success('Habit added to My Habits!', {
        duration: 2000,
        style: {
          background: 'color-mix(in srgb, var(--color-success, #10b981) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    } catch (err) {
      console.error('Error adding habit:', err);
      toast.error('Failed to add habit. Please try again.', {
        duration: 3000,
        style: {
          background: 'color-mix(in srgb, var(--color-error, #ef4444) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    }
  };

  const deleteHabit = async (habitId) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this habit? All completion data will be removed.')) {
      return;
    }

    try {
      const { error } = await masteryService.deleteUserHabit(habitId);
      if (error) throw error;

      setPersonalHabits(prev => prev.filter(h => h.id !== habitId));
      triggerRefresh();
      
      toast.success('Habit deleted successfully', {
        duration: 2000,
        style: {
          background: 'color-mix(in srgb, var(--color-success, #10b981) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    } catch (err) {
      console.error('Error deleting habit:', err);
      toast.error('Failed to delete habit. Please try again.', {
        duration: 3000,
        style: {
          background: 'color-mix(in srgb, var(--color-error, #ef4444) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    }
  };

  const toggleCalendarVisibility = async (habitId, currentValue) => {
    if (!user) return;
    if (!calendarVisibilitySupported) {
      toast.error('Calendar visibility is not configured yet. Run ADD_CALENDAR_VISIBILITY_COLUMN.sql in Supabase.', {
        duration: 2500,
        style: {
          background: 'color-mix(in srgb, var(--color-error, #ef4444) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_habits')
        .update({ show_on_calendar: !currentValue })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPersonalHabits(prev =>
        prev.map(h => {
          if (h.id === habitId) {
            return { ...h, show_on_calendar: !currentValue };
          }
          return h;
        })
      );

      toast.success(!currentValue ? 'Shown on calendar' : 'Hidden from calendar', {
        duration: 1500,
        style: {
          background: 'color-mix(in srgb, var(--bg-secondary, #1e293b) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });

      triggerRefresh();
    } catch (err) {
      const errObj = err?.error ?? err;
      const msgParts = [errObj?.message, errObj?.details, errObj?.hint].filter(Boolean);
      const msg = (msgParts.join(' • ') || 'Failed to update calendar visibility.').toString();
      const msgLower = msg.toLowerCase();
      const needsColumn = msgLower.includes('show_on_calendar') && (msgLower.includes('column') || msgLower.includes('schema cache'));

      console.error('Error toggling calendar visibility:', msg, errObj);

      if (needsColumn) {
        setCalendarVisibilitySupported(false);
      }

      toast.error(
        needsColumn
          ? 'DB missing column show_on_calendar. Run ADD_CALENDAR_VISIBILITY_COLUMN.sql in Supabase.'
          : msg,
        {
        duration: 2000,
        style: {
          background: 'color-mix(in srgb, var(--color-error, #ef4444) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Tab Switcher */}
      <div className="flex bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-1.5 mb-6 shadow-ethereal-base">
        <button
          onClick={() => setActiveTab('my-habits')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
            activeTab === 'my-habits' ? 'bg-indigo-600 text-ethereal-white shadow-ethereal-base' : 'text-ethereal-text'
          }`}
        >
          <Target size={18}  aria-hidden="true"/>
          <span>My Habits</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
            activeTab === 'library' ? 'bg-indigo-600 text-ethereal-white shadow-ethereal-base' : 'text-ethereal-text'
          }`}
        >
          <Plus size={18}  aria-hidden="true"/>
          <span>Library</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'my-habits' ? (
        <div className="space-y-4">
          {!calendarVisibilitySupported && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-ethereal p-4 text-sm text-yellow-100">
              <strong>Calendar visibility toggle is disabled:</strong> your database is missing
              <code> show_on_calendar</code>. Run <code>ADD_CALENDAR_VISIBILITY_COLUMN.sql</code> in Supabase, then refresh.
            </div>
          )}
          {personalHabits.length === 0 ? (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto mb-4 text-ethereal-text"  aria-hidden="true"/>
              <p className="text-ethereal-text mb-4">No habits yet</p>
              <button
                onClick={() => setActiveTab('library')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-all min-h-[48px]"
              >
                Add from Library
              </button>
            </div>
          ) : (
            personalHabits.map(habit => (
              <div
                key={habit.id}
                className="bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-5 border border-ethereal shadow-ethereal-base"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-ethereal-white mb-1">{habit.title}</h3>
                    {habit.description && (
                      <p className="text-sm text-ethereal-text">{habit.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {habit.streak > 0 && (
                      <div className="flex items-center space-x-1 bg-orange-600/20 px-3 py-1 rounded-full border border-orange-500/30">
                        <Flame size={14} className="text-orange-400" />
                        <span className="text-sm font-semibold text-orange-300">{habit.streak}</span>
                      </div>
                    )}
                    <button
                      onClick={() => toggleCalendarVisibility(habit.id, habit.show_on_calendar !== false)}
                      disabled={!calendarVisibilitySupported}
                      className={`p-2 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                        habit.show_on_calendar !== false
                          ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
                            : 'bg-ethereal-glass/50 text-ethereal-text hover:bg-ethereal-glass-hover'
                      } ${!calendarVisibilitySupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={habit.show_on_calendar !== false ? 'Hide from calendar' : 'Show on calendar'}
                    >
                      {habit.show_on_calendar !== false ? <Calendar size={18} /> : <CalendarOff size={18} />}
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Delete habit"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-ethereal-text">
                    <span className="text-yellow-400 font-semibold">+{habit.xp_reward} XP</span>
                    <span className="mx-2">•</span>
                    <span>{habit.frequency_type}</span>
                  </div>

                  <button
                    onClick={() => toggleHabitToday(habit.id)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all min-h-[44px] ${
                      habit.completed_today
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {habit.completed_today ? '✓ Done Today' : 'Complete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {habitsLibrary.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-ethereal-text">No habits in library</p>
            </div>
          ) : (
            habitsLibrary.map(habit => (
              <div
                key={habit.id}
                className="bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-5 border border-ethereal shadow-ethereal-base"
              >
                <h3 className="text-lg font-bold text-ethereal-white mb-2">{habit.title}</h3>
                  {habit.description && (
                    <p className="text-sm text-ethereal-text mb-4">{habit.description}</p>
                  )}
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-ethereal-text">
                    <span className="text-yellow-400 font-semibold">+{habit.xp_reward} XP</span>
                  </div>
                  
                  <button
                    onClick={() => addHabitFromLibrary(habit)}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-500 transition-all min-h-[44px]"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HabitsTabMobile;

