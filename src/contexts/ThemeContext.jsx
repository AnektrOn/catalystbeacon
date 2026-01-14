import React, { createContext, useContext, useState, useLayoutEffect, useEffect } from 'react';
import { colorPalettes, DEFAULT_PALETTE, STORAGE_KEY } from '../config/colorPalettes';
import colorPaletteSwitcher from '../utils/colorPaletteSwitcher';

const ThemeContext = createContext(null);

/**
 * ThemeProvider - Dynamic Theming Engine
 * 
 * Merges the Ethereal Design System (glassmorphism, blurs, shadows) with
 * the Color Palette System (semantic colors in HSL format).
 * 
 * When a palette is selected, it dynamically injects CSS variables that
 * the Ethereal system inherits, creating a cohesive theming experience.
 */
export const ThemeProvider = ({ children }) => {
  const [currentPalette, setCurrentPalette] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved && colorPalettes[saved]) ? saved : DEFAULT_PALETTE;
    }
    return DEFAULT_PALETTE;
  });

  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true' ? 'dark' : 'light';
      }
      // Auto-detect system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  /**
   * Apply dark mode class to document root
   */
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', mode === 'dark' ? 'true' : 'false');
  }, [mode]);

  /**
   * CRITICAL: useLayoutEffect to inject CSS variables BEFORE paint
   * This ensures the Ethereal system inherits colors from the active palette
   */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const palette = colorPalettes[currentPalette];
    
    if (!palette) {
      return;
    }

    // Select appropriate variant based on mode
    const variant = mode === 'dark' ? palette.dark : palette.light;

    // Apply all CSS variables from the palette variant
    // This includes: --primary, --secondary, --card, --border, --foreground, etc.
    Object.entries(variant).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, currentPalette);
    } catch (error) {
    }

    // Dispatch custom event for components that need to react
    const event = new CustomEvent('colorPaletteChanged', {
      detail: {
        paletteKey: currentPalette,
        palette,
        variant: mode
      }
    });
    window.dispatchEvent(event);
  }, [currentPalette, mode]);

  /**
   * Listen for external palette changes (e.g., from ColorPaletteDropdown)
   */
  useEffect(() => {
    const handlePaletteChange = (event) => {
      const newPalette = event.detail.paletteKey;
      if (newPalette !== currentPalette && colorPalettes[newPalette]) {
        setCurrentPalette(newPalette);
      }
    };

    window.addEventListener('colorPaletteChanged', handlePaletteChange);
    return () => {
      window.removeEventListener('colorPaletteChanged', handlePaletteChange);
    };
  }, [currentPalette]);

  /**
   * Listen for dark mode class changes (e.g., from AppShell theme toggle)
   */
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          const newMode = isDark ? 'dark' : 'light';
          if (newMode !== mode) {
            setMode(newMode);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [mode]);

  /**
   * Switch to a specific palette
   */
  const switchPalette = (paletteKey) => {
    if (colorPalettes[paletteKey]) {
      setCurrentPalette(paletteKey);
      // Also update the legacy switcher for compatibility
      colorPaletteSwitcher.switchTo(paletteKey, true);
    } else {
    }
  };

  /**
   * Toggle between light and dark mode
   */
  const toggleMode = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  /**
   * Set mode explicitly
   */
  const setModeExplicit = (newMode) => {
    if (newMode === 'dark' || newMode === 'light') {
      setMode(newMode);
    }
  };

  const value = {
    currentPalette,
    mode,
    palette: colorPalettes[currentPalette],
    variant: colorPalettes[currentPalette]?.[mode],
    switchPalette,
    toggleMode,
    setMode: setModeExplicit,
    availablePalettes: colorPalettes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
