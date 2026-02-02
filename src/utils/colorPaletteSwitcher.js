/**
 * Color Palette Switcher
 * Core logic for switching between color palettes with light/dark mode support
 */

import { colorPalettes, DEFAULT_PALETTE, STORAGE_KEY } from '../config/colorPalettes';

let currentPaletteKey = DEFAULT_PALETTE;

/**
 * Check if dark mode is currently active
 * @returns {boolean} True if dark mode is active
 */
export function isDarkMode() {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * Initialize the color palette system
 * Loads saved palette from localStorage or uses default
 * Applies appropriate variant based on dark mode state
 */
export function init() {
  if (typeof window === 'undefined') return;
  
  try {
    const savedPalette = localStorage.getItem(STORAGE_KEY);
    const paletteKey = (savedPalette && colorPalettes[savedPalette]) ? savedPalette : DEFAULT_PALETTE;
    
    // Apply palette with current dark mode state
    switchTo(paletteKey, false); // Don't save to localStorage since we just loaded it
    
    // Listen for dark mode changes
    setupDarkModeListener();
  } catch (error) {
    switchTo(DEFAULT_PALETTE, false);
  }
}

/**
 * Setup listener for dark mode changes
 * Re-applies current palette when dark mode toggles
 */
function setupDarkModeListener() {
  if (typeof window === 'undefined') return;
  
  // Use MutationObserver to watch for dark class changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        // Dark mode changed, re-apply current palette
        const currentPalette = getCurrentPalette();
        switchTo(currentPalette, false); // Don't save, just re-apply
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
}

/**
 * Switch to a specific color palette
 * Automatically applies light or dark variant based on current dark mode state
 * @param {string} paletteKey - The key of the palette to switch to
 * @param {boolean} save - Whether to save to localStorage (default: true)
 */
export function switchTo(paletteKey, save = true) {
  if (typeof window === 'undefined') return;
  
  const palette = colorPalettes[paletteKey];
  if (!palette) {
    switchTo(DEFAULT_PALETTE, save);
    return;
  }
  
  const root = document.documentElement;
  const isDark = isDarkMode();
  
  // Select appropriate variant
  const variant = isDark ? palette.dark : palette.light;
  
  // Apply all CSS variables from the selected variant (single global source for cards/theming)
  Object.entries(variant).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });
  
  currentPaletteKey = paletteKey;
  
  // Save to localStorage
  if (save) {
    try {
      localStorage.setItem(STORAGE_KEY, paletteKey);
    } catch (error) {
    }
  }
  
  // Dispatch custom event for components that need to react
  const event = new CustomEvent('colorPaletteChanged', {
    detail: {
      paletteKey,
      palette,
      variant: isDark ? 'dark' : 'light'
    }
  });
  window.dispatchEvent(event);
}

/**
 * Get the current palette key
 * @returns {string} The current palette key
 */
export function getCurrentPalette() {
  return currentPaletteKey;
}

/**
 * Get the current palette object
 * @returns {object} The current palette object
 */
export function getCurrentPaletteData() {
  return colorPalettes[currentPaletteKey] || colorPalettes[DEFAULT_PALETTE];
}

/**
 * Get the current variant (light or dark)
 * @returns {string} 'light' or 'dark'
 */
export function getCurrentVariant() {
  return isDarkMode() ? 'dark' : 'light';
}

/**
 * Reset to default palette
 */
export function resetToDefault() {
  switchTo(DEFAULT_PALETTE);
}

/**
 * Get all available palettes
 * @returns {object} All available palettes
 */
export function getAllPalettes() {
  return colorPalettes;
}

// Export default object for convenience
const colorPaletteSwitcher = {
  init,
  switchTo,
  getCurrentPalette,
  getCurrentPaletteData,
  getCurrentVariant,
  resetToDefault,
  getAllPalettes,
  isDarkMode
};

export default colorPaletteSwitcher;
