import { supabase } from '../lib/supabaseClient';
import { logDebug, logError, logWarn } from '../utils/logger';

class CourseService {
  // ===== UUID GENERATION HELPERS =====

  /**
   * Generate a deterministic UUID for a chapter based on course_id and chapter_number
   * This ensures consistent UUIDs for the same chapter across operations
   * @param {number} courseId - The course_id
   * @param {number} chapterNumber - The chapter number (1-5)
   * @returns {string} UUID v5 based on course and chapter
   */
  generateChapterId(courseId, chapterNumber) {
    // Use a namespace UUID for chapters (could be any valid UUID)
    // const CHAPTER_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Not currently used
    const name = `course:${courseId}:chapter:${chapterNumber}`;

    // Simple deterministic UUID generation (you may want to use uuid library for proper v5)
    // For now, create a pseudo-UUID based on the input
    const hash = this._simpleHash(name);
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  }

  /**
   * Generate a deterministic UUID for a lesson based on course_id, chapter_number, and lesson_number
   * @param {number} courseId - The course_id
   * @param {number} chapterNumber - The chapter number (1-5)
   * @param {number} lessonNumber - The lesson number (1-4)
   * @returns {string} UUID v5 based on course, chapter, and lesson
   */
  generateLessonId(courseId, chapterNumber, lessonNumber) {
    // const LESSON_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'; // Not currently used
    const name = `course:${courseId}:chapter:${chapterNumber}:lesson:${lessonNumber}`;

    const hash = this._simpleHash(name);
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  }

