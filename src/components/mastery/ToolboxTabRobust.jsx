import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wrench, Plus, Target, Trash2, CheckCircle, Clock, Star } from 'lucide-react';
import masteryService from '../../services/masteryService';
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

/**
 * layout: 'default' | 'compact' | 'mobile' — controls wrapper styling for desktop/compact vs mobile-first.
 */
const ToolboxTabRobust = ({ layout = 'default' }) => {
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

  // Simple data loading without loading states
  useEffect(() => {
    const loadToolbox = async () => {
      if (!user) {
        return;
      }
      
      setError(null);
      
      try {
        // Load toolbox library
        const { data: libraryData, error: libraryError } = await masteryService.getToolboxLibrary();
        if (libraryError) {
          setError('Failed to load toolbox library');
          return;
        }

        // Load user toolbox items
        const { data: userToolboxData, error: userToolboxError } = await masteryService.getUserToolboxItems(user.id);
        if (userToolboxError) {
          setError('Failed to load user toolbox');
          return;
        }

        // Transform user toolbox items to include real usage data and UI properties
        const transformedUserToolbox = await Promise.all(
          (userToolboxData || []).map(async (item) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const today = new Date();
            
            const { data: usageData } = await masteryService.getToolboxUsage(
              user.id,
              item.id,
              thirtyDaysAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            );

            const completedDates = (usageData || []).map(u => u.usage_date);
            const currentStreak = calculateCurrentStreak(completedDates);
            const color = getToolboxColor(item.title);

            return {
              ...item,
              completedDates,
              currentStreak,
              color,
              totalUsage: usageData?.length || 0
            };
          })
        );

        setToolboxLibrary(libraryData || []);
        setUserToolbox(transformedUserToolbox);
      } catch (error) {
        setError('Failed to load toolbox data');
      }
    };

    loadToolbox();
  }, [user]);

  const handleConvertToHabit = async () => {
    if (!user || !selectedTool) return;
    
    try {
      
      const { error } = await masteryService.convertToolToHabit(user.id, selectedTool.id, conversionData);
      if (error) {
        setError('Failed to convert tool to habit');
        return;
      }

      setShowConvertModal(false);
      setSelectedTool(null);
      
      // Reload user toolbox
      const { data: userToolboxData } = await masteryService.getUserToolboxItems(user.id);
      if (userToolboxData) {
        const transformedUserToolbox = await Promise.all(
          userToolboxData.map(async (item) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const today = new Date();
            
            const { data: usageData } = await masteryService.getToolboxUsage(
              user.id,
              item.id,
              thirtyDaysAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            );

            const completedDates = (usageData || []).map(u => u.usage_date);
            const currentStreak = calculateCurrentStreak(completedDates);
            const color = getToolboxColor(item.title);

            return {
              ...item,
              completedDates,
              currentStreak,
              color,
              totalUsage: usageData?.length || 0
            };
          })
        );
        setUserToolbox(transformedUserToolbox);
      }
      
    } catch (error) {
      setError('Failed to convert tool to habit');
    }
  };

  const handleAddToToolbox = async (toolId) => {
    if (!user) return;
    
    try {
      
      const { error } = await masteryService.addToolToUserToolbox(user.id, toolId);
      if (error) {
        setError('Failed to add tool to toolbox');
        return;
      }

      // Reload user toolbox
      const { data: userToolboxData } = await masteryService.getUserToolboxItems(user.id);
      if (userToolboxData) {
        const transformedUserToolbox = await Promise.all(
          userToolboxData.map(async (item) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const today = new Date();
            
            const { data: usageData } = await masteryService.getToolboxUsage(
              user.id,
              item.id,
              thirtyDaysAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            );

            const completedDates = (usageData || []).map(u => u.usage_date);
            const currentStreak = calculateCurrentStreak(completedDates);
            const color = getToolboxColor(item.title);

            return {
              ...item,
              completedDates,
              currentStreak,
              color,
              totalUsage: usageData?.length || 0
            };
          })
        );
        setUserToolbox(transformedUserToolbox);
      }
      
    } catch (error) {
      setError('Failed to add tool to toolbox');
    }
  };

  const handleRemoveFromToolbox = async (toolId) => {
    if (!user) return;
    
    try {
      
      const { error } = await masteryService.removeToolFromUserToolbox(user.id, toolId);
      if (error) {
        setError('Failed to remove tool from toolbox');
        return;
      }

      setUserToolbox(prev => prev.filter(t => t.id !== toolId));
    } catch (error) {
      setError('Failed to remove tool from toolbox');
    }
  };

  const handleRecordUsage = async (toolId) => {
    if (!user) return;
    
    try {
      
      const { error } = await masteryService.recordToolboxUsage(user.id, toolId);
      if (error) {
        setError('Failed to record tool usage');
        return;
      }

      // Reload user toolbox to update usage data
      const { data: userToolboxData } = await masteryService.getUserToolboxItems(user.id);
      if (userToolboxData) {
        const transformedUserToolbox = await Promise.all(
          userToolboxData.map(async (item) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const today = new Date();
            
            const { data: usageData } = await masteryService.getToolboxUsage(
              user.id,
              item.id,
              thirtyDaysAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            );

            const completedDates = (usageData || []).map(u => u.usage_date);
            const currentStreak = calculateCurrentStreak(completedDates);
            const color = getToolboxColor(item.title);

            return {
              ...item,
              completedDates,
              currentStreak,
              color,
              totalUsage: usageData?.length || 0
            };
          })
        );
        setUserToolbox(transformedUserToolbox);
      }
      
    } catch (error) {
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

  const layoutClass = layout === 'mobile' ? 'toolbox-tab-mobile space-y-4' : layout === 'compact' ? 'toolbox-tab-compact space-y-6' : 'space-y-6';

  return (
    <div className={layoutClass}>
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
                <div key={tool.id} className="bg-ethereal-glass rounded-ethereal shadow-ethereal-base border border-ethereal p-6">
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
                          <span>Category: {tool.category}</span>
                          <span>XP: {tool.xp_reward}</span>
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
                <div key={tool.id} className="bg-ethereal-glass rounded-ethereal shadow-ethereal-base border border-ethereal p-6">
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
                          <span>Category: {tool.category}</span>
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
      {showConvertModal && selectedTool && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" style={{ width: '100vw', height: '100vh' }}>
          <div className="bg-ethereal-glass rounded-ethereal border border-ethereal p-6 w-full max-w-md my-auto" style={{ maxHeight: 'calc(100vh - 40px)' }}>
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default ToolboxTabRobust;
