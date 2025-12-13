import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBadge from './NotificationBadge';
import AppShellMobile from './AppShellMobile';
import ColorPaletteDropdown from './common/ColorPaletteDropdown';
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
  X,
  Sparkles
} from 'lucide-react';

const AppShell = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();

  // Load notification count from Supabase (must be before any early returns)
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Handle resize to switch between desktop and mobile shells
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // #region agent log
  useEffect(() => {
    const checkColorPalette = () => {
      try {
        const root = document.documentElement;
        const computedStyle = window.getComputedStyle(root);
        const colorPrimary = computedStyle.getPropertyValue('--color-primary').trim();
        const hasColorPaletteDropdown = document.querySelector('[data-color-palette-dropdown]') !== null;
        const hasColorPaletteSwitcher = typeof window !== 'undefined' && window.colorPaletteSwitcher;
        fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppShell.jsx:47',message:'AppShell mounted - checking color palette UI',data:{colorPrimary,hasColorPaletteDropdown,hasColorPaletteSwitcher,hasCSSVariables:!!colorPrimary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      } catch(e) {
        fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppShell.jsx:47',message:'Error checking color palette UI',data:{error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      }
    };
    setTimeout(checkColorPalette, 1000);
  }, []);
  // #endregion

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        setNotificationCount(0);
        return;
      }
      
      try {
        // Check if notifications table exists
        const { data, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        
        if (error && error.code !== 'PGRST116') {
          // Table doesn't exist or other error - default to 0
          console.warn('Notifications table not available:', error.message);
          setNotificationCount(0);
        } else {
          setNotificationCount(data?.length || 0);
        }
      } catch (err) {
        console.warn('Error loading notifications:', err);
        setNotificationCount(0);
      }
    };
    
    loadNotifications();
    
    // Set up real-time subscription for notifications
    if (user) {
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => loadNotifications()
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Debug: Log profile background image changes
  useEffect(() => {
    if (profile?.background_image) {
      console.log('🎨 AppShell: Background image updated:', profile.background_image);
    }
  }, [profile?.background_image]);

  // Debug: Log current profile state
  useEffect(() => {
    console.log('🎨 AppShell: Current profile state:', {
      hasProfile: !!profile,
      hasBackgroundImage: !!profile?.background_image,
      backgroundImageUrl: profile?.background_image
    });
  }, [profile]);

  // Use AppShellMobile for smaller screens
  if (isMobile) {
    return <AppShellMobile />;
  }

  // Debug: Verify new version is loading

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
    { icon: Sparkles, label: 'Stellar Map', path: '/stellar-map' },
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
        key={profile?.background_image || 'default-bg'}
        className="fixed inset-0 -z-10 transition-all duration-500"
        style={{
          backgroundImage: profile?.background_image
            ? `url(${profile.background_image})`
            : 'none',
          backgroundSize: profile?.background_image ? 'cover' : 'auto',
          backgroundPosition: profile?.background_image ? 'center' : 'center',
          backgroundRepeat: profile?.background_image ? 'no-repeat' : 'repeat'
        }}
      >
        {!profile?.background_image && (
          <div className="absolute inset-0" style={{ background: 'var(--gradient-warm)' }}>
            {/* Abstract shapes for visual interest */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 dark:opacity-10">
              <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}></div>
              <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full blur-3xl" style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.2 }}></div>
              <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full blur-3xl" style={{ backgroundColor: 'var(--color-kobicha)', opacity: 0.2 }}></div>
            </div>
          </div>
        )}
        <div 
          className="absolute inset-0 backdrop-blur-[1px]"
          style={{
            backgroundColor: profile?.background_image ? 'rgba(0, 0, 0, 0.1)' : 'transparent'
          }}
        ></div>
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
            {/* Color Palette Dropdown */}
            <ColorPaletteDropdown />
            
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
        <div className={`glass-sidebar-panel-v2 glass-panel-floating ${isSidebarExpanded ? 'expanded' : 'collapsed'}`} style={{ background: `linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 15%, transparent) 0%, color-mix(in srgb, var(--color-earth-green) 15%, transparent) 100%)` }}>
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
                (item.path === '/courses' && location.pathname.startsWith('/courses')) ||
                (item.path === '/stellar-map' && location.pathname.startsWith('/stellar-map'));

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