  /**
   * Simple hash function for deterministic UUID generation
   * @private
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to hex and pad to 32 characters
    return Math.abs(hash).toString(16).padStart(32, '0');
  }

  // ===== COURSE METADATA =====

  /**
   * Get all published courses with optional filters
   * Only returns courses from unlocked schools
   * @param {Object} filters - Optional filters (school, difficulty, status, userId)
   * @param {string} filters.userId - User ID to check school unlock status
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getAllCourses(filters = {}) {
    try {
      const queryStartTime = Date.now();
      
      // Optimized: First get course_ids with structures (fast, indexed, minimal data)
      // Then filter course_metadata by those IDs (also fast with index)
      const { data: courseStructures, error: structureError } = await supabase
        .from('course_structure')
        .select('course_id');

      if (structureError) {
        logError(structureError, 'courseService - Error fetching course structures');
        // Return the error so the caller knows something went wrong
        return { data: null, error: structureError };
      }

      logDebug(`Course structure query took ${Date.now() - queryStartTime}ms`);

      // Extract unique course_ids that have structures, filtering out null/undefined values
      const courseIdsWithStructure = [...new Set(
        (courseStructures || [])
          .map(cs => cs.course_id)
          .filter(id => id != null && id !== undefined)
      )];

      // If no courses have structures, return empty array (this is expected behavior)
      if (courseIdsWithStructure.length === 0) {
        logDebug('No courses with course_structure found');
        return { data: [], error: null };
      }

      // Now build the main query with all filters applied
      let query = supabase
        .from('course_metadata')
        .select('*')
        .eq('status', 'published')
        .in('course_id', courseIdsWithStructure)
        .order('masterschool', { ascending: true })
        .order('xp_threshold', { ascending: true });

      if (filters.masterschool) {
        query = query.eq('masterschool', filters.masterschool);
      }

      // Filter by unlocked schools if userId is provided
      if (filters.userId) {
        const unlockQueryStartTime = Date.now();
        
        // Get user's XP and unlocked schools in parallel for better performance
        const [profileResult, schoolsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('current_xp')
            .eq('id', filters.userId)
            .single(),
          supabase
            .from('schools')
            .select('name, unlock_xp')
            .order('unlock_xp', { ascending: true })
        ]);

        if (profileResult.error) {
          logWarn('Error fetching user profile for unlock check:', profileResult.error);
        }
        if (schoolsResult.error) {
          logWarn('Error fetching schools for unlock check:', schoolsResult.error);
        }

        const userXp = profileResult?.data?.current_xp || 0;

        // Get unlocked school names (filter in memory for better performance)
        const unlockedSchoolNames = (schoolsResult?.data || [])
          .filter(s => s.unlock_xp <= userXp)
          .map(s => s.name);

        // Always include Ignition as it's the default unlocked school
        if (unlockedSchoolNames.length === 0 || !unlockedSchoolNames.includes('Ignition')) {
          unlockedSchoolNames.push('Ignition');
        }

        logDebug(`Unlock check query took ${Date.now() - unlockQueryStartTime}ms, unlocked schools: ${unlockedSchoolNames.length}`);

        // Filter courses to only show unlocked schools
        if (unlockedSchoolNames.length > 0) {
          query = query.in('masterschool', unlockedSchoolNames);
        }
      }

      if (filters.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }

      if (filters.topic) {
        query = query.ilike('topic', `%${filters.topic}%`);
      }

      const metadataQueryStartTime = Date.now();
      const { data, error } = await query;
      const metadataQueryTime = Date.now() - metadataQueryStartTime;

      if (error) {
        logError(error, 'courseService - Error fetching courses with filters');
        logDebug('Course IDs with structure:', courseIdsWithStructure.length);
        throw error;
      }
      
      logDebug(`Successfully fetched ${data?.length || 0} courses with course_structure (metadata query took ${metadataQueryTime}ms, total time: ${Date.now() - queryStartTime}ms)`);
      return { data, error: null };
    } catch (error) {
      logError(error, 'courseService - Error fetching courses');
      return { data: null, error };
    }
  }

  /**
   * Get courses grouped by masterschool
   * @param {Object} filters - Optional filters to pass to getAllCourses
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getCoursesBySchool(filters = {}) {
    try {
      const { data, error } = await this.getAllCourses(filters);

      if (error) throw error;

      // Group courses by masterschool (normalize to capitalize first letter)
      const grouped = {};
      if (data) {
        data.forEach(course => {
          // Normalize masterschool name: capitalize first letter
          let school = course.masterschool || 'Other';

          // Handle special case "God Mode" (two words)
          if (school.toLowerCase() === 'god mode' || school.toLowerCase() === 'godmode') {
            school = 'God Mode';
          } else if (school) {
            // Capitalize first letter, lowercase rest
            school = school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
          }

          if (!grouped[school]) {
            grouped[school] = [];
          }
          grouped[school].push(course);
        });
      }

      return { data: grouped, error: null };
    } catch (error) {
      logError('Error grouping courses by school:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single course by UUID or course_id
   * @param {string|number} courseId - UUID or course_id (integer) of the course
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getCourseById(courseId) {
    try {
      // Try UUID first, then course_id
      let query = supabase
        .from('course_metadata')
        .select('*');

      // Check if it's a UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      // UUIDs have multiple dashes in specific positions, not just a negative sign
      const isUUID = typeof courseId === 'string' && courseId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      
      if (isUUID) {
        query = query.eq('id', courseId);
      } else {
        // It's an integer (could be negative)
        query = query.eq('course_id', parseInt(courseId));
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error fetching course:', error);
      return { data: null, error };
    }
  }

  /**
   * Get course structure (denormalized)
   * @param {number} courseId - course_id (integer) from course_metadata
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getCourseStructure(courseId) {
    try {
      
      // Handle duplicates by getting the most recent one (or first if multiple)
      const queryStart = Date.now()
      const { data, error } = await supabase
        .from('course_structure')
        .select('*')
        .eq('course_id', parseInt(courseId))
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // If there are multiple rows, try to get the first one
        const { data: allData, error: allError } = await supabase
          .from('course_structure')
          .select('*')
          .eq('course_id', parseInt(courseId))
          .limit(1)
          .maybeSingle();
        
        if (allError) throw allError;
        return { data: allData, error: null };
      }

      return { data: data || null, error: null };
    } catch (error) {
      logError('Error fetching course structure:', error);
      return { data: null, error };
    }
  }

  /**
   * Parse denormalized course structure into normalized format
   * @param {Object} structure - The course_structure row
   * @returns {Array} Array of chapters with lessons
   */
  parseCourseStructure(structure) {
    if (!structure) {
      logWarn('[CourseService] parseCourseStructure: No structure provided');
      return [];
    }

    const chapters = [];
    // Try to get chapter_count, but also check for chapters manually if count is 0
    let chapterCount = structure.chapter_count || 0;
    
    // If chapter_count is 0, try to detect chapters by checking for chapter_title_1, chapter_title_2, etc.
    if (chapterCount === 0) {
      for (let i = 1; i <= 5; i++) {
        if (structure[`chapter_title_${i}`]) {
          chapterCount = i;
        }
      }
    }

    logDebug('[CourseService] parseCourseStructure:', {
      chapterCount,
      hasChapter1: !!structure.chapter_title_1,
      hasLesson1_1: !!structure.lesson_1_1,
      hasLesson1_2: !!structure.lesson_1_2,
      structureKeys: Object.keys(structure).filter(k => k.startsWith('chapter') || k.startsWith('lesson'))
    });

    for (let i = 1; i <= Math.min(chapterCount || 5, 5); i++) {
      const chapterTitle = structure[`chapter_title_${i}`];
      const chapterId = structure[`chapter_id_${i}`];

      if (!chapterTitle) {
        logDebug(`[CourseService] Skipping chapter ${i}: no chapter_title_${i}`);
        continue;
      }

      const lessons = [];
      for (let j = 1; j <= 4; j++) {
        const lessonTitle = structure[`lesson_${i}_${j}`];
        if (lessonTitle && lessonTitle.trim() !== '') {
          lessons.push({
            chapter_number: i,
            lesson_number: j,
            lesson_title: lessonTitle,
            lesson_id: `${i}_${j}`, // Composite ID for reference
            chapter_id: chapterId
          });
        }
      }

      logDebug(`[CourseService] Chapter ${i} "${chapterTitle}": ${lessons.length} lessons found`);

      // Include chapter even if no lessons (so it shows in UI)
      chapters.push({
        chapter_number: i,
        chapter_title: chapterTitle,
        chapter_id: chapterId,
        lessons: lessons
      });
    }

    logDebug(`[CourseService] parseCourseStructure result: ${chapters.length} chapters, ${chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)} total lessons`);
    return chapters;
  }

