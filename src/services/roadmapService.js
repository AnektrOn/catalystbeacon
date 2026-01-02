import { supabase } from '../lib/supabaseClient';

/**
 * RoadmapService - Handles all roadmap-related operations
 * Manages lesson progression, tracking, and rewards for Ignition, Insight, and Transformation masterschools
 */
class RoadmapService {
  /**
   * Fetch all lessons for a masterschool, sorted by difficulty and stat link
   * @param {string} masterschool - 'Ignition', 'Insight', or 'Transformation'
   * @param {string|null} statLink - Optional: filter by specific stat link
   * @returns {Promise<Array>} Sorted array of lessons
   */
  async getRoadmapLessons(masterschool) {
    try {
      // Query course_content and course_metadata directly (more reliable)
      console.log('Fetching roadmap lessons for:', masterschool);
      
      // Get courses for this masterschool
      const { data: courses, error: coursesError } = await supabase
        .from('course_metadata')
        .select('*')
        .eq('masterschool', masterschool);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }

      if (!courses || courses.length === 0) {
        console.warn(`No courses found for masterschool: ${masterschool}`);
        console.warn('Try running: UPDATE course_metadata SET masterschool = \'Ignition\' WHERE course_id IN (SELECT course_id FROM course_metadata LIMIT 15);');
        return [];
      }

      console.log(`✅ Found ${courses.length} courses for ${masterschool}`);
      const courseIds = courses.map(c => c.course_id);

      // Get all lessons for these courses
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_content')
        .select('*')
        .in('course_id', courseIds)
        .order('course_id', { ascending: true })
        .order('chapter_number', { ascending: true })
        .order('lesson_number', { ascending: true });

      if (lessonsError) {
        console.error('❌ Error fetching lessons:', lessonsError);
        throw lessonsError;
      }

      if (!lessons || lessons.length === 0) {
        console.warn(`⚠️ No lessons found in course_content for course IDs:`, courseIds);
        return [];
      }

      console.log(`✅ Found ${lessons.length} lessons in course_content`);

      // Merge course and lesson data
      const merged = (lessons || []).map(lesson => {
        const course = courses.find(c => c.course_id === lesson.course_id);
        const difficultyNumeric = course?.difficulty_numeric || 5;
        
        return {
          ...lesson,
          course_title: course?.course_title || 'Unknown Course',
          masterschool: course?.masterschool || masterschool,
          difficulty_numeric: difficultyNumeric,
          stats_linked: course?.stats_linked || [],
          master_skill_linked: course?.master_skill_linked || 'General',
          lesson_xp_reward: difficultyNumeric * 10
        };
      });

      // Sort by difficulty, master skill, then course/chapter/lesson
      const sorted = this._sortLessons(merged);
      console.log(`✅ Returning ${sorted.length} sorted lessons (${new Set(sorted.map(l => l.master_skill_linked)).size} master skills)`);
      
      if (sorted.length > 0) {
        console.log('First 3 lessons:', sorted.slice(0, 3).map(l => ({
          title: l.lesson_title,
          course: l.course_title,
          difficulty: l.difficulty_numeric,
          masterSkill: l.master_skill_linked
        })));
      }
      
      return sorted;
    } catch (error) {
      console.error('Error fetching roadmap lessons:', error);
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
      const lessons = await this.getRoadmapLessons(masterschool);
      
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

      console.log('📊 Grouped by master skill:', Object.keys(paginated));

      return paginated;
    } catch (error) {
      console.error('Error grouping roadmap by master skill:', error);
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
        console.warn('roadmap_progress table not found or error:', error.code);
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
      console.warn('Error fetching roadmap progress, returning empty:', error.message);
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
      const allLessons = await this.getRoadmapLessons(masterschool);
      
      // Find the index of the target lesson
      const lessonIndex = allLessons.findIndex(l => l.lesson_id === lessonId);
      
      if (lessonIndex === -1) {
        console.warn('Lesson not found in roadmap:', lessonId);
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
        console.warn('Error checking previous lesson completion:', error);
        // If we can't check, unlock it anyway (better UX)
        return true;
      }

      // Return true if previous lesson is completed
      return data?.is_completed === true;
    } catch (error) {
      console.error('Error checking lesson unlock status:', error);
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
      // Check if minimum requirements are met (3 minutes = 180 seconds, 100% scroll)
      const minimumTimeMet = timeSpent >= 180;
      const canComplete = minimumTimeMet && scrollPercentage >= 100;

      // Upsert lesson progress
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
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

      if (error) throw error;

      return {
        ...data,
        canComplete
      };
    } catch (error) {
      console.error('Error updating lesson tracking:', error);
      throw new Error(`Failed to update lesson tracking: ${error.message}`);
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
          message: 'Requirements not met. Please spend at least 5 minutes and scroll to the end of the lesson.'
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

      return {
        success: true,
        alreadyCompleted: false,
        rewards: rewardsData,
        message: 'Lesson completed successfully!'
      };
    } catch (error) {
      console.error('Error completing lesson:', error);
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
        console.warn('roadmap_notifications table not found:', error.code);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Error fetching roadmap notifications, returning empty:', error);
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
      console.error('Error marking notification as read:', error);
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
      const currentLessons = await this.getRoadmapLessons(masterschool);
      
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
      console.error('Error detecting roadmap changes:', error);
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
      allLessons = await this.getRoadmapLessons(masterschool);

      // Find first incomplete lesson using user_lesson_progress
      for (const lesson of allLessons) {
        const { data } = await supabase
          .from('user_lesson_progress')
          .select('is_completed')
          .eq('user_id', userId)
          .eq('course_id', lesson.course_id)
          .eq('chapter_number', lesson.chapter_number)
          .eq('lesson_number', lesson.lesson_number)
          .single();
        
        const isCompleted = data?.is_completed === true;
        
        if (!isCompleted) {
          // Check if it's unlocked
          const isUnlocked = await this.isLessonUnlocked(userId, masterschool, lesson.lesson_id);
          if (isUnlocked) {
            return lesson;
          }
        }
      }

      return null; // All lessons completed or none unlocked
    } catch (error) {
      console.error('Error getting next lesson:', error);
      return allLessons[0] || null; // Fallback to first lesson
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
      console.error('Error fetching lesson progress:', error);
      throw error;
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Sort lessons by difficulty, master skill, and course/chapter/lesson order
   * @private
   */
  _sortLessons(lessons, masterSkill = null) {
    return lessons.sort((a, b) => {
      // First, sort by difficulty
      if (a.difficulty_numeric !== b.difficulty_numeric) {
        return a.difficulty_numeric - b.difficulty_numeric;
      }

      // Then by master_skill_linked (alphabetically)
      const aSkill = a.master_skill_linked || 'ZZZ'; // Put undefined at end
      const bSkill = b.master_skill_linked || 'ZZZ';
      if (aSkill !== bSkill) {
        return aSkill.localeCompare(bSkill);
      }

      // Then by course_id
      if (a.course_id !== b.course_id) {
        return a.course_id - b.course_id;
      }

      // Then by chapter_number
      if (a.chapter_number !== b.chapter_number) {
        return a.chapter_number - b.chapter_number;
      }

      // Finally by lesson_number
      return a.lesson_number - b.lesson_number;
    });
  }
}

// Export singleton instance
const roadmapService = new RoadmapService();
export default roadmapService;

