import { supabase } from '../lib/supabaseClient'

/**
 * Lesson Progress Service
 * Handles queries for lesson completion data, especially for analytics
 */
class LessonProgressService {
  /**
   * Get completed lessons grouped by school_name over time
   * Returns data formatted for area chart: { Period: string, School1: number, School2: number, ... }
   * @param {string} userId - UUID of the user
   * @param {string} period - 'month' or 'week' (default: 'month')
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getCompletedLessonsBySchool(userId, period = 'month') {
    try {
      // First, get all completed lessons
      // Fix: Remove .not() syntax and filter in JavaScript for compatibility
      const { data: completedLessons, error: lessonsError } = await supabase
        .from('user_lesson_progress')
        .select('completed_at, course_id')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .order('completed_at', { ascending: true })

      if (lessonsError) throw lessonsError

      // Filter out null completed_at in JavaScript
      const validCompletedLessons = (completedLessons || []).filter(
        lesson => lesson.completed_at !== null && lesson.completed_at !== undefined
      )

      if (!validCompletedLessons || validCompletedLessons.length === 0) {
        return { data: [], categories: [], error: null }
      }

      // Get unique course_ids
      const courseIds = [...new Set(validCompletedLessons.map(l => l.course_id).filter(Boolean))]

      if (courseIds.length === 0) {
        return { data: [], categories: [], error: null }
      }

      // Get course metadata for those courses
      const { data: courses, error: coursesError } = await supabase
        .from('course_metadata')
        .select('course_id, school_name')
        .in('course_id', courseIds)

      if (coursesError) throw coursesError

      // Create a map for quick lookup
      const courseMap = new Map()
      if (courses) {
        courses.forEach(course => {
          courseMap.set(course.course_id, course.school_name)
        })
      }

      // Group by time period and school_name
      const grouped = {}
      const schoolNames = new Set()

      validCompletedLessons.forEach(lesson => {
        if (!lesson.completed_at || !lesson.course_id) return

        const schoolName = courseMap.get(lesson.course_id) || 'Other'
        if (!schoolName) return

        const date = new Date(lesson.completed_at)
        let periodKey

        if (period === 'month') {
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else if (period === 'week') {
          // Calculate week number (week of year)
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
          const year = weekStart.getFullYear()
          const startOfYear = new Date(year, 0, 1)
          const daysDiff = Math.floor((weekStart - startOfYear) / (24 * 60 * 60 * 1000))
          const weekNum = Math.ceil((daysDiff + startOfYear.getDay() + 1) / 7)
          periodKey = `${year}-W${String(weekNum).padStart(2, '0')}`
        } else if (period === 'day') {
          // Format: YYYY-MM-DD
          periodKey = date.toISOString().split('T')[0]
        } else {
          periodKey = date.toISOString().split('T')[0] // Default to daily
        }

        if (!grouped[periodKey]) {
          grouped[periodKey] = {}
        }

        if (!grouped[periodKey][schoolName]) {
          grouped[periodKey][schoolName] = 0
        }

        grouped[periodKey][schoolName]++
        schoolNames.add(schoolName)
      })

      // Convert to array format for chart
      const sortedPeriods = Object.keys(grouped).sort()
      const schoolNamesArray = Array.from(schoolNames).sort()

      const chartData = sortedPeriods.map(periodKey => {
        const dataPoint = { Period: periodKey }
        schoolNamesArray.forEach(schoolName => {
          dataPoint[schoolName] = grouped[periodKey][schoolName] || 0
        })
        return dataPoint
      })

      return { 
        data: chartData, 
        categories: schoolNamesArray,
        error: null 
      }
    } catch (error) {
      return { data: null, categories: [], error }
    }
  }

  /**
   * Get total completed lessons count by school_name
   * @param {string} userId - UUID of the user
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getTotalCompletedBySchool(userId) {
    try {
      const { data: completedLessons, error: lessonsError } = await supabase
        .from('user_lesson_progress')
        .select('course_id')
        .eq('user_id', userId)
        .eq('is_completed', true)

      if (lessonsError) throw lessonsError

      if (!completedLessons || completedLessons.length === 0) {
        return { data: {}, error: null }
      }

      const courseIds = [...new Set(completedLessons.map(l => l.course_id).filter(Boolean))]

      if (courseIds.length === 0) {
        return { data: {}, error: null }
      }

      const { data: courses, error: coursesError } = await supabase
        .from('course_metadata')
        .select('course_id, school_name')
        .in('course_id', courseIds)

      if (coursesError) throw coursesError

      const courseMap = new Map()
      if (courses) {
        courses.forEach(course => {
          courseMap.set(course.course_id, course.school_name)
        })
      }

      const totals = {}
      completedLessons.forEach(lesson => {
        const schoolName = courseMap.get(lesson.course_id) || 'Other'
        if (schoolName) {
          totals[schoolName] = (totals[schoolName] || 0) + 1
        }
      })

      return { data: totals, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

const lessonProgressService = new LessonProgressService()
export default lessonProgressService

