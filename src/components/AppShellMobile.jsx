import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import NotificationBadge from './NotificationBadge';
import ColorPaletteDropdown from './common/ColorPaletteDropdown';
import {
  Grid3X3,
  User,
  Settings,
  Sun,
  Moon,
  Users,
  Target,
  Menu,
  X,
  Home,
  LogOut,
  BookOpen,
  Bell,
  ArrowLeft,
  ArrowRight,
  Type,
  Sparkles
} from 'lucide-react';

const AppShellMobile = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut, user } = useAuth();

  // Load notification count from Supabase
  const [notificationCount, setNotificationCount] = useState(0);
  
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
        .channel('notifications-mobile')
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
      console.log('🎨 AppShellMobile: Background image updated:', profile.background_image);
    }
  }, [profile?.background_image]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const sidebarItems = [
    { icon: Grid3X3, label: 'Dashboard', path: '/dashboard' },
    { icon: Target, label: 'Mastery', path: '/mastery' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Sparkles, label: 'Stellar Map', path: '/stellar-map' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const bottomNavItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Target, label: 'Mastery', path: '/mastery' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Sparkles, label: 'Stellar', path: '/stellar-map' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Debug: Log current profile state
  useEffect(() => {
    console.log('🎨 AppShellMobile: Current profile state:', {
      hasProfile: !!profile,
      hasBackgroundImage: !!profile?.background_image,
      backgroundImageUrl: profile?.background_image
    });
  }, [profile]);

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
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 dark:opacity-10">
              <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}></div>
              <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full blur-3xl" style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.2 }}></div>
            </div>
          </div>
        )}
        <div 
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            backgroundColor: profile?.background_image ? 'rgba(0, 0, 0, 0.1)' : 'transparent'
          }}
        ></div>
      </div>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 safe-area-top">
        <div className="glass-header-browser flex items-center justify-between">
          {/* Left side - Menu button */}
          <button
            className="glass-icon-btn lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop left navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <button className="glass-icon-btn">
              <Grid3X3 size={16} />
            </button>
            <button className="glass-icon-btn">
              <ArrowLeft size={16} />
            </button>
            <button className="glass-icon-btn">
              <ArrowRight size={16} />
            </button>
            <button className="glass-icon-btn">
              <Type size={16} />
            </button>
          </div>

          {/* Center - Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              HC University
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Color Palette Dropdown */}
            <ColorPaletteDropdown />
            
            {/* Notification Bell */}
            <div className="relative">
              <button className="glass-icon-btn">
                <Bell size={18} />
              </button>
              <NotificationBadge count={notificationCount} />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="glass-icon-btn"
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Only show on large screens */}
      <aside className="hidden lg:block fixed left-4 top-20 bottom-4 z-40 w-24">
        <div className="glass-sidebar-panel">
          {/* Top section - Toggle and active indicator */}
          <div className="flex flex-col items-center pt-6 pb-4">
            {/* Toggle button */}
            <div className="glass-toggle-btn mb-4">
              <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-primary)' }}></div>
              <div className="flex space-x-1 mt-1">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
              </div>
            </div>

            {/* Active dashboard icon */}
            <button className="glass-nav-btn-active mb-6">
              <Grid3X3 size={20} />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 flex flex-col items-center space-y-4">
            {sidebarItems.slice(1).map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/mastery' && location.pathname.startsWith('/mastery')) ||
                (item.path === '/courses' && location.pathname.startsWith('/courses'));

              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className={`glass-nav-btn ${isActive ? 'glass-nav-btn-active' : ''}`}
                  title={item.label}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </nav>

          {/* Theme toggle - Circular switch */}
          <div className="flex flex-col items-center pb-6">
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

      {/* Mobile Slide-out Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User info */}
              {profile && (
                <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                      <User size={20} className="text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {profile.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Level {profile.level || 1}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path === '/mastery' && location.pathname.startsWith('/mastery')) ||
                  (item.path === '/courses' && location.pathname.startsWith('/courses'));

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    style={isActive ? { background: 'var(--gradient-primary)' } : {}}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-slate-900/95">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="fixed lg:left-32 left-0 top-[52px] lg:top-20 right-0 bottom-[70px] lg:bottom-4 z-30 lg:right-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="glass-main-panel h-full overflow-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-bottom mobile-bottom-nav">
        <div className="glass-effect mx-4 mb-4 rounded-2xl border border-white/20 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-around px-2 py-3">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/mastery' && location.pathname.startsWith('/mastery')) ||
                (item.path === '/courses' && location.pathname.startsWith('/courses'));

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`mobile-nav-item flex flex-col items-center justify-center px-3 py-2 rounded-xl min-w-[60px] transition-all duration-200 ${isActive
                    ? 'scale-110'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  style={isActive ? { color: 'var(--color-primary)' } : {}}
                  >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && <div className="w-1 h-1 rounded-full mt-1" style={{ backgroundColor: 'var(--color-primary)' }}></div>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppShellMobile;

