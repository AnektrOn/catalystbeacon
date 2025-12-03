import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBadge from './NotificationBadge';
import AppShellMobile from './AppShellMobile';
import {
  Grid3X3,
  Calendar,
  Clock,
  User,
  Settings,
  Sun,
  Moon,
  Users,
  Target,
  BookOpen,
  Bell,
  Menu,
  X
} from 'lucide-react';

const AppShell = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  // Handle resize to switch between desktop and mobile shells
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use AppShellMobile for smaller screens
  if (isMobile) {
    return <AppShellMobile />;
  }

  // Debug: Verify new version is loading
  console.log('🎨 NEW AppShell loaded - with earth tones and expandable sidebar!');

  // Mock notification count - replace with actual data
  const notificationCount = 3;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const sidebarItems = [
    { icon: Grid3X3, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Target, label: 'Mastery', path: '/mastery' },
    { icon: Calendar, label: 'Calendar', path: '/mastery/calendar' },
    { icon: Clock, label: 'Timer', path: '/mastery/timer' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Background - User's custom background or earth-tone gradient */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10 transition-all duration-500"
        style={{
          backgroundImage: profile?.background_image
            ? `url(${profile.background_image})`
            : undefined
        }}
      >
        {!profile?.background_image && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#F7F1E1] via-[#E3D8C1] to-[#B4833D] dark:from-[#3F3F2C] dark:via-[#66371B] dark:to-[#81754B]">
            {/* Abstract shapes for visual interest */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 dark:opacity-10">
              <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#B4833D]/20 blur-3xl"></div>
              <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#81754B]/20 blur-3xl"></div>
              <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-[#66371B]/20 blur-3xl"></div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      </div>

      {/* Header - 60% width */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="glass-header-browser">
          {/* Left side - Empty or logo */}
          <div className="flex items-center space-x-2">
            {/* Intentionally empty - no navigation icons */}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button className="glass-icon-btn">
                <Bell size={18} />
              </button>
              <NotificationBadge count={notificationCount} />
            </div>

            {/* User Profile Avatar */}
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="glass-user-avatar"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                />
              ) : (
                <div
                  className="glass-user-avatar bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <User size={20} className="text-white" />
                </div>
              )}
              <UserProfileDropdown
                isOpen={isProfileDropdownOpen}
                onClose={() => setIsProfileDropdownOpen(false)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Left Sidebar - Expandable vertical panel */}
      <aside
        className="app-shell-sidebar fixed left-4 top-20 bottom-4 z-40"
        style={{ width: isSidebarExpanded ? 'var(--sidebar-width-expanded)' : 'var(--sidebar-width-collapsed)' }}
      >
        <div className={`glass-sidebar-panel-v2 glass-panel-floating ${isSidebarExpanded ? 'expanded' : 'collapsed'}`} style={{ background: 'linear-gradient(180deg, rgba(180, 131, 61, 0.15) 0%, rgba(63, 63, 44, 0.15) 100%)' }}>
          {/* Top section - Toggle button */}
          <div className={`flex ${isSidebarExpanded ? 'justify-between items-center' : 'justify-center'} mb-6`}>
            <button
              className="glass-toggle-btn w-10 h-10"
              onClick={toggleSidebar}
              title={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarExpanded ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 flex flex-col space-y-2">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/mastery' && location.pathname.startsWith('/mastery')) ||
                (item.path === '/courses' && location.pathname.startsWith('/courses'));

              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className={`${isActive ? 'glass-nav-btn-active' : 'glass-nav-btn'} group relative`}
                >
                  <div className="glass-icon-premium">
                    <Icon size={22} />
                  </div>
                  {isSidebarExpanded ? (
                    <span className="glass-nav-label ml-2">{item.label}</span>
                  ) : (
                    <div className="glass-tooltip">{item.label}</div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Theme toggle - Circular switch */}
          <div className={`flex ${isSidebarExpanded ? 'justify-start' : 'justify-center'} pt-6`}>
            <div className="glass-theme-toggle">
              <button
                onClick={toggleTheme}
                className={`glass-theme-btn ${!isDarkMode ? 'glass-theme-btn-active' : ''}`}
                title="Light mode"
              >
                <Sun size={14} />
              </button>
              <button
                onClick={toggleTheme}
                className={`glass-theme-btn ${isDarkMode ? 'glass-theme-btn-active' : ''}`}
                title="Dark mode"
              >
                <Moon size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Adjusts based on sidebar state */}
      <main
        className="fixed top-20 right-4 bottom-4 z-30 transition-all duration-300"
        style={{
          left: isSidebarExpanded
            ? 'calc(var(--sidebar-width-expanded) + 32px)'
            : 'calc(var(--sidebar-width-collapsed) + 32px)'
        }}
      >
        <div className="glass-main-panel">
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppShell;