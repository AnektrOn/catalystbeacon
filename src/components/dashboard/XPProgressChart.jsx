import React, { useEffect, useState } from 'react'
import ModernCard from './ModernCard'
import { TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import './XPProgressChart.css'

/**
 * XP Progress Chart - Shows XP earned over the last 7 days
 * Simple line/area chart visualization
 */
const XPProgressChart = ({ userId }) => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const loadXPData = async () => {
      try {
        // Get last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const { data, error } = await supabase
          .from('xp_transactions')
          .select('amount, created_at')
          .eq('user_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error loading XP chart data:', error)
          throw error
        }

        // Group by day
        const dailyData = {}
        const today = new Date()
        
        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dateKey = date.toISOString().split('T')[0]
          dailyData[dateKey] = 0
        }

        // Sum XP by day (amount is the XP value in xp_transactions)
        data?.forEach(log => {
          const dateKey = new Date(log.created_at).toISOString().split('T')[0]
          if (dailyData[dateKey] !== undefined) {
            dailyData[dateKey] += log.amount || 0
          }
        })

        // Convert to array format
        const chartDataArray = Object.entries(dailyData).map(([date, xp]) => ({
          date,
          xp: Math.round(xp),
          dayLabel: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
        }))

        setChartData(chartDataArray)
      } catch (error) {
        console.error('Error loading XP chart data:', error)
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    loadXPData()
  }, [userId])

  if (loading) {
    return (
      <ModernCard className="xp-chart-card">
        <div className="xp-chart-loading">Loading chart...</div>
      </ModernCard>
    )
  }

  // Handle empty data
  if (!chartData || chartData.length === 0) {
    return (
      <ModernCard className="xp-chart-card">
        <div className="xp-chart-header">
          <div className="xp-chart-title">
            <TrendingUp size={18} />
            <span>XP Progress</span>
          </div>
          <div className="xp-chart-total">0 XP</div>
        </div>
        <div className="xp-chart-empty" style={{ padding: '20px', textAlign: 'center' }}>
          <p>No XP data available for the last 7 days.</p>
        </div>
      </ModernCard>
    )
  }

  const maxXP = Math.max(...chartData.map(d => d.xp), 1)
  const totalXP = chartData.reduce((sum, d) => sum + d.xp, 0)

  return (
    <ModernCard className="xp-chart-card">
      <div className="xp-chart-header">
        <div className="xp-chart-title">
          <TrendingUp size={18} />
          <span>XP Progress</span>
        </div>
        <div className="xp-chart-total">{totalXP} XP</div>
      </div>

      <div className="xp-chart-container">
        <svg className="xp-chart-svg" viewBox="0 0 300 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="xpGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Area chart */}
          <path
            className="xp-chart-area"
            d={`M 0,80 ${chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * 300
              const y = 80 - (d.xp / maxXP) * 70
              return `L ${x},${y}`
            }).join(' ')} L 300,80 Z`}
            fill="url(#xpGradient)"
          />
          
          {/* Line chart */}
          <path
            className="xp-chart-line"
            d={`M ${chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * 300
              const y = 80 - (d.xp / maxXP) * 70
              return `${x},${y}`
            }).join(' L ')}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * 300
            const y = 80 - (d.xp / maxXP) * 70
            return (
              <circle
                key={d.date}
                cx={x}
                cy={y}
                r="3"
                fill="hsl(var(--primary))"
                className="xp-chart-dot"
              />
            )
          })}
        </svg>
      </div>

      {/* Day labels */}
      <div className="xp-chart-labels">
        {chartData.map((d) => (
          <div key={d.date} className="xp-chart-label">
            <span className="xp-chart-label-day">{d.dayLabel}</span>
            <span className="xp-chart-label-value">{d.xp}</span>
          </div>
        ))}
      </div>
    </ModernCard>
  )
}

export default XPProgressChart

