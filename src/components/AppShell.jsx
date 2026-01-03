import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBadge from './NotificationBadge';
import ColorPaletteDropdown from './common/ColorPaletteDropdown';
import AppShellMobile from './AppShellMobile';
import useSubscription from '../hooks/useSubscription';
import UpgradeModal from './UpgradeModal';
import { getCurrentPalette, switchTo } from '../utils/colorPaletteSwitcher';
import {
  Grid3X3,
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
  Sparkles,
  Zap,
  Award,
  Map
} from 'lucide-react';

// Sidebar Navigation Item with hover tooltip
const SidebarNavItem = ({ item, isActive, isSidebarExpanded, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const Icon = item.icon;

  const handleMouseEnter = () => {
    if (!isSidebarExpanded && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 16
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${isActive ? 'glass-nav-btn-active' : 'glass-nav-btn'} group relative`}
      >
        <div className="glass-icon-premium">
          <Icon size={22} />
        </div>
        {isSidebarExpanded ? (
          <span className="glass-nav-label ml-2">{item.label}</span>
        ) : null}
      </button>
      {!isSidebarExpanded && showTooltip && createPortal(
        <div
          className="glass-tooltip-fixed"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {item.label}
        </div>,
        document.body
      )}
    </>
  );
};

const AppShell = () => {
  // Initialize dark mode from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      // Check system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
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
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();
  const { isFreeUser, isAdmin } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedFeature, setRestrictedFeature] = useState(null);
  
  // XP and achievement state
  const [totalXP, setTotalXP] = useState(0);
  const [lastAchievement, setLastAchievement] = useState(null);

  // Handle resize to switch between desktop and mobile shells
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load XP and last achievement
  useEffect(() => {
    const loadXPAndAchievement = async () => {
      if (!user) {
        setTotalXP(0);
        setLastAchievement(null);
        return;
      }

      try {
        // Get total XP from profile
        if (profile?.current_xp !== undefined) {
          setTotalXP(profile.current_xp);
        }

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

        // Get the most recent achievement
        if (achievements.length > 0) {
          achievements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setLastAchievement(achievements[0]);
        } else {
          setLastAchievement(null);
        }
      } catch (error) {
        console.warn('Error loading XP and achievements:', error);
      }
    };

    loadXPAndAchievement();
  }, [user, profile]);

  // Debug: Log background image state
  useEffect(() => {
    if (profile && !isMobile) {
      const bgElement = document.querySelector('[class*="fixed inset-0"][style*="backgroundImage"]');
      const computedBg = bgElement ? getComputedStyle(bgElement).backgroundImage : 'not found';
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppShell.jsx:228',message:'Background image debug',data:{hasProfile:!!profile,hasBackgroundImage:!!profile?.background_image,backgroundImageUrl:profile?.background_image,profileId:profile?.id,computedBg,isMobile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'background-image'})}).catch(()=>{});
      console.log('🖼️ AppShell Desktop: Background image state:', {
        hasProfile: !!profile,
        hasBackgroundImage: !!profile?.background_image,
        backgroundImageUrl: profile?.background_image,
        profileId: profile?.id,
        computedBg,
        fullProfile: profile
      });
    }
  }, [profile, isMobile]);

  // #region agent log
  useEffect(() => {
    const root = document.documentElement;
    const computedBgPrimary = getComputedStyle(root).getPropertyValue('--bg-primary').trim();
    const computedBgSecondary = getComputedStyle(root).getPropertyValue('--bg-secondary').trim();
    const computedTextPrimary = getComputedStyle(root).getPropertyValue('--text-primary').trim();
    const computedColorPrimary = getComputedStyle(root).getPropertyValue('--color-primary').trim();
    const glassCard = document.querySelector('.glass-card-premium, .glass-effect');
    const glassCardBg = glassCard ? getComputedStyle(glassCard).backgroundColor : 'not found';
    fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppShell.jsx:214',message:'Render - CSS variables and glass card',data:{isDarkMode,computedBgPrimary,computedBgSecondary,computedTextPrimary,computedColorPrimary,glassCardBg,hasDarkClass:root.classList.contains('dark')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
  }, [isDarkMode]);
  // #endregion

  // Use AppShellMobile for smaller screens
  if (isMobile) {
    return <AppShellMobile />;
  }

  // Debug: Verify new version is loading
  console.log('🎨 NEW AppShell loaded - with earth tones and expandable sidebar!');

  // Mock notification count - replace with actual data
  const notificationCount = 3;

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    const root = document.documentElement;
    const currentPalette = getCurrentPalette();
    
    // Toggle dark class
    if (newDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    setIsDarkMode(newDarkMode);
    
    // Re-apply current palette with new dark mode state
    // This will automatically select the correct variant (light/dark)
    switchTo(currentPalette, false); // Don't save, just re-apply
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Define all sidebar items
  const allSidebarItems = [
    { icon: Grid3X3, label: 'Dashboard', path: '/dashboard', restricted: false },
    { icon: BookOpen, label: 'Courses', path: '/courses', restricted: true, feature: 'courses' },
    { icon: Target, label: 'Mastery', path: '/mastery', restricted: false },
    { icon: Map, label: 'Roadmap', path: '/roadmap/ignition', restricted: false },
    { icon: Sparkles, label: 'Stellar Map', path: '/stellar-map-2d', restricted: true, feature: 'stellarMap' },
    { icon: User, label: 'Profile', path: '/profile', restricted: true, feature: 'profile' },
    { icon: Users, label: 'Community', path: '/community', restricted: true, feature: 'community' },
    { icon: Settings, label: 'Settings', path: '/settings', restricted: false }
  ];
  
  // Filter out restricted items for free users (admins see everything)
  const sidebarItems = (isFreeUser && !isAdmin)
    ? allSidebarItems.filter(item => !item.restricted)
    : allSidebarItems;

  const handleNavigation = (path, item) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Background - User's custom background or earth-tone gradient */}
      {profile?.background_image ? (
        <div
          key={`bg-img-${profile.id}-${profile.background_image.substring(0, 50)}`}
          className="fixed inset-0 transition-all duration-500"
          style={{
            backgroundImage: `url("${profile.background_image}")`,
            backgroundSize: (() => {
              const fit = profile.background_fit || 'cover';
              const zoom = profile.background_zoom || 100;
              
              if (fit === 'cover') {
                // For cover, use zoom percentage
                return `${zoom}%`;
              } else if (fit === 'contain') {
                // For contain, use zoom percentage
                return `${zoom}%`;
              } else if (fit === 'auto') {
                return 'auto';
              } else if (fit === '100% 100%') {
                return '100% 100%';
              }
              return 'cover';
            })(),
            backgroundPosition: profile.background_position || 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            zIndex: -1,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none'
          }}
          ref={(el) => {
            if (el) {
              const computed = getComputedStyle(el);
              fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppShell.jsx:332',message:'Background div rendered',data:{bgUrl:profile.background_image,computedZIndex:computed.zIndex,computedBg:computed.backgroundImage,computedDisplay:computed.display,computedPosition:computed.position,offsetWidth:el.offsetWidth,offsetHeight:el.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'background-image'})}).catch(()=>{});
            }
          }}
        >
          {/* #region agent log */}
          {(() => {
            const bgUrl = profile.background_image;
            const img = new Image();
            img.onload = () => {
              fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppShell.jsx:331',message:'Background image loaded',data:{bgUrl,loaded:true,width:img.width,height:img.height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'background-image'})}).catch(()=>{});
            };
            img.onerror = () => {
              fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppShell.jsx:331',message:'Background image failed to load',data:{bgUrl,loaded:false,error:'Image load error'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'background-image'})}).catch(()=>{});
            };
            img.src = bgUrl;
            return null;
          })()}
          {/* #endregion */}
          <div 
            className="absolute inset-0 backdrop-blur-[1px]"
            style={{
              backgroundColor: isDarkMode 
                ? 'color-mix(in srgb, var(--bg-secondary) 10%, transparent)'
                : 'color-mix(in srgb, var(--bg-primary) 3%, transparent)'
            }}
          ></div>
        </div>
      ) : (
        <div
          key={`bg-default-${profile?.id || 'no-user'}`}
          className="fixed inset-0 -z-10 transition-all duration-500"
          style={{
            backgroundColor: isDarkMode ? 'var(--bg-secondary)' : 'var(--bg-primary)'
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: isDarkMode 
                ? `linear-gradient(to bottom right, var(--bg-secondary, #1F2937), var(--color-earth-green, #3F3F2C), var(--bg-secondary, #1F2937))`
                : `linear-gradient(to bottom right, var(--color-old-lace, #F7F1E1), var(--color-bone, #E3D8C1), var(--color-primary, #B4833D))`
            }}
          >
            {/* Abstract shapes for visual interest */}
            <div 
              className="absolute top-0 left-0 w-full h-full overflow-hidden"
              style={{ opacity: isDarkMode ? 0.1 : 0.2 }}
            >
              <div 
                className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl"
                style={{ backgroundColor: isDarkMode 
                  ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                  : 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
                }}
              ></div>
              <div 
                className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full blur-3xl"
                style={{ backgroundColor: isDarkMode
                  ? 'color-mix(in srgb, var(--color-secondary) 15%, transparent)'
                  : 'color-mix(in srgb, var(--color-secondary) 20%, transparent)'
                }}
              ></div>
              <div 
                className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full blur-3xl"
                style={{ backgroundColor: isDarkMode
                  ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                  : 'color-mix(in srgb, var(--color-kobicha) 20%, transparent)'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Header - 60% width */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="glass-header-browser flex items-center justify-between">
          {/* Left side - Empty or logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Intentionally empty - no navigation icons */}
          </div>

          {/* Center - XP and Last Achievement */}
          {user && (
            <div className="flex items-center gap-3 flex-1 justify-center px-4">
              {/* Total XP */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-effect border border-white/10">
                <Zap size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {totalXP.toLocaleString()}
                </span>
              </div>

              {/* Last Achievement */}
              {lastAchievement && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-effect border border-white/10 max-w-[200px]">
                  {lastAchievement.iconUrl ? (
                    <img 
                      src={lastAchievement.iconUrl} 
                      alt={lastAchievement.title}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <Award size={16} style={{ color: 'var(--color-primary)' }} />
                  )}
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }} title={lastAchievement.subtitle || lastAchievement.title}>
                    {lastAchievement.type === 'lesson' ? 'Lesson' : lastAchievement.title}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
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
        <div 
          className={`glass-sidebar-panel-v2 glass-panel-floating ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
        >
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
              const isActive = location.pathname === item.path ||
                (item.path === '/mastery' && location.pathname.startsWith('/mastery')) ||
                (item.path === '/courses' && location.pathname.startsWith('/courses')) ||
                (item.path === '/roadmap/ignition' && location.pathname.startsWith('/roadmap')) ||
                (item.path === '/stellar-map-2d' && (location.pathname.startsWith('/stellar-map') || location.pathname === '/stellar-map-2d'));

              return (
                <SidebarNavItem
                  key={index}
                  item={item}
                  isActive={isActive}
                  isSidebarExpanded={isSidebarExpanded}
                  onClick={() => handleNavigation(item.path, item)}
                />
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

      {/* Upgrade Modal - Only show for non-admins */}
      {!isAdmin && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setRestrictedFeature(null);
          }}
          restrictedFeature={restrictedFeature}
        />
      )}
    </div>
  );
};

export default AppShell;