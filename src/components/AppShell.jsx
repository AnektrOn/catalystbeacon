
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Grid3X3,
  Calendar,
  Clock,
  User,
  Settings,
  Sun,
  Moon,
  Upload,
  Plus,
  Square,
  ArrowLeft,
  ArrowRight,
  Type,
  Users,
  Target,
  BookOpen
} from 'lucide-react';

const AppShell = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const sidebarItems = [
    { icon: Grid3X3, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Target, label: 'Mastery', path: '/mastery' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Clock, label: 'Timer', path: '/timer' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={`min - h - screen ${isDarkMode ? 'dark' : ''} `}>
      {/* Background - User's custom background or default gradient */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10 transition-all duration-500"
        style={{
          backgroundImage: profile?.background_image
            ? `url(${profile.background_image})`
            : undefined
        }}
      >
        {!profile?.background_image && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Abstract shapes for visual interest */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 dark:opacity-20">
              <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-3xl"></div>
              <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-3xl"></div>
              <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-400/20 blur-3xl"></div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      </div>

      {/* Header - 60% width, no search bar */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="glass-header-browser">
          {/* Left side navigation */}
          <div className="flex items-center space-x-2">
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

          {/* Right side actions */}
          <div className="flex items-center space-x-2 ml-auto">
            <button className="glass-icon-btn">
              <Upload size={16} />
            </button>
            <button className="glass-icon-btn">
              <Plus size={16} />
            </button>
            <button className="glass-icon-btn">
              <Square size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Left Sidebar - Narrow vertical panel */}
      <aside className="fixed left-4 top-20 bottom-4 z-40 w-24">
        <div className="glass-sidebar-panel">
          {/* Top section - Toggle and active indicator */}
          <div className="flex flex-col items-center pt-6 pb-4">
            {/* Toggle button */}
            <div className="glass-toggle-btn mb-4">
              <div className="w-4 h-3 bg-orange-400 rounded-sm"></div>
              <div className="flex space-x-1 mt-1">
                <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
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
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className={`glass - nav - btn ${isActive ? 'glass-nav-btn-active' : ''} `}
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
                className={`glass - theme - btn ${!isDarkMode ? 'glass-theme-btn-active' : ''} `}
                title="Light mode"
              >
                <Sun size={14} />
              </button>
              <button
                onClick={toggleTheme}
                className={`glass - theme - btn ${isDarkMode ? 'glass-theme-btn-active' : ''} `}
                title="Dark mode"
              >
                <Moon size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Large glass panel */}
      <main className="fixed left-32 top-20 right-4 bottom-4 z-30">
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