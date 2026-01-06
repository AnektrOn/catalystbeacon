import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle, Star, Laptop, BookOpen, Dumbbell, Flame, Trash2 } from 'lucide-react';
import masteryService from '../../services/masteryService';
import { useAuth } from '../../contexts/AuthContext';
import { handleError } from '../../utils/errorHandler';

// Helper function to calculate current streak from completion dates
const calculateCurrentStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Sort dates in descending order (most recent first)
  const sortedDates = [...completedDates].sort().reverse();
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check if today is completed
  if (sortedDates.includes(todayString)) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    // If today is not completed, start from yesterday
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // Count consecutive days backwards
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

// Helper function to generate progress grid for current month with proper calendar layout
const generateProgressGrid = (completedDates = [], color) => {
  const grid = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get first day of current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Create 6 rows x 7 columns = 42 cells to cover any month
  for (let week = 0; week < 6; week++) {
    for (let day = 0; day < 7; day++) {
      const cellIndex = week * 7 + day;
      const dayOfMonth = cellIndex - firstDayOfWeek + 1;
      
      // Check if this cell represents a valid day of the month
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
        // Empty cell for days outside the current month
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

// Helper function to get appropriate icon and color for habits
const getHabitIconAndColor = (title) => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('read') || titleLower.includes('book')) {
    return { icon: BookOpen, color: '#10b981' }; // Green
  } else if (titleLower.includes('workout') || titleLower.includes('exercise') || titleLower.includes('gym')) {
    return { icon: Dumbbell, color: '#8b5cf6' }; // Purple
  } else if (titleLower.includes('build') || titleLower.includes('code') || titleLower.includes('program')) {
    return { icon: Laptop, color: '#3b82f6' }; // Blue
  } else if (titleLower.includes('meditation') || titleLower.includes('mindfulness')) {
    return { icon: Star, color: '#f59e0b' }; // Orange
  } else if (titleLower.includes('journal') || titleLower.includes('write')) {
    return { icon: BookOpen, color: '#ef4444' }; // Red
  } else {
    return { icon: Target, color: '#6b7280' }; // Gray default
  }
};

const HabitsTab = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [personalHabits, setPersonalHabits] = useState([]);
  const [habitsLibrary, setHabitsLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    frequency_type: 'daily',
    xp_reward: 10
  });

  // Load habits data
  useEffect(() => {
    const loadHabits = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Load user habits with completion data
        const { data: userHabits, error: userHabitsError } = await masteryService.getUserHabits(user.id);
        if (userHabitsError) throw userHabitsError;

        // Load habits library
        const { data: libraryHabits, error: libraryError } = await masteryService.getHabitsLibrary();
        if (libraryError) throw libraryError;

        // Transform user habits to include completion data and UI properties
        const transformedHabits = await Promise.all(
          (userHabits || []).map(async (habit) => {
            // Get completions for the entire current month (not just 30 days)
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

            // Get appropriate icon and color
            const { icon, color } = getHabitIconAndColor(habit.title);

            return {
              ...habit,
              completed_dates: completedDates,
              completed_today: completedDates.includes(todayString),
              streak: streak || 0,
              icon,
              color,
              progress_grid: generateProgressGrid(completedDates, color)
            };
          })
        );

        setPersonalHabits(transformedHabits);
        setHabitsLibrary(libraryHabits || []);
      } catch (error) {
        handleError(error, 'loading habits', setError, setLoading);
      } finally {
        setLoading(false);
      }
    };

    loadHabits();
  }, [user]);

  // Add habit from library to personal
  const addHabitFromLibrary = async (habit) => {
    if (!user) return;
    
    try {
      const { error } = await masteryService.addHabitFromLibrary(user.id, habit.id);
      if (error) throw error;

      // Reload habits to get the updated list
      const { data: userHabits } = await masteryService.getUserHabits(user.id);
      if (userHabits) {
        // Transform the updated habits
        const transformedHabits = await Promise.all(
          userHabits.map(async (h) => {
            // Get completions for the entire current month
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const { data: completions } = await masteryService.getHabitCompletions(
              user.id,
              h.id,
              firstDayOfMonth.toISOString().split('T')[0],
              lastDayOfMonth.toISOString().split('T')[0]
            );

            const { data: streak } = await masteryService.calculateHabitStreak(user.id, h.id);
            const completedDates = (completions || []).map(c => c.completed_at.split('T')[0]);
            const todayString = today.toISOString().split('T')[0];
            const { icon, color } = getHabitIconAndColor(h.title);

            return {
              ...h,
              completed_dates: completedDates,
              completed_today: completedDates.includes(todayString),
              streak: streak || 0,
              icon,
              color,
              progress_grid: generateProgressGrid(completedDates, color)
            };
          })
        );

        setPersonalHabits(transformedHabits);
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      setError(error.message);
    }
  };

  // Create custom habit
  const createCustomHabit = async () => {
    if (!user) return;
    
    try {
      const { data: customHabit, error } = await masteryService.createCustomHabit(user.id, newHabit);
      if (error) throw error;

      // Reload habits to get the updated list
      const { data: userHabits } = await masteryService.getUserHabits(user.id);
      if (userHabits) {
        // Transform the updated habits
        const transformedHabits = await Promise.all(
          userHabits.map(async (h) => {
            // Get completions for the entire current month
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const { data: completions } = await masteryService.getHabitCompletions(
              user.id,
              h.id,
              firstDayOfMonth.toISOString().split('T')[0],
              lastDayOfMonth.toISOString().split('T')[0]
            );

            const { data: streak } = await masteryService.calculateHabitStreak(user.id, h.id);
            const completedDates = (completions || []).map(c => c.completed_at.split('T')[0]);
            const todayString = today.toISOString().split('T')[0];
            const { icon, color } = getHabitIconAndColor(h.title);

            return {
              ...h,
              completed_dates: completedDates,
              completed_today: completedDates.includes(todayString),
              streak: streak || 0,
              icon,
              color,
              progress_grid: generateProgressGrid(completedDates, color)
            };
          })
        );

        setPersonalHabits(transformedHabits);
      }

      setNewHabit({ title: '', description: '', frequency_type: 'daily', xp_reward: 10 });
      setShowAddHabit(false);
    } catch (error) {
      console.error('Error creating habit:', error);
      setError(error.message);
    }
  };

  // Delete habit
  const deleteHabit = async (habitId) => {
    if (!user) return;
    
    try {
      const { error } = await masteryService.deleteUserHabit(habitId);
      if (error) throw error;

      // Reload habits to get updated data
      const { data: userHabits } = await masteryService.getUserHabits(user.id);
      if (userHabits) {
        // Transform the updated habits
        const transformedHabits = await Promise.all(
          userHabits.map(async (h) => {
            // Get completions for the entire current month
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const { data: completions } = await masteryService.getHabitCompletions(
              user.id,
              h.id,
              firstDayOfMonth.toISOString().split('T')[0],
              lastDayOfMonth.toISOString().split('T')[0]
            );

            const { data: streak } = await masteryService.calculateHabitStreak(user.id, h.id);
            const completedDates = (completions || []).map(c => c.completed_at.split('T')[0]);
            const todayString = today.toISOString().split('T')[0];
            const { icon, color } = getHabitIconAndColor(h.title);

            return {
              ...h,
              completed_dates: completedDates,
              completed_today: completedDates.includes(todayString),
              streak: streak || 0,
              icon,
              color,
              progress_grid: generateProgressGrid(completedDates, color)
            };
          })
        );

        setPersonalHabits(transformedHabits);
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      setError(error.message);
    }
  };

  // Complete habit
  const completeHabit = async (habitId) => {
    if (!user) return;
    
    try {
      const { data: completion, error } = await masteryService.completeHabit(user.id, habitId);
      if (error) throw error;

      // Reload habits to get updated data
      const { data: userHabits } = await masteryService.getUserHabits(user.id);
      if (userHabits) {
        // Transform the updated habits
        const transformedHabits = await Promise.all(
          userHabits.map(async (h) => {
            // Get completions for the entire current month
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const { data: completions } = await masteryService.getHabitCompletions(
              user.id,
              h.id,
              firstDayOfMonth.toISOString().split('T')[0],
              lastDayOfMonth.toISOString().split('T')[0]
            );

            const { data: streak } = await masteryService.calculateHabitStreak(user.id, h.id);
            const completedDates = (completions || []).map(c => c.completed_at.split('T')[0]);
            const todayString = today.toISOString().split('T')[0];
            const { icon, color } = getHabitIconAndColor(h.title);

            return {
              ...h,
              completed_dates: completedDates,
              completed_today: completedDates.includes(todayString),
              streak: streak || 0,
              icon,
              color,
              progress_grid: generateProgressGrid(completedDates, color)
            };
          })
        );

        setPersonalHabits(transformedHabits);
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
        <span className="ml-2 text-gray-600">Loading habits...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading habits</div>
          <div className="text-sm text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 text-white rounded transition-colors"
            style={{ background: 'var(--gradient-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="glass-tab-navigation">
        <nav className="flex space-x-1" role="tablist">
          <button
            onClick={() => setActiveTab('personal')}
            className={`glass-tab-btn ${activeTab === 'personal' ? 'glass-tab-btn-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'personal'}
            aria-label={`My Habits (${personalHabits.length} habits)`}
          >
            <Target size={20} className="mr-2" aria-hidden="true" />
            My Habits ({personalHabits.length})
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`glass-tab-btn ${activeTab === 'library' ? 'glass-tab-btn-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'library'}
            aria-label={`Library (${habitsLibrary.length} habits)`}
          >
            <Star size={20} className="mr-2" aria-hidden="true" />
            Library ({habitsLibrary.length})
          </button>
        </nav>
      </div>

      {/* Personal Habits Tab */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          {/* Add Custom Habit Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Habits
            </h2>
            <button
              onClick={() => setShowAddHabit(true)}
              className="glass-primary-btn"
              aria-label="Add new custom habit"
             aria-label="Add new custom habit">
              <Plus size={20} className="mr-2" aria-hidden="true" />
              Add Custom Habit
            </button>
          </div>

          {/* Add Custom Habit Form */}
          {showAddHabit && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create Custom Habit
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Habit Title
                  </label>
                  <input
                    type="text"
                    value={newHabit.title}
                    onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                    className="glass-input"
                    placeholder="e.g., Morning Meditation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    className="glass-input"
                    rows={3}
                    placeholder="Describe your habit..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frequency
                    </label>
                    <select
                      value={newHabit.frequency_type}
                      onChange={(e) => setNewHabit({ ...newHabit, frequency_type: e.target.value })}
                      className="glass-input"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      value={newHabit.xp_reward}
                      onChange={(e) => setNewHabit({ ...newHabit, xp_reward: parseInt(e.target.value) })}
                      className="glass-input"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createCustomHabit}
                    className="glass-primary-btn"
                    disabled={!newHabit.title.trim()}
                    aria-label="Create new custom habit"
                   aria-label="Create new custom habit">
                    Create Habit
                  </button>
                  <button
                    onClick={() => setShowAddHabit(false)}
                    className="glass-secondary-btn"
                    aria-label="Cancel creating habit"
                   aria-label="Cancel creating habit">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Personal Habits List */}
          <div className="flex flex-wrap gap-3">
            {personalHabits.map(habit => {
              const IconComponent = habit.icon;
              return (
                <div key={habit.id} className="rounded-lg p-4 shadow-sm w-80 glass-effect" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 80%, transparent)' }}>
                  <div className="flex items-center justify-between">
                    {/* Left Section - Icon, Title, and Completion Button */}
                    <div className="flex items-center space-x-3">
                      <IconComponent size={16} className="text-white" strokeWidth={1.5} />
                      <h3 className="text-sm font-semibold text-white">
                        {habit.title}
                      </h3>
                      <button
                        onClick={() => completeHabit(habit.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          habit.completed_today
                            ? 'text-white'
                            : 'border-2 border-white text-white hover:bg-white'
                        }`}
                        style={habit.completed_today ? { background: 'var(--gradient-primary)' } : {}}
                        onMouseEnter={!habit.completed_today ? (e) => e.currentTarget.style.color = 'var(--color-primary)' : undefined}
                        onMouseLeave={!habit.completed_today ? (e) => e.currentTarget.style.color = 'white' : undefined}
                        aria-label={habit.completed_today ? `Mark ${habit.title} as incomplete` : `Complete ${habit.title}`}
                        aria-pressed={habit.completed_today}
                      >
                        <CheckCircle size={12} strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Right Section - Streak, Progress Grid, and Delete Button */}
                    <div className="flex items-center space-x-3">
                      {/* Streak Counter */}
                      <div className="flex items-center space-x-1">
                        <Flame size={14} className="text-white" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-white">
                          {habit.streak}
                        </span>
                      </div>

                      {/* Progress Grid - Monthly Calendar Layout */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {habit.progress_grid.map((day, index) => (
                          <div
                            key={index}
                            className={`w-2.5 h-2.5 rounded-sm ${
                              day.isCurrentMonth ? '' : 'opacity-30'
                            }`}
                            style={{ 
                              backgroundColor: day.filled ? day.color : '#ffffff',
                              border: day.isCurrentMonth ? 'none' : '1px solid #e5e7eb'
                            }}
                            title={day.date ? new Date(day.date).toLocaleDateString() : ''}
                          />
                        ))}
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                        aria-label={`Delete habit ${habit.title}`}
                        title="Delete habit"
                      >
                        <Trash2 size={12} strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {personalHabits.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Target size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} aria-hidden="true"/>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No habits yet
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Start building your habits by adding from the library or creating custom ones. Every journey begins with a single step!
              </p>
              <button
                onClick={() => setActiveTab('library')}
                className="glass-primary-btn"
                aria-label="Browse habits library"
                role="tab" 
                aria-selected={activeTab === 'library'}
              >
                Browse Library
              </button>
            </div>
          )}
        </div>
      )}

      {/* Habits Library Tab */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Habits Library
          </h2>
          
          <div className="grid gap-4">
            {habitsLibrary.map(habit => (
              <div key={habit.id} className="glass-habit-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {habit.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {habit.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                        +{habit.xp_reward} XP
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {habit.frequency_type}
                      </span>
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        {habit.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addHabitFromLibrary(habit)}
                    className="glass-primary-btn"
                    aria-label={`Add ${habit.title} to your habits`}
                   aria-label={`Add ${habit.title} to your habits`}>
                    <Plus size={20} className="mr-2"  aria-hidden="true"/>
                    Add to My Habits
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsTab;
