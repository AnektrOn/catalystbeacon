import { supabase } from '../lib/supabaseClient';
import { logDebug, logError } from '../utils/logger';

const DASHBOARD_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let dashboardCache = { data: null, timestamp: 0, ttl: DASHBOARD_CACHE_TTL_MS };

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
   * Get paginated teacher feed (for "load more" / infinite scroll)
   * @param {number} pageNumber - 1-based page
   * @param {number} pageSize - items per page (max 50)
   * @returns {Promise<{data: { feed: Array, page: number, page_size: number }|null, error: Error|null}>}
   */
  async getFeedPaginated(pageNumber = 1, pageSize = 10) {
    try {
      const { data, error } = await supabase.rpc('get_feed_paginated', {
        p_page_number: pageNumber,
        p_page_size: Math.min(Math.max(1, pageSize), 50)
      });

      if (error) {
        logError(error, 'DashboardService - get_feed_paginated failed');
        return { data: null, error };
      }
      return { data, error: null };
    } catch (error) {
      logError(error, 'DashboardService - getFeedPaginated Exception');
      return { data: null, error };
    }
  }

  /**
   * Get dashboard data with in-memory cache to avoid repeated RPC calls.
   * @param {string} userId - UUID of the user
   * @param {number} [ttlMs] - Cache TTL in ms (default 5 min)
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getDashboardDataCached(userId, ttlMs = DASHBOARD_CACHE_TTL_MS) {
    if (dashboardCache.data && dashboardCache.userId === userId && (Date.now() - dashboardCache.timestamp < ttlMs)) {
      logDebug('DashboardService: returning cached data');
      return { data: dashboardCache.data, error: null };
    }
    const { data, error } = await this.getDashboardData(userId);
    if (!error && data) {
      dashboardCache = { data, userId, timestamp: Date.now(), ttl: ttlMs };
    }
    return { data, error };
  }

  /**
   * Map RPC dashboard payload to page state shape (levelData + dashboardData).
   * Single source of truth for mapping so pages stay thin.
   * @param {Object} data - Raw RPC response from get_dashboard_data_v3
   * @param {Object} profile - User profile (for current_xp)
   * @returns {{ levelData: Object, dashboardData: Object }}
   */
  mapDashboardRpcToState(data, profile = {}) {
    const currentXP = profile.current_xp ?? 0;
    const nextThreshold = data?.level_info?.nextLevel?.xp_threshold ?? 1000;
    const levelData = {
      level: data?.level_info?.currentLevel?.level_number ?? 1,
      levelTitle: data?.level_info?.currentLevel?.title ?? 'Level 1',
      currentXP,
      nextLevelXP: nextThreshold,
      xpToNext: Math.max(0, nextThreshold - currentXP)
    };
    const dashboardData = {
      ritual: data?.ritual_info ?? { completed: false, streak: 0, xpReward: 50 },
      constellation: data?.constellation_info ?? {
        currentSchool: 'Ignition',
        currentConstellation: { name: '', nodes: [] }
      },
      stats: {
        learningTime: data?.stats_info?.learningTime ?? 0,
        lessonsCompleted: data?.stats_info?.lessonsCompleted ?? 0,
        averageScore: data?.stats_info?.averageScore ?? 0
      },
      achievements: { total: data?.stats_info?.achievementsUnlocked ?? 0 }
    };
    return { levelData, dashboardData };
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