  /**
   * Get full course structure (metadata + parsed structure)
   * @param {string|number} courseId - UUID or course_id
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getFullCourseStructure(courseId) {
    try {
      // Get course metadata
      const { data: course, error: courseError } = await this.getCourseById(courseId);
      if (courseError) throw courseError;

      if (!course || !course.course_id) {
        return { data: { ...course, chapters: [] }, error: null };
      }

      // Get course structure
      const { data: structure, error: structureError } = await this.getCourseStructure(course.course_id);
      if (structureError) {
        // Structure might not exist yet, return course with empty chapters
        return { data: { ...course, chapters: [] }, error: null };
      }

      // Parse structure into chapters
      const chapters = this.parseCourseStructure(structure);

      return {
        data: {
          ...course,
          chapters: chapters,
          structure: structure
        },
        error: null
      };
    } catch (error) {
      logError('Error fetching full course structure:', error);
      return { data: null, error };
    }
  }

  /**
   * Get lesson content
   * @param {number} courseId - course_id (integer)
   * @param {number} chapterNumber - Chapter number (1-5)
   * @param {number} lessonNumber - Lesson number (1-4)
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getLessonContent(courseId, chapterNumber, lessonNumber) {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', parseInt(courseId))
        .eq('chapter_number', chapterNumber)
        .eq('lesson_number', lessonNumber)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return { data: data || null, error: null };
    } catch (error) {
      logError('Error fetching lesson content:', error);
      return { data: null, error };
    }
  }

  /**
   * Get lesson content by UUID (for backward compatibility)
   * @param {string} lessonId - UUID of the lesson
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getLessonContentByUUID(lessonId) {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null, error: null };
    } catch (error) {
      logError('Error fetching lesson content by UUID:', error);
      return { data: null, error };
    }
  }

  /**
   * Get lesson content by chapter UUID (for backward compatibility)
   * @param {string} chapterId - UUID of the chapter
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getLessonsByChapterUUID(chapterId) {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('lesson_number');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      logError('Error fetching lessons by chapter UUID:', error);
      return { data: null, error };
    }
  }

  /**
   * Get course descriptions (denormalized)
   * @param {number} courseId - course_id (integer) from course_metadata
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getCourseDescriptions(courseId) {
    try {
      const { data, error } = await supabase
        .from('course_description')
        .select('*')
        .eq('course_id', parseInt(courseId))
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null, error: null };
    } catch (error) {
      logError('Error fetching course descriptions:', error);
      return { data: null, error };
    }
  }

  /**
   * Parse denormalized course descriptions into normalized format
   * @param {Object} descriptions - The course_description row
   * @returns {Object} Object with chapter and lesson descriptions
   */
  parseCourseDescriptions(descriptions) {
    if (!descriptions) return { chapters: {}, lessons: {} };

    const chapterDescriptions = {};
    const lessonDescriptions = {};

    for (let i = 1; i <= 5; i++) {
      const chapterDesc = descriptions[`chapter_${i}_description`];
      if (chapterDesc) {
        chapterDescriptions[i] = chapterDesc;
      }

      for (let j = 1; j <= 4; j++) {
        const lessonDesc = descriptions[`lesson_${i}_${j}_description`];
        if (lessonDesc) {
          if (!lessonDescriptions[i]) {
            lessonDescriptions[i] = {};
          }
          lessonDescriptions[i][j] = lessonDesc;
        }
      }
    }

    return {
      chapters: chapterDescriptions,
      lessons: lessonDescriptions
    };
  }

