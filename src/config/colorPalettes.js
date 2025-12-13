/**
 * Color Palette System
 * Defines all available color palettes with complete CSS variable mappings
 */

export const colorPalettes = {
  ocean: {
    name: 'Ocean Blue',
    description: 'Professional blue theme',
    colors: {
      // Primary colors
      '--color-primary': '#3B82F6',
      '--color-secondary': '#60A5FA',
      
      // Semantic colors
      '--color-success': '#10B981',
      '--color-warning': '#F59E0B',
      '--color-error': '#EF4444',
      '--color-info': '#3B82F6',
      
      // Background colors
      '--bg-primary': '#EFF6FF',
      '--bg-secondary': '#DBEAFE',
      
      // Text colors
      '--text-primary': '#1E3A8A',
      '--text-secondary': '#3B82F6',
      
      // Earth tone palette (mapped to ocean theme)
      '--color-old-lace': '#EFF6FF',
      '--color-bone': '#DBEAFE',
      '--color-dark-goldenrod': '#3B82F6',
      '--color-kobicha': '#1E3A8A',
      '--color-coyote': '#60A5FA',
      '--color-earth-green': '#1E40AF',
      
      // Gradients
      '--gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #60A5FA 0%, #1E40AF 100%)',
      '--gradient-warm': 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      '--gradient-earth': 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #1E40AF 100%)',
    }
  },
  
  forest: {
    name: 'Forest Green',
    description: 'Natural green theme',
    colors: {
      '--color-primary': '#10B981',
      '--color-secondary': '#34D399',
      '--color-success': '#10B981',
      '--color-warning': '#F59E0B',
      '--color-error': '#EF4444',
      '--color-info': '#3B82F6',
      '--bg-primary': '#ECFDF5',
      '--bg-secondary': '#D1FAE5',
      '--text-primary': '#065F46',
      '--text-secondary': '#10B981',
      '--color-old-lace': '#ECFDF5',
      '--color-bone': '#D1FAE5',
      '--color-dark-goldenrod': '#10B981',
      '--color-kobicha': '#065F46',
      '--color-coyote': '#34D399',
      '--color-earth-green': '#047857',
      '--gradient-primary': 'linear-gradient(135deg, #10B981 0%, #065F46 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #34D399 0%, #047857 100%)',
      '--gradient-warm': 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      '--gradient-earth': 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #047857 100%)',
    }
  },
  
  sunset: {
    name: 'Sunset Orange',
    description: 'Warm orange theme',
    colors: {
      '--color-primary': '#F97316',
      '--color-secondary': '#FB923C',
      '--color-success': '#10B981',
      '--color-warning': '#F59E0B',
      '--color-error': '#EF4444',
      '--color-info': '#3B82F6',
      '--bg-primary': '#FFF7ED',
      '--bg-secondary': '#FFEDD5',
      '--text-primary': '#9A3412',
      '--text-secondary': '#F97316',
      '--color-old-lace': '#FFF7ED',
      '--color-bone': '#FFEDD5',
      '--color-dark-goldenrod': '#F97316',
      '--color-kobicha': '#9A3412',
      '--color-coyote': '#FB923C',
      '--color-earth-green': '#C2410C',
      '--gradient-primary': 'linear-gradient(135deg, #F97316 0%, #9A3412 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #FB923C 0%, #C2410C 100%)',
      '--gradient-warm': 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
      '--gradient-earth': 'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #C2410C 100%)',
    }
  },
  
  royal: {
    name: 'Royal Purple',
    description: 'Elegant purple theme',
    colors: {
      '--color-primary': '#8B5CF6',
      '--color-secondary': '#A78BFA',
      '--color-success': '#10B981',
      '--color-warning': '#F59E0B',
      '--color-error': '#EF4444',
      '--color-info': '#3B82F6',
      '--bg-primary': '#F5F3FF',
      '--bg-secondary': '#EDE9FE',
      '--text-primary': '#5B21B6',
      '--text-secondary': '#8B5CF6',
      '--color-old-lace': '#F5F3FF',
      '--color-bone': '#EDE9FE',
      '--color-dark-goldenrod': '#8B5CF6',
      '--color-kobicha': '#5B21B6',
      '--color-coyote': '#A78BFA',
      '--color-earth-green': '#6D28D9',
      '--gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #A78BFA 0%, #6D28D9 100%)',
      '--gradient-warm': 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
      '--gradient-earth': 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #6D28D9 100%)',
    }
  },
  
  teal: {
    name: 'Ocean Teal',
    description: 'Calming teal theme',
    colors: {
      '--color-primary': '#14B8A6',
      '--color-secondary': '#5EEAD4',
      '--color-success': '#10B981',
      '--color-warning': '#F59E0B',
      '--color-error': '#EF4444',
      '--color-info': '#3B82F6',
      '--bg-primary': '#F0FDFA',
      '--bg-secondary': '#CCFBF1',
      '--text-primary': '#134E4A',
      '--text-secondary': '#14B8A6',
      '--color-old-lace': '#F0FDFA',
      '--color-bone': '#CCFBF1',
      '--color-dark-goldenrod': '#14B8A6',
      '--color-kobicha': '#134E4A',
      '--color-coyote': '#5EEAD4',
      '--color-earth-green': '#0D9488',
      '--gradient-primary': 'linear-gradient(135deg, #14B8A6 0%, #134E4A 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #5EEAD4 0%, #0D9488 100%)',
      '--gradient-warm': 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)',
      '--gradient-earth': 'linear-gradient(135deg, #14B8A6 0%, #5EEAD4 50%, #0D9488 100%)',
    }
  },
  
  rose: {
    name: 'Rose Pink',
    description: 'Soft pink theme',
    colors: {
      '--color-primary': '#EC4899',
      '--color-secondary': '#F472B6',
      '--color-success': '#10B981',
      '--color-warning': '#F59E0B',
      '--color-error': '#EF4444',
      '--color-info': '#3B82F6',
      '--bg-primary': '#FDF2F8',
      '--bg-secondary': '#FCE7F3',
      '--text-primary': '#9F1239',
      '--text-secondary': '#EC4899',
      '--color-old-lace': '#FDF2F8',
      '--color-bone': '#FCE7F3',
      '--color-dark-goldenrod': '#EC4899',
      '--color-kobicha': '#9F1239',
      '--color-coyote': '#F472B6',
      '--color-earth-green': '#BE185D',
      '--gradient-primary': 'linear-gradient(135deg, #EC4899 0%, #9F1239 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #F472B6 0%, #BE185D 100%)',
      '--gradient-warm': 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)',
      '--gradient-earth': 'linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #BE185D 100%)',
    }
  },
  
  dark: {
    name: 'Dark Mode',
    description: 'Dark theme for low light',
    colors: {
      '--color-primary': '#60A5FA',
      '--color-secondary': '#818CF8',
      '--color-success': '#34D399',
      '--color-warning': '#FBBF24',
      '--color-error': '#F87171',
      '--color-info': '#60A5FA',
      '--bg-primary': '#1F2937',
      '--bg-secondary': '#111827',
      '--text-primary': '#F9FAFB',
      '--text-secondary': '#D1D5DB',
      '--color-old-lace': '#374151',
      '--color-bone': '#4B5563',
      '--color-dark-goldenrod': '#60A5FA',
      '--color-kobicha': '#F9FAFB',
      '--color-coyote': '#D1D5DB',
      '--color-earth-green': '#111827',
      '--gradient-primary': 'linear-gradient(135deg, #60A5FA 0%, #1E3A8A 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #818CF8 0%, #1E1B4B 100%)',
      '--gradient-warm': 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
      '--gradient-earth': 'linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #1E1B4B 100%)',
    }
  },
  
  midnight: {
    name: 'Midnight Blue',
    description: 'Deep blue night theme',
    colors: {
      '--color-primary': '#6366F1',
      '--color-secondary': '#818CF8',
      '--color-success': '#10B981',
      '--color-warning': '#F59E0B',
      '--color-error': '#EF4444',
      '--color-info': '#3B82F6',
      '--bg-primary': '#1E1B4B',
      '--bg-secondary': '#312E81',
      '--text-primary': '#E0E7FF',
      '--text-secondary': '#A5B4FC',
      '--color-old-lace': '#312E81',
      '--color-bone': '#4338CA',
      '--color-dark-goldenrod': '#6366F1',
      '--color-kobicha': '#E0E7FF',
      '--color-coyote': '#A5B4FC',
      '--color-earth-green': '#1E1B4B',
      '--gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #1E1B4B 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #818CF8 0%, #312E81 100%)',
      '--gradient-warm': 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)',
      '--gradient-earth': 'linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #1E1B4B 100%)',
    }
  },
  
  // Earth Tone (default - matches current design)
  earth: {
    name: 'Earth Tone',
    description: 'Warm earth tone theme (default)',
    colors: {
      '--color-primary': '#B4833D',
      '--color-secondary': '#81754B',
      '--color-success': '#10B981',
      '--color-warning': '#F59E0B',
      '--color-error': '#EF4444',
      '--color-info': '#3B82F6',
      '--bg-primary': '#F7F1E1',
      '--bg-secondary': '#E3D8C1',
      '--text-primary': '#66371B',
      '--text-secondary': '#81754B',
      '--color-old-lace': '#F7F1E1',
      '--color-bone': '#E3D8C1',
      '--color-dark-goldenrod': '#B4833D',
      '--color-kobicha': '#66371B',
      '--color-coyote': '#81754B',
      '--color-earth-green': '#3F3F2C',
      '--gradient-primary': 'linear-gradient(135deg, #B4833D 0%, #66371B 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #81754B 0%, #3F3F2C 100%)',
      '--gradient-warm': 'linear-gradient(135deg, #F7F1E1 0%, #E3D8C1 100%)',
      '--gradient-earth': 'linear-gradient(135deg, #B4833D 0%, #81754B 50%, #3F3F2C 100%)',
    }
  }
};

export const DEFAULT_PALETTE = 'earth';
export const STORAGE_KEY = 'colorPalette';
