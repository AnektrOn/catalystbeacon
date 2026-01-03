import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Target, Wrench, Clock, Trophy, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useSubscription from '../hooks/useSubscription';

// Import components
import CalendarTab from '../components/mastery/CalendarTab';
import CalendarTabMobile from '../components/mastery/CalendarTabMobile';
import HabitsTabCompact from '../components/mastery/HabitsTabCompact';
import HabitsTabMobile from '../components/mastery/HabitsTabMobile';
import ToolboxTabCompact from '../components/mastery/ToolboxTabCompact';
import ToolboxTabMobile from '../components/mastery/ToolboxTabMobile';
import TimerPage from './TimerPage';
import Achievements from './Achievements';

// Create a context for sharing refresh state
const MasteryRefreshContext = createContext();

export const useMasteryRefresh = () => {
  const context = useContext(MasteryRefreshContext);
  if (!context) {
    throw new Error('useMasteryRefresh must be used within MasteryRefreshProvider');
  }
  return context;
};

const Mastery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { isFreeUser, isAdmin } = useSubscription();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // For free users, only show Habits and Toolbox tabs (admins see everything)
  const allTabs = [
    { id: 'overview', label: 'Hub', icon: LayoutDashboard, path: '/mastery', restricted: true },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/mastery/calendar', restricted: false },
    { id: 'habits', label: 'Habits', icon: Target, path: '/mastery/habits', restricted: false },
    { id: 'timer', label: 'Focus', icon: Clock, path: '/mastery/timer', restricted: true },
    { id: 'achievements', label: 'Awards', icon: Trophy, path: '/mastery/achievements', restricted: true },
    { id: 'toolbox', label: 'Toolbox', icon: Wrench, path: '/mastery/toolbox', restricted: false }
  ];
  
  const tabs = (isFreeUser && !isAdmin)
    ? allTabs.filter(tab => !tab.restricted)
    : allTabs;

  const handleTabClick = (path) => {
    navigate(path);
  };

  const renderContent = () => {
    const path = location.pathname;

    // Redirect free users from overview to habits (admins can access overview)
    if (path === '/mastery' && isFreeUser && !isAdmin) {
      navigate('/mastery/habits', { replace: true });
      return null;
    }

    if (path === '/mastery') {
      // Gaming Hub Overview
      return (
        <div className="space-y-8 animate-fade-in">
          {/* Hero Section */}
          <div className="glass-panel-floating p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-full p-1 shadow-xl" style={{ background: 'var(--gradient-primary)' }}>
                <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                  <Trophy size={40} className="text-white" />
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {profile?.username || 'Master'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Level {profile?.level || 1} • {profile?.current_xp || 0} XP
                </p>

                {/* XP Progress Bar */}
                <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)', width: `${Math.min(((profile?.current_xp || 0) / ((profile?.level || 1) * 1000)) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right max-w-md">
                  {((profile?.level || 1) * 1000) - (profile?.current_xp || 0)} XP to next level
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/mastery/timer')}
              className="glass-card-premium p-6 text-left hover:scale-[1.02] transition-transform group"
            >
              <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Clock className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Focus Session</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start a timer and earn XP</p>
            </button>

            <button
              onClick={() => navigate('/mastery/habits')}
              className="glass-card-premium p-6 text-left hover:scale-[1.02] transition-transform group"
            >
              <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4 group-hover:bg-green-500/20 transition-colors">
                <Target className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Check Habits</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Maintain your streaks</p>
            </button>

            <button
              onClick={() => navigate('/mastery/achievements')}
              className="glass-card-premium p-6 text-left hover:scale-[1.02] transition-transform group"
            >
              <div className="p-3 rounded-xl w-fit mb-4 transition-colors" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 20%, transparent)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)'}>
                <Trophy size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Achievements</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View your awards</p>
            </button>
          </div>
        </div>
      );
    } else if (path === '/mastery/calendar') {
      return isMobile ? <CalendarTabMobile key={`calendar-${refreshKey}`} /> : <CalendarTab key={`calendar-${refreshKey}`} />;
    } else if (path === '/mastery/habits') {
      return isMobile ? <HabitsTabMobile key={`habits-${refreshKey}`} /> : <HabitsTabCompact key={`habits-${refreshKey}`} />;
    } else if (path === '/mastery/toolbox') {
      return isMobile ? <ToolboxTabMobile key={`toolbox-${refreshKey}`} /> : <ToolboxTabCompact key={`toolbox-${refreshKey}`} />;
    } else if (path === '/mastery/timer') {
      return <TimerPage />;
    } else if (path === '/mastery/achievements') {
      return <Achievements />;
    }
    return null;
  };

  return (
    <div className="min-h-full w-full pb-safe">
      {/* Mobile-First Header - Clean & Minimal */}
      <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {/* Tab Navigation - Clean Pills */}
        <nav className="flex bg-slate-800/60 backdrop-blur-md rounded-2xl p-1.5 shadow-xl min-w-max mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all min-h-[48px] ${isActive
                    ? 'text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                  }`}
                style={isActive ? {
                  background: 'var(--gradient-primary)',
                  backgroundColor: 'var(--color-primary)'
                } : {}}
              >
                <Icon size={20} />
                <span className="text-sm whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        <MasteryRefreshContext.Provider value={{ triggerRefresh, refreshKey }}>
          {renderContent()}
        </MasteryRefreshContext.Provider>
      </div>
    </div>
  );
};

export default Mastery;