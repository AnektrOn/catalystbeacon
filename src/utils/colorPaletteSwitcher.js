/**
 * Color Palette Switcher
 * Core logic for switching between color palettes
 */

import { colorPalettes, DEFAULT_PALETTE, STORAGE_KEY } from '../config/colorPalettes';

let currentPaletteKey = DEFAULT_PALETTE;

/**
 * Initialize the color palette system
 * Loads saved palette from localStorage or uses default
 */
export function init() {
  if (typeof window === 'undefined') return;
  
  try {
    const savedPalette = localStorage.getItem(STORAGE_KEY);
    if (savedPalette && colorPalettes[savedPalette]) {
      switchTo(savedPalette, false); // Don't save to localStorage since we just loaded it
    } else {
      switchTo(DEFAULT_PALETTE, false);
    }
  } catch (error) {
    console.error('Error initializing color palette:', error);
    switchTo(DEFAULT_PALETTE, false);
  }
}

/**
 * Switch to a specific color palette
 * @param {string} paletteKey - The key of the palette to switch to
 * @param {boolean} save - Whether to save to localStorage (default: true)
 */
export function switchTo(paletteKey, save = true) {
  if (typeof window === 'undefined') return;
  
  const palette = colorPalettes[paletteKey];
  if (!palette) {
    console.warn(`Palette "${paletteKey}" not found. Using default.`);
    switchTo(DEFAULT_PALETTE, save);
    return;
  }
  
  const root = document.documentElement;
  const colors = palette.colors;
  
  // Apply all CSS variables
  Object.entries(colors).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });
  
  currentPaletteKey = paletteKey;
  
  // Save to localStorage
  if (save) {
    try {
      localStorage.setItem(STORAGE_KEY, paletteKey);
    } catch (error) {
      console.error('Error saving color palette to localStorage:', error);
    }
  }
  
  // Dispatch custom event for components that need to react
  const event = new CustomEvent('colorPaletteChanged', {
    detail: {
      paletteKey,
      palette
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
  resetToDefault,
  getAllPalettes
};

export default colorPaletteSwitcher;
