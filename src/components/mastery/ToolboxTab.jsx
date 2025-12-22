import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Target, Trash2, CheckCircle, Clock, Star } from 'lucide-react';
import masteryService from '../../services/masteryService';
import { useAuth } from '../../contexts/AuthContext';
import { handleError, clearError } from '../../utils/errorHandler';
import toast from 'react-hot-toast';

// Helper function to calculate current streak from completion dates
const calculateCurrentStreak = (completedDates = []) => {
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

// Helper function to get appropriate color for toolbox items
const getToolboxColor = (title) => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('pomodoro') || titleLower.includes('time')) {
    return '#3B82F6'; // Blue
  } else if (titleLower.includes('mind') || titleLower.includes('map')) {
    return '#8B5CF6'; // Purple
  } else if (titleLower.includes('meditation') || titleLower.includes('mindfulness')) {
    return '#10B981'; // Green
  } else if (titleLower.includes('listening') || titleLower.includes('communication')) {
    return '#F59E0B'; // Orange
  } else {
    return '#6B7280'; // Gray default
  }
};

const ToolboxTab = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [toolboxLibrary, setToolboxLibrary] = useState([]);
  const [userToolbox, setUserToolbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [conversionData, setConversionData] = useState({
    frequency_type: 'daily'
  });

  // Load toolbox data
  useEffect(() => {
    const loadToolbox = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Load toolbox library
        const { data: libraryData, error: libraryError } = await masteryService.getToolboxLibrary();
        if (libraryError) throw libraryError;

        // Load user toolbox items
        const { data: userToolboxData, error: userToolboxError } = await masteryService.getUserToolboxItems(user.id);
        if (userToolboxError) throw userToolboxError;

        // Transform user toolbox items to include real usage data and UI properties
        const transformedUserToolbox = await Promise.all(
          (userToolboxData || []).map(async (item) => {
            // Get real usage data for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const today = new Date();
            
            const { data: usageData } = await masteryService.getToolboxUsage(
              user.id,
              item.id,
              thirtyDaysAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            );

            // Get usage dates from real data
            const usageDates = (usageData || []).map(usage => usage.used_at.split('T')[0]);
            const todayString = today.toISOString().split('T')[0];
            const isUsedToday = usageDates.includes(todayString);
            const totalXPEarned = (usageData || []).reduce((sum, usage) => sum + (usage.xp_earned || 0), 0);

            return {
              ...item,
              title: item.toolbox_library?.title || 'Unknown Tool',
              description: item.toolbox_library?.description || 'No description available',
              usage_count: usageData?.length || 0,
              last_used: usageDates[usageDates.length - 1] || null,
              xp_earned: totalXPEarned,
              color: getToolboxColor(item.toolbox_library?.title || 'Unknown Tool'),
              completed_dates: usageDates,
              used_today: isUsedToday,
              streak: calculateCurrentStreak(usageDates)
            };
          })
        );

        setToolboxLibrary(libraryData || []);
        setUserToolbox(transformedUserToolbox);
      } catch (error) {
        console.error('Error loading toolbox:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadToolbox();
  }, [user]);

  // Add tool to user toolbox
  const addToolToUser = async (tool) => {
    if (!user) return;
    
    try {
      const { error } = await masteryService.addToolboxItem(user.id, tool.id);
      if (error) throw error;

      // Reload toolbox to get updated data
      const { data: userToolboxData } = await masteryService.getUserToolboxItems(user.id);
      if (userToolboxData) {
        // Transform the updated toolbox items with real data
        const transformedUserToolbox = await Promise.all(
          userToolboxData.map(async (item) => {
            // Get real usage data for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const today = new Date();
            
            const { data: usageData } = await masteryService.getToolboxUsage(
              user.id,
              item.id,
              thirtyDaysAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            );

            // Get usage dates from real data
            const usageDates = (usageData || []).map(usage => usage.used_at.split('T')[0]);
            const todayString = today.toISOString().split('T')[0];
            const isUsedToday = usageDates.includes(todayString);
            const totalXPEarned = (usageData || []).reduce((sum, usage) => sum + (usage.xp_earned || 0), 0);

            return {
              ...item,
              title: item.toolbox_library?.title || 'Unknown Tool',
              description: item.toolbox_library?.description || 'No description available',
              usage_count: usageData?.length || 0,
              last_used: usageDates[usageDates.length - 1] || null,
              xp_earned: totalXPEarned,
              color: getToolboxColor(item.toolbox_library?.title || 'Unknown Tool'),
              completed_dates: usageDates,
              used_today: isUsedToday,
              streak: calculateCurrentStreak(usageDates)
            };
          })
        );

        setUserToolbox(transformedUserToolbox);
      }
    } catch (error) {
      console.error('Error adding tool:', error);
      setError(error.message);
    }
  };

  // Convert tool to habit
  const convertToolToHabit = async () => {
    if (!user || !selectedTool) return;
    
    try {
      // Create a custom habit from the toolbox item
      const habitData = {
        title: selectedTool.toolbox_library?.title || selectedTool.title,
        description: selectedTool.toolbox_library?.description || selectedTool.description,
        frequency_type: conversionData.frequency_type,
        xp_reward: selectedTool.toolbox_library?.xp_reward || 15, // Use the XP from the toolbox library
        skill_tags: selectedTool.toolbox_library?.skill_tags || [],
        is_custom: true,
        converted_from_toolbox_id: selectedTool.toolbox_id
      };

      const { data: newHabit, error: habitError } = await masteryService.createCustomHabit(user.id, habitData);
      if (habitError) throw habitError;

      // Update the toolbox item to mark it as converted
      const { error: updateError } = await masteryService.updateUserToolboxItem(
        selectedTool.id, 
        { converted_to_habit_id: newHabit.id }
      );
      if (updateError) throw updateError;

      // Reload toolbox to get updated data
      const { data: userToolboxData } = await masteryService.getUserToolboxItems(user.id);
      if (userToolboxData) {
        // Transform the updated toolbox items with real data
        const transformedUserToolbox = await Promise.all(
          userToolboxData.map(async (item) => {
            // Get real usage data for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const today = new Date();
            
            const { data: usageData } = await masteryService.getToolboxUsage(
              user.id,
              item.id,
              thirtyDaysAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            );

            // Get usage dates from real data
            const usageDates = (usageData || []).map(usage => usage.used_at.split('T')[0]);
            const todayString = today.toISOString().split('T')[0];
            const isUsedToday = usageDates.includes(todayString);
            const totalXPEarned = (usageData || []).reduce((sum, usage) => sum + (usage.xp_earned || 0), 0);

            return {
              ...item,
              title: item.toolbox_library?.title || 'Unknown Tool',
              description: item.toolbox_library?.description || 'No description available',
              usage_count: usageData?.length || 0,
              last_used: usageDates[usageDates.length - 1] || null,
              xp_earned: totalXPEarned,
              color: getToolboxColor(item.toolbox_library?.title || 'Unknown Tool'),
              completed_dates: usageDates,
              used_today: isUsedToday,
              streak: calculateCurrentStreak(usageDates)
            };
          })
        );

        setUserToolbox(transformedUserToolbox);
      }
      
      setShowConvertModal(false);
      setSelectedTool(null);
      setConversionData({ frequency_type: 'daily' }); // Reset form
    } catch (error) {
      console.error('Error converting tool to habit:', error);
      setError(error.message);
    }
  };

  // Remove tool from user toolbox
  const removeTool = async (toolId) => {
    if (!user) return;
    
    try {
      // Find the user toolbox item ID
      const toolboxItem = userToolbox.find(tool => tool.toolbox_library?.id === toolId || tool.id === toolId);
      if (!toolboxItem) {
        console.error('Toolbox item not found:', toolId);
        return;
      }

      // Use masteryService to remove the toolbox item
      const { error } = await masteryService.removeUserToolboxItem(toolboxItem.id);
      
      if (error) {
        console.error('Error removing tool:', error);
        handleError(error);
        return;
      }
      
      // Update local state
      setUserToolbox(userToolbox.filter(tool => tool.id !== toolboxItem.id));
    } catch (error) {
      console.error('Error removing tool:', error);
      handleError(error);
    }
  };

  // Check if tool is already in user toolbox
  const isToolInUserToolbox = (toolId) => {
    return userToolbox.some(tool => tool.toolbox_id === toolId);
  };

  // Helper function to generate progress grid for toolbox items
  const generateProgressGrid = (completedDates = [], color) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of current month and how many days it has
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const grid = [];
    
    // Create 6 rows (weeks) x 7 columns (days)
    for (let week = 0; week < 6; week++) {
      const weekRow = [];
      for (let day = 0; day < 7; day++) {
        const dayNumber = week * 7 + day - startingDayOfWeek + 1;
        
        if (dayNumber < 1 || dayNumber > daysInMonth) {
          // Day is outside current month
          weekRow.push(
            <div
              key={`${week}-${day}`}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: '#ffffff' }}
            />
          );
        } else {
          const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
          const isCompleted = completedDates.includes(dateString);
          
          weekRow.push(
            <div
              key={`${week}-${day}`}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: isCompleted ? color : '#ffffff' }}
            />
          );
        }
      }
      grid.push(weekRow);
    }
    
    return grid;
  };

  // Helper function to calculate current streak from completion dates
  const calculateCurrentStreak = (completedDates = []) => {
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

  // Use toolbox tool
  const handleUseTool = async (toolId) => {
    if (!user) return;
    
    try {
      const { error } = await masteryService.useToolboxItem(user.id, toolId);
      if (error) throw error;

      // Reload toolbox to get updated data with real usage
      const { data: userToolboxData } = await masteryService.getUserToolboxItems(user.id);
      if (userToolboxData) {
        // Transform the updated toolbox items with real usage data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const today = new Date();
        
        const transformedUserToolbox = await Promise.all(
          userToolboxData.map(async (item) => {
            // Get real usage data from Supabase
            const { data: usageData } = await masteryService.getToolboxUsage(
              user.id,
              item.id,
              thirtyDaysAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            );

            // Get usage dates from real data
            const usageDates = (usageData || []).map(usage => new Date(usage.used_at).toISOString().split('T')[0]);
            const todayString = today.toISOString().split('T')[0];
            const isUsedToday = usageDates.includes(todayString);
            const totalXPEarned = (usageData || []).reduce((sum, usage) => sum + (usage.xp_earned || 0), 0);

            return {
              ...item,
              title: item.toolbox_library?.title || 'Unknown Tool',
              description: item.toolbox_library?.description || 'No description available',
              usage_count: usageData?.length || 0,
              last_used: usageDates[usageDates.length - 1] || null,
              xp_earned: totalXPEarned,
              color: getToolboxColor(item.toolbox_library?.title || 'Unknown Tool'),
              completed_dates: usageDates,
              used_today: isUsedToday,
              streak: calculateCurrentStreak(usageDates)
            };
          })
        );

        setUserToolbox(transformedUserToolbox);
      }
    } catch (error) {
      console.error('Error using tool:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading toolbox...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading toolbox</div>
          <div className="text-sm text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('library')}
            className={`glass-tab-btn ${activeTab === 'library' ? 'glass-tab-btn-active' : ''}`}
          >
            <Wrench size={20} className="mr-2"  aria-hidden="true"/>
            Library ({toolboxLibrary.length})
          </button>
          <button
            onClick={() => setActiveTab('my-toolbox')}
            className={`glass-tab-btn ${activeTab === 'my-toolbox' ? 'glass-tab-btn-active' : ''}`}
          >
            <Target size={20} className="mr-2"  aria-hidden="true"/>
            My Toolbox ({userToolbox.length})
          </button>
        </nav>
      </div>

      {/* Toolbox Library Tab */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Learning Tools Library
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Discover powerful learning tools and techniques. Add them to your toolbox or convert them into habits.
          </p>
          
          <div className="grid gap-4">
            {toolboxLibrary.map(tool => (
              <div key={tool.id} className="glass-toolbox-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {tool.title}
                      </h3>
                      <span className="glass-difficulty-badge">
                        Level {tool.difficulty_level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {tool.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        +{tool.xp_reward} XP
                      </span>
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        {tool.category}
                      </span>
                      {tool.can_convert_to_habit && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Convertible to Habit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {!isToolInUserToolbox(tool.id) ? (
                      <button
                        onClick={() => addToolToUser(tool)}
                        className="glass-primary-btn"
                      >
                        <Plus size={16} className="mr-2"  aria-hidden="true"/>
                        Add to Toolbox
                      </button>
                    ) : (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ In Your Toolbox
                      </span>
                    )}
                    {tool.toolbox_library?.can_convert_to_habit && (
                      <button
                        onClick={() => {
                          setSelectedTool(tool);
                          setShowConvertModal(true);
                        }}
                        className={`glass-secondary-btn ${tool.converted_to_habit_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={tool.converted_to_habit_id}
                      >
                        <Target size={16} className="mr-2"  aria-hidden="true"/>
                        {tool.converted_to_habit_id ? 'Already Converted' : 'Convert to Habit'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Toolbox Tab */}
      {activeTab === 'my-toolbox' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Toolbox
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal collection of learning tools and techniques.
          </p>
          
          <div className="flex flex-wrap gap-3">
            {userToolbox.map(tool => {
              const today = new Date().toISOString().split('T')[0];
              const completedDates = tool.completed_dates || [];
              const isUsedToday = completedDates.includes(today);
              const streak = calculateCurrentStreak(completedDates);
              const progressGrid = generateProgressGrid(completedDates, tool.color || '#3B82F6');
              
              return (
                <div key={tool.id} className="w-80 bg-blue-900 rounded-lg p-4 text-white">
                  {/* Header with icon and title */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Wrench size={20} className="text-white" strokeWidth={1.5}  aria-hidden="true"/>
                      <h3 className="text-lg font-semibold text-white truncate">
                        {tool.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star size={16} className="text-yellow-400"  aria-hidden="true"/>
                      <span className="text-sm text-yellow-400 font-medium">
                        {tool.xp_earned} XP
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {tool.description}
                  </p>

                  {/* Usage button */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleUseTool(tool.id);
                      }}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isUsedToday
                          ? 'bg-blue-600 text-white'
                          : 'border border-white text-white hover:bg-white hover:text-blue-900'
                      }`}
                    >
                      <CheckCircle size={16} strokeWidth={1.5}  aria-hidden="true"/>
                      <span>{isUsedToday ? 'Used Today' : 'Use Tool'}</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock size={14} className="text-gray-300" />
                      <span className="text-gray-300">
                        {tool.usage_count} uses
                      </span>
                    </div>
                  </div>

                  {/* Streak counter */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-300">Streak:</span>
                      <span className="text-sm font-semibold text-white">
                        {streak} days
                      </span>
                    </div>
                    
                    {!tool.converted_to_habit_id && (
                      <button
                        onClick={() => {
                          const libraryTool = toolboxLibrary.find(t => t.id === tool.toolbox_id);
                          if (libraryTool) {
                            setSelectedTool(libraryTool);
                            setShowConvertModal(true);
                          }
                        }}
                        className="text-xs text-blue-300 hover:text-blue-200 underline"
                      >
                        Convert to Habit
                      </button>
                    )}
                  </div>

                  {/* Progress grid */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-7 gap-1">
                      {progressGrid.map((week, weekIndex) =>
                        week.map((day, dayIndex) => (
                          <div key={`${weekIndex}-${dayIndex}`}>
                            {day}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Remove button */}
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => removeTool(tool.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} strokeWidth={1.5}  aria-hidden="true"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {userToolbox.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Wrench size={48} className="mx-auto text-gray-400 mb-4"  aria-hidden="true"/>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your toolbox is empty
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your learning toolkit by exploring the library.
              </p>
              <button
                onClick={() => setActiveTab('library')}
                className="glass-primary-btn"
               role="tab" aria-selected={activeTab === 'library'} aria-label="Toolbox Library" aria-label="Browse toolbox library">
                Browse Library
              </button>
            </div>
          )}
        </div>
      )}

      {/* Convert to Habit Modal */}
      {showConvertModal && selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-modal">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Convert "{selectedTool.title}" to Habit
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {selectedTool.description}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  value={conversionData.frequency_type}
                  onChange={(e) => setConversionData({ ...conversionData, frequency_type: e.target.value })}
                  className="glass-input"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={convertToolToHabit}
                className="glass-primary-btn"
              >
                Convert to Habit
              </button>
              <button
                onClick={() => {
                  setShowConvertModal(false);
                  setSelectedTool(null);
                }}
                className="glass-secondary-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolboxTab;
