import { supabase } from '../lib/supabaseClient'

/**
 * Lessons Service
 * Handles fetching all available lessons in realtime
 */
class LessonsService {
  /**
   * Get all available lessons from all courses
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getAllLessons() {
    try {
      // First get all lessons
      const { data: lessons, error } = await supabase
        .from('course_content')
        .select('*')
        .order('course_id', { ascending: true })
        .order('chapter_number', { ascending: true })
        .order('lesson_number', { ascending: true })

      if (error) throw error

      // Then get course metadata for each unique course_id
      const courseIds = [...new Set((lessons || []).map(l => l.course_id).filter(Boolean))]
      
      let courseMetadata = {}
      if (courseIds.length > 0) {
        const { data: courses, error: coursesError } = await supabase
          .from('course_metadata')
          .select('course_id, course_title, school_name, difficulty_level, masterschool')
          .in('course_id', courseIds)

        if (coursesError) {
        } else {
          courses?.forEach(course => {
            courseMetadata[course.course_id] = course
          })
        }
      }

      if (error) throw error

      // Merge course metadata with lessons
      const flattened = (lessons || []).map(lesson => {
        const course = courseMetadata[lesson.course_id] || {}
        return {
          ...lesson,
          course_title: course.course_title || 'Unknown Course',
          school_name: course.school_name || 'Unknown School',
          difficulty_level: course.difficulty_level || 'Medium',
          masterschool: course.masterschool || 'General'
        }
      })

      return { data: flattened, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  /**
   * Subscribe to realtime updates for lessons
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToLessons(callback) {
    const channel = supabase
      .channel('lessons-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_content'
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}

export default new LessonsService()

