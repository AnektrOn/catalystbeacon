import { supabase } from '../lib/supabaseClient';

/**
 * Per-school config for roadmap UI: display name, URL slug, colors, optional overrides.
 * Used by SchoolRoadmap to dynamically render nodes, colors, and content.
 */
export const ROADMAP_SCHOOL_CONFIG = {
  Ignition: {
    displayName: 'Ignition',
    slug: 'ignition',
    primaryColor: 'hsl(var(--primary))',
    accentColor: 'hsl(var(--primary) / 0.8)',
  },
  Insight: {
    displayName: 'Insight',
    slug: 'insight',
    primaryColor: 'hsl(var(--primary))',
    accentColor: 'hsl(var(--primary) / 0.8)',
  },
  Transformation: {
    displayName: 'Transformation',
    slug: 'transformation',
    primaryColor: 'hsl(var(--primary))',
    accentColor: 'hsl(var(--primary) / 0.8)',
  },
  'Stellar Ops': {
    displayName: 'Stellar Ops',
    slug: 'stellar-ops',
    primaryColor: 'hsl(var(--primary))',
    accentColor: 'hsl(var(--primary) / 0.8)',
  },
  'Neural RPG': {
    displayName: 'Neural RPG',
    slug: 'neural-rpg',
    primaryColor: 'hsl(var(--primary))',
    accentColor: 'hsl(var(--primary) / 0.8)',
  },
};

/**
 * Normalize URL slug to masterschool name (for useParams).
 * @param {string} slug - e.g. 'ignition', 'stellar-ops'
 * @returns {string} e.g. 'Ignition', 'Stellar Ops'
 */
