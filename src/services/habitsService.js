import { supabase } from '../lib/supabaseClient'
import { getTodayStartISO } from '../utils/dateUtils'

/**
 * Habits Service
 * Handles fetching habit completion statistics
 */
class HabitsService {
  /**
   * Get total habits completed by all users for a specific period
   * @param {string} period - 'day', 'week', 'month', or 'year'
   * @returns {Promise<{data: number, error: Error|null}>}
   */
  async getHabitsCompletedCount(period = 'day') {
    try {
      const now = new Date()
      let startDate

      switch (period) {
        case 'day':
          // Use local timezone for accurate "today"
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
          break
        case 'week':
          const dayOfWeek = now.getDay()
          startDate = new Date(now)
          startDate.setDate(now.getDate() - dayOfWeek)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      }

      // Query user_habit_completions table
      const { data, error, count } = await supabase
        .from('user_habit_completions')
        .select('*', { count: 'exact', head: false })
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false })

      if (error) throw error

      return { data: count || 0, error: null }
    } catch (error) {
      console.error('Error fetching habits completed count:', error)
      return { data: 0, error }
    }
  }

  /**
   * Get habits completed grouped by day/week/month/year
   * @param {string} period - 'day', 'week', 'month', or 'year'
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getHabitsCompletedByPeriod(period = 'day') {
    try {
      const now = new Date()
      let startDate

      switch (period) {
        case 'day':
          // Use local timezone for accurate "today"
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
          break
        case 'week':
          const dayOfWeek = now.getDay()
          startDate = new Date(now)
          startDate.setDate(now.getDate() - dayOfWeek)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      }

      const { data, error } = await supabase
        .from('user_habit_completions')
        .select('completed_at')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false })

      if (error) throw error

      // Group by period - use local timezone for date calculations
      const grouped = {}
      data?.forEach(completion => {
        const date = new Date(completion.completed_at)
        let key

        switch (period) {
          case 'day':
            // Use local date string for accurate day grouping
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            key = `${year}-${month}-${day}`
            break
          case 'week':
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            key = `${weekStart.getFullYear()}-W${Math.ceil((date.getDate() + 6 - date.getDay()) / 7)}`
            break
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            break
          case 'year':
            key = String(date.getFullYear())
            break
          default:
            const defaultYear = date.getFullYear()
            const defaultMonth = String(date.getMonth() + 1).padStart(2, '0')
            const defaultDay = String(date.getDate()).padStart(2, '0')
            key = `${defaultYear}-${defaultMonth}-${defaultDay}`
        }

        grouped[key] = (grouped[key] || 0) + 1
      })

      const result = Object.entries(grouped).map(([periodKey, count]) => ({
        period: periodKey,
        count
      })).sort((a, b) => a.period.localeCompare(b.period))

      return { data: result, error: null }
    } catch (error) {
      console.error('Error fetching habits completed by period:', error)
      return { data: [], error }
    }
  }
}

export default new HabitsService()

