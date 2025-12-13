import { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * XP thresholds for each core level
 */
export const XP_THRESHOLDS = {
  Ignition: {
    Fog: 0,
    Lens: 3750,
    Prism: 7500,
    Beam: 11250
  },
  Insight: {
    Fog: 15000,
    Lens: 20250,
    Prism: 25500,
    Beam: 30750
  },
  Transformation: {
    Fog: 36000,
    Lens: 52000,
    Prism: 68000,
    Beam: 84000
  }
};

/**
 * Difficulty ranges for each visibility group
 */
export const DEPTH_RANGES = {
  Fog: [0, 2],    // Shows difficulty 0-2
  Lens: [3, 5],    // Shows difficulty 3-5
  Prism: [6, 8],  // Shows difficulty 6-8
  Beam: [9, 10]    // Shows difficulty 9-10
};

/**
 * Determine current visibility group based on core and XP
 * @param {string} coreName - Core name ('Ignition', 'Insight', 'Transformation')
 * @param {number} xp - User's current XP
 * @returns {string} Visibility group ('Fog', 'Lens', 'Prism', 'Beam')
 */
export function getCurrentGroup(coreName, xp) {
  const thresholds = XP_THRESHOLDS[coreName];
  if (!thresholds) return 'Fog';
  
  // Check from highest to lowest threshold
  if (xp >= thresholds.Beam) return 'Beam';
  if (xp >= thresholds.Prism) return 'Prism';
  if (xp >= thresholds.Lens) return 'Lens';
  return 'Fog';
}

/**
 * Hook to get XP-based visibility information
 * @returns {Object} Visibility data and helper functions
 */
export function useXPVisibility() {
  const { profile } = useAuth();
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[useXPVisibility] Profile:', profile);
    console.log('[useXPVisibility] current_xp:', profile?.current_xp);
    console.log('[useXPVisibility] current_xp type:', typeof profile?.current_xp);
    console.log('[useXPVisibility] All profile keys:', profile ? Object.keys(profile) : 'no profile');
  }
  
  // Handle XP - check for null, undefined, or if it's actually 0
  let userXP = 0;
  if (profile) {
    if (profile.current_xp !== null && profile.current_xp !== undefined) {
      userXP = Number(profile.current_xp) || 0;
    } else {
      // If current_xp doesn't exist, try total_xp_earned as fallback
      userXP = Number(profile.total_xp_earned) || 0;
    }
  }

  const visibilityData = useMemo(() => {
    const coreGroups = {};
    
    ['Ignition', 'Insight', 'Transformation'].forEach(coreName => {
      const group = getCurrentGroup(coreName, userXP);
      const range = DEPTH_RANGES[group];
      coreGroups[coreName] = {
        group,
        maxDifficulty: range[1],
        minDifficulty: range[0],
        range
      };
    });

    return {
      userXP,
      coreGroups,
      getGroup: (coreName) => getCurrentGroup(coreName, userXP),
      getMaxDifficulty: (coreName) => {
        const group = getCurrentGroup(coreName, userXP);
        return DEPTH_RANGES[group][1];
      },
      isNodeVisible: (coreName, difficulty, xpThreshold) => {
        const group = getCurrentGroup(coreName, userXP);
        const range = DEPTH_RANGES[group];
        return difficulty >= range[0] && 
               difficulty <= range[1] && 
               userXP >= xpThreshold;
      }
    };
  }, [userXP]);

  return visibilityData;
}
