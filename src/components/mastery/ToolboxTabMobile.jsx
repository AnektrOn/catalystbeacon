import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, Calendar, CalendarOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useMasteryRefresh } from '../../pages/Mastery';
import masteryService from '../../services/masteryService';
import SkeletonLoader from '../ui/SkeletonLoader';

/**
 * Modern Mobile-First Toolbox Component
 * Clean card-based layout
 */
const ToolboxTabMobile = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useMasteryRefresh();
  const [activeTab, setActiveTab] = useState('my-tools');
  const [toolboxLibrary, setToolboxLibrary] = useState([]);
  const [userToolbox, setUserToolbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarVisibilitySupported, setCalendarVisibilitySupported] = useState(true);
  // Removed unused error state (errors are logged directly)

  useEffect(() => {
    const loadToolbox = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const { data, error } = await masteryService.getMasteryDataConsolidated(
          user.id,
          firstDay.toISOString().split('T')[0],
          lastDay.toISOString().split('T')[0]
        );

        if (error) throw error;

        setToolboxLibrary(data.toolbox_library || []);
        setUserToolbox(data.user_toolbox || []);
      } catch (err) {
        // Error logged in service
      } finally {
        setLoading(false);
      }
    };

    loadToolbox();
  }, [user]);

  const handleUseToolItem = async (toolId) => {
    if (!user) return;

    try {
      await masteryService.useToolboxItem(user.id, toolId);
      
      setUserToolbox(prev =>
        prev.map(tool => {
          if (tool.id === toolId) {
            return {
              ...tool,
              last_used: new Date().toISOString(),
              usage_count: (tool.usage_count || 0) + 1
            };
          }
          return tool;
        })
      );

      triggerRefresh();
    } catch (err) {
    }
  };

  const addToolFromLibrary = async (libraryTool) => {
    if (!user) return;

    try {
      const { data, error } = await masteryService.addToolboxItem(user.id, libraryTool.id);
      if (error) throw error;

      setUserToolbox(prev => [
        ...prev,
        {
          ...data,
          toolbox_library: libraryTool,
          usage_count: 0
        }
      ]);

      setActiveTab('my-tools');
      toast.success('Tool added to My Tools!', {
        duration: 2000,
        style: {
          background: 'color-mix(in srgb, var(--color-success, #10b981) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    } catch (err) {
      toast.error('Failed to add tool. Please try again.', {
        duration: 3000,
        style: {
          background: 'color-mix(in srgb, var(--color-error, #ef4444) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    }
  };

  const deleteTool = async (toolId) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this tool? All usage data will be removed.')) {
      return;
    }

    try {
      const { error } = await masteryService.removeUserToolboxItem(toolId);
      if (error) throw error;

      setUserToolbox(prev => prev.filter(t => t.id !== toolId));
      triggerRefresh();
      
      toast.success('Tool deleted successfully', {
        duration: 2000,
        style: {
          background: 'color-mix(in srgb, var(--color-success, #10b981) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    } catch (err) {
      toast.error('Failed to delete tool. Please try again.', {
        duration: 3000,
        style: {
          background: 'color-mix(in srgb, var(--color-error, #ef4444) 95%, transparent)',
          color: '#fff',
          zIndex: 9999,
        },
      });
    }
  };

  const toggleCalendarVisibility = async (toolId, currentValue) => {
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
        .from('user_toolbox_items')
        .update({ show_on_calendar: !currentValue })
        .eq('id', toolId)
        .eq('user_id', user.id);

      if (error) throw error;

      setUserToolbox(prev =>
        prev.map(t => {
          if (t.id === toolId) {
            return { ...t, show_on_calendar: !currentValue };
          }
          return t;
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
    return <SkeletonLoader type="page" />;
  }

  return (
    <div className="pb-8">
      {/* Tab Switcher */}
      <div className="flex bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-1.5 mb-6 shadow-ethereal-base">
        <button
          onClick={() => setActiveTab('my-tools')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
            activeTab === 'my-tools' ? 'bg-indigo-600 text-ethereal-white shadow-ethereal-base' : 'text-ethereal-text'
          }`}
        >
          <Wrench size={18}  aria-hidden="true"/>
          <span>My Tools</span>
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
      {activeTab === 'my-tools' ? (
        <div className="space-y-4">
          {!calendarVisibilitySupported && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-ethereal p-4 text-sm text-yellow-100">
              <strong>Calendar visibility toggle is disabled:</strong> your database is missing
              <code> show_on_calendar</code>. Run <code>ADD_CALENDAR_VISIBILITY_COLUMN.sql</code> in Supabase, then refresh.
            </div>
          )}
          {userToolbox.length === 0 ? (
            <div className="text-center py-12">
              <Wrench size={48} className="mx-auto mb-4 text-ethereal-text"  aria-hidden="true"/>
              <p className="text-ethereal-text mb-4">No tools yet</p>
              <button
                onClick={() => setActiveTab('library')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-all min-h-[48px]"
               role="tab" aria-selected={activeTab === 'library'} aria-label="Toolbox Library">
                Add from Library
              </button>
            </div>
          ) : (
            userToolbox.map(tool => {
              const toolData = tool.toolbox_library || tool;
              return (
                <div
                  key={tool.id}
                  className="bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-5 border border-ethereal shadow-ethereal-base"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-ethereal-white mb-2">{toolData.title}</h3>
                      {toolData.description && (
                        <p className="text-sm text-ethereal-text">{toolData.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCalendarVisibility(tool.id, tool.show_on_calendar !== false)}
                        disabled={!calendarVisibilitySupported}
                        className={`p-2 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                          tool.show_on_calendar !== false
                            ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
                            : 'bg-ethereal-glass/50 text-ethereal-text hover:bg-ethereal-glass-hover'
                        } ${!calendarVisibilitySupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={tool.show_on_calendar !== false ? 'Hide from calendar' : 'Show on calendar'}
                      >
                        {tool.show_on_calendar !== false ? <Calendar size={18} /> : <CalendarOff size={18} />}
                      </button>
                      <button
                        onClick={() => deleteTool(tool.id)}
                        className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Delete tool"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-ethereal-text">
                      <span className="text-yellow-400 font-semibold">+{toolData.xp_reward || 15} XP</span>
                      {tool.usage_count > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Used {tool.usage_count}x</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleUseToolItem(tool.id)}
                      className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-500 transition-all min-h-[44px]"
                    >
                      Use Tool
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {toolboxLibrary.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No tools in library</p>
            </div>
          ) : (
            toolboxLibrary.map(tool => (
              <div
                key={tool.id}
                className="bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-5 border border-ethereal shadow-ethereal-base"
              >
                <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
                {tool.description && (
                  <p className="text-sm text-ethereal-text mb-4">{tool.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-ethereal-text">
                    <span className="text-yellow-400 font-semibold">+{tool.xp_reward || 15} XP</span>
                  </div>
                  
                  <button
                    onClick={() => addToolFromLibrary(tool)}
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

export default ToolboxTabMobile;

