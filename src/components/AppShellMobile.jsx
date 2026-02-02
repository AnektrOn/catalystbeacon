import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { logDebug, logWarn } from '../utils/logger';
import { hapticImpact } from '../utils/haptics';
import NotificationBadge from './NotificationBadge';
import ColorPaletteDropdown from './common/ColorPaletteDropdown';
import useSubscription from '../hooks/useSubscription';
import levelsService from '../services/levelsService';
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
  Sparkles,
  CreditCard,
  Zap,
  MoreVertical,
  Map
} from 'lucide-react';

const AppShellMobile = ({ navData: navDataProp } = {}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  // Initialize dark mode from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      // Auto-detect system preference if no user preference saved
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsBtnRef = useRef(null);
  const [actionsMenuPos, setActionsMenuPos] = useState({ top: 64, left: 0, width: 224 });
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut, user } = useAuth();
  const { isFreeUser, isAdmin } = useSubscription();

  // Keyboard handling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      setKeyboardHeight(info.keyboardHeight);
      setIsKeyboardVisible(true);
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Handle haptic feedback on navigation
  const handleNavigation = useCallback((path) => {
    hapticImpact('light');
    navigate(path);
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const getMobilePageTitle = useCallback(() => {
    const path = location.pathname || '/';
    if (path === '/' || path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/mastery')) return 'Mastery';
    if (path.startsWith('/courses')) return 'Courses';
    if (path.startsWith('/roadmap')) return 'Roadmap';
    if (path.startsWith('/stellar')) return 'Stellar Map';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/settings')) return 'Settings';
    return 'HC Beacon';
  }, [location.pathname]);

  // Local state when navData not provided (e.g. standalone mount)
  const [notificationCount, setNotificationCount] = useState(navDataProp?.notificationCount ?? 0);
  const [totalXP, setTotalXP] = useState(navDataProp?.totalXP ?? 0);
  const [lastAchievement, setLastAchievement] = useState(navDataProp?.lastAchievement ?? null);
  const [levelTitle, setLevelTitle] = useState(navDataProp?.levelTitle ?? null);

  const notificationCountVal = navDataProp != null ? navDataProp.notificationCount : notificationCount;
  const totalXPVal = navDataProp != null ? navDataProp.totalXP : totalXP;
  const lastAchievementVal = navDataProp != null ? navDataProp.lastAchievement : lastAchievement;
  const levelTitleVal = navDataProp != null ? navDataProp.levelTitle : levelTitle;

  const computeActionsMenuPos = useCallback(() => {
    const el = actionsBtnRef.current;
    if (!el) {
      // Fallback if button ref not ready
      const headerHeight = 52;
      const padding = 12;
      const maxWidth = Math.max(200, Math.min(280, window.innerWidth - padding * 2));
      setActionsMenuPos({ 
        top: headerHeight + padding, 
        left: window.innerWidth - maxWidth - padding, 
        width: maxWidth 
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 12;
    const maxWidth = Math.max(200, Math.min(280, window.innerWidth - padding * 2));
    const width = maxWidth;
    
    // Position from right edge
    const left = Math.max(padding, window.innerWidth - width - padding);
    
    // Position directly below the button
    const top = rect.bottom + padding;
    
    // Ensure it's never above 60px (below header)
    const finalTop = Math.max(60, top);

    setActionsMenuPos({ top: finalTop, left, width });
  }, []);

  // Ensure the actions dropdown is never clipped/off-screen on mobile
  useEffect(() => {
    if (!isActionsMenuOpen) return;

    // Compute immediately - use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      computeActionsMenuPos();
    }, 0);
    
    const raf = requestAnimationFrame(() => computeActionsMenuPos());

    const onResize = () => computeActionsMenuPos();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [isActionsMenuOpen, computeActionsMenuPos]);
  
  useEffect(() => {
    if (navDataProp != null) return;
    const loadNotifications = async () => {
      if (!user) {
        setNotificationCount(0);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        if (error && error.code !== 'PGRST116') {
          logWarn('Notifications table not available:', error.message);
          setNotificationCount(0);
        } else {
          setNotificationCount(data?.length || 0);
        }
      } catch (err) {
        logWarn('Error loading notifications:', err);
        setNotificationCount(0);
      }
    };
    loadNotifications();
    if (user) {
      const channel = supabase
        .channel('notifications-mobile')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, loadNotifications)
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [user, navDataProp]);

  useEffect(() => {
    if (navDataProp != null) return;
    const loadLevelTitle = async () => {
      if (!user || !profile) {
        setLevelTitle(null);
        return;
      }
      try {
        if (profile.rank) {
          setLevelTitle(profile.rank);
          return;
        }
        const currentXP = profile.current_xp || 0;
        const { data: levelInfo, error } = await levelsService.getCurrentAndNextLevel(currentXP);
        if (!error && levelInfo?.currentLevel) setLevelTitle(levelInfo.currentLevel.title);
        else if (profile.level) {
          const { data: levelData } = await levelsService.getLevelByNumber(profile.level);
          if (levelData?.title) setLevelTitle(levelData.title);
        }
      } catch (err) {
        logWarn('Error loading level title:', err);
        setLevelTitle(null);
      }
    };
    loadLevelTitle();
  }, [user, profile, navDataProp]);

  useEffect(() => {
    if (navDataProp != null) return;
    const loadXPAndAchievement = async () => {
      if (!user) {
        setTotalXP(0);
        setLastAchievement(null);
        return;
      }
      try {
        if (profile?.current_xp !== undefined) setTotalXP(profile.current_xp);

        // Get most recent achievement (badge or lesson completion)
        const achievements = [];

        // Get most recent badge
        const { data: recentBadge, error: badgeError } = await supabase
          .from('user_badges')
          .select(`
            awarded_at,
            badges (
              title,
              badge_image_url
            )
          `)
          .eq('user_id', user.id)
          .order('awarded_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!badgeError && recentBadge) {
          achievements.push({
            type: 'badge',
            title: recentBadge.badges?.title || 'Achievement Unlocked',
            iconUrl: recentBadge.badges?.badge_image_url,
            timestamp: recentBadge.awarded_at
          });
        }

        // Get most recent lesson completion
        const { data: recentLesson, error: lessonError } = await supabase
          .from('user_lesson_progress')
          .select('completed_at, course_id, chapter_number, lesson_number')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!lessonError && recentLesson && recentLesson.completed_at) {
          // Fetch course title separately
          let courseTitle = 'Course';
          if (recentLesson.course_id) {
            const { data: courseData } = await supabase
              .from('course_metadata')
              .select('course_title')
              .eq('course_id', recentLesson.course_id)
              .maybeSingle();
            if (courseData) {
              courseTitle = courseData.course_title;
            }
          }

          achievements.push({
            type: 'lesson',
            title: `Lesson Completed`,
            subtitle: `${courseTitle} • Ch ${recentLesson.chapter_number} L ${recentLesson.lesson_number}`,
            timestamp: recentLesson.completed_at
          });
        }

        if (achievements.length > 0) {
          achievements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setLastAchievement(achievements[0]);
        } else setLastAchievement(null);
      } catch (err) {
        logWarn('Error loading XP and achievements:', err);
      }
    };

    loadXPAndAchievement();
  }, [user, profile, navDataProp]);

  // Debug: Log profile background image changes
  useEffect(() => {
    if (profile?.background_image) {
      logDebug('🎨 AppShellMobile: Background image updated:', profile.background_image);
    }
  }, [profile?.background_image]);

  // Apply dark class to document.documentElement on mount and when isDarkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const allSidebarItems = [
    { icon: Grid3X3, label: 'Dashboard', path: '/dashboard', restricted: false },
    { icon: Target, label: 'Mastery', path: '/mastery', restricted: false },
    { icon: BookOpen, label: 'Courses', path: '/courses', restricted: true },
    { icon: Sparkles, label: 'Stellar Map', path: '/stellar-map', restricted: true },
    { icon: Map, label: 'Roadmap', path: '/roadmap/ignition', restricted: false },
    { icon: Users, label: 'Community', path: '/community', restricted: true },
    { icon: CreditCard, label: 'Pricing', path: '/pricing', restricted: false },
    { icon: User, label: 'Profile', path: '/profile', restricted: true },
    { icon: Settings, label: 'Settings', path: '/settings', restricted: false }
  ];

  const allBottomNavItems = [
    { icon: Home, label: 'Home', path: '/dashboard', restricted: false },
    { icon: Target, label: 'Mastery', path: '/mastery', restricted: false },
    { icon: Map, label: 'Roadmap', path: '/roadmap/ignition', restricted: false },
    { icon: BookOpen, label: 'Courses', path: '/courses', restricted: true },
    { icon: Sparkles, label: 'Stellar', path: '/stellar-map', restricted: true },
    { icon: User, label: 'Profile', path: '/profile', restricted: true }
  ];

  // Filter out restricted items for free users (admins see everything)
  const sidebarItems = (isFreeUser && !isAdmin)
    ? allSidebarItems.filter(item => !item.restricted)
    : allSidebarItems;

  const bottomNavItems = (isFreeUser && !isAdmin)
    ? allBottomNavItems.filter(item => !item.restricted)
    : allBottomNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Debug: Log current profile state
  useEffect(() => {
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
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: isDarkMode ? 'var(--bg-secondary)' : 'var(--bg-primary)',
              background: isDarkMode 
                ? `linear-gradient(to bottom right, var(--bg-secondary), var(--color-earth-green), var(--bg-secondary))`
                : `linear-gradient(to bottom right, var(--color-old-lace), var(--color-bone), var(--color-primary))`
            }}
          >
            <div 
              className="absolute top-0 left-0 w-full h-full overflow-hidden"
              style={{ opacity: isDarkMode ? 0.1 : 0.2 }}
            >
              <div 
                className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl"
                style={{ 
                  backgroundColor: isDarkMode
                    ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                    : 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
                }}
              ></div>
              <div 
                className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full blur-3xl"
                style={{ 
                  backgroundColor: isDarkMode
                    ? 'color-mix(in srgb, var(--color-secondary) 15%, transparent)'
                    : 'color-mix(in srgb, var(--color-secondary) 20%, transparent)'
                }}
              ></div>
            </div>
          </div>
        )}
        <div 
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            backgroundColor: profile?.background_image 
              ? (isDarkMode 
                  ? 'color-mix(in srgb, var(--bg-secondary) 30%, transparent)'
                  : 'color-mix(in srgb, var(--bg-primary) 25%, transparent)')
              : 'transparent'
          }}
        ></div>
      </div>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 safe-area-top">
        <div className="bg-ethereal-glass backdrop-blur-ethereal border-b border-ethereal flex items-center justify-between w-full rounded-none m-0 px-4 py-3 h-[56px] lg:w-[70%] lg:mx-auto lg:rounded-full lg:px-6 lg:py-2 lg:h-[60px]">
          {/* Left side - Menu button */}
          <button
            className="glass-icon-btn lg:hidden min-w-[44px] min-h-[44px]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>

          {/* Desktop left navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <button className="glass-icon-btn" aria-label="View grid">
              <Grid3X3 size={16} aria-hidden="true" />
            </button>
            <button className="glass-icon-btn" aria-label="Go back">
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <button className="glass-icon-btn" aria-label="Go forward">
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button className="glass-icon-btn" aria-label="Text options">
              <Type size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Center - Calm page title (Apple-like: reduce header cognitive load) */}
          <div className="flex-1 px-3 flex items-center justify-center">
            <h1
              className="text-sm font-semibold tracking-tight truncate"
              style={{ color: 'var(--text-primary)' }}
              title={getMobilePageTitle()}
            >
              {getMobilePageTitle()}
            </h1>
          </div>

          {/* Right side actions - Grouped dropdown on mobile */}
          <div className="flex items-center">
            {/* Mobile: Actions dropdown menu */}
            <div className="lg:hidden relative">
              <button
                onClick={() => {
                  const willOpen = !isActionsMenuOpen;
                  setIsActionsMenuOpen(willOpen);
                  if (willOpen) {
                    // Calculate position immediately when opening
                    setTimeout(() => computeActionsMenuPos(), 0);
                  }
                }}
                ref={actionsBtnRef}
                className="glass-icon-btn min-w-[44px] min-h-[44px]"
                aria-label="More actions"
                aria-expanded={isActionsMenuOpen}
              >
                <MoreVertical size={20} aria-hidden="true" />
              </button>
              
              {isActionsMenuOpen && typeof document !== 'undefined' && document.body && createPortal(
                <>
                  <div 
                    className="fixed inset-0 z-[90]"
                    onClick={() => setIsActionsMenuOpen(false)}
                    style={{ width: '100vw', height: '100vh' }}
                  />
                  <div
                    className="fixed bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal shadow-ethereal-elevated border border-ethereal z-[100] overflow-visible"
                    style={{
                      top: `${actionsMenuPos.top}px`,
                      left: `${actionsMenuPos.left}px`,
                      width: `${actionsMenuPos.width}px`,
                      position: 'fixed'
                    }}
                  >
                    <div className="py-2">
                      {/* Color Palette */}
                      <div className="px-3 py-2 overflow-visible">
                        <ColorPaletteDropdown />
                      </div>
                      
                      {/* Notification */}
                      <button
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          // TODO: Navigate to notifications
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ethereal-text hover:bg-ethereal-glass-hover transition-colors min-h-[44px]"
                        aria-label={`Notifications${notificationCountVal > 0 ? ` (${notificationCountVal} unread)` : ''}`}
                      >
                        <div className="relative">
                          <Bell size={18} aria-hidden="true" />
                          {notificationCountVal > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                          )}
                        </div>
                        <span>Notifications</span>
                        {notificationCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{notificationCountVal}</span>
                        )}
                      </button>
                      
                      {/* Theme Toggle */}
                      <button
                        onClick={() => {
                          toggleTheme();
                          setIsActionsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ethereal-text hover:bg-ethereal-glass-hover transition-colors min-h-[44px]"
                        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                      >
                        {isDarkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
                        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
            
            {/* Desktop: Show individual buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <ColorPaletteDropdown />
              
              <div className="relative">
                <button 
                  className="glass-icon-btn min-w-[44px] min-h-[44px]"
                  aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
                >
                  <Bell size={18} aria-hidden="true" />
                </button>
                <NotificationBadge count={notificationCountVal} />
              </div>

              <button
                onClick={toggleTheme}
                className="glass-icon-btn min-w-[44px] min-h-[44px]"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Only show on large screens */}
      <aside className="hidden lg:block fixed left-4 top-20 bottom-4 z-40 w-24">
        <div className="bg-ethereal-glass border-r border-ethereal backdrop-blur-ethereal rounded-ethereal shadow-ethereal-base h-full flex flex-col py-4 px-3 m-4">
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
            <button 
              className="glass-nav-btn-active mb-6"
              aria-label="Dashboard"
              aria-current="page"
            >
              <Grid3X3 size={20} aria-hidden="true" />
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
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                >
                  <Icon size={20} aria-hidden="true" />
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
                aria-label="Switch to light mode"
                title="Light mode"
              >
                <Sun size={14} aria-hidden="true" />
              </button>
              <button
                onClick={toggleTheme}
                className={`glass-theme-btn ${isDarkMode ? 'glass-theme-btn-active' : ''}`}
                aria-label="Switch to dark mode"
                title="Dark mode"
              >
                <Moon size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-out Menu */}
      {isMobileMenuOpen && typeof document !== 'undefined' && document.body && createPortal(
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ width: '100vw', height: '100vh' }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ width: '100vw', height: '100vh' }} />
          <div
            className="absolute top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-ethereal-glass backdrop-blur-ethereal border-r border-ethereal shadow-ethereal-elevated flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="p-6 border-b border-ethereal">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="glass-icon-btn min-w-[44px] min-h-[44px]"
                  aria-label="Close menu"
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              {/* User info */}
              {profile && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal-sm border border-ethereal">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-ethereal-white font-semibold text-sm" style={{ background: 'var(--gradient-primary)' }}>
                        {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User size={20} />}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {profile.full_name || 'User'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {levelTitleVal || profile?.rank || `Level ${profile?.level || 1}`}
                      </p>
                    </div>
                  </div>
                  {/* XP Display */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal-sm border border-ethereal">
                    <Zap size={16} style={{ color: 'var(--color-primary)' }} />
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Experience Points</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {totalXPVal.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {sidebarItems.filter(item => item.path !== '/profile' && item.path !== '/settings').map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path === '/mastery' && location.pathname.startsWith('/mastery')) ||
                  (item.path === '/courses' && location.pathname.startsWith('/courses')) ||
                  (item.path === '/roadmap/ignition' && location.pathname.startsWith('/roadmap'));

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-ethereal-sm text-sm font-medium transition-all duration-200 min-h-[44px] ${isActive
                      ? 'text-ethereal-white shadow-ethereal-base bg-ethereal-violet/20'
                      : 'hover:bg-ethereal-glass-hover text-ethereal-text'
                      }`}
                    style={isActive ? { background: 'var(--gradient-primary)' } : {}}
                    aria-label={`Navigate to ${item.label}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={20} aria-hidden="true" className="flex-shrink-0" />
                    <span className="flex-1 text-left" style={!isActive ? { color: 'var(--text-primary)' } : {}}>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Menu Footer - Profile, Settings, Sign Out */}
            <div className="p-4 border-t border-ethereal space-y-2">
              {sidebarItems.filter(item => item.path === '/profile' || item.path === '/settings').map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-ethereal-sm text-sm font-medium transition-all duration-200 min-h-[44px] ${isActive
                      ? 'text-ethereal-white shadow-ethereal-base bg-ethereal-violet/20'
                      : 'hover:bg-ethereal-glass-hover text-ethereal-text'
                      }`}
                    style={isActive ? { background: 'var(--gradient-primary)' } : {}}
                    aria-label={`Navigate to ${item.label}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={20} aria-hidden="true" className="flex-shrink-0" />
                    <span className="flex-1 text-left" style={!isActive ? { color: 'var(--text-primary)' } : {}}>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-ethereal-sm text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all duration-200 min-h-[44px]"
                aria-label="Sign out of your account"
              >
                <LogOut size={20} aria-hidden="true" className="flex-shrink-0" />
                <span className="flex-1 text-left">Sign Out</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Main Content Area */}
      <main className="fixed lg:left-32 left-0 top-[52px] lg:top-20 right-0 bottom-[70px] lg:bottom-4 z-30 lg:right-4 flex flex-col min-h-0"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <div
          className={`bg-ethereal-glass backdrop-blur-ethereal border border-ethereal rounded-2xl shadow-ethereal-base h-full m-0 lg:m-4 p-0 flex flex-col min-h-0 ${location.pathname.startsWith('/stellar-map') ? 'overflow-hidden' : 'overflow-auto'}`}
        >
          {location.pathname.startsWith('/stellar-map') ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <Outlet />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-bottom mobile-bottom-nav"
        style={{
          paddingBottom: `max(env(safe-area-inset-bottom), ${keyboardHeight > 0 ? keyboardHeight + 'px' : '0px'})`
        }}
      >
        <div className="bg-ethereal-glass backdrop-blur-ethereal mx-4 mb-4 rounded-2xl border border-ethereal shadow-ethereal-elevated">
          <div className="flex items-center justify-around px-2 py-3">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/mastery' && location.pathname.startsWith('/mastery')) ||
                (item.path === '/courses' && location.pathname.startsWith('/courses')) ||
                (item.path === '/roadmap/ignition' && location.pathname.startsWith('/roadmap'));

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`mobile-nav-item flex flex-col items-center justify-center px-3 py-2 rounded-ethereal-sm min-w-[60px] min-h-[60px] transition-all duration-200 ${isActive
                    ? 'scale-110 text-ethereal-cyan'
                    : 'text-ethereal-text hover:text-ethereal-white'
                    }`}
                  style={isActive ? { color: 'var(--color-primary)' } : {}}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  {isActive && <div className="w-2 h-2 rounded-full mt-1.5 shadow-lg" style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} aria-hidden="true"></div>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default AppShellMobile;

