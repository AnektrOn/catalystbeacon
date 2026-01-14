import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Dot
} from 'recharts'
import ModernCard from './ModernCard'
import { Heart, Moon, AlertCircle, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { getLocalDateString, getFirstDayOfMonth, getLastDayOfMonth, isToday } from '../../utils/dateUtils'
import './MoodTracker.css'

/**
 * Daily Tracker - Premium Ethereal Chart
 * Tracks mood, sleep, and stress (1-10 scale) daily using Recharts
 */
const MoodTracker = ({ userId }) => {
  const [entries, setEntries] = useState({})
  const [loading, setLoading] = useState(true)
  const [showInputModal, setShowInputModal] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const cardRef = useRef(null)
  const [todayEntry, setTodayEntry] = useState({
    mood: 5,
    sleep: 5,
    stress: 5
  })
  const [editingDate, setEditingDate] = useState(null)

  // Get current month days
  const getCurrentMonthDays = () => {
    const days = []
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    // Get first day of current month
    const firstDay = new Date(currentYear, currentMonth, 1)
    // Get last day of current month
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    
    // Create array of all days in current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day)
      days.push({
        date: getLocalDateString(date),
        day: day,
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' })
      })
    }
    
    return days
  }

  const days = getCurrentMonthDays()

  // Transform data for Recharts
  const chartData = days.map(day => {
    const entry = entries[day.date]
    return {
      day: day.day,
      dayLabel: day.dayLabel,
      date: day.date,
      mood: entry?.mood ?? null,
      sleep: entry?.sleep ?? null,
      stress: entry?.stress ?? null
    }
  })

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true)
      
      // Verify user is authenticated - RLS requires auth.uid() to match user_id
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`)
      }
      
      if (!session?.user) {
        setEntries({})
        setLoading(false)
        return
      }
      
      // Use authenticated user ID to ensure RLS policy matches
      const authenticatedUserId = session.user.id
      
      // Verify userId prop matches authenticated user (for security)
      if (userId && userId !== authenticatedUserId) {
        // Still proceed with authenticated user ID for RLS compliance
      }
      
      // Get current month date range using local timezone
      const firstDayOfMonthStr = getFirstDayOfMonth()
      const lastDayOfMonthStr = getLastDayOfMonth()

      const { data, error } = await supabase
        .from('user_daily_tracking')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .gte('date', firstDayOfMonthStr)
        .lte('date', lastDayOfMonthStr)
        .order('date', { ascending: true })

      if (error) {
        throw error
      }

      // Create a map for quick lookup
      const entriesMap = {}
      data?.forEach(entry => {
        entriesMap[entry.date] = {
          mood: entry.mood || null,
          sleep: entry.sleep || null,
          stress: entry.stress || null
        }
      })

      setEntries(entriesMap)
    } catch (error) {
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load mood tracker data'
      if (error?.code === 'PGRST301' || error?.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.'
      } else if (error?.code === '42501' || error?.message?.includes('permission')) {
        errorMessage = 'Permission denied. Please refresh the page.'
      } else if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        errorMessage = 'Mood tracker table not found. Please contact support.'
      } else if (error?.message) {
        errorMessage = `Failed to load: ${error.message}`
      }
      
      toast.error(errorMessage)
      setEntries({}) // Set empty entries on error to prevent UI issues
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    loadEntries()
  }, [userId, loadEntries])

  const handleSaveEntry = async (date) => {
    try {
      // Verify user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        toast.error('Please sign in to save entries')
        return
      }
      
      const authenticatedUserId = session.user.id

      const { error } = await supabase
        .from('user_daily_tracking')
        .upsert({
          user_id: authenticatedUserId,
          date: date,
          mood: todayEntry.mood,
          sleep: todayEntry.sleep,
          stress: todayEntry.stress,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        })

      if (error) {
        throw error
      }

      toast.success('Entry saved!')
      setShowInputModal(false)
      setEditingDate(null)
      loadEntries()
    } catch (error) {
      let errorMessage = 'Failed to save entry'
      if (error?.message) {
        errorMessage = `Failed to save: ${error.message}`
      }
      toast.error(errorMessage)
    }
  }

  const handleDayClick = (day) => {
    const existingEntry = entries[day.date]
    if (existingEntry) {
      setTodayEntry({
        mood: existingEntry.mood || 5,
        sleep: existingEntry.sleep || 5,
        stress: existingEntry.stress || 5
      })
      setEditingDate(day.date)
    } else {
      setTodayEntry({ mood: 5, sleep: 5, stress: 5 })
      setEditingDate(day.date)
    }
    
    // Calculate modal position relative to card (for desktop)
    if (cardRef.current && window.innerWidth > 768) {
      const rect = cardRef.current.getBoundingClientRect()
      const modalHeight = 400 // Approximate modal height
      const modalWidth = 400
      
      // Position modal above the card, centered horizontally
      const top = rect.top - modalHeight - 16
      const left = rect.left + (rect.width / 2) - (modalWidth / 2)
      
      setModalPosition({ 
        top: Math.max(16, top), 
        left: Math.max(16, Math.min(left, window.innerWidth - modalWidth - 16))
      })
    } else {
      // Mobile: center on screen
      setModalPosition({ top: 0, left: 0 })
    }
    
    setShowInputModal(true)
  }

  const getTodayDate = () => {
    return getLocalDateString()
  }

  // Custom dot component - only show for entries with data
  const CustomDot = (props) => {
    const { cx, cy, payload, dataKey } = props
    const value = payload[dataKey]
    
    // Only show dot if value exists
    if (value === null || value === undefined) {
      return null
    }
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={props.stroke}
        stroke="#fff"
        strokeWidth={2}
      />
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="mood-tracker-tooltip">
          <p className="mood-tracker-tooltip-label">Day {label}</p>
          {payload.map((entry, index) => {
            if (entry.value === null || entry.value === undefined) return null
            return (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <ModernCard className="mood-tracker-card">
        <div className="mood-tracker-loading" style={{ color: 'var(--ethereal-text)' }}>Loading mood tracker...</div>
      </ModernCard>
    )
  }

  return (
    <>
      <div ref={cardRef} className="mood-tracker-wrapper">
        <ModernCard className="mood-tracker-card">
          {/* Header */}
          <div className="mood-tracker-header">
            <h3 className="mood-tracker-title">
              DAILY TRACKER
            </h3>
            <div className="mood-tracker-legend">
              <div className="mood-tracker-legend-item">
                <div className="mood-tracker-legend-line mood-tracker-line-mood"></div>
                <Heart size={12} />
                <span>Mood</span>
              </div>
              <div className="mood-tracker-legend-item">
                <div className="mood-tracker-legend-line mood-tracker-line-sleep"></div>
                <Moon size={12} />
                <span>Sleep</span>
              </div>
              <div className="mood-tracker-legend-item">
                <div className="mood-tracker-legend-line mood-tracker-line-stress"></div>
                <AlertCircle size={12} />
                <span>Stress</span>
              </div>
            </div>
            <button
              className="mood-tracker-add-btn"
              onClick={() => handleDayClick({ date: getTodayDate() })}
              aria-label="Add today's entry"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Chart Area */}
          <div className="mood-tracker-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid 
                  vertical={false} 
                  stroke="var(--ethereal-border)" 
                  strokeOpacity={0.2} 
                />
                <XAxis
                  dataKey="day"
                  stroke="var(--ethereal-text)"
                  tick={{ 
                    fontSize: 12, 
                    fontFamily: "'Cinzel', serif", 
                    fill: 'var(--ethereal-text)',
                    opacity: 0.7
                  }}
                  style={{ 
                    fontSize: '12px', 
                    fontFamily: "'Cinzel', serif" 
                  }}
                />
                <YAxis
                  domain={[0, 10]}
                  stroke="var(--ethereal-text)"
                  tick={{ 
                    fontSize: 12, 
                    fontFamily: "'Cinzel', serif", 
                    fill: 'var(--ethereal-text)',
                    opacity: 0.7
                  }}
                  style={{ 
                    fontSize: '12px', 
                    fontFamily: "'Cinzel', serif" 
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  strokeDasharray="2 2"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  strokeDasharray="4 2"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>
      </div>

      {/* Input Modal */}
      {showInputModal && createPortal(
        <div className="mood-tracker-modal-overlay" onClick={() => setShowInputModal(false)}>
          <div 
            className="mood-tracker-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mood-tracker-modal-header">
              <h3>
                {isToday(editingDate) ? "Today's Entry" : new Date(editingDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              <button
                className="mood-tracker-modal-close"
                onClick={() => setShowInputModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mood-tracker-modal-content">
              {/* Mood */}
              <div className="mood-tracker-input-group">
                <label className="mood-tracker-input-label">
                  <Heart size={16} />
                  <span>Mood</span>
                </label>
                <div className="mood-tracker-slider-container">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={todayEntry.mood}
                    onChange={(e) => setTodayEntry({ ...todayEntry, mood: parseInt(e.target.value) })}
                    className="mood-tracker-slider mood-tracker-slider-mood"
                  />
                  <span className="mood-tracker-value">{todayEntry.mood}</span>
                </div>
              </div>

              {/* Sleep */}
              <div className="mood-tracker-input-group">
                <label className="mood-tracker-input-label">
                  <Moon size={16} />
                  <span>Sleep</span>
                </label>
                <div className="mood-tracker-slider-container">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={todayEntry.sleep}
                    onChange={(e) => setTodayEntry({ ...todayEntry, sleep: parseInt(e.target.value) })}
                    className="mood-tracker-slider mood-tracker-slider-sleep"
                  />
                  <span className="mood-tracker-value">{todayEntry.sleep}</span>
                </div>
              </div>

              {/* Stress */}
              <div className="mood-tracker-input-group">
                <label className="mood-tracker-input-label">
                  <AlertCircle size={16} />
                  <span>Stress</span>
                </label>
                <div className="mood-tracker-slider-container">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={todayEntry.stress}
                    onChange={(e) => setTodayEntry({ ...todayEntry, stress: parseInt(e.target.value) })}
                    className="mood-tracker-slider mood-tracker-slider-stress"
                  />
                  <span className="mood-tracker-value">{todayEntry.stress}</span>
                </div>
              </div>
            </div>

            <div className="mood-tracker-modal-actions">
              <button
                className="mood-tracker-save-btn"
                onClick={() => handleSaveEntry(editingDate)}
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default MoodTracker
