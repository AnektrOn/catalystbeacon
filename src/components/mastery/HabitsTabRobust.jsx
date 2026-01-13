import React, { useState, useEffect } from 'react';
import { Plus, Target, Star, BookOpen, Dumbbell, Flame, Trash2 } from 'lucide-react';
import masteryService from '../../services/masteryService';
import { useAuth } from '../../contexts/AuthContext';

// Helper function to calculate current streak from completion dates
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

// Helper function to get appropriate icon and color for habits
const getHabitIconAndColor = (title) => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('read') || titleLower.includes('book')) {
    return { icon: BookOpen, color: '#10b981' };
  } else if (titleLower.includes('workout') || titleLower.includes('exercise') || titleLower.includes('gym')) {
    return { icon: Dumbbell, color: '#8b5cf6' };
  } else if (titleLower.includes('build') || titleLower.includes('code') || titleLower.includes('program')) {
    return { icon: Target, color: '#3b82f6' };
  } else if (titleLower.includes('meditation') || titleLower.includes('mindfulness')) {
    return { icon: Star, color: '#f59e0b' };
  } else {
    return { icon: Target, color: '#6b7280' };
  }
};

const HabitsTabRobust = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [personalHabits, setPersonalHabits] = useState([]);
  const [habitsLibrary, setHabitsLibrary] = useState([]);
  const [error, setError] = useState(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    frequency_type: 'daily',
    xp_reward: 10
  });

  // Simple data loading without loading states
  useEffect(() => {
    const loadHabits = async () => {
      if (!user) {
        console.log('📝 HabitsTab: No user, skipping data load');
        return;
      }
      
      console.log('📝 HabitsTab: Loading habits data for user:', user.id);
      setError(null);
      
      try {
        // Load user habits with completion data
        const { data: userHabits, error: userHabitsError } = await masteryService.getUserHabits(user.id);
        if (userHabitsError) {
          console.error('❌ HabitsTab: Error loading user habits:', userHabitsError);
          setError('Failed to load habits');
          return;
        }

        // Load habits library
        const { data: libraryHabits, error: libraryError } = await masteryService.getHabitsLibrary();
        if (libraryError) {
          console.error('❌ HabitsTab: Error loading habits library:', libraryError);
          setError('Failed to load habits library');
          return;
        }

        // Transform user habits to include completion data and UI properties
        const transformedHabits = await Promise.all(
          (userHabits || []).map(async (habit) => {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const { data: completions } = await masteryService.getHabitCompletions(
              user.id,
              habit.id,
              firstDayOfMonth.toISOString().split('T')[0],
              lastDayOfMonth.toISOString().split('T')[0]
            );

            const completedDates = (completions || []).map(c => c.completion_date);
            const currentStreak = calculateCurrentStreak(completedDates);
            const { icon: Icon, color } = getHabitIconAndColor(habit.title);

            return {
              ...habit,
              completedDates,
              currentStreak,
              Icon,
              color,
              progressGrid: generateProgressGrid(completedDates, color)
            };
          })
        );

        setPersonalHabits(transformedHabits);
        setHabitsLibrary(libraryHabits || []);
        console.log('✅ HabitsTab: Habits loaded successfully:', transformedHabits.length, 'personal habits,', libraryHabits?.length || 0, 'library habits');
      } catch (error) {
        console.error('❌ HabitsTab: Exception during habits load:', error);
        setError('Failed to load habits data');
      }
    };

    loadHabits();
  }, [user]);

  // Simple progress grid generation
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

  const handleToggleHabit = async (habitId, date) => {
    if (!user) return;
    
    try {
      console.log('📝 HabitsTab: Toggling habit completion:', habitId, date);
      
      const { error } = await masteryService.toggleHabitCompletion(user.id, habitId, date);
      if (error) {
        console.error('❌ HabitsTab: Error toggling habit:', error);
        setError('Failed to update habit');
        return;
      }

      // Reload habits data
      const { data: userHabits } = await masteryService.getUserHabits(user.id);
      if (userHabits) {
        const transformedHabits = await Promise.all(
          userHabits.map(async (habit) => {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const { data: completions } = await masteryService.getHabitCompletions(
              user.id,
              habit.id,
              firstDayOfMonth.toISOString().split('T')[0],
              lastDayOfMonth.toISOString().split('T')[0]
            );

            const completedDates = (completions || []).map(c => c.completion_date);
            const currentStreak = calculateCurrentStreak(completedDates);
            const { icon: Icon, color } = getHabitIconAndColor(habit.title);

            return {
              ...habit,
              completedDates,
              currentStreak,
              Icon,
              color,
              progressGrid: generateProgressGrid(completedDates, color)
            };
          })
        );
        setPersonalHabits(transformedHabits);
      }
      
      console.log('✅ HabitsTab: Habit toggled successfully');
    } catch (error) {
      console.error('❌ HabitsTab: Exception during habit toggle:', error);
      setError('Failed to update habit');
    }
  };

  const handleCreateHabit = async () => {
    if (!user || !newHabit.title.trim()) return;
    
    try {
      console.log('📝 HabitsTab: Creating new habit:', newHabit.title);
      
      const { error } = await masteryService.createUserHabit(user.id, newHabit);
      if (error) {
        console.error('❌ HabitsTab: Error creating habit:', error);
        setError('Failed to create habit');
        return;
      }

      setNewHabit({ title: '', description: '', frequency_type: 'daily', xp_reward: 10 });
      setShowAddHabit(false);
      
      // Reload habits
      const { data: userHabits } = await masteryService.getUserHabits(user.id);
      if (userHabits) {
        const transformedHabits = await Promise.all(
          userHabits.map(async (habit) => {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const { data: completions } = await masteryService.getHabitCompletions(
              user.id,
              habit.id,
              firstDayOfMonth.toISOString().split('T')[0],
              lastDayOfMonth.toISOString().split('T')[0]
            );

            const completedDates = (completions || []).map(c => c.completion_date);
            const currentStreak = calculateCurrentStreak(completedDates);
            const { icon: Icon, color } = getHabitIconAndColor(habit.title);

            return {
              ...habit,
              completedDates,
              currentStreak,
              Icon,
              color,
              progressGrid: generateProgressGrid(completedDates, color)
            };
          })
        );
        setPersonalHabits(transformedHabits);
      }
      
      console.log('✅ HabitsTab: Habit created successfully');
    } catch (error) {
      console.error('❌ HabitsTab: Exception during habit creation:', error);
      setError('Failed to create habit');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!user) return;
    
    try {
      console.log('📝 HabitsTab: Deleting habit:', habitId);
      
      const { error } = await masteryService.deleteUserHabit(user.id, habitId);
      if (error) {
        console.error('❌ HabitsTab: Error deleting habit:', error);
        setError('Failed to delete habit');
        return;
      }

      setPersonalHabits(prev => prev.filter(h => h.id !== habitId));
      console.log('✅ HabitsTab: Habit deleted successfully');
    } catch (error) {
      console.error('❌ HabitsTab: Exception during habit deletion:', error);
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
        <h2 className="text-2xl font-bold text-gray-900">Habits</h2>
        <button
          onClick={() => setShowAddHabit(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'personal'
              ? 'bg-ethereal-glass text-blue-600 shadow-ethereal-base'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Habits ({personalHabits.length})
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'library'
              ? 'bg-ethereal-glass text-blue-600 shadow-ethereal-base'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Library ({habitsLibrary.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          {personalHabits.length === 0 ? (
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
              {personalHabits.map((habit) => {
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
                          <h3 className="text-lg font-semibold text-gray-900">{habit.title}</h3>
                          <p className="text-sm text-gray-600">{habit.description}</p>
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
                          <span className="text-sm font-medium text-gray-900">{habit.currentStreak}</span>
                          <span className="text-sm text-gray-600 ml-1">day streak</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{habit.xp_reward}</span>
                          <span className="text-sm text-gray-600 ml-1">XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {habit.progressGrid.map((cell, index) => (
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
      )}

      {activeTab === 'library' && (
        <div className="grid gap-4">
          {habitsLibrary.map((habit) => {
            const { icon: Icon, color } = getHabitIconAndColor(habit.title);
            return (
              <div key={habit.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: color + '20' }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{habit.title}</h3>
                      <p className="text-sm text-gray-600">{habit.description}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add to My Habits
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Habit Modal */}
      {showAddHabit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ethereal-glass rounded-ethereal border border-ethereal p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Habit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newHabit.title}
                  onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Read for 30 minutes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
      )}
    </div>
  );
};

export default HabitsTabRobust;
