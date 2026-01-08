import { supabase } from '../lib/supabaseClient'

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
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          const dayOfWeek = now.getDay()
          startDate = new Date(now)
          startDate.setDate(now.getDate() - dayOfWeek)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
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
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          const dayOfWeek = now.getDay()
          startDate = new Date(now)
          startDate.setDate(now.getDate() - dayOfWeek)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      }

      const { data, error } = await supabase
        .from('user_habit_completions')
        .select('completed_at')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false })

      if (error) throw error

      // Group by period
      const grouped = {}
      data?.forEach(completion => {
        const date = new Date(completion.completed_at)
        let key

        switch (period) {
          case 'day':
            key = date.toISOString().split('T')[0] // YYYY-MM-DD
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
            key = date.toISOString().split('T')[0]
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

