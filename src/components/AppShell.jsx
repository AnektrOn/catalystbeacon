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
import { useNavigationData } from '../hooks/useNavigationData';
import UpgradeModal from './UpgradeModal';
import { getCurrentPalette, switchTo } from '../utils/colorPaletteSwitcher';
import GlobalBackground from './ui/GlobalBackground';
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

// Intent-based prefetch: load chunk on hover so navigation feels instant
const PREFETCH_MAP = {
  '/dashboard': () => import(/* webpackChunkName: "dashboard-feature" */ '../pages/DashboardNeomorphic'),
  '/mastery': () => import(/* webpackChunkName: "mastery-feature" */ '../pages/Mastery'),
  '/roadmap/ignition': () => import(/* webpackChunkName: "roadmap-feature" */ '../pages/SchoolRoadmap'),
  '/profile': () => import(/* webpackChunkName: "profile" */ '../pages/ProfilePage'),
  '/community': () => import(/* webpackChunkName: "community" */ '../pages/CommunityPage'),
  '/settings': () => import(/* webpackChunkName: "settings" */ '../pages/SettingsPage'),
  '/courses': () => import(/* webpackChunkName: "courses-feature" */ '../pages/CourseCatalogPage'),
  '/stellar-map': () => import(/* webpackChunkName: "stellar-map" */ '../pages/StellarMapPage'),
  '/achievements': () => import(/* webpackChunkName: "achievements" */ '../pages/Achievements'),
};

// Sidebar Navigation Item with hover tooltip and prefetch
const SidebarNavItem = ({ item, isActive, isSidebarExpanded, onClick, onPrefetch }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const Icon = item.icon;

  const handleMouseEnter = () => {
    onPrefetch?.(item.path);
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
      // Auto-detect system preference if no user preference saved
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

  const navData = useNavigationData();
  const { totalXP, lastAchievement, notificationCount } = navData;

  // Handle resize to switch between desktop and mobile shells
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrefetch = (path) => {
    const fn = PREFETCH_MAP[path] ?? PREFETCH_MAP[path?.split('/').slice(0, 2).join('/')];
    if (typeof fn === 'function') fn().catch(() => {});
  };

  // #region agent log
  useEffect(() => {
    const root = document.documentElement;
    const computedBgPrimary = getComputedStyle(root).getPropertyValue('--bg-primary').trim();
    const computedBgSecondary = getComputedStyle(root).getPropertyValue('--bg-secondary').trim();
    const computedTextPrimary = getComputedStyle(root).getPropertyValue('--text-primary').trim();
    const computedColorPrimary = getComputedStyle(root).getPropertyValue('--color-primary').trim();
    const glassCard = document.querySelector('.glass-card-premium, .glass-effect');
    const glassCardBg = glassCard ? getComputedStyle(glassCard).backgroundColor : 'not found';
  }, [isDarkMode]);
  // #endregion

  // Use AppShellMobile for smaller screens; pass navData to avoid double-fetch on resize
  if (isMobile) {
    return <AppShellMobile navData={navData} />;
  }

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
    { icon: Sparkles, label: 'Stellar Map', path: '/stellar-map', restricted: true, feature: 'stellarMap' },
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
      {/* Global Background - Consolidated system */}
      <GlobalBackground />

      {/* Header - 60% width */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="bg-ethereal-glass backdrop-blur-ethereal border border-ethereal shadow-ethereal-base flex items-center justify-between px-6 py-2 h-[60px] w-[95%] lg:w-[70%] mx-auto rounded-full">
          {/* Left side - Empty or logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Intentionally empty - no navigation icons */}
          </div>

          {/* Center - XP and Last Achievement */}
          {user && (
            <div className="flex items-center gap-3 flex-1 justify-center px-4">
              {/* Total XP */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-ethereal-sm bg-ethereal-glass/50 backdrop-blur-ethereal border border-ethereal">
                <Zap size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {totalXP.toLocaleString()}
                </span>
              </div>

              {/* Last Achievement */}
              {lastAchievement && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-ethereal-sm bg-ethereal-glass/50 backdrop-blur-ethereal border border-ethereal max-w-[200px]">
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
                  className="glass-user-avatar flex items-center justify-center text-ethereal-white font-semibold text-sm"
                  style={{ background: 'var(--gradient-primary)' }}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User size={20} />}
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
          className={`bg-ethereal-glass border-r border-ethereal backdrop-blur-ethereal rounded-ethereal shadow-ethereal-base flex flex-col h-full py-4 px-3 m-4 ${isSidebarExpanded ? 'expanded' : 'collapsed'} transition-all duration-300`}
          style={{
            width: isSidebarExpanded ? 'var(--sidebar-width-expanded)' : 'var(--sidebar-width-collapsed)',
            alignItems: isSidebarExpanded ? 'flex-start' : 'center'
          }}
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
                (item.path === '/stellar-map' && location.pathname.startsWith('/stellar-map'));

              return (
                <SidebarNavItem
                  key={index}
                  item={item}
                  isActive={isActive}
                  isSidebarExpanded={isSidebarExpanded}
                  onClick={() => handleNavigation(item.path, item)}
                  onPrefetch={handlePrefetch}
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
            : 'calc(var(--sidebar-width-collapsed) + 32px)',
          width: isSidebarExpanded
            ? 'calc(100vw - var(--sidebar-width-expanded) - 32px - 16px)'
            : 'calc(100vw - var(--sidebar-width-collapsed) - 32px - 16px)',
          boxSizing: 'border-box'
        }}
      >
        <div
          className={`bg-ethereal-glass backdrop-blur-ethereal border border-ethereal rounded-2xl shadow-ethereal-base h-full m-4 p-0 ${location.pathname.startsWith('/stellar-map') ? 'overflow-hidden flex flex-col min-h-0' : 'overflow-auto'}`}
        >
          <div
            className={location.pathname.startsWith('/stellar-map') ? 'flex-1 min-h-0 flex flex-col overflow-hidden p-0' : 'p-4'}
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          >
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