export function normalizeMasterschoolSlug(slug) {
  if (!slug || typeof slug !== 'string') return 'Ignition';
  const lower = slug.trim().toLowerCase().replace(/-/g, ' ');
  const bySlug = Object.fromEntries(
    Object.entries(ROADMAP_SCHOOL_CONFIG).map(([name, c]) => [c.slug, name])
  );
  return bySlug[slug.trim().toLowerCase()] || lower.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get config object for a masterschool (nodes, colors, display name).
 * @param {string} masterschool - 'Ignition' | 'Insight' | 'Transformation' | 'Stellar Ops' | 'Neural RPG'
 * @returns {Object} ROADMAP_SCHOOL_CONFIG entry or Ignition fallback
 */
export function getSchoolConfig(masterschool) {
  const key = masterschool && ROADMAP_SCHOOL_CONFIG[masterschool] ? masterschool : 'Ignition';
  return ROADMAP_SCHOOL_CONFIG[key] || ROADMAP_SCHOOL_CONFIG.Ignition;
}

/**
 * RoadmapService - Handles all roadmap-related operations
 * Manages lesson progression, tracking, and rewards for Ignition, Insight, and Transformation masterschools
 */
class RoadmapService {
  /**
   * Fetch all lessons for a masterschool, sorted by difficulty and stat link
   * @param {string} masterschool - 'Ignition', 'Insight', or 'Transformation'
   * @param {string} userId - User UUID to fetch personalized data
   * @returns {Promise<Array>} Sorted array of lessons
   */
 /**
   * Generate roadmap lessons based on user's institute priority order.
   * Order: Institute Priority → Lesson Number → Chapter → Course
   * Returns next 10 nodes dynamically (starting from first incomplete lesson).
   * @param {string} masterschool - 'Ignition', 'Insight', or 'Transformation'
   * @param {string} userId - User UUID
   * @param {number} limit - Number of nodes to return (default 10)
   * @returns {Promise<Array>} Array of roadmap lessons
   */
 async getRoadmapLessons(masterschool, userId, limit = 10) {
  try {
    if (!userId) {
      console.warn('getRoadmapLessons: No userId provided');
      return [];
    }

    // Check if user has institute_priority set
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('institute_priority')
      .eq('id', userId)
      .maybeSingle();

    if (!profile?.institute_priority || profile.institute_priority.length === 0) {
      // User hasn't set institute priority yet - return empty to trigger modal
      console.warn('getRoadmapLessons: User has no institute_priority set');
      return [];
    }

    // Use get_roadmap_batch: returns the stored 10 for this user; is_completed from user_lesson_progress. Stable until all 10 done.
    const { data, error } = await supabase
      .rpc('get_roadmap_batch', {
        p_user_id: userId,
        p_masterschool: masterschool
      });

    if (error) {
      console.error('get_roadmap_batch RPC error:', error);
      // Fallback to generate_roadmap_nodes if batch RPC missing
      const { data: fallbackData, error: fallbackError } = await supabase
        .rpc('generate_roadmap_nodes', {
          p_user_id: userId,
          p_masterschool: masterschool,
          p_limit: limit
        });
      if (!fallbackError && fallbackData?.length) {
        const limited = fallbackData.slice(0, limit).map(lesson => ({
          ...lesson,
          masterschool,
          lesson_xp_reward: (lesson.difficulty_numeric || 5) * 10
        }));
        return limited;
      }
      const fallbackLessons = await this._getRoadmapLessonsFallback(masterschool, userId);
      return fallbackLessons.slice(0, limit).map(lesson => ({
        ...lesson,
        masterschool,
        lesson_xp_reward: (lesson.difficulty_numeric || 5) * 10
      }));
    }

    const lessons = data || [];
    console.log(`[RoadmapService] RPC returned ${lessons.length} lessons, requested ${limit}`);

    // Format lessons with masterschool and XP reward
    // Ensure we don't return more than the requested limit
    const limitedLessons = lessons.slice(0, limit);
    if (lessons.length > limit) {
      console.warn(`[RoadmapService] RPC returned ${lessons.length} lessons but limit is ${limit}, truncating`);
    }
    return limitedLessons.map(lesson => ({
      ...lesson,
      masterschool: masterschool,
      lesson_xp_reward: (lesson.difficulty_numeric || 5) * 10
    }));

  } catch (error) {
    console.error(`Failed to fetch roadmap lessons: ${error.message}`);
    // Fallback to old method on exception, but limit results
    const fallbackLessons = await this._getRoadmapLessonsFallback(masterschool, userId);
    console.log(`[RoadmapService] Exception fallback returned ${fallbackLessons.length} lessons, limiting to ${limit}`);
    return fallbackLessons.slice(0, limit).map(lesson => ({
      ...lesson,
      masterschool: masterschool,
      lesson_xp_reward: (lesson.difficulty_numeric || 5) * 10
    }));
  }
}

  /**
   * Fallback: construit la liste roadmap sans RPC (course_metadata + course_content + user_lesson_progress).
   * Utilisé si le RPC est absent, en erreur, ou renvoie vide. is_completed = user_lesson_progress (source canonique).
   */
  async _getRoadmapLessonsFallback(masterschool, userId) {
    try {
      const { data: structures } = await supabase.from('course_structure').select('course_id');
      const courseIds = [...new Set((structures || []).map(s => s.course_id).filter(id => id != null && Number.isInteger(id) && id > 0))];
      if (courseIds.length === 0) return [];

      const { data: metadataRows } = await supabase
        .from('course_metadata')
        .select('course_id, difficulty_numeric, xp_threshold')
        .eq('masterschool', masterschool)
        .eq('status', 'published')
        .in('course_id', courseIds)
        .order('xp_threshold', { ascending: true })
        .order('course_id', { ascending: true });
      if (!metadataRows?.length) return [];

      const metaByCourse = Object.fromEntries(metadataRows.map(m => [m.course_id, m]));

      const { data: contentRows } = await supabase
        .from('course_content')
        .select('course_id, chapter_number, lesson_number, lesson_title')
        .in('course_id', courseIds)
        .order('course_id')
        .order('chapter_number')
        .order('lesson_number');
      if (!contentRows?.length) return [];

      let completedSet = new Set();
      if (userId) {
        const { data: progressRows } = await supabase
          .from('user_lesson_progress')
          .select('course_id, chapter_number, lesson_number, is_completed')
          .eq('user_id', userId)
          .eq('is_completed', true);
        (progressRows || []).forEach(p => {
          completedSet.add(`${p.course_id}-${p.chapter_number}-${p.lesson_number}`);
        });
      }

      const orderedContent = contentRows.filter(cc => metaByCourse[cc.course_id]);
      orderedContent.sort((a, b) => {
        const ma = metaByCourse[a.course_id];
        const mb = metaByCourse[b.course_id];
        if ((ma?.xp_threshold ?? 0) !== (mb?.xp_threshold ?? 0)) return (ma?.xp_threshold ?? 0) - (mb?.xp_threshold ?? 0);
        if (a.course_id !== b.course_id) return a.course_id - b.course_id;
        if (a.chapter_number !== b.chapter_number) return a.chapter_number - b.chapter_number;
        return a.lesson_number - b.lesson_number;
      });

      // Find first incomplete lesson and return only next lessons from there
      let startIndex = 0;
      for (let i = 0; i < orderedContent.length; i++) {
        const cc = orderedContent[i];
        const key = `${cc.course_id}-${cc.chapter_number}-${cc.lesson_number}`;
        if (!completedSet.has(key)) {
          startIndex = i;
          break;
        }
      }

      // Return lessons starting from first incomplete (fallback doesn't limit, caller will slice)
      return orderedContent.slice(startIndex).map(cc => {
        const meta = metaByCourse[cc.course_id] || {};
        const key = `${cc.course_id}-${cc.chapter_number}-${cc.lesson_number}`;
        return {
          lesson_id: key,
          course_id: cc.course_id,
          chapter_number: cc.chapter_number,
          lesson_number: cc.lesson_number,
          lesson_title: cc.lesson_title || 'Lesson',
          difficulty_numeric: meta.difficulty_numeric ?? 5,
          is_completed: completedSet.has(key)
        };
      });
    } catch (err) {
      console.warn('Fallback roadmap failed:', err);
      return [];
    }
  }

  /**
   * Get lessons grouped by master skill for pagination (no duplicates)
   * @param {string} masterschool - 'Ignition', 'Insight', or 'Transformation'
   * @returns {Promise<Object>} Object with master skills as keys and lesson arrays as values
   */
  async getRoadmapByStatLink(masterschool) {
    try {
      // This method now needs to be re-evaluated as getRoadmapLessons will return filtered results.
      // For now, it will use the filtered list, but this might need adjustment depending on UI.
      const lessons = await this.getRoadmapLessons(masterschool, null); // userId is null here, so priority won't apply

      // Group lessons by master_skill_linked (singular, no duplicates)
      const grouped = {};

      lessons.forEach(lesson => {
        const masterSkill = lesson.master_skill_linked || 'General';

        if (!grouped[masterSkill]) {
          grouped[masterSkill] = [];
        }

        grouped[masterSkill].push(lesson);
      });

      // Limit each master skill group to 10 lessons per page
      const paginated = {};
      Object.keys(grouped).forEach(masterSkill => {
        const skillLessons = grouped[masterSkill];
        paginated[masterSkill] = {
          total: skillLessons.length,
          pages: Math.ceil(skillLessons.length / 10),
          lessons: skillLessons
        };
      });


      return paginated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's current progress in a masterschool roadmap
   * @param {string} userId - User UUID
   * @param {string} masterschool - 'Ignition', 'Insight', or 'Transformation'
   * @returns {Promise<Object>} User's roadmap progress
   */
  async getUserRoadmapProgress(userId, masterschool) {
    try {
      const { data, error } = await supabase
        .from('roadmap_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('masterschool', masterschool)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        // Table might not exist yet - return empty progress
        return {
          user_id: userId,
          masterschool,
          current_lesson_id: null,
          lessons_completed: [],
          total_lessons_completed: 0,
          last_accessed_at: null
        };
      }

      // If no progress exists, return empty progress
      if (!data) {
        return {
          user_id: userId,
          masterschool,
          current_lesson_id: null,
          lessons_completed: [],
          total_lessons_completed: 0,
          last_accessed_at: null
        };
      }

      return data;
    } catch (error) {
      // If table doesn't exist, just return empty progress
      return {
        user_id: userId,
        masterschool,
        current_lesson_id: null,
        lessons_completed: [],
        total_lessons_completed: 0,
        last_accessed_at: null
      };
    }
  }

  /**
   * Check if a lesson is unlocked for a user
   * @param {string} userId - User UUID
   * @param {string} masterschool - Masterschool name
   * @param {string} lessonId - Lesson ID to check
   * @returns {Promise<boolean>} True if lesson is unlocked
   */
  async isLessonUnlocked(userId, masterschool, lessonId) {
    try {
      // Get all lessons in order
      const allLessons = await this.getRoadmapLessons(masterschool, userId);

      // Find the index of the target lesson
      const lessonIndex = allLessons.findIndex(l => l.lesson_id === lessonId);

      if (lessonIndex === -1) {
        return false;
      }

      // First lesson is always unlocked
      if (lessonIndex === 0) {
        return true;
      }

      // Get the previous lesson
      const previousLesson = allLessons[lessonIndex - 1];

      // Check if previous lesson is completed using user_lesson_progress table
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('is_completed')
        .eq('user_id', userId)
        .eq('course_id', previousLesson.course_id)
        .eq('chapter_number', previousLesson.chapter_number)
        .eq('lesson_number', previousLesson.lesson_number)
        .maybeSingle();

      if (error) {
        console.error('Error checking lesson completion:', error);
        return false; // Safer default
      }

      // Return true if previous lesson is completed
      return data?.is_completed === true;
    } catch (error) {
      console.error('Error in isLessonUnlocked:', error);
      return false; // Safer default
    }
  }

  /**
   * Update lesson tracking (time spent and scroll percentage)
   * @param {string} userId - User UUID
   * @param {number} courseId - Course ID
   * @param {number} chapterNumber - Chapter number
   * @param {number} lessonNumber - Lesson number
   * @param {number} timeSpent - Time spent in seconds
   * @param {number} scrollPercentage - Scroll percentage (0-100)
   * @returns {Promise<Object>} Updated tracking data
   */
  /**
   * Update lesson tracking (OPTIMISÉ : Plus de vérification bloquante)
   * Accepte les IDs négatifs et économise une requête réseau.
   */
/**
   * Update tracking (VERSION AVEC BYPASS ID NÉGATIF)
   */
async updateLessonTracking(userId, courseId, chapterNumber, lessonNumber, timeSpent, scrollPercentage) {
  try {
    if (!userId || !courseId) return { canComplete: false };

    // PASSE-DROIT : Si ID Négatif, on dit OK sans appeler la DB
    if (parseInt(courseId) < 0) {
      return { canComplete: true, time_spent_seconds: timeSpent };
    }

    // Code normal pour les vrais cours
    const minimumTimeMet = timeSpent >= 120;
    const canComplete = minimumTimeMet && scrollPercentage >= 100;

    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        course_id: parseInt(courseId),
        chapter_number: chapterNumber,
        lesson_number: lessonNumber,
        time_spent_seconds: timeSpent,
        scroll_percentage: scrollPercentage,
        minimum_time_met: minimumTimeMet,
        can_complete: canComplete,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,course_id,chapter_number,lesson_number'
      })
      .select()
      .single();

    if (error) return { canComplete: false };

    return { ...data, canComplete };
  } catch (error) {
    return { canComplete: false };
  }
}
  /**
   * Complete a lesson (validates requirements and awards XP/skills)
   * @param {string} userId - User UUID
   * @param {string} lessonId - Lesson ID
   * @param {number} courseId - Course ID
   * @param {number} chapterNumber - Chapter number
   * @param {number} lessonNumber - Lesson number
   * @param {string} masterschool - Masterschool name
   * @param {string} lessonTitle - Lesson title
   * @returns {Promise<Object>} Completion result with rewards
   */
  /**
   * Complete a lesson (VERSION TRANSACTIONNELLE BLINDÉE)
   * Utilise la fonction SQL unique 'complete_lesson_transaction'
   */
/**
   * Complete a lesson (VERSION AVEC BYPASS POUR ID NÉGATIFS)
   */
async completeLesson(userId, lessonId, courseId, chapterNumber, lessonNumber, masterschool, lessonTitle) {
  try {
    // --- COURS VIRTUELS (ID Négatif) : on persiste la complétion pour que la roadmap
    // reste correcte quel que soit le lien (sinon seul le lien "lesson complete" montrait le bon node).
    if (parseInt(courseId) < 0) {
      const justCompletedId = `${courseId}-${chapterNumber}-${lessonNumber}`;
      let nextLessonId = null;

      // 1. Persist completion in DB so generate_roadmap_nodes sees it as completed on any future load
      const { error: upsertError } = await supabase.rpc('upsert_lesson_completed', {
        p_user_id: userId,
        p_course_id: parseInt(courseId, 10),
        p_chapter_number: parseInt(chapterNumber, 10),
        p_lesson_number: parseInt(lessonNumber, 10)
      });
      if (upsertError) {
        console.error('[completeLesson] upsert_lesson_completed failed:', upsertError.code, upsertError.message);
        return {
          success: false,
          message: upsertError.message || 'Impossible de sauvegarder la progression. Exécutez le script SQL APPLY_VIRTUAL_LESSON_PROGRESS_RUN_THIS.sql dans Supabase.'
        };
      }

      // 2. Fetch the updated roadmap so next_lesson_id reflects the DB state after the upsert
      try {
        const { data: nextRows, error: nodesError } = await supabase.rpc('generate_roadmap_nodes', {
          p_user_id: userId,
          p_masterschool: masterschool,
          p_limit: 5
        });
        if (nodesError) {
          console.error('[completeLesson] generate_roadmap_nodes failed:', nodesError.message);
        }
        if (Array.isArray(nextRows) && nextRows.length > 0) {
          const afterCompleted = nextRows.find(r => r?.lesson_id && r.lesson_id !== justCompletedId);
          nextLessonId = afterCompleted?.lesson_id ?? nextRows[0]?.lesson_id ?? null;
        }
      } catch (e) {
        console.error('[completeLesson] next node fetch exception:', e?.message || e);
      }

      return {
        success: true,
        alreadyCompleted: false,
        rewards: {
          xp_earned: 50,
          new_total_xp: null,
          skills_earned: [],
          next_lesson_id: nextLessonId
        },
        message: 'Lesson completed successfully!'
      };
    }

    // --- VALIDATION NORMALE (Transaction SQL) ---
    const payload = {
      p_user_id: userId,
      p_lesson_id: String(lessonId),
      p_course_id: parseInt(courseId, 10),
      p_chapter_number: parseInt(chapterNumber, 10),
      p_lesson_number: parseInt(lessonNumber, 10),
      p_masterschool: masterschool,
      p_lesson_title: lessonTitle || 'Lesson'
    };

    const { data, error } = await supabase.rpc('complete_lesson_transaction', payload);

    if (error) throw error;

    // RPC RETURNS TABLE returns an array of rows; take the first row
    const row = Array.isArray(data) && data.length > 0 ? data[0] : data;

    if (!row || !row.success) {
      const msg = row?.message || (data?.message) || 'Erreur inconnue du serveur';
      console.error('complete_lesson_transaction failed:', msg, row || data);
      return {
        success: false,
        message: msg
      };
    }

    // Envoi email en tâche de fond
    const xpEarned = row.xp_earned ?? 50;
    this._sendCompletionEmail(userId, lessonTitle, masterschool, xpEarned).catch(console.error);

    return {
      success: true,
      alreadyCompleted: false,
      rewards: {
        xp_earned: xpEarned,
        new_total_xp: row.new_total_xp ?? null,
        skills_earned: row.skills_earned || [],
        next_lesson_id: row.next_lesson_id ?? null
      },
      message: row.message || 'Lesson completed successfully!'
    };

  } catch (error) {
    console.error('Complete Lesson Error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to complete lesson. Please try again.'
    };
  }
}

  /**
   * Helper privé pour l'envoi d'email (pour alléger la fonction principale)
   */
  async _sendCompletionEmail(userId, lessonTitle, masterschool, xpEarned) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, current_xp')
        .eq('id', userId)
        .single();

      if (profile?.email && lessonTitle) {
        const { emailService } = await import('./emailService');
        await emailService.sendLessonCompletion(
          profile.email,
          profile.full_name || 'Initiate',
          lessonTitle,
          masterschool || 'Academy',
          xpEarned,
          profile.current_xp
        );
      }
    } catch (e) {
      // Email failure should silent
    }
  }
  /**
   * Get unread roadmap notifications for a user
   * @param {string} userId - User UUID
   * @param {string|null} masterschool - Optional: filter by masterschool
   * @returns {Promise<Array>} Array of notifications
   */
  async getRoadmapNotifications(userId, masterschool = null) {
    try {
      let query = supabase
        .from('roadmap_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (masterschool) {
        query = query.eq('masterschool', masterschool);
      }

      const { data, error } = await query;

      if (error) {
        // Table might not exist yet - just return empty array
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Mark a roadmap notification as read
   * @param {string} notificationId - Notification UUID
   * @returns {Promise<void>}
   */
  async markNotificationAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('roadmap_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Detect roadmap changes and create notifications (admin function)
   * @param {string} masterschool - Masterschool to check
   * @returns {Promise<Object>} Summary of changes detected
   */
  async detectRoadmapChanges(masterschool) {
    try {
      // This would typically be called by an admin or triggered by course updates
      // For now, it's a placeholder for the notification system
      
      // Get current roadmap state
      const currentLessons = await this.getRoadmapLessons(masterschool, null); // userId is null here

      // In a real implementation, you would:
      // 1. Compare with a stored snapshot of the roadmap
      // 2. Detect new lessons at lower difficulty levels
      // 3. Create notifications for all users with progress in this masterschool
      
      return {
        masterschool,
        totalLessons: currentLessons.length,
        message: 'Roadmap change detection is a placeholder for admin functionality'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the next unlocked lesson for a user in a masterschool
   * @param {string} userId - User UUID
   * @param {string} masterschool - Masterschool name
   * @returns {Promise<Object|null>} Next lesson or null if all completed
   */
  async getNextLesson(userId, masterschool) {
    let allLessons = [];
    try {
      allLessons = await this.getRoadmapLessons(masterschool, userId);

      // Find first incomplete lesson using is_completed flag from merged data
      for (const lesson of allLessons) {
        if (!lesson.is_completed) {
          // Check if it's unlocked (this will use the already sorted and filtered list)
          const isUnlocked = await this.isLessonUnlocked(userId, masterschool, lesson.lesson_id);
          if (isUnlocked) {
            return lesson;
          }
        }
      }

      return null; // All lessons completed or none unlocked
    } catch (error) {
      // Fallback to the first lesson if an error occurs, as a safe default
      const firstLesson = (await this.getRoadmapLessons(masterschool, userId))[0];
      return firstLesson || null;
    }
  }

  /**
   * Get lesson progress details
   * @param {string} userId - User UUID
   * @param {number} courseId - Course ID
   * @param {number} chapterNumber - Chapter number
   * @param {number} lessonNumber - Lesson number
   * @returns {Promise<Object|null>} Lesson progress or null
   */
  async getLessonProgress(userId, courseId, chapterNumber, lessonNumber) {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('chapter_number', chapterNumber)
        .eq('lesson_number', lessonNumber)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    } catch (error) {
      throw error;
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Sort and filter lessons based on user priority.
   * Returns all completed lessons + the first incomplete lesson according to priority.
   * @private
   * @param {Array} lessons - Array of all lessons
   * @param {Array} userPriority - Array of institute names in user's preferred order
   * @returns {Array} Sorted and filtered lessons
   */
  _sortAndFilterLessons(lessons, userPriority) {
    // Sort lessons based on the new logic
    const sortedLessons = this._sortLessonsByInstituteAndProgress(lessons, userPriority);

    const completedLessons = [];
    const filteredLessons = [];
    let firstIncompleteFound = false;

    for (const lesson of sortedLessons) {
      if (lesson.is_completed) {
        completedLessons.push(lesson);
      } else if (!firstIncompleteFound) {
        filteredLessons.push(lesson);
        firstIncompleteFound = true;
      }
    }

    return [...completedLessons, ...filteredLessons];
  }

  /**
   * Sorts lessons based on institute priority, then chapter, course, and lesson number.
   * @private
   * @param {Array} lessons - Array of all lessons
   * @param {Array} userPriority - Array of institute names in user's preferred order
   * @returns {Array} Sorted lessons
   */
  _sortLessonsByInstituteAndProgress(lessons, userPriority) {
    const priorityMap = new Map();
    if (userPriority && userPriority.length > 0) {
      userPriority.forEach((instituteName, index) => {
        priorityMap.set(instituteName, index);
      });
    }

    return [...lessons].sort((a, b) => {
      const aPriority = priorityMap.has(a.master_skill_linked) ? priorityMap.get(a.master_skill_linked) : Infinity;
      const bPriority = priorityMap.has(b.master_skill_linked) ? priorityMap.get(b.master_skill_linked) : Infinity;

      // 1. Sort by institute priority
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // 2. Then by chapter_number
      if (a.chapter_number !== b.chapter_number) {
        return a.chapter_number - b.chapter_number;
      }

      // 3. Then by course_id
      if (a.course_id !== b.course_id) {
        return a.course_id - b.course_id;
      }

      // 4. Finally by lesson_number
      return a.lesson_number - b.lesson_number;
    });
  }
}

// Export singleton instance
const roadmapService = new RoadmapService();
export default roadmapService;