import React, { useEffect, useState } from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import ModernCard from './ModernCard'
import lessonProgressService from '../../services/lessonProgressService'
import './SchoolProgressAreaChart.css'

/**
 * School Progress Area Chart - Desktop Version
 * Shows Day, Week, and Month views
 */
const SchoolProgressAreaChartDesktop = ({ userId }) => {
  const [chartData, setChartData] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month') // 'day', 'week', or 'month'

  // Color mapping for each school
  const schoolColors = {
    'Institute of Applied Sovereignty': '#8B5CF6',
    'Institute of Behavioral Design': '#10B981',
    'Institute of Cognitive Defense': '#3B82F6',
    'Institute of Economic Architecture': '#F59E0B',
    'Institute of Emotional Integration': '#EC4899',
    'Institute of Energetic Anatomy': '#14B8A6',
    'Institute of Historical Deconstruction': '#EF4444',
    'Institute of Quantum Mechanics': '#6366F1',
    'Institute of Reality Engineering': '#F97316',
    'Institute of Systemic Analysis': '#06B6D4'
  }

  // Expanded color palette to handle many schools (30+ distinct colors)
  const fallbackColors = [
    '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EC4899',
    '#14B8A6', '#EF4444', '#6366F1', '#F97316', '#06B6D4',
    '#0c6d62', '#12a594', '#10b3a3', '#0b544a', '#14c9a8',
    '#0d8a7a', '#16d4b8', '#0a4d45', '#18e5c7', '#0f7a6d',
    '#9333EA', '#059669', '#0284C7', '#D97706', '#DB2777',
    '#0D9488', '#DC2626', '#4F46E5', '#EA580C', '#0891B2',
    '#7C3AED', '#047857', '#0369A1', '#B45309', '#BE185D',
    '#115E59', '#991B1B', '#4338CA', '#C2410C', '#0E7490'
  ]

  // Generate color based on school name hash for consistency
  const getSchoolColor = (schoolName, index) => {
    // First check if it's in the predefined colors
    if (schoolColors[schoolName]) {
      return schoolColors[schoolName]
    }
    
    // Use index-based color from expanded palette
    return fallbackColors[index % fallbackColors.length]
  }

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      setLoading(true)
      try {
        const result = await lessonProgressService.getCompletedLessonsBySchool(
          userId,
          period
        )

        if (result.error) {
          setChartData([])
          setCategories([])
        } else {
          setChartData(result.data || [])
          setCategories(result.categories || [])
        }
      } catch (err) {
        setChartData([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId, period])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="school-chart-tooltip">
          <p className="school-chart-tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              <strong>{entry.name}</strong>: {entry.value} {entry.value === 1 ? 'lesson' : 'lessons'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ModernCard className="school-progress-chart" elevated>
      <div className="school-chart-header">
        <div>
          <h3 className="school-chart-title">Lessons Completed by School</h3>
          {categories.length > 0 && (
            <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px', marginBottom: 0 }}>
              {categories.length} {categories.length === 1 ? 'school' : 'schools'} with completed lessons
            </p>
          )}
        </div>
        <div className="school-chart-period-selector">
          <button
            className={`period-btn ${period === 'day' ? 'active' : ''}`}
            onClick={() => setPeriod('day')}
          >
            Day
          </button>
          <button
            className={`period-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button
            className={`period-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
        </div>
      </div>
      <div className="school-chart-container" style={{ height: '320px', minHeight: '320px', width: '100%', position: 'relative', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
        {loading ? (
          <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading chart data...</p>
          </div>
        ) : chartData && chartData.length > 0 && categories && categories.length > 0 ? (
          <div style={{ width: '100%', height: '320px', position: 'relative', minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height={320}>
            <RechartsAreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
            >
              <defs>
                {categories.map((schoolName, index) => {
                  const schoolColor = getSchoolColor(schoolName, index)
                  // Adjust gradient opacity based on number of schools
                  const topOpacity = categories.length > 10 ? 0.8 : 1
                  const bottomOpacity = categories.length > 10 ? 0.2 : 0.3
                  return (
                    <linearGradient
                      key={schoolName}
                      id={`desktop-color${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={schoolColor} stopOpacity={topOpacity} />
                      <stop offset="95%" stopColor={schoolColor} stopOpacity={bottomOpacity} />
                    </linearGradient>
                  )
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" opacity={0.5} />
              <XAxis
                dataKey="Period"
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontSize: '12px', fontFamily: "'Cinzel', serif" }}
                angle={period === 'day' ? -45 : 0}
                textAnchor={period === 'day' ? 'end' : 'middle'}
                height={period === 'day' ? 60 : 30}
                tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontFamily: "'Cinzel', serif" }}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontSize: '12px', fontFamily: "'Cinzel', serif" }}
                width={40}
                tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontFamily: "'Cinzel', serif" }}
              />
              <Tooltip content={<CustomTooltip />} />
              {categories.map((schoolName, index) => {
                const schoolColor = getSchoolColor(schoolName, index)
                // Adjust opacity and stroke width based on number of schools for better visibility
                const opacity = categories.length > 10 ? 0.7 : 0.9
                const strokeWidth = categories.length > 15 ? 2 : 2.5
                return (
                  <Area
                    key={schoolName}
                    type="monotone"
                    dataKey={schoolName}
                    stackId="1"
                    stroke={schoolColor}
                    fill={`url(#desktop-color${index})`}
                    strokeWidth={strokeWidth}
                    strokeOpacity={1}
                    fillOpacity={opacity}
                  />
                )
              })}
            </RechartsAreaChart>
          </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <p style={{ marginBottom: '8px' }}>No completed lessons yet</p>
            <p style={{ fontSize: '12px', opacity: 0.7, textAlign: 'center' }}>
              Complete lessons to see your progress by school
            </p>
          </div>
        )}
      </div>
    </ModernCard>
  )
}

export default SchoolProgressAreaChartDesktop

