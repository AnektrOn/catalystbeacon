import { supabase } from '../lib/supabaseClient';

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
   * VERSION TURBO : Récupère la roadmap en 1 seul appel RPC
   */
 async getRoadmapLessons(masterschool, userId) {
  try {
    // 1. Appel RPC (Récupération brute rapide)
    const { data, error } = await supabase
      .rpc('get_user_roadmap_details', {
        p_user_id: userId,
        p_masterschool: masterschool
      });

    if (error) {
      console.error('Erreur RPC Roadmap:', error);
      return [];
    }

    const allLessons = data || [];
    if (allLessons.length === 0) return [];

    // 2. CALCUL DE LA FENÊTRE D'AFFICHAGE
    // On cherche l'index de la première leçon non terminée (le "Front")
    let activeIndex = allLessons.findIndex(l => !l.is_completed);
    
    // Si tout est fini, on affiche tout jusqu'à la fin
    if (activeIndex === -1) activeIndex = allLessons.length - 1;

    // 3. FILTRAGE CHIRURGICAL
    // On coupe après (Active + 3). Le reste du futur est caché.
    const futureBuffer = 3; 
    const cutoffIndex = activeIndex + futureBuffer;
    
    const optimizedData = allLessons.slice(0, cutoffIndex + 1);

    // 4. Formatage
    return optimizedData.map(lesson => ({
      ...lesson,
      masterschool: masterschool,
      lesson_xp_reward: (lesson.difficulty_numeric || 5) * 10
    }));

  } catch (error) {
    console.error(`Failed to fetch roadmap lessons: ${error.message}`);
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
        .single();

      if (error && error.code !== 'PGRST116') {
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
    // --- PASSE-DROIT POUR COURS VIRTUELS (ID Négatif) ---
    // On valide immédiatement sans toucher à la DB pour éviter les crashs
    if (parseInt(courseId) < 0) {
      console.log("Validation Bypass (Virtuel) pour :", courseId);
      return {
        success: true,
        alreadyCompleted: false,
        rewards: {
          xp_earned: 50,
          new_total_xp: null,
          skills_earned: []
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

    if (!data || !data.success) {
      console.error("ERREUR SQL BRUTE:", data);
      throw new Error(data?.error || "Erreur inconnue du serveur");
    }

    // Envoi email en tâche de fond
    this._sendCompletionEmail(userId, lessonTitle, masterschool, data.xp_earned).catch(console.error);

    return {
      success: true,
      alreadyCompleted: false,
      rewards: {
        xp_earned: data.xp_earned || 50,
        new_total_xp: data.new_total_xp,
        skills_earned: data.skills_earned || []
      },
      message: 'Lesson completed successfully!'
    };

  } catch (error) {
    console.error('Complete Lesson Error:', error);
    // Fallback ultime : On valide localement pour ne pas bloquer l'user
    return { 
      success: true, 
      message: 'Lesson completed locally (Sync issue bypassed)' 
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
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
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