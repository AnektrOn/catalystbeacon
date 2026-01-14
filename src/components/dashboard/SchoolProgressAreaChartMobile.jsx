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
 * School Progress Area Chart - Mobile Version
 * Shows 3 days view and Week view only
 */
const SchoolProgressAreaChartMobile = ({ userId }) => {
  const [chartData, setChartData] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week') // '3days' or 'week'

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
          period === '3days' ? 'day' : period
        )

        if (result.error) {
          setChartData([])
          setCategories([])
        } else {
          let data = result.data || []
          
          // If 3days view, only show last 3 days
          if (period === '3days' && data.length > 3) {
            data = data.slice(-3)
          }

          
          // Verify data structure
          if (data.length > 0 && result.categories && result.categories.length > 0) {
            const firstPoint = data[0]
            const allKeys = Object.keys(firstPoint)
            const hasAllSchools = result.categories.every(cat => allKeys.includes(cat))
            
            
            if (!hasAllSchools) {
            }
          }

          setChartData(data)
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

  // Debug: Log current state - must be before any conditional returns
  const willRender = chartData && chartData.length > 0 && categories && categories.length > 0
  
  useEffect(() => {
    if (willRender && chartData[0]) {
    }
  }, [willRender, chartData, categories, loading])

  return (
    <ModernCard className="school-progress-chart" elevated>
      <div className="school-chart-header">
        <div>
          <h3 className="school-chart-title">Lessons by School</h3>
          {categories.length > 0 && (
            <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px', marginBottom: 0 }}>
              {categories.length} {categories.length === 1 ? 'school' : 'schools'} with completed lessons
            </p>
          )}
        </div>
        <div className="school-chart-period-selector">
          <button
            className={`period-btn ${period === '3days' ? 'active' : ''}`}
            onClick={() => setPeriod('3days')}
          >
            3 Days
          </button>
          <button
            className={`period-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
        </div>
      </div>
      <div className="school-chart-container" style={{ height: '250px', minHeight: '250px', width: '100%', position: 'relative', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
        {loading ? (
          <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading chart data...</p>
          </div>
        ) : chartData && chartData.length > 0 && categories && categories.length > 0 ? (
          <div style={{ width: '100%', height: '250px', position: 'relative', minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height={250} minWidth={0} minHeight={0}>
            <RechartsAreaChart
              data={chartData}
              margin={{ top: 10, right: 5, left: 0, bottom: 50 }}
            >
              <defs>
                {categories.map((schoolName, index) => {
                  const schoolColor = getSchoolColor(schoolName, index)
                    // Adjust gradient opacity based on number of schools
                    const topOpacity = categories.length > 10 ? 0.8 : 1
                    const bottomOpacity = categories.length > 10 ? 0.2 : 0.3
                    return (
                      <linearGradient
                        key={`gradient-${schoolName}-${index}`}
                        id={`mobile-color${index}`}
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
                angle={-45}
                textAnchor="end"
                height={50}
                tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontFamily: "'Cinzel', serif" }}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontSize: '12px', fontFamily: "'Cinzel', serif" }}
                width={30}
                tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontFamily: "'Cinzel', serif" }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              {categories.map((schoolName, index) => {
                const schoolColor = getSchoolColor(schoolName, index)
                // Adjust opacity and stroke width based on number of schools for better visibility
                const opacity = categories.length > 10 ? 0.6 : 0.8
                const strokeWidth = categories.length > 15 ? 1 : 1.5
                return (
                  <Area
                    key={schoolName}
                    type="monotone"
                    dataKey={schoolName}
                    stackId="1"
                    stroke={schoolColor}
                    fill={`url(#mobile-color${index})`}
                    strokeWidth={strokeWidth}
                    strokeOpacity={opacity}
                    fillOpacity={opacity}
                  />
                )
              })}
            </RechartsAreaChart>
          </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
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

export default SchoolProgressAreaChartMobile

