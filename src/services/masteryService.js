import { supabase } from '../lib/supabaseClient';
import skillsService from './skillsService';
import { logDebug, logError, logWarn } from '../utils/logger';

class MasteryService {
  // ===== HABITS LIBRARY =====

  /**
   * Get all habits from the library
   */
  async getHabitsLibrary() {
    try {
      const { data, error } = await supabase
        .from('habits_library')
        .select('*')
        .eq('is_global', true)
        .order('title');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error fetching habits library');
      return { data: null, error };
    }
  }

  /**
   * Get user's personal habits (with pagination support)
   */
  async getUserHabits(userId, page = 1, limit = 50) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('user_habits')
        .select(`
          *,
          habits_library (
            title,
            description,
            category,
            skill_tags,
            xp_reward
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        data,
        error: null,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logError(error, 'masteryService - Error fetching user habits');
      return { data: null, error };
    }
  }

  /**
   * Add a habit from library to user's habits
   */
  async addHabitFromLibrary(userId, habitId) {
    try {
      // First get the habit from library
      const { data: libraryHabit, error: libraryError } = await supabase
        .from('habits_library')
        .select('*')
        .eq('id', habitId)
        .single();

      if (libraryError) throw libraryError;

      // Create user habit
      const { data, error } = await supabase
        .from('user_habits')
        .insert({
          user_id: userId,
          habit_id: habitId,
          title: libraryHabit.title,
          description: libraryHabit.description,
          frequency_type: libraryHabit.frequency_type,
          xp_reward: libraryHabit.xp_reward,
          skill_tags: libraryHabit.skill_tags,
          is_custom: false,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error adding habit from library');
      return { data: null, error };
    }
  }

  /**
   * Create a custom habit
   */
  async createCustomHabit(userId, habitData) {
    try {
      const { data, error } = await supabase
        .from('user_habits')
        .insert({
          user_id: userId,
          title: habitData.title,
          description: habitData.description,
          frequency_type: habitData.frequency_type || 'daily',
          xp_reward: habitData.xp_reward || 10,
          skill_tags: habitData.skill_tags || [],
          is_custom: true,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error creating custom habit');
      return { data: null, error };
    }
  }

  /**
   * Delete a user habit and all related data (completions will be deleted via CASCADE)
   */
  async deleteUserHabit(habitId) {
    try {
      // Delete the habit - CASCADE will automatically delete related completions
      const { error } = await supabase
        .from('user_habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;
      return { data: { deleted: true }, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error deleting user habit');
      return { data: null, error };
    }
  }

  /**
   * Complete a habit for a specific date
   */
  async completeHabit(userId, habitId, date = null) {
    try {
      const completionDate = date || new Date().toISOString().split('T')[0];

      // Check if already completed today
      const { data: existingCompletion, error: checkError } = await supabase
        .from('user_habit_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .gte('completed_at', `${completionDate}T00:00:00`)
        .lt('completed_at', `${completionDate}T23:59:59`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCompletion) {
        return { data: { alreadyCompleted: true }, error: null };
      }

      // Get habit details for XP reward and skill_tags
      const { data: habit, error: habitError } = await supabase
        .from('user_habits')
        .select(`
          xp_reward,
          habit_id,
          habits_library (
            skill_tags
          )
        `)
        .eq('id', habitId)
        .single();

      if (habitError) throw habitError;

      // Create completion record
      const { data, error } = await supabase
        .from('user_habit_completions')
        .insert({
          user_id: userId,
          habit_id: habitId,
          completed_at: `${completionDate}T09:00:00`,
          xp_earned: habit.xp_reward
        })
        .select()
        .single();

      if (error) throw error;

      // Update habit completion count
      await this.updateHabitCompletionCount(habitId);

      // Award XP to user
      await this.awardXP(userId, habit.xp_reward, 'habit_completion', `Completed habit: ${habitId}`);

      // Award skill points (0.1 per skill)
      const skillTags = habit.habits_library?.skill_tags || [];
      if (skillTags.length > 0) {
        logDebug(`🎯 Awarding 0.1 skill points to ${skillTags.length} skills`);
        await skillsService.awardSkillPoints(userId, skillTags, 0.1);
      }

      // Update profile completion statistics
      const statsResult = await this.updateProfileCompletionStats(userId, completionDate);
      if (statsResult.error) {
        logError(statsResult.error, 'masteryService - Failed to update profile completion stats');
        // Don't fail the whole operation, but log the error
      } else {
        logDebug('✅ Profile completion stats updated:', statsResult.data);
      }

      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error completing habit');
      return { data: null, error };
    }
  }

  /**
   * Remove a habit completion
   */
  async removeHabitCompletion(userId, habitId, date = null) {
    try {
      const completionDate = date || new Date().toISOString().split('T')[0];

      // Find and delete the completion
      const { data, error } = await supabase
        .from('user_habit_completions')
        .delete()
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .gte('completed_at', `${completionDate}T00:00:00`)
        .lt('completed_at', `${completionDate}T23:59:59`)
        .select()
        .single();

      if (error) throw error;

      // Update habit completion count
      await this.updateHabitCompletionCount(habitId);

      // Update profile completion statistics (recalculate after removal)
      await this.updateProfileCompletionStats(userId, completionDate);

      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error removing habit completion');
      return { data: null, error };
    }
  }

  /**
   * Get habit completions for a date range
   */
  async getHabitCompletions(userId, habitId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('user_habit_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .gte('completed_at', `${startDate}T00:00:00`)
        .lte('completed_at', `${endDate}T23:59:59`)
        .order('completed_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error fetching habit completions');
      return { data: null, error };
    }
  }

  /**
   * Calculate current streak for a habit (optimized)
   */
  async calculateHabitStreak(userId, habitId) {
    try {
      // Get completions for the last 30 days only (more efficient)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: completions, error } = await supabase
        .from('user_habit_completions')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: false });

      if (error) throw error;

      if (!completions || completions.length === 0) {
        return { data: 0, error: null };
      }

      // Convert to date strings and sort
      const completionDates = completions.map(c => c.completed_at.split('T')[0]).sort();

      // Calculate streak
      let streak = 0;
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // Check if completed today or yesterday
      let checkDate = new Date(today);
      if (!completionDates.includes(todayString)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const checkDateString = checkDate.toISOString().split('T')[0];
        if (completionDates.includes(checkDateString)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return { data: streak, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error calculating habit streak');
      return { data: 0, error };
    }
  }

  /**
   * Update habit completion count
   */
  async updateHabitCompletionCount(habitId) {
    try {
      const { data, error } = await supabase
        .from('user_habit_completions')
        .select('id, completed_at')
        .eq('habit_id', habitId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const completionCount = data?.length || 0;
      const lastCompleted = data?.[0]?.completed_at || null;

      const { error: updateError } = await supabase
        .from('user_habits')
        .update({
          completion_count: completionCount,
          last_completed_at: lastCompleted
        })
        .eq('id', habitId);

      if (updateError) throw updateError;
      return { data: { completionCount, lastCompleted }, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error updating habit completion count');
      return { data: null, error };
    }
  }

  /**
   * Award XP to user
   */
  async awardXP(userId, amount, source, description) {
    try {
      // Get current user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_xp, total_xp_earned')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_xp: profile.current_xp + amount,
          total_xp_earned: profile.total_xp_earned + amount
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Record XP transaction
      const { data, error } = await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          source: source,
          description: description
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error awarding XP');
      return { data: null, error };
    }
  }

  /**
   * Update profile completion statistics (streak, counts, etc.)
   */
  async updateProfileCompletionStats(userId, completionDate = null) {
    try {
      // Always use actual current date for streak calculation, not the completion date
      const actualToday = new Date();
      actualToday.setHours(0, 0, 0, 0);
      const today = actualToday.toISOString().split('T')[0];
      const todayDate = new Date(today);
      
      // Calculate date ranges
      const startOfWeek = new Date(todayDate);
      startOfWeek.setDate(todayDate.getDate() - todayDate.getDay());
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
      
      const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
      
      // Get completion counts from user_habit_completions
      const { data: allCompletions, error: completionsError } = await supabase
        .from('user_habit_completions')
        .select('completed_at')
        .eq('user_id', userId);

      if (completionsError) throw completionsError;

      // Calculate counts
      const totalCompletions = allCompletions?.length || 0;
      const todayCompletions = allCompletions?.filter(c => 
        c.completed_at.split('T')[0] === today
      ).length || 0;
      
      const weekCompletions = allCompletions?.filter(c => {
        const completionDate = c.completed_at.split('T')[0];
        return completionDate >= startOfWeekStr && completionDate <= today;
      }).length || 0;
      
      const monthCompletions = allCompletions?.filter(c => {
        const completionDate = c.completed_at.split('T')[0];
        return completionDate >= startOfMonthStr && completionDate <= today;
      }).length || 0;

      // Calculate completion streak
      const completionDates = [...new Set(
        (allCompletions || []).map(c => {
          const dateStr = c.completed_at.split('T')[0];
          return dateStr;
        })
      )].sort().reverse(); // Sort descending (most recent first)

      logDebug(`📊 All completion dates (${completionDates.length} unique days):`, completionDates.slice(0, 10));

      let streak = 0;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      let checkDate = new Date(now);
      
      // Start checking from today, or yesterday if not completed today
      const todayStr = now.toISOString().split('T')[0];
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStrFormatted = yesterdayDate.toISOString().split('T')[0];
      
      logDebug(`📊 Checking streak from today (${todayStr}) or yesterday (${yesterdayStrFormatted})`);
      
      // If not completed today, start from yesterday
      if (!completionDates.includes(todayStr)) {
        checkDate = new Date(yesterdayDate);
        logDebug(`📊 Not completed today, starting from yesterday`);
      }

      // Count consecutive days with completions (going backwards)
      let daysChecked = 0;
      while (daysChecked < 365) { // Safety limit
        const checkDateStr = checkDate.toISOString().split('T')[0];
        if (completionDates.includes(checkDateStr)) {
          streak++;
          logDebug(`📊 Day ${streak}: ${checkDateStr} ✓`);
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          logDebug(`📊 Streak broken at: ${checkDateStr} (no completion)`);
          break;
        }
        daysChecked++;
      }

      logDebug(`📊 Final streak calculation: ${streak} days`);

      // Get current profile to preserve longest_streak
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('longest_streak')
        .eq('id', userId)
        .single();

      const longestStreak = Math.max(
        streak,
        currentProfile?.longest_streak || 0
      );

      // Update profile with all statistics
      logDebug(`📊 Updating profile stats for user ${userId}:`, {
        streak,
        longestStreak,
        todayCompletions,
        weekCompletions,
        monthCompletions,
        totalCompletions
      });

      // Build update object - only include fields that exist
      const updateData = {
        last_activity_date: new Date().toISOString()
      };

      // Try to update completion_streak (may not exist in older schemas)
      try {
        updateData.completion_streak = streak;
        updateData.longest_streak = longestStreak;
        updateData.habits_completed_today = todayCompletions;
        updateData.habits_completed_week = weekCompletions;
        updateData.habits_completed_month = monthCompletions;
        updateData.habits_completed_total = totalCompletions;
      } catch (e) {
        logWarn('⚠️ Some completion stat columns may not exist:', e);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        logError(updateError, 'masteryService - Error updating profile completion stats');
        logDebug('Update error details:', updateError.message, updateError.code, updateError.details);
        
        // If columns don't exist, provide helpful error message
        if (updateError.message && (updateError.message.includes('does not exist') || updateError.code === 'PGRST204')) {
          logWarn('============================================');
          logWarn('MISSING DATABASE COLUMNS!');
          logWarn('The profiles table is missing required columns.');
          logWarn('');
          logWarn('SOLUTION: Run this SQL in Supabase SQL Editor:');
          logWarn('File: ADD_PROFILE_COMPLETION_STATS.sql');
          logWarn('');
          logWarn('This will add: completion_streak, longest_streak,');
          logWarn('habits_completed_today/week/month/total, last_activity_date');
          logWarn('============================================');
        }
        
        // Don't throw - this is a non-critical update
        return { data: null, error: updateError };
      }

      logDebug('✅ Profile completion stats updated successfully');
      return { data: { streak, totalCompletions }, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error updating profile completion stats');
      // Don't throw - this is a non-critical update
      return { data: null, error };
    }
  }

  /**
   * Get calendar events for a date range
   */
  async getCalendarEvents(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('user_calendar_events')
        .select(`
          *,
          user_habits (
            title,
            description,
            xp_reward
          ),
          toolbox_library (
            title,
            description,
            xp_reward
          )
        `)
        .eq('user_id', userId)
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error fetching calendar events');
      return { data: null, error };
    }
  }


  // ===== TOOLBOX =====

  /**
   * Get toolbox library
   */
  async getToolboxLibrary() {
    try {
      const { data, error } = await supabase
        .from('toolbox_library')
        .select('*')
        .eq('is_global', true)
        .order('title');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error fetching toolbox library');
      return { data: null, error };
    }
  }

  /**
   * Get user's toolbox items (with pagination support)
   */
  async getUserToolboxItems(userId, page = 1, limit = 50) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('user_toolbox_items')
        .select(`
          *,
          toolbox_library (
            title,
            description,
            category,
            skill_tags,
            xp_reward,
            can_convert_to_habit
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        data,
        error: null,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logError(error, 'masteryService - Error fetching user toolbox items');
      return { data: null, error };
    }
  }

