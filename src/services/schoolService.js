import { supabase } from '../lib/supabaseClient';

/**
 * School Service
 * Handles school unlock logic and school-related queries
 */
class SchoolService {
  // School unlock thresholds
  static SCHOOL_THRESHOLDS = {
    'Ignition': 0,
    'Insight': 10000,
    'Transformation': 50000,
    'God Mode': 100000
  };

  /**
   * Get all schools with unlock status for a user
   * @param {string} userId - UUID of the user
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getSchoolsWithUnlockStatus(userId) {
    try {
      // Get user's current XP
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_xp')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const userXp = profile?.current_xp || 0;

      // Get all schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('order_index', { ascending: true });

      if (schoolsError) throw schoolsError;

      // Add unlock status to each school
      const schoolsWithStatus = schools.map(school => ({
        ...school,
        isUnlocked: userXp >= (school.unlock_xp || 0),
        userXp,
        requiredXp: school.unlock_xp || 0
      }));

      return { data: schoolsWithStatus, error: null };
    } catch (error) {
      console.error('Error getting schools with unlock status:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if a specific school is unlocked for a user
   * @param {string} userId - UUID of the user
   * @param {string} schoolName - Name of the school (Ignition, Insight, etc.)
   * @returns {Promise<{data: {isUnlocked: boolean, userXp: number, requiredXp: number}, error: Error|null}>}
   */
  async checkSchoolUnlock(userId, schoolName) {
    try {
      // Get user's current XP
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_xp')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get school unlock threshold
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('unlock_xp')
        .eq('name', schoolName)
        .single();

      if (schoolError) throw schoolError;

      const userXp = profile?.current_xp || 0;
      const requiredXp = school?.unlock_xp || 0;
      const isUnlocked = userXp >= requiredXp;

      return {
        data: {
          isUnlocked,
          userXp,
          requiredXp
        },
        error: null
      };
    } catch (error) {
      console.error('Error checking school unlock:', error);
      return { data: null, error };
    }
  }

  /**
   * Get list of unlocked school names for a user
   * @param {string} userId - UUID of the user
   * @returns {Promise<{data: string[], error: Error|null}>}
   */
  async getUnlockedSchoolNames(userId) {
    try {
      const { data: schools, error } = await this.getSchoolsWithUnlockStatus(userId);
      
      if (error) throw error;

      const unlockedNames = schools
        .filter(school => school.isUnlocked)
        .map(school => school.name);

      return { data: unlockedNames, error: null };
    } catch (error) {
      console.error('Error getting unlocked school names:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all schools (without user context)
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getAllSchools() {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting all schools:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if a school is unlocked based on XP (static method)
   * @param {number} userXp - User's current XP
   * @param {string} schoolName - Name of the school
   * @returns {boolean}
   */
  static isSchoolUnlocked(userXp, schoolName) {
    const threshold = this.SCHOOL_THRESHOLDS[schoolName];
    if (threshold === undefined) return false;
    return userXp >= threshold;
  }

  /**
   * Get unlock threshold for a school (static method)
   * @param {string} schoolName - Name of the school
   * @returns {number}
   */
  static getSchoolThreshold(schoolName) {
    return this.SCHOOL_THRESHOLDS[schoolName] || 0;
  }
}

const schoolService = new SchoolService();
export default schoolService;

