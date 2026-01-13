import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Target, Trash2, CheckCircle, Clock, Star } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

// Helper function to calculate current streak from completion dates
const calculateCurrentStreak = (completedDates = []) => {
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

const ToolboxTabFixed = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [toolboxLibrary, setToolboxLibrary] = useState([]);
  const [userToolbox, setUserToolbox] = useState([]);
  const [error, setError] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [conversionData, setConversionData] = useState({
    frequency_type: 'daily'
  });

  // Load toolbox data from database - NO LOADING STATE
  useEffect(() => {
    const loadToolbox = async () => {
      if (!user) {
        console.log('🔧 ToolboxTabFixed: No user, skipping data load');
        return;
      }
      
      console.log('🔧 ToolboxTabFixed: Loading toolbox data for user:', user.id);
      setError(null);
      
      try {
        // Load toolbox library from database
        const { data: libraryData, error: libraryError } = await supabase
          .from('toolbox_library')
          .select('*');

        if (libraryError) {
          console.error('❌ ToolboxTabFixed: Error loading toolbox library:', libraryError);
          setError('Failed to load toolbox library');
          return;
        }

        // Load user toolbox items from database
        const { data: userToolboxData, error: userToolboxError } = await supabase
          .from('user_toolbox_items')
          .select('*')
          .eq('user_id', user.id);

        if (userToolboxError) {
          console.error('❌ ToolboxTabFixed: Error loading user toolbox:', userToolboxError);
          setError('Failed to load user toolbox');
          return;
        }

        // Transform user toolbox items to include real usage data and UI properties
        const transformedUserToolbox = await Promise.all(
          (userToolboxData || []).map(async (item) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const today = new Date();
            
            // Try to get usage data, but don't fail if table doesn't exist
            let usageData = [];
            try {
              const { data: usage } = await supabase
                .from('toolbox_usage')
                .select('usage_date')
                .eq('user_id', user.id)
                .eq('toolbox_item_id', item.id)
                .gte('usage_date', thirtyDaysAgo.toISOString().split('T')[0])
                .lte('usage_date', today.toISOString().split('T')[0]);
              
              usageData = usage || [];
            } catch (usageError) {
              console.log('🔧 ToolboxTabFixed: toolbox_usage table not found, using empty usage');
              usageData = [];
            }

            const completedDates = usageData.map(u => u.usage_date);
            const currentStreak = calculateCurrentStreak(completedDates);
            const color = getToolboxColor(item.title);

            return {
              ...item,
              completedDates,
              currentStreak,
              color,
              totalUsage: usageData.length
            };
          })
        );

        setToolboxLibrary(libraryData || []);
        setUserToolbox(transformedUserToolbox);
        console.log('✅ ToolboxTabFixed: Toolbox loaded successfully:', transformedUserToolbox.length, 'user tools,', libraryData?.length || 0, 'library tools');
      } catch (error) {
        console.error('❌ ToolboxTabFixed: Exception during toolbox load:', error);
        setError('Failed to load toolbox data');
      }
    };

    loadToolbox();
  }, [user]);

  const handleConvertToHabit = async () => {
    if (!user || !selectedTool) return;
    
    try {
      console.log('🔧 ToolboxTabFixed: Converting tool to habit:', selectedTool.title);
      
      // Create a new habit from the tool
      const { error } = await supabase
        .from('user_habits')
        .insert({
          user_id: user.id,
          title: selectedTool.title,
          description: selectedTool.description,
          frequency_type: conversionData.frequency_type,
          xp_reward: selectedTool.xp_reward
        })
        .select()
        .single();

      if (error) {
        console.error('❌ ToolboxTabFixed: Error converting tool to habit:', error);
        setError('Failed to convert tool to habit');
        return;
      }

      setShowConvertModal(false);
      setSelectedTool(null);
      
      console.log('✅ ToolboxTabFixed: Tool converted to habit successfully');
    } catch (error) {
      console.error('❌ ToolboxTabFixed: Exception during tool conversion:', error);
      setError('Failed to convert tool to habit');
    }
  };

  const handleAddToToolbox = async (toolId) => {
    if (!user) return;
    
    try {
      console.log('🔧 ToolboxTabFixed: Adding tool to user toolbox:', toolId);
      
      // Get the tool from library
      const { data: tool, error: toolError } = await supabase
        .from('toolbox_library')
        .select('*')
        .eq('id', toolId)
        .single();

      if (toolError) {
        console.error('❌ ToolboxTabFixed: Error getting tool from library:', toolError);
        setError('Failed to get tool from library');
        return;
      }

      // Add to user toolbox
      const { data: insertedData, error } = await supabase
        .from('user_toolbox_items')
        .insert({
          user_id: user.id,
          toolbox_item_id: toolId,
          title: tool.title,
          description: tool.description,
          xp_reward: tool.xp_reward
        })
        .select()
        .single();

      if (error) {
        console.error('❌ ToolboxTabFixed: Error adding tool to toolbox:', error);
        setError('Failed to add tool to toolbox');
        return;
      }

      // Add to local state
      const color = getToolboxColor(insertedData.title);
      const newToolData = {
        ...insertedData,
        completedDates: [],
        currentStreak: 0,
        color,
        totalUsage: 0
      };

      setUserToolbox(prev => [...prev, newToolData]);
      
      console.log('✅ ToolboxTabFixed: Tool added to toolbox successfully');
    } catch (error) {
      console.error('❌ ToolboxTabFixed: Exception during tool addition:', error);
      setError('Failed to add tool to toolbox');
    }
  };

  const handleRemoveFromToolbox = async (toolId) => {
    if (!user) return;
    
    try {
      console.log('🔧 ToolboxTabFixed: Removing tool from user toolbox:', toolId);
      
      const { error } = await supabase
        .from('user_toolbox_items')
        .delete()
        .eq('id', toolId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ ToolboxTabFixed: Error removing tool from toolbox:', error);
        setError('Failed to remove tool from toolbox');
        return;
      }

      setUserToolbox(prev => prev.filter(t => t.id !== toolId));
      console.log('✅ ToolboxTabFixed: Tool removed from toolbox successfully');
    } catch (error) {
      console.error('❌ ToolboxTabFixed: Exception during tool removal:', error);
      setError('Failed to remove tool from toolbox');
    }
  };

  const handleRecordUsage = async (toolId) => {
    if (!user) return;
    
    try {
      console.log('🔧 ToolboxTabFixed: Recording tool usage:', toolId);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Try to record usage in database
      try {
        const { error: usageError } = await supabase
          .from('toolbox_usage')
          .upsert({
            user_id: user.id,
            toolbox_item_id: toolId,
            usage_date: today
          });

        if (usageError) {
          console.log('🔧 ToolboxTabFixed: toolbox_usage table not found, using local state only');
        }
      } catch (dbError) {
        console.log('🔧 ToolboxTabFixed: Database usage recording failed, using local state only');
      }

      // Update local state immediately for responsive UI
      setUserToolbox(prev => prev.map(tool => {
        if (tool.id === toolId) {
          const isUsedToday = tool.completedDates.includes(today);
          const newCompletedDates = isUsedToday 
            ? tool.completedDates.filter(d => d !== today)
            : [...tool.completedDates, today];
          
          return {
            ...tool,
            completedDates: newCompletedDates,
            currentStreak: calculateCurrentStreak(newCompletedDates),
            totalUsage: newCompletedDates.length
          };
        }
        return tool;
      }));
      
      console.log('✅ ToolboxTabFixed: Tool usage recorded successfully');
    } catch (error) {
      console.error('❌ ToolboxTabFixed: Exception during usage recording:', error);
      setError('Failed to record tool usage');
    }
  };

  // Error display
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading toolbox</div>
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
        <h2 className="text-2xl font-bold text-gray-900">Toolbox</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'library'
              ? 'bg-ethereal-glass text-blue-600 shadow-ethereal-base'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Library ({toolboxLibrary.length})
        </button>
        <button
          onClick={() => setActiveTab('my-tools')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my-tools'
              ? 'bg-ethereal-glass text-blue-600 shadow-ethereal-base'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Tools ({userToolbox.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'library' && (
        <div className="grid gap-4">
          {toolboxLibrary.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools in library</h3>
              <p className="text-gray-600">Toolbox library is empty</p>
            </div>
          ) : (
            toolboxLibrary.map((tool) => {
              const color = getToolboxColor(tool.title);
              const isInUserToolbox = userToolbox.some(ut => ut.toolbox_item_id === tool.id);
              
              return (
                <div key={tool.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                        style={{ backgroundColor: color + '20' }}
                      >
                        <Wrench className="w-6 h-6" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
                        <p className="text-gray-600 mb-3">{tool.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>XP: {tool.xp_reward}</span>
                          {tool.can_convert_to_habit && (
                            <span className="text-green-600">Can convert to habit</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {isInUserToolbox ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddToToolbox(tool.id)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'my-tools' && (
        <div className="space-y-4">
          {userToolbox.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools yet</h3>
              <p className="text-gray-600 mb-4">Add tools from the library to start tracking your usage</p>
              <button
                onClick={() => setActiveTab('library')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
               role="tab" aria-selected={activeTab === 'library'} aria-label="Toolbox Library">
                Browse Library
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {userToolbox.map((tool) => (
                <div key={tool.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                        style={{ backgroundColor: tool.color + '20' }}
                      >
                        <Wrench className="w-6 h-6" style={{ color: tool.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
                        <p className="text-gray-600 mb-3">{tool.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>XP: {tool.xp_reward}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromToolbox(tool.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{tool.currentStreak}</span>
                        <span className="text-sm text-gray-600 ml-1">day streak</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{tool.totalUsage}</span>
                        <span className="text-sm text-gray-600 ml-1">times used</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleRecordUsage(tool.id)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Record Usage
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTool(tool);
                        setShowConvertModal(true);
                      }}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Convert to Habit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Convert to Habit Modal */}
      {showConvertModal && selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ethereal-glass rounded-ethereal border border-ethereal p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Convert to Habit</h3>
            <p className="text-gray-600 mb-4">
              Convert "{selectedTool.title}" into a trackable habit?
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={conversionData.frequency_type}
                  onChange={(e) => setConversionData({ ...conversionData, frequency_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowConvertModal(false);
                  setSelectedTool(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertToHabit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Convert to Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolboxTabFixed;