  /**
   * Add toolbox item to user's toolbox
   */
  async addToolboxItem(userId, toolboxId) {
    try {
      // First check if the item already exists
      const { data: existingItem, error: checkError } = await supabase
        .from('user_toolbox_items')
        .select('*')
        .eq('user_id', userId)
        .eq('toolbox_id', toolboxId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if item doesn't exist
        throw checkError;
      }

      if (existingItem) {
        // Item already exists, return it
        return { data: existingItem, error: null };
      }

      // Item doesn't exist, create it
      const { data, error } = await supabase
        .from('user_toolbox_items')
        .insert({
          user_id: userId,
          toolbox_id: toolboxId,
          is_active: true,
          show_on_calendar: true // Default to showing on calendar
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error adding toolbox item');
      return { data: null, error };
    }
  }

  /**
   * Update user toolbox item
   */
  async updateUserToolboxItem(itemId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_toolbox_items')
        .update(updates)
        .eq('id', itemId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(`No toolbox item found with id: ${itemId}`);
      }

      return { data: data[0], error: null };
    } catch (error) {
      logError(error, 'masteryService - Error updating user toolbox item');
      return { data: null, error };
    }
  }

  /**
   * Remove a toolbox item from user's toolbox (usage data will be deleted via CASCADE)
   */
  async removeUserToolboxItem(itemId) {
    try {
      // Delete the toolbox item - CASCADE will automatically delete related usage data
      const { error } = await supabase
        .from('user_toolbox_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return { data: { deleted: true }, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error removing user toolbox item');
      return { data: null, error };
    }
  }

  /**
   * Get toolbox usage data for a user
   */
  async getToolboxUsage(userId, toolboxItemId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('user_toolbox_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('toolbox_item_id', toolboxItemId)
        .gte('used_at', `${startDate}T00:00:00`)
        .lte('used_at', `${endDate}T23:59:59`)
        .order('used_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error fetching toolbox usage');
      return { data: null, error };
    }
  }

  /**
   * Use a toolbox item
   */
  async useToolboxItem(userId, toolboxItemId) {
    try {
      // Get toolbox item details
      const { data: toolboxItem, error: itemError } = await supabase
        .from('user_toolbox_items')
        .select(`
          *,
          toolbox_library (
            title,
            xp_reward,
            skill_tags
          )
        `)
        .eq('id', toolboxItemId)
        .single();

      if (itemError) throw itemError;

      // Record usage
      const { data, error } = await supabase
        .from('user_toolbox_usage')
        .insert({
          user_id: userId,
          toolbox_item_id: toolboxItemId,
          used_at: new Date().toISOString(),
          xp_earned: toolboxItem.toolbox_library.xp_reward
        })
        .select()
        .single();

      if (error) throw error;

      // Award XP
      await this.awardXP(userId, toolboxItem.toolbox_library.xp_reward, 'toolbox_usage', `Used toolbox item: ${toolboxItem.toolbox_library.title}`);

      // Award skill points (0.15 per skill)
      const skillTags = toolboxItem.toolbox_library?.skill_tags || [];
      if (skillTags.length > 0) {
        logDebug(`🎯 Awarding 0.15 skill points to ${skillTags.length} skills`);
        await skillsService.awardSkillPoints(userId, skillTags, 0.15);
      }

      return { data, error: null };
    } catch (error) {
      logError(error, 'masteryService - Error using toolbox item');
      return { data: null, error };
    }
  }

  // ===== CALENDAR =====

  /**
   * Test database connection and basic operations
   */
  async testConnection() {
    try {
      logDebug('🧪 Testing MasteryService connection...');

      // Test 1: Get habits library
      logDebug('📚 Testing habits library fetch...');
      const { data: habitsLibrary, error: habitsError } = await this.getHabitsLibrary();
      if (habitsError) throw habitsError;
      logDebug(`✅ Found ${habitsLibrary.length} habits in library`);

      // Test 2: Get toolbox library
      logDebug('🔧 Testing toolbox library fetch...');
      const { data: toolboxLibrary, error: toolboxError } = await this.getToolboxLibrary();
      if (toolboxError) throw toolboxError;
      logDebug(`✅ Found ${toolboxLibrary.length} toolbox items in library`);

      // Test 3: Get current user (if authenticated)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        logDebug(`👤 Testing with user: ${user.email}`);

        // Test 4: Get user habits
        logDebug('🎯 Testing user habits fetch...');
        const { data: userHabits, error: userHabitsError } = await this.getUserHabits(user.id);
        if (userHabitsError) throw userHabitsError;
        logDebug(`✅ Found ${userHabits.length} user habits`);

        // Test 5: Get user toolbox items
        logDebug('🛠️ Testing user toolbox items fetch...');
        const { data: userToolbox, error: userToolboxError } = await this.getUserToolboxItems(user.id);
        if (userToolboxError) throw userToolboxError;
        logDebug(`✅ Found ${userToolbox.length} user toolbox items`);

        // Test 6: Get calendar events for current month
        logDebug('📅 Testing calendar events fetch...');
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

        const { data: calendarEvents, error: calendarError } = await this.getCalendarEvents(
          user.id,
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        );
        if (calendarError) throw calendarError;
        logDebug(`✅ Found ${calendarEvents.length} calendar events for current month`);
      } else {
        logDebug('⚠️ No authenticated user found - skipping user-specific tests');
      }
    } catch (error) {
      logError(error, 'masteryService - Connection test failed');
    }
  }
}

const masteryService = new MasteryService();
export default masteryService;