  /**
   * Get lesson description
   * @param {string|number} courseId - UUID or course_id
   * @param {number} chapterNumber - Chapter number
   * @param {number} lessonNumber - Lesson number
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getLessonDescription(courseId, chapterNumber, lessonNumber) {
    try {
      // First get the course to find the course_id
      const { data: course, error: courseError } = await this.getCourseById(courseId);
      if (courseError) throw courseError;

      if (!course?.course_id) {
        return { data: null, error: null };
      }

      // Get course descriptions
      const { data: descriptions, error: descError } = await this.getCourseDescriptions(course.course_id);
      if (descError) throw descError;

      if (!descriptions) {
        return { data: null, error: null };
      }

      // Extract specific chapter and lesson descriptions
      const chapterDescription = descriptions[`chapter_${chapterNumber}_description`] || null;
      const lessonDescription = descriptions[`lesson_${chapterNumber}_${lessonNumber}_description`] || null;

      return {
        data: {
          chapter_description: chapterDescription,
          lesson_description: lessonDescription
        },
        error: null
      };
    } catch (error) {
      logError('Error fetching lesson description:', error);
      return { data: null, error };
    }
  }

  // ===== USER PROGRESS =====

  /**
   * Get user's course progress
   * @param {string} userId - UUID of the user
   * @param {number} courseId - course_id (integer) from course_metadata
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getUserCourseProgress(userId, courseId) {
    try {
      const parsedCourseId = parseInt(courseId);
      if (isNaN(parsedCourseId)) {
        return { data: null, error: { message: 'Invalid courseId: must be an integer course_id, not UUID' } };
      }
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', parsedCourseId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid 406 errors

      // PGRST116 = not found, which is OK - return null data
      if (error && error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      
      // 406 errors (Not Acceptable) usually mean table doesn't exist or RLS issue
      // Return null data instead of error to prevent blocking
      if (error) {
        logWarn('Error fetching user course progress (non-critical):', error);
        return { data: null, error: null }; // Don't block on progress errors
      }
      
      return { data: data || null, error: null };
    } catch (error) {
      logWarn('Exception fetching user course progress (non-critical):', error);
      // Don't block on progress errors - return null data
      return { data: null, error: null };
    }
  }

  /**
   * Get all courses user has started
   * @param {string} userId - UUID of the user
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getUserCourses(userId) {
    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select(`
          *,
          course_metadata!inner (
            id,
            course_title,
            school_name,
            masterschool,
            difficulty_level,
            xp_threshold
          )
        `)
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error fetching user courses:', error);
      return { data: null, error };
    }
  }

  /**
   * Initialize or update user course progress
   * @param {string} userId - UUID of the user
   * @param {number} courseId - course_id (integer) from course_metadata
   * @param {Object} progressData - Progress data (status, progress_percentage)
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async updateCourseProgress(userId, courseId, progressData = {}) {
    try {
      // Check if progress exists
      const { data: existing } = await this.getUserCourseProgress(userId, courseId);

      const progressUpdate = {
        user_id: userId,
        course_id: parseInt(courseId),
        last_accessed_at: new Date().toISOString(),
        ...progressData
      };

      let result;
      if (existing) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_course_progress')
          .update(progressUpdate)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from('user_course_progress')
          .insert(progressUpdate)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return { data: result, error: null };
    } catch (error) {
      logError('Error updating course progress:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's lesson progress
   * @param {string} userId - UUID of the user
   * @param {number} courseId - course_id (integer)
   * @param {number} chapterNumber - Chapter number
   * @param {number} lessonNumber - Lesson number
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getUserLessonProgress(userId, courseId, chapterNumber, lessonNumber) {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', parseInt(courseId))
        .eq('chapter_number', chapterNumber)
        .eq('lesson_number', lessonNumber)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null, error: null };
    } catch (error) {
      logError('Error fetching user lesson progress:', error);
      return { data: null, error };
    }
  }

  /**
   * Mark lesson as completed and award XP
   * @param {string} userId - UUID of the user
   * @param {number} courseId - course_id (integer)
   * @param {number} chapterNumber - Chapter number
   * @param {number} lessonNumber - Lesson number
   * @param {number} xpAmount - XP to award (default 50)
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async completeLesson(userId, courseId, chapterNumber, lessonNumber, xpAmount = 50) {
    try {
      
      // Check if already completed
      
      const { data: existing } = await this.getUserLessonProgress(userId, courseId, chapterNumber, lessonNumber);

      const progressData = {
        user_id: userId,
        course_id: parseInt(courseId),
        chapter_number: chapterNumber,
        lesson_number: lessonNumber,
        is_completed: true,
        completed_at: new Date().toISOString()
      };

      let lessonProgress;
      if (existing) {
        
        // Update existing progress
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .update(progressData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        lessonProgress = data;
      } else {
        
        // Create new progress
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .insert(progressData)
          .select()
          .single();

        if (error) throw error;
        lessonProgress = data;
      }

      // Award XP using the database function
      
      const { data: xpResult, error: xpError } = await supabase.rpc('award_lesson_xp', {
        user_id: userId,
        course_id: parseInt(courseId),
        chapter_number: chapterNumber,
        lesson_number: lessonNumber,
        xp_amount: xpAmount
      });

      if (xpError) {
        logError('Error awarding XP:', xpError);
        // Throw error so it can be handled properly
        throw new Error(`Failed to award XP: ${xpError.message}`);
      }

      // Supabase RPC returns arrays, so check the first element
      const xpAwarded = Array.isArray(xpResult) ? xpResult[0] : xpResult;
      
      // Check if function returned false (indicating failure)
      if (xpAwarded === false) {
        logWarn('⚠️ XP award function returned false - attempting direct profile update as fallback');
        
        // Fallback: Try to update XP directly if the function fails
        // This handles cases where the function doesn't exist or has errors
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('current_xp, total_xp_earned')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          throw new Error(`Failed to award XP: Database function returned false and fallback failed: ${profileError.message}`);
        }
        
        const currentXP = profileData?.current_xp || 0;
        const totalXP = profileData?.total_xp_earned || 0;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            current_xp: currentXP + xpAmount,
            total_xp_earned: totalXP + xpAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          throw new Error(`Failed to award XP: Database function returned false and fallback update failed: ${updateError.message}`);
        }
        logDebug(`✅ XP awarded via fallback: ${xpAmount} XP added (${currentXP} → ${currentXP + xpAmount})`);
      }

      if (xpAwarded === true) {
        logDebug(`✅ Successfully awarded ${xpAmount} XP to user ${userId}`);
      }
      
      // Send lesson completion email via Supabase (non-blocking)
      try {
        // Get user profile and lesson details for email
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email, full_name, current_xp')
          .eq('id', userId)
          .single();
        
        const { data: courseData } = await supabase
          .from('course_metadata')
          .select('title')
          .eq('course_id', parseInt(courseId))
          .single();
        
        const { data: lessonData } = await supabase
          .from('course_content')
          .select('title')
          .eq('course_id', parseInt(courseId))
          .eq('chapter_number', chapterNumber)
          .eq('lesson_number', lessonNumber)
          .single();
        
        if (profileData?.email && lessonData?.title) {
          const { emailService } = await import('./emailService')
          
          await emailService.sendLessonCompletion(
            profileData.email,
            profileData.full_name || 'there',
            lessonData.title,
            courseData?.title || 'Course',
            xpAmount,
            profileData.current_xp || 0
          ).catch(err => {
            logDebug('Lesson completion email send failed (non-critical):', err)
            // Don't fail lesson completion if email fails
          })
        }
      } catch (emailError) {
        logDebug('Lesson completion email error (non-critical):', emailError)
        // Don't fail lesson completion if email fails
      }
      
      return { data: { lessonProgress, xpAwarded: xpAmount }, error: null };
    } catch (error) {
      logError('Error completing lesson:', error);
      return { data: null, error };
    }
  }

  /**
   * Calculate course progress percentage
   * @param {string} userId - UUID of the user
   * @param {number} courseId - course_id (integer)
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async calculateCourseProgress(userId, courseId) {
    try {
      // Get course structure
      const { data: structure, error: structureError } = await this.getCourseStructure(courseId);
      if (structureError) {
        return { data: { progressPercentage: 0, completedLessons: 0, totalLessons: 0 }, error: null };
      }

      // Parse structure to get total lessons
      const chapters = this.parseCourseStructure(structure);
      let totalLessons = 0;
      chapters.forEach(chapter => {
        totalLessons += (chapter.lessons || []).length;
      });

      if (totalLessons === 0) {
        return { data: { progressPercentage: 0, completedLessons: 0, totalLessons: 0 }, error: null };
      }

      // Get completed lessons
      const { data: completedLessons, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('chapter_number, lesson_number')
        .eq('user_id', userId)
        .eq('course_id', parseInt(courseId))
        .eq('is_completed', true);

      if (progressError) throw progressError;

      const completedCount = (completedLessons || []).length;
      const progressPercentage = Math.round((completedCount / totalLessons) * 100);

      // Update course progress
      const status = completedCount === totalLessons ? 'completed' :
        completedCount > 0 ? 'in_progress' : 'not_started';

      await this.updateCourseProgress(userId, courseId, {
        status,
        progress_percentage: progressPercentage
      });

      return {
        data: {
          progressPercentage,
          completedLessons: completedCount,
          totalLessons,
          status
        },
        error: null
      };
    } catch (error) {
      logError('Error calculating course progress:', error);
      return { data: null, error };
    }
  }

  /**
   * Get next lesson for user in a course
   * @param {string} userId - UUID of the user
   * @param {number} courseId - course_id (integer)
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getNextLesson(userId, courseId) {
    try {
      // Get course structure
      const { data: structure, error: structureError } = await this.getCourseStructure(courseId);
      if (structureError) {
        return { data: null, error: null };
      }

      // Get completed lessons
      const { data: completed, error: completedError } = await supabase
        .from('user_lesson_progress')
        .select('chapter_number, lesson_number')
        .eq('user_id', userId)
        .eq('course_id', parseInt(courseId))
        .eq('is_completed', true);

      if (completedError) throw completedError;

      const completedSet = new Set(
        (completed || []).map(c => `${c.chapter_number}_${c.lesson_number}`)
      );

      // Parse structure and find first incomplete lesson
      const chapters = this.parseCourseStructure(structure);
      for (const chapter of chapters) {
        for (const lesson of chapter.lessons) {
          const key = `${lesson.chapter_number}_${lesson.lesson_number}`;
          if (!completedSet.has(key)) {
            return {
              data: {
                chapter_number: lesson.chapter_number,
                lesson_number: lesson.lesson_number,
                lesson_title: lesson.lesson_title,
                lesson_id: lesson.lesson_id
              },
              error: null
            };
          }
        }
      }

      return { data: null, error: null }; // All lessons completed
    } catch (error) {
      logError('Error getting next lesson:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if user has enough XP to unlock a course
   * @param {string} userId - UUID of the user
   * @param {string|number} courseId - UUID or course_id
   * @returns {Promise<{data: {isUnlocked: boolean, userXp: number, requiredXp: number}, error: Error|null}>}
   */
  async checkCourseUnlock(userId, courseId) {
    try {
      // Get user's current XP
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_xp')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get course metadata
      const { data: course, error: courseError } = await this.getCourseById(courseId);
      if (courseError) throw courseError;

      const userXp = profile?.current_xp || 0;

      // Check if the school itself is unlocked
      const { data: school } = await supabase
        .from('schools')
        .select('unlock_xp')
        .eq('name', course?.masterschool)
        .single();

      const schoolUnlockXp = school?.unlock_xp || 0;
      const isSchoolUnlocked = userXp >= schoolUnlockXp;

      // Course is unlocked if the school is unlocked
      // Individual courses no longer have XP requirements
      const isUnlocked = isSchoolUnlocked;

      return {
        data: {
          isUnlocked,
          userXp,
          requiredXp: schoolUnlockXp // Return school unlock XP as the requirement
        },
        error: null
      };
    } catch (error) {
      logError('Error checking course unlock:', error);
      return { data: null, error };
    }
  }

  /**
   * Get consolidated course catalog data in a single request (optimized)
   */
  async getCourseCatalogDataConsolidated(userId) {
    try {
      const { data, error } = await supabase.rpc('get_course_catalog_data_v1', {
        p_user_id: userId
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError(error, 'courseService - Error fetching consolidated course catalog data');
      return { data: null, error };
    }
  }

  // ===== COURSE CREATION (TEACHER) =====
  // Note: Course creation would need to be updated to work with denormalized structure
  // This is a placeholder for future implementation
}

const courseService = new CourseService();
export default courseService;
