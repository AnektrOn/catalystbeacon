import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, CheckCircle, Flame } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import masteryService from '../../services/masteryService';
import skillsService from '../../services/skillsService';
import toast from 'react-hot-toast';

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

const ToolboxTabCompact = () => {
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
  
  // Removed unused state variables: allSkills, skillsMap, masterStats

  // Load toolbox data from database - NO LOADING STATE
  useEffect(() => {
    const loadToolbox = async () => {
      console.log('🔧 ToolboxTabCompact: Starting toolbox data load');
      setError(null);
      
      try {
        // Load skills first
        console.log('🎯 ToolboxTabCompact: Loading skills...');
        const { data: skillsData, error: skillsError } = await skillsService.getAllSkills();
        let skillsMap = new Map();
        if (!skillsError && skillsData) {
          skillsMap = new Map(skillsData.map(skill => [skill.id, skill]));
          console.log('✅ ToolboxTabCompact: Skills loaded:', skillsData.length);
          console.log('📋 Skills map created with', skillsMap.size, 'entries');
        } else {
          console.error('❌ ToolboxTabCompact: Failed to load skills:', skillsError);
        }

        // Load toolbox library from database (always load this)
        const { data: libraryData, error: libraryError } = await supabase
          .from('toolbox_library')
          .select('*');

        if (libraryError) {
          console.error('❌ ToolboxTabCompact: Error loading toolbox library:', libraryError);
          setError('Failed to load toolbox library');
          return;
        }

        console.log('✅ ToolboxTabCompact: Library loaded successfully:', libraryData?.length || 0, 'items');

        // Load user toolbox items from database (only if user exists)
        let userToolboxData = [];
        if (user && user.id) {
          console.log('🔧 ToolboxTabCompact: Loading user toolbox for user:', user.id);
          
          const { data: userData, error: userToolboxError } = await masteryService.getUserToolboxItems(user.id);

          if (userToolboxError) {
            console.error('❌ ToolboxTabCompact: Error loading user toolbox:', userToolboxError);
            // Don't fail completely, just use empty user toolbox
            userToolboxData = [];
          } else {
            userToolboxData = userData || [];
            console.log('✅ ToolboxTabCompact: User toolbox loaded:', userToolboxData.length, 'items');
          }
        } else {
          console.log('🔧 ToolboxTabCompact: No user, using empty user toolbox');
        }

        // Transform user toolbox items to include real usage data and UI properties
        const transformedUserToolbox = await Promise.all(
          (userToolboxData || []).map(async (item) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const today = new Date();
            
            // Try to get usage data, but don't fail if table doesn't exist or no user
            let usageData = [];
            if (user && user.id) {
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
                console.log('🔧 ToolboxTabCompact: toolbox_usage table not found, using empty usage');
                usageData = [];
              }
            }

            const completedDates = usageData.map(u => u.usage_date);
            const currentStreak = calculateCurrentStreak(completedDates);
            
            // Get tool details from the joined data
            const toolData = item.toolbox_library || {};
            const color = getToolboxColor(toolData.title || item.title);

            // Enrich with skills
            let toolSkills = [];
            if (toolData.skill_tags && toolData.skill_tags.length > 0) {
              toolSkills = toolData.skill_tags
                .map(skillId => skillsMap.get(skillId))
                .filter(Boolean);
            }

            return {
              id: item.id,
              title: toolData.title || item.title,
              description: toolData.description || '',
              xp_reward: toolData.xp_reward || 0,
              can_convert_to_habit: toolData.can_convert_to_habit || false,
              completedDates,
              currentStreak,
              color,
              totalUsage: usageData.length,
              skills: toolSkills
            };
          })
        );

        // Enrich library tools with skill information
        console.log('🎯 ToolboxTabCompact: Enriching library tools with skills...');
        console.log('📋 Skills map size:', skillsMap.size);
        const enrichedLibraryTools = (libraryData || []).map(tool => {
          const toolSkills = (tool.skill_tags || [])
            .map(skillId => {
              const skill = skillsMap.get(skillId);
              if (!skill) {
                console.log(`⚠️ Skill not found in map: ${skillId}`);
              }
              return skill;
            })
            .filter(Boolean);
          
          console.log(`📝 Tool "${tool.title}": ${tool.skill_tags?.length || 0} skill_tags -> ${toolSkills.length} skills`);
          
          return {
            ...tool,
            skills: toolSkills
          };
        });

        setToolboxLibrary(enrichedLibraryTools);
        setUserToolbox(transformedUserToolbox);
        console.log('✅ ToolboxTabCompact: Toolbox loaded successfully:', transformedUserToolbox.length, 'user tools,', enrichedLibraryTools.length, 'library tools');
        console.log('📋 ToolboxTabCompact: Library toolbox data:', enrichedLibraryTools);
      } catch (error) {
        console.error('❌ ToolboxTabCompact: Exception during toolbox load:', error);
        // Try to at least load the library data as fallback
        try {
          const { data: fallbackLibrary } = await supabase
            .from('toolbox_library')
            .select('*');
          setToolboxLibrary(fallbackLibrary || []);
          setUserToolbox([]);
          console.log('🔧 ToolboxTabCompact: Fallback library loaded:', fallbackLibrary?.length || 0, 'items');
        } catch (fallbackError) {
          console.error('❌ ToolboxTabCompact: Fallback also failed:', fallbackError);
          setError('Failed to load toolbox data');
        }
      }
    };

    loadToolbox();
  }, [user]);

  const handleConvertToHabit = async () => {
    if (!user || !selectedTool) {
      console.log('🔧 ToolboxTabCompact: Cannot convert - no user or tool selected');
      setError('Please log in to convert tools to habits');
      return;
    }
    
    try {
      console.log('🔧 ToolboxTabCompact: Converting tool to habit:', selectedTool.title);
      console.log('🔧 ToolboxTabCompact: Frequency type:', conversionData.frequency_type);
      
      // Create a new habit from the tool
      const { data: newHabit, error } = await supabase
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
        console.error('❌ ToolboxTabCompact: Error converting tool to habit:', error);
        console.error('❌ ToolboxTabCompact: Error details:', error.message);
        setError(`Failed to convert tool to habit: ${error.message}`);
        return;
      }

      console.log('✅ ToolboxTabCompact: Tool converted to habit successfully:', newHabit);
      
      // Show success message
      toast.success(`"${selectedTool.title}" has been converted to a habit! You can now track it in the Habits tab.`);
      
      // Close modal
      setShowConvertModal(false);
      setSelectedTool(null);
      setConversionData({ frequency_type: 'daily' });
      
    } catch (error) {
      console.error('❌ ToolboxTabCompact: Exception during tool conversion:', error);
      setError(`Failed to convert tool to habit: ${error.message}`);
    }
  };

  const handleAddToToolbox = async (toolId) => {
    if (!user) {
      console.log('🔧 ToolboxTabCompact: Cannot add tool - no user');
      setError('Please log in to add tools to your toolbox');
      return;
    }
    
    try {
      console.log('🔧 ToolboxTabCompact: Adding tool to user toolbox:', toolId);
      
      // Use masteryService to add tool to user toolbox
      const { data: insertedData, error } = await masteryService.addToolboxItem(user.id, toolId);

      if (error) {
        console.error('❌ ToolboxTabCompact: Error adding tool to toolbox:', error);
        setError(`Failed to add tool to toolbox: ${error.message}`);
        return;
      }

      console.log('✅ ToolboxTabCompact: Tool added to toolbox successfully:', insertedData);
      
      // Refresh the toolbox data to get the updated list
      const { data: updatedToolbox, error: refreshError } = await masteryService.getUserToolboxItems(user.id);
      
      if (refreshError) {
        console.error('❌ ToolboxTabCompact: Error refreshing toolbox:', refreshError);
        // Don't fail completely, just show success
      } else {
        // Transform the updated data
        const transformedUserToolbox = await Promise.all(
          (updatedToolbox || []).map(async (item) => {
            const toolData = item.toolbox_library || {};
            const color = getToolboxColor(toolData.title || item.title);

            return {
              id: item.id,
              title: toolData.title || item.title,
              description: toolData.description || '',
              xp_reward: toolData.xp_reward || 0,
              can_convert_to_habit: toolData.can_convert_to_habit || false,
              completedDates: [],
              currentStreak: 0,
              color,
              totalUsage: 0
            };
          })
        );
        
        setUserToolbox(transformedUserToolbox);
      }
      
    } catch (error) {
      console.error('❌ ToolboxTabCompact: Exception during tool addition:', error);
      setError(`Failed to add tool to toolbox: ${error.message}`);
    }
  };

  const handleRemoveFromToolbox = async (toolId) => {
    if (!user) {
      console.log('🔧 ToolboxTabCompact: Cannot remove tool - no user');
      setError('Please log in to remove tools from your toolbox');
      return;
    }
    
    try {
      console.log('🔧 ToolboxTabCompact: Removing tool from user toolbox:', toolId);
      
      const { error } = await supabase
        .from('user_toolbox_items')
        .delete()
        .eq('id', toolId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ ToolboxTabCompact: Error removing tool from toolbox:', error);
        setError(`Failed to remove tool from toolbox: ${error.message}`);
        return;
      }

      setUserToolbox(prev => prev.filter(t => t.id !== toolId));
      console.log('✅ ToolboxTabCompact: Tool removed from toolbox successfully');
    } catch (error) {
      console.error('❌ ToolboxTabCompact: Exception during tool removal:', error);
      setError(`Failed to remove tool from toolbox: ${error.message}`);
    }
  };

  const handleRecordUsage = async (toolId) => {
    if (!user) return;
    
    try {
      console.log('🔧 ToolboxTabCompact: Recording tool usage:', toolId);
      
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
          console.log('🔧 ToolboxTabCompact: toolbox_usage table not found, using local state only');
        }
      } catch (dbError) {
        console.log('🔧 ToolboxTabCompact: Database usage recording failed, using local state only');
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
      
      console.log('✅ ToolboxTabCompact: Tool usage recorded successfully');
    } catch (error) {
      console.error('❌ ToolboxTabCompact: Exception during usage recording:', error);
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Toolbox</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'library'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Library ({toolboxLibrary.length})
        </button>
        <button
          onClick={() => setActiveTab('my-tools')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my-tools'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Tools ({userToolbox.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolboxLibrary.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No tools in library</h3>
              <p className="text-xs text-gray-600">Toolbox library is empty</p>
            </div>
          ) : (
            toolboxLibrary.map((tool) => {
              const color = getToolboxColor(tool.title);
              const isInUserToolbox = userToolbox.some(ut => ut.toolbox_item_id === tool.id);
              
              return (
                <div key={tool.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: color + '20' }}
                      >
                        <Wrench className="w-4 h-4" style={{ color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{tool.title}</h3>
                        <p className="text-xs text-gray-600">{tool.description}</p>
                        {tool.skills && tool.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tool.skills.slice(0, 3).map(skill => (
                              <span
                                key={skill.id}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                                style={{ 
                                  backgroundColor: skill.master_stats?.color + '20',
                                  color: skill.master_stats?.color 
                                }}
                              >
                                {skill.display_name}
                              </span>
                            ))}
                            {tool.skills.length > 3 && (
                              <span className="text-xs text-gray-500">+{tool.skills.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isInUserToolbox ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddToToolbox(tool.id)}
                          className="flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userToolbox.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No tools yet</h3>
              <p className="text-xs text-gray-600 mb-3">Add tools from the library</p>
              <button
                onClick={() => setActiveTab('library')}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Browse Library
              </button>
            </div>
          ) : (
            userToolbox.map((tool) => {
              const isUsedToday = tool.completedDates.includes(new Date().toISOString().split('T')[0]);
              
              return (
                <div key={tool.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: tool.color + '20' }}
                      >
                        <Wrench className="w-4 h-4" style={{ color: tool.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{tool.title}</h3>
                        {tool.skills && tool.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tool.skills.slice(0, 2).map(skill => (
                              <span
                                key={skill.id}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                                style={{ 
                                  backgroundColor: skill.master_stats?.color + '20',
                                  color: skill.master_stats?.color 
                                }}
                              >
                                {skill.display_name}
                              </span>
                            ))}
                            {tool.skills.length > 2 && (
                              <span className="text-xs text-gray-500">+{tool.skills.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Flame className="w-3 h-3 text-orange-500 mr-1" />
                        <span className="text-xs font-medium text-gray-900">{tool.currentStreak}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFromToolbox(tool.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleRecordUsage(tool.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isUsedToday 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">{tool.totalUsage} times used</span>
                      <button
                        onClick={() => {
                          setSelectedTool(tool);
                          setShowConvertModal(true);
                        }}
                        className="px-2 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700"
                      >
                        Convert
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Convert to Habit Modal */}
      {showConvertModal && selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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

export default ToolboxTabCompact;
