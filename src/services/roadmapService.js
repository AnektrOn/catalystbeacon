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
  async getRoadmapLessons(masterschool, userId) {
    try {
      // Fetch user's institute priority
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('institute_priority')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile for institute priority:', profileError.message);
        // Fallback to empty array if no priority is set or error occurs
      }

      const userPriority = profileData?.institute_priority || [];

      // Query course_content and course_metadata directly (more reliable)

      // Get courses for this masterschool
      const { data: courses, error: coursesError } = await supabase
        .from('course_metadata')
        .select('*')
        .eq('masterschool', masterschool);

      if (coursesError) {
        throw coursesError;
      }

      if (!courses || courses.length === 0) {
        return [];
      }

      const courseIds = courses.map(c => c.course_id);

      // Get all lessons for these courses
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('course_content')
        .select('*')
        .in('course_id', courseIds)
        .order('course_id', { ascending: true })
        .order('chapter_number', { ascending: true })
        .order('lesson_number', { ascending: true });


      if (lessonsError) {
        throw lessonsError;
      }

      if (!lessonsData || lessonsData.length === 0) {
        return [];
      }

      // Fetch user lesson progress separately
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('course_id, chapter_number, lesson_number, is_completed')
        .eq('user_id', userId)
        .in('course_id', courseIds);

      if (progressError) {
        console.error('Error fetching user lesson progress:', progressError.message);
        // Continue without progress if error
      }

      const progressMap = new Map();
      if (progressData) {
        progressData.forEach(p => {
          const key = `${p.course_id}-${p.chapter_number}-${p.lesson_number}`;
          progressMap.set(key, p.is_completed);
        });
      }

      // Merge course, lesson, and progress data
      const merged = lessonsData.map(lesson => {
        const course = courses.find(c => c.course_id === lesson.course_id);
        const difficultyNumeric = course?.difficulty_numeric || 5;
        const progressKey = `${lesson.course_id}-${lesson.chapter_number}-${lesson.lesson_number}`;
        const isCompleted = progressMap.get(progressKey) || false;

        return {
          ...lesson,
          course_title: course?.course_title || 'Unknown Course',
          masterschool: course?.masterschool || masterschool,
          difficulty_numeric: difficultyNumeric,
          stats_linked: course?.stats_linked || [],
          master_skill_linked: course?.master_skill_linked || 'General',
          lesson_xp_reward: difficultyNumeric * 10,
          is_completed: isCompleted
        };
      });

      // Sort by user priority, then filter to show only completed + first incomplete
      const sortedAndFiltered = this._sortAndFilterLessons(merged, userPriority);

      return sortedAndFiltered;
    } catch (error) {
      throw new Error(`Failed to fetch roadmap lessons: ${error.message}`);
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
        // If we can't check, unlock it anyway (better UX)
        return true;
      }

      // Return true if previous lesson is completed
      return data?.is_completed === true;
    } catch (error) {
      // If error, unlock anyway (better UX than blocking)
      return true;
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
  async updateLessonTracking(userId, courseId, chapterNumber, lessonNumber, timeSpent, scrollPercentage) {
    try {
      // Validate inputs
      if (!userId || !courseId || !chapterNumber || !lessonNumber) {
        return { canComplete: false };
      }

      // Ensure courseId is an integer
      const courseIdInt = parseInt(courseId);
      if (isNaN(courseIdInt)) {
        return { canComplete: false };
      }

      // Verify course exists in course_metadata before attempting insert
      const { data: courseExists, error: courseCheckError } = await supabase
        .from('course_metadata')
        .select('course_id')
        .eq('course_id', courseIdInt)
        .single();

      if (courseCheckError || !courseExists) {
        return { canComplete: false };
      }

      // Check if minimum requirements are met (2 minutes = 120 seconds, 100% scroll)
      const minimumTimeMet = timeSpent >= 120;
      const canComplete = minimumTimeMet && scrollPercentage >= 100;

      // Upsert lesson progress
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          course_id: courseIdInt,
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

      if (error) {
        // If it's a foreign key constraint error, log it but don't crash
        if (error.code === '23503' || error.message.includes('foreign key constraint')) {
          return { canComplete: false };
        }
        throw error;
      }

      return {
        ...data,
        canComplete
      };
    } catch (error) {
      // Return a safe default instead of throwing to prevent UI crashes
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
  async completeLesson(userId, lessonId, courseId, chapterNumber, lessonNumber, masterschool, lessonTitle) {
    try {
      // First, check if requirements are met
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('can_complete, is_completed')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('chapter_number', chapterNumber)
        .eq('lesson_number', lessonNumber)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      // If already completed, return early
      if (progressData?.is_completed) {
        return {
          success: true,
          alreadyCompleted: true,
          message: 'Lesson already completed'
        };
      }

      // Check if can complete
      if (!progressData?.can_complete) {
        return {
          success: false,
          message: 'Requirements not met. Please spend at least 2 minutes and scroll to the end of the lesson.'
        };
      }

      // Award XP and skills using database function
      const { data: rewardsData, error: rewardsError } = await supabase
        .rpc('award_roadmap_lesson_xp', {
          p_user_id: userId,
          p_lesson_id: lessonId,
          p_course_id: courseId,
          p_chapter_number: chapterNumber,
          p_lesson_number: lessonNumber
        });

      if (rewardsError) throw rewardsError;

      // Update roadmap progress
      const { error: roadmapError } = await supabase
        .rpc('update_roadmap_progress', {
          p_user_id: userId,
          p_masterschool: masterschool,
          p_lesson_id: lessonId,
          p_lesson_title: lessonTitle,
          p_course_id: courseId,
          p_chapter_number: chapterNumber,
          p_lesson_number: lessonNumber
        });

      if (roadmapError) throw roadmapError;

      // Explicitly mark the lesson as completed in user_lesson_progress
      const { error: updateProgressError } = await supabase
        .from('user_lesson_progress')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('chapter_number', chapterNumber)
        .eq('lesson_number', lessonNumber);

      if (updateProgressError) throw updateProgressError;

      // Send lesson completion email via Supabase (non-blocking)
      try {
        // Get user profile for email
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email, full_name, current_xp')
          .eq('id', userId)
          .single();

        if (profileData?.email && lessonTitle) {
          const { emailService } = await import('./emailService')
          const xpEarned = rewardsData?.xp_earned || 50

          await emailService.sendLessonCompletion(
            profileData.email,
            profileData.full_name || 'there',
            lessonTitle,
            masterschool || 'Course',
            xpEarned,
            profileData.current_xp || 0
          ).catch(err => {
            // Don't fail lesson completion if email fails
          })
        }
      } catch (emailError) {
        // Don't fail lesson completion if email fails
      }

      return {
        success: true,
        alreadyCompleted: false,
        rewards: rewardsData,
        message: 'Lesson completed successfully!'
      };
    } catch (error) {
      throw new Error(`Failed to complete lesson: ${error.message}`);
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
    if (!userPriority || userPriority.length === 0) {
      // Fallback to default sort if no priority is set
      return this._sortLessons(lessons);
    }

    // Create a map for quick lookup of institute priority index
    const priorityMap = new Map();
    userPriority.forEach((instituteName, index) => {
      priorityMap.set(instituteName, index);
    });

    const sortedLessons = [...lessons].sort((a, b) => {
      // Get priority for master_skill_linked, default to Infinity if not in priority list
      const aPriority = priorityMap.has(a.master_skill_linked) ? priorityMap.get(a.master_skill_linked) : Infinity;
      const bPriority = priorityMap.has(b.master_skill_linked) ? priorityMap.get(b.master_skill_linked) : Infinity;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Fallback to default sort for lessons within the same priority or if institute not in priority list
      return this._sortLessons([a, b])[0] === a ? -1 : 1;
    });

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
   * Default sort lessons by difficulty, master skill, and course/chapter/lesson order
   * @private
   */
  _sortLessons(lessons) {
    // Custom skill order based on Genesis Protocol phases
    const SKILL_ORDER = {
      // Phase I: DECONDITIONING
      'critical_thinking': 10,
      'Cognitive & Theoretical': 20,
      
      // Phase II: REORIENTATION
      'Inner Awareness': 30,
      
      // Phase III: INTEGRATION
      'Physical Mastery': 40,
      'emotional_regulation': 50,
      'shadow_work_habit': 60,
      'breathwork_habit': 70,
      
      // Phase IV: EXPANSION
      'neuroscience_habit': 80,
      'ritual_discipline_habit': 90,
      
      // Default / Others
      'General': 100,
      'ZZZ': 1000
    };

    return lessons.sort((a, b) => {
      // 1. Sort by master_skill_linked weight (Genesis Protocol Phase)
      const aWeight = SKILL_ORDER[a.master_skill_linked] || 100;
      const bWeight = SKILL_ORDER[b.master_skill_linked] || 100;
      
      if (aWeight !== bWeight) {
        return aWeight - bWeight;
      }

      // 2. Then by difficulty
      if (a.difficulty_numeric !== b.difficulty_numeric) {
        return a.difficulty_numeric - b.difficulty_numeric;
      }

      // 3. Then by course_id
      if (a.course_id !== b.course_id) {
        return a.course_id - b.course_id;
      }

      // 4. Then by chapter_number
      if (a.chapter_number !== b.chapter_number) {
        return a.chapter_number - b.chapter_number;
      }

      // 5. Finally by lesson_number
      return a.lesson_number - b.lesson_number;
    });
  }
}

// Export singleton instance
const roadmapService = new RoadmapService();
export default roadmapService;