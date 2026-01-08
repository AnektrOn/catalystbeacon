import React, { useEffect, useState } from 'react'
import ModernCard from './ModernCard'
import { CheckCircle2, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import habitsService from '../../services/habitsService'
import './HabitsCompletedCard.css'

/**
 * Habits Completed Card - Displays number of habits completed by users
 * with day/week/month/year period sorting
 */
const HabitsCompletedCard = () => {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('day')
  const [trend, setTrend] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await habitsService.getHabitsCompletedCount(period)
        
        if (result.error) {
          setError(result.error.message)
        } else {
          setCount(result.data || 0)
          setError(null)
        }

        // Get previous period for trend
        try {
          const now = new Date()
          let startDate, endDate

          switch (period) {
            case 'day':
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
              endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
              break
            case 'week':
              const dayOfWeek = now.getDay()
              endDate = new Date(now)
              endDate.setDate(now.getDate() - dayOfWeek)
              endDate.setHours(0, 0, 0, 0)
              startDate = new Date(endDate)
              startDate.setDate(endDate.getDate() - 7)
              break
            case 'month':
              endDate = new Date(now.getFullYear(), now.getMonth(), 1)
              startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
              break
            case 'year':
              endDate = new Date(now.getFullYear(), 0, 1)
              startDate = new Date(now.getFullYear() - 1, 0, 1)
              break
            default:
              startDate = null
              endDate = null
          }

          if (startDate && endDate) {
            const { count: previousCount } = await supabase
              .from('user_habit_completions')
              .select('*', { count: 'exact', head: false })
              .gte('completed_at', startDate.toISOString())
              .lt('completed_at', endDate.toISOString())

            if (previousCount !== null) {
              const currentCount = result.data || 0
              const diff = currentCount - previousCount
              setTrend(diff)
            }
          }
        } catch (trendError) {
          console.error('Error calculating trend:', trendError)
          // Don't set error, just skip trend
        }
      } catch (err) {
        console.error('Error loading habits completed:', err)
        setError('Failed to load habits data')
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60000)

    return () => clearInterval(interval)
  }, [period])

  const periods = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' }
  ]

  return (
    <ModernCard className="habits-completed-card" elevated>
      <div className="habits-completed-header">
        <div className="habits-completed-title-section">
          <CheckCircle2 size={20} />
          <h3 className="habits-completed-title">Habits Completed</h3>
        </div>
      </div>

      <div className="habits-completed-period-selector">
        {periods.map(p => (
          <button
            key={p.key}
            className={`period-btn ${period === p.key ? 'active' : ''}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="habits-completed-loading">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="habits-completed-error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="habits-completed-content">
          <div className="habits-completed-count">
            <span className="habits-completed-number">{count.toLocaleString()}</span>
            <span className="habits-completed-label">
              {period === 'day' ? 'Today' : 
               period === 'week' ? 'This Week' :
               period === 'month' ? 'This Month' : 'This Year'}
            </span>
          </div>
          
          {trend !== null && (
            <div className={`habits-completed-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
              <TrendingUp size={16} />
              <span>{trend >= 0 ? '+' : ''}{trend.toLocaleString()}</span>
              <span className="trend-label">vs previous {period}</span>
            </div>
          )}
        </div>
      )}
    </ModernCard>
  )
}

export default HabitsCompletedCard

