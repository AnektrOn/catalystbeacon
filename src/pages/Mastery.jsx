import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Target, Wrench, Clock, Trophy, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePageTransition } from '../contexts/PageTransitionContext';
import useSubscription from '../hooks/useSubscription';
import SkeletonLoader from '../components/ui/SkeletonLoader';

// Import components
import CalendarTab from '../components/mastery/CalendarTab';
import CalendarTabMobile from '../components/mastery/CalendarTabMobile';
import HabitsTabCompact from '../components/mastery/HabitsTabCompact';
import HabitsTabMobile from '../components/mastery/HabitsTabMobile';
import ToolboxTabCompact from '../components/mastery/ToolboxTabCompact';
import ToolboxTabMobile from '../components/mastery/ToolboxTabMobile';

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
  const { profile, loading: authLoading } = useAuth();
  const { startTransition, endTransition } = usePageTransition();
  const { isFreeUser, isAdmin } = useSubscription();
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // NOTE: We intentionally avoid JS "isMobile" checks here.
  // In embedded browsers / certain environments, window size + matchMedia can be unreliable.
  // Instead, render both layouts and let CSS breakpoints decide via Tailwind classes.

  // Redirect /mastery to /mastery/calendar (must be in an effect, not during render)
  useEffect(() => {
    if (location.pathname === '/mastery') {
      navigate('/mastery/calendar', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Use global loader instead of local loading state
  // useEffect(() => {
  //   if (authLoading) {
  //     startTransition();
  //   } else {
  //     endTransition();
  //   }
  // }, [authLoading, startTransition, endTransition]);

  if (authLoading) {
    return <SkeletonLoader type="page" />;
  }

  // Only show Calendar, Habits, and Toolbox tabs
  const allTabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/mastery/calendar', restricted: false },
    { id: 'habits', label: 'Habits', icon: Target, path: '/mastery/habits', restricted: false },
    { id: 'toolbox', label: 'Toolbox', icon: Wrench, path: '/mastery/toolbox', restricted: false }
  ];
  
  const tabs = allTabs;

  const handleTabClick = (path) => {
    navigate(path);
  };

  const renderContent = () => {
    const path = location.pathname;

    if (path === '/mastery/calendar') {
      return (
        <>
          <div className="lg:hidden">
            <CalendarTabMobile key={`calendar-mobile-${refreshKey}`} />
          </div>
          <div className="hidden lg:block">
            <CalendarTab key={`calendar-desktop-${refreshKey}`} />
          </div>
        </>
      );
    } else if (path === '/mastery/habits') {
      return (
        <>
          <div id="habit-tracker-container" className="w-full">
          <div className="lg:hidden">
            <HabitsTabMobile key={`habits-mobile-${refreshKey}`} />
          </div>
          <div className="hidden lg:block">
            <HabitsTabCompact key={`habits-desktop-${refreshKey}`} />
          </div>
        </div>
        </>
      );
    } else if (path === '/mastery/toolbox') {
      return (
        <>
         <div id="toolbox-container" className="w-full">
          <div className="lg:hidden">
            <ToolboxTabMobile key={`toolbox-mobile-${refreshKey}`} />
          </div>
          <div className="hidden lg:block">
            <ToolboxTabCompact key={`toolbox-desktop-${refreshKey}`} />
          </div>
        </div>
        </>
      );
    }
    // Fallback
    return (
      <>
        <div className="lg:hidden">
          <CalendarTabMobile key={`calendar-mobile-${refreshKey}`} />
        </div>
        <div className="hidden lg:block">
          <CalendarTab key={`calendar-desktop-${refreshKey}`} />
        </div>
      </>
    );
  };

  return (
    <div id="mastery-container" className="min-h-full w-full pb-safe">
      {/* Mobile-First Header - Clean & Minimal */}
      <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {/* Tab Navigation - Clean Pills */}
        <nav className="flex glass-effect rounded-2xl p-1.5 shadow-xl min-w-max mx-auto border border-white/15">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all min-h-[48px] ${
                  isActive ? 'text-white shadow-lg' : ''
                }`}
                style={isActive ? { background: 'var(--gradient-primary)' } : { color: 'var(--text-primary)' }}
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