import React, { useEffect, useState } from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import ModernCard from './ModernCard'
import lessonProgressService from '../../services/lessonProgressService'
import './SchoolProgressAreaChart.css'

/**
 * School Progress Area Chart
 * Displays completed lessons over time grouped by school_name
 */
const SchoolProgressAreaChart = ({ userId }) => {
  const [chartData, setChartData] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month') // 'month', 'week', or 'day'
  const [chartHeight, setChartHeight] = useState(320)

  // Color mapping for each school - distinct colors for better differentiation
  const schoolColors = {
    'Institute of Applied Sovereignty': '#8B5CF6',      // Purple
    'Institute of Behavioral Design': '#10B981',        // Emerald
    'Institute of Cognitive Defense': '#3B82F6',       // Blue
    'Institute of Economic Architecture': '#F59E0B',   // Amber
    'Institute of Emotional Integration': '#EC4899',   // Pink
    'Institute of Energetic Anatomy': '#14B8A6',       // Teal
    'Institute of Historical Deconstruction': '#EF4444', // Red
    'Institute of Quantum Mechanics': '#6366F1',       // Indigo
    'Institute of Reality Engineering': '#F97316',     // Orange
    'Institute of Systemic Analysis': '#06B6D4'       // Cyan
  }

  // Fallback colors if school name doesn't match
  const fallbackColors = [
    '#0c6d62',
    '#12a594',
    '#10b3a3',
    '#0b544a',
    '#14c9a8',
    '#0d8a7a',
    '#16d4b8',
    '#0a4d45',
    '#18e5c7',
    '#0f7a6d'
  ]

  // Get color for a school name
  const getSchoolColor = (schoolName, index) => {
    return schoolColors[schoolName] || fallbackColors[index % fallbackColors.length]
  }

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Set chart height based on screen size
    const updateChartHeight = () => {
      setChartHeight(window.innerWidth <= 768 ? 250 : 320)
    }
    
    updateChartHeight()
    window.addEventListener('resize', updateChartHeight)

    const loadData = async () => {
      setLoading(true)
      try {
        const result = await lessonProgressService.getCompletedLessonsBySchool(
          userId,
          period
        )

        if (result.error) {
          console.error('Error loading chart data:', result.error)
          setChartData([])
          setCategories([])
        } else {
          console.log('Chart data loaded:', { 
            dataPoints: result.data?.length || 0, 
            categories: result.categories?.length || 0,
            sampleData: result.data?.[0]
          })
          setChartData(result.data || [])
          setCategories(result.categories || [])
        }
      } catch (err) {
        console.error('Error in loadData:', err)
        setChartData([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
    
    return () => {
      window.removeEventListener('resize', updateChartHeight)
    }
  }, [userId, period])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="school-chart-tooltip">
          <p className="school-chart-tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} lessons`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <ModernCard className="school-progress-chart" elevated>
        <div className="school-chart-header">
          <h3 className="school-chart-title">Lessons Completed by School</h3>
        </div>
        <div className="school-chart-loading">
          <p>Loading chart data...</p>
        </div>
      </ModernCard>
    )
  }

  if (!chartData || chartData.length === 0 || !categories || categories.length === 0) {
    return (
      <ModernCard className="school-progress-chart" elevated>
        <div className="school-chart-header">
          <h3 className="school-chart-title">Lessons Completed by School</h3>
        </div>
        <div className="school-chart-empty">
          <p>No completed lessons yet. Start learning to see your progress!</p>
        </div>
      </ModernCard>
    )
  }

  return (
    <ModernCard className="school-progress-chart" elevated>
      <div className="school-chart-header">
        <h3 className="school-chart-title">Lessons Completed by School</h3>
        <div className="school-chart-period-selector">
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
      <div className="school-chart-container" style={{ height: `${chartHeight}px`, minHeight: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <RechartsAreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
          >
            <defs>
              {categories.map((schoolName, index) => {
                const schoolColor = getSchoolColor(schoolName, index)
                return (
                  <linearGradient
                    key={schoolName}
                    id={`color${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={schoolColor}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={schoolColor}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                )
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="Period"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              verticalAlign="top"
              height={36}
            />
            {categories.map((schoolName, index) => {
              const schoolColor = getSchoolColor(schoolName, index)
              return (
                <Area
                  key={schoolName}
                  type="monotone"
                  dataKey={schoolName}
                  stackId="1"
                  stroke={schoolColor}
                  fill={`url(#color${index})`}
                  strokeWidth={2}
                />
              )
            })}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </ModernCard>
  )
}

export default SchoolProgressAreaChart

