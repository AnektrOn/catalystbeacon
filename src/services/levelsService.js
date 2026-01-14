import { supabase } from '../lib/supabaseClient';

/**
 * Levels Service
 * 
 * Security Note: The 'levels' table is a public reference table containing
 * level definitions (XP thresholds, titles, etc.). RLS policies should ensure:
 * - Only authenticated users can read levels
 * - No user-specific filtering needed as levels are shared reference data
 * - All users see the same level definitions
 */
class LevelsService {
  /**
   * Get all levels from the levels table
   * RLS: Requires authenticated user, no user-specific filtering needed
   */
  async getAllLevels() {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('level_number', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get level by level number
   * RLS: Requires authenticated user, no user-specific filtering needed
   */
  async getLevelByNumber(levelNumber) {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('level_number', levelNumber)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get current level and next level based on XP
   * RLS: Requires authenticated user, no user-specific filtering needed
   */
  async getCurrentAndNextLevel(currentXP) {
    try {
      const { data: levels, error } = await supabase
        .from('levels')
        .select('*')
        .order('level_number', { ascending: true });

      if (error) throw error;

      let currentLevel = null;
      let nextLevel = null;

      // Find current level (highest level where XP >= threshold)
      for (let i = levels.length - 1; i >= 0; i--) {
        if (currentXP >= levels[i].xp_threshold) {
          currentLevel = levels[i];
          break;
        }
      }

      // Find next level
      if (currentLevel) {
        const currentIndex = levels.findIndex(level => level.id === currentLevel.id);
        if (currentIndex < levels.length - 1) {
          nextLevel = levels[currentIndex + 1];
        }
      } else {
        // If no current level found, user is at level 0
        currentLevel = levels[0];
        nextLevel = levels[1];
      }

      return { 
        data: { currentLevel, nextLevel }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }
}

const levelsService = new LevelsService();
export default levelsService;
