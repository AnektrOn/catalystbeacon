import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Target, Star, BookOpen, Dumbbell, Flame, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import masteryService from '../../services/masteryService';

// Loads real habits from Supabase
const HabitsTabSimple = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    frequency_type: 'daily',
    xp_reward: 10
  });

  // Icon mapping for habits
  const getHabitIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('read') || titleLower.includes('book')) return BookOpen;
    if (titleLower.includes('exercise') || titleLower.includes('workout')) return Dumbbell;
    if (titleLower.includes('meditat')) return Target;
    return Target;
  };

  // Color mapping for habits
  const getHabitColor = (index) => {
    const colors = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444'];
    return colors[index % colors.length];
  };

  // Load habits from Supabase
  useEffect(() => {
    if (!user) {
      return;
    }
    
    const loadHabits = async () => {
      setError(null);
      setLoading(true);
      
      try {
        // Get user habits from Supabase
        const { data: userHabits, error: habitsError } = await masteryService.getUserHabits(user.id);
        
        if (habitsError) {
          setError('Failed to load habits');
          setHabits([]);
          return;
        }

        if (!userHabits || userHabits.length === 0) {
          setHabits([]);
          setLoading(false);
          return;
        }

        // Get completions for all habits
        const habitIds = userHabits.map(h => h.id);
        const { data: completions, error: completionsError } = await supabase
          .from('user_habit_completions')
          .select('habit_id, completed_at')
          .eq('user_id', user.id)
          .in('habit_id', habitIds);

        if (completionsError) {
        }

        // Group completions by habit_id
        const completionsByHabit = {};
        (completions || []).forEach(completion => {
          const habitId = completion.habit_id;
          if (!completionsByHabit[habitId]) {
            completionsByHabit[habitId] = [];
          }
          const dateStr = new Date(completion.completed_at).toISOString().split('T')[0];
          if (!completionsByHabit[habitId].includes(dateStr)) {
            completionsByHabit[habitId].push(dateStr);
          }
        });

        // Transform habits with completion data
        const transformedHabits = userHabits.map((habit, index) => {
          const completedDates = completionsByHabit[habit.id] || [];
          const currentStreak = calculateCurrentStreak(completedDates);
          
          return {
            id: habit.id,
            title: habit.title || habit.habits_library?.title || 'Untitled Habit',
            description: habit.description || habit.habits_library?.description || '',
            frequency_type: habit.frequency_type || 'daily',
            xp_reward: habit.xp_reward || habit.habits_library?.xp_reward || 10,
            currentStreak,
            completedDates,
            color: getHabitColor(index),
            Icon: getHabitIcon(habit.title || habit.habits_library?.title || '')
          };
        });

        setHabits(transformedHabits);
      } catch (err) {
        setError('Failed to load habits');
        setHabits([]);
      } finally {
        setLoading(false);
      }
    };

    loadHabits();
  }, [user]);

  const handleToggleHabit = async (habitId, date) => {
    
    if (!user) return;
    
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const isCompleted = habit.completedDates.includes(date);
      
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from('user_habit_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('habit_id', habitId)
          .gte('completed_at', `${date}T00:00:00`)
          .lt('completed_at', `${date}T23:59:59`);

        if (error) throw error;
      } else {
        // Add completion
        const { error } = await supabase
          .from('user_habit_completions')
          .insert({
            user_id: user.id,
            habit_id: habitId,
            completed_at: `${date}T12:00:00`,
            xp_earned: habit.xp_reward || 10
          });

        if (error) throw error;
      }

      // Update local state
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          const newCompletedDates = isCompleted 
            ? h.completedDates.filter(d => d !== date)
            : [...h.completedDates, date].sort();
          
          return {
            ...h,
            completedDates: newCompletedDates,
            currentStreak: calculateCurrentStreak(newCompletedDates)
          };
        }
        return h;
      }));

      // Refresh profile to update streak
      if (window.location.pathname.includes('/mastery')) {
        // Trigger profile refresh if available
        const event = new CustomEvent('habitCompleted', { detail: { habitId, date } });
        window.dispatchEvent(event);
      }

    } catch (err) {
      setError('Failed to update habit completion');
    }
  };

  const calculateCurrentStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const sortedDates = [...completedDates].sort().reverse();
    
    let streak = 0;
    let currentDate = new Date(today);
    
    if (sortedDates.includes(todayString)) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const generateProgressGrid = (completedDates = [], color) => {
    const grid = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const cellIndex = week * 7 + day;
        const dayOfMonth = cellIndex - firstDayOfWeek + 1;
        
        if (dayOfMonth >= 1 && dayOfMonth <= lastDayOfMonth.getDate()) {
          const date = new Date(currentYear, currentMonth, dayOfMonth);
          const dateString = date.toISOString().split('T')[0];
          const wasCompleted = completedDates.includes(dateString);
          
          grid.push({
            date: dateString,
            dayOfMonth: dayOfMonth,
            filled: wasCompleted,
            color: wasCompleted ? color : '#ffffff',
            isCurrentMonth: true
          });
        } else {
          grid.push({
            date: null,
            dayOfMonth: null,
            filled: false,
            color: '#ffffff',
            isCurrentMonth: false
          });
        }
      }
    }
    
    return grid;
  };

  const handleCreateHabit = async () => {
    if (!newHabit.title.trim() || !user) return;
    
    
    try {
      // Create custom habit in Supabase
      const { data, error } = await supabase
        .from('user_habits')
        .insert({
          user_id: user.id,
          title: newHabit.title,
          description: newHabit.description,
          frequency_type: newHabit.frequency_type,
          xp_reward: newHabit.xp_reward,
          is_custom: true,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newHabitData = {
        id: data.id,
        title: data.title,
        description: data.description,
        frequency_type: data.frequency_type,
        xp_reward: data.xp_reward,
        currentStreak: 0,
        completedDates: [],
        color: getHabitColor(habits.length),
        Icon: getHabitIcon(data.title)
      };
      
      setHabits(prev => [...prev, newHabitData]);
      setNewHabit({ title: '', description: '', frequency_type: 'daily', xp_reward: 10 });
      setShowAddHabit(false);
      
    } catch (err) {
      setError('Failed to create habit');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    
    if (!user) return;
    
    try {
      // Delete from Supabase (set is_active to false)
      const { error } = await supabase
        .from('user_habits')
        .update({ is_active: false })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setHabits(prev => prev.filter(h => h.id !== habitId));
      
    } catch (err) {
      setError('Failed to delete habit');
    }
  };

  // Error display
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading habits</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Habits (Simple Mode)</h2>
        <button
          onClick={() => setShowAddHabit(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading habits...</div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-600 mb-4">Start building good habits to track your progress</p>
            <button
              onClick={() => setShowAddHabit(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {habits.map((habit) => {
              const Icon = habit.Icon;
              return (
                <div key={habit.id} className="bg-ethereal-glass rounded-ethereal shadow-ethereal-base border border-ethereal p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: habit.color + '20' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: habit.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-ethereal-white">{habit.title}</h3>
                        <p className="text-sm text-ethereal-text">{habit.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Flame className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-sm font-medium text-ethereal-white">{habit.currentStreak}</span>
                        <span className="text-sm text-ethereal-text ml-1">day streak</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-ethereal-white">{habit.xp_reward}</span>
                        <span className="text-sm text-ethereal-text ml-1">XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {generateProgressGrid(habit.completedDates, habit.color).map((cell, index) => (
                      <button
                        key={index}
                        onClick={() => cell.isCurrentMonth && handleToggleHabit(habit.id, cell.date)}
                        className={`w-6 h-6 rounded text-xs ${
                          cell.isCurrentMonth 
                            ? 'hover:opacity-80 cursor-pointer' 
                            : 'cursor-default'
                        }`}
                        style={{ 
                          backgroundColor: cell.filled ? habit.color : '#f3f4f6',
                          border: cell.filled ? `1px solid ${habit.color}` : '1px solid #e5e7eb'
                        }}
                        disabled={!cell.isCurrentMonth}
                      >
                        {cell.dayOfMonth}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Habit Modal */}
      {showAddHabit && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" style={{ width: '100vw', height: '100vh' }}>
          <div className="bg-ethereal-glass rounded-ethereal border border-ethereal p-6 w-full max-w-md my-auto" style={{ maxHeight: 'calc(100vh - 40px)' }}>
            <h3 className="text-lg font-semibold mb-4">Create New Habit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newHabit.title}
                  onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                  className="w-full px-3 py-2 border border-ethereal rounded-ethereal-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-ethereal-glass text-ethereal-text"
                  placeholder="e.g., Read for 30 minutes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  className="w-full px-3 py-2 border border-ethereal rounded-ethereal-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-ethereal-glass text-ethereal-text"
                  rows="3"
                  placeholder="Describe your habit..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">XP Reward</label>
                <input
                  type="number"
                  value={newHabit.xp_reward}
                  onChange={(e) => setNewHabit({ ...newHabit, xp_reward: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 border border-ethereal rounded-ethereal-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-ethereal-glass text-ethereal-text"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddHabit(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateHabit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Habit
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HabitsTabSimple;
