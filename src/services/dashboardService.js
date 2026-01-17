import { supabase } from '../lib/supabaseClient';
import { logDebug, logError } from '../utils/logger';

class DashboardService {
  /**
   * Get consolidated dashboard data via RPC
   * @param {string} userId - UUID of the user
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getDashboardData(userId) {
    try {
      logDebug('🚀 DashboardService: Fetching consolidated data for:', userId);
      
      const { data, error } = await supabase.rpc('get_dashboard_data_v3', {
        p_user_id: userId
      });

      if (error) {
        logError(error, 'DashboardService - RPC failed');
        return { data: null, error };
      }

      if (data?.error) {
        logError(new Error(data.error), 'DashboardService - RPC returned logic error');
        return { data: null, error: new Error(data.error) };
      }

      return { data, error: null };
    } catch (error) {
      logError(error, 'DashboardService - Exception');
      return { data: null, error };
    }
  }

  /**
   * Apply XP penalty to user profile
   * @param {string} userId - UUID of the user
   * @param {number} amount - Amount of XP to subtract
   * @param {string} reason - Reason for penalty
   */
  async applyXPPenalty(userId, amount, reason) {
    try {
      logDebug(`📉 DashboardService: Applying penalty of -${amount} XP to:`, userId);
      
      // Get current XP
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_xp')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      const currentXP = profile.current_xp || 0;
      const newXP = Math.max(0, currentXP - amount);
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_xp: newXP })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // Log the penalty
      await supabase
        .from('xp_logs')
        .insert({
          user_id: userId,
          xp_earned: -amount,
          reason: reason || 'Penalty'
        });
        
      return { success: true, newXP };
    } catch (error) {
      logError(error, 'DashboardService - applyXPPenalty failed');
      return { success: false, error };
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
