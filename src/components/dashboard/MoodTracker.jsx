import React, { useState, useEffect, useRef, useCallback } from 'react'
import ModernCard from './ModernCard'
import { Heart, Moon, AlertCircle, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'
import './MoodTracker.css'

/**
 * Mood Tracker - Bullet journal style chart
 * Tracks mood, sleep, and stress (1-10 scale) daily
 */
const MoodTracker = ({ userId }) => {
  const [entries, setEntries] = useState([])
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
        date: date.toISOString().split('T')[0],
        day: day,
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' })
      })
    }
    
    return days
  }

  const days = getCurrentMonthDays()

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true)
      
      // Verify user is authenticated - RLS requires auth.uid() to match user_id
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error(`Authentication error: ${sessionError.message}`)
      }
      
      if (!session?.user) {
        console.warn('No authenticated session found')
        setEntries({})
        setLoading(false)
        return
      }
      
      // Use authenticated user ID to ensure RLS policy matches
      const authenticatedUserId = session.user.id
      
      // Verify userId prop matches authenticated user (for security)
      if (userId && userId !== authenticatedUserId) {
        console.warn('userId prop does not match authenticated user ID')
        // Still proceed with authenticated user ID for RLS compliance
      }
      
      // Get current month date range
      const today = new Date()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)

      const { data, error } = await supabase
        .from('user_daily_tracking')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .gte('date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('date', lastDayOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) {
        console.error('Supabase query error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
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
      console.error('Error loading mood tracker entries:', error)
      
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
        console.error('Error saving entry:', {
          message: error.message,
          code: error.code,
          details: error.details
        })
        throw error
      }

      toast.success('Entry saved!')
      setShowInputModal(false)
      setEditingDate(null)
      loadEntries()
    } catch (error) {
      console.error('Error saving entry:', error)
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
    return new Date().toISOString().split('T')[0]
  }

  const isToday = (date) => {
    return date === getTodayDate()
  }

  const chartHeight = 120
  const chartTopPadding = 10

  const getYPosition = (value) => {
    if (!value) return null
    return chartHeight - chartTopPadding - ((value / 10) * (chartHeight - chartTopPadding * 2))
  }

  const getPathD = (metric, days) => {
    const points = days
      .map((day, i) => {
        const entry = entries[day.date]
        // If entry exists, use the metric value or default to 5
        const value = entry ? (entry[metric] !== null && entry[metric] !== undefined ? entry[metric] : 5) : null
        if (value === null || value === undefined) return null
        const x = (i / (days.length - 1)) * 100
        const y = getYPosition(value)
        return y !== null ? { x, y } : null
      })
      .filter(p => p !== null)

    if (points.length === 0) return ''
    const firstPoint = points[0]
    const restPoints = points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')
    return `M ${firstPoint.x},${firstPoint.y} ${restPoints}`
  }

  if (loading) {
    return (
      <ModernCard className="mood-tracker-card">
        <div className="mood-tracker-loading">Loading mood tracker...</div>
      </ModernCard>
    )
  }

  return (
    <>
      <div ref={cardRef}>
        <ModernCard className="mood-tracker-card">
        <div className="mood-tracker-header">
          <h3 className="mood-tracker-title">
            Daily Tracker - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            className="mood-tracker-add-btn"
            onClick={() => handleDayClick({ date: getTodayDate() })}
            aria-label="Add today's entry"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Legend */}
        <div className="mood-tracker-legend">
          <div className="mood-tracker-legend-item">
            <div className="mood-tracker-legend-line mood-tracker-line-mood"></div>
            <Heart size={14} />
            <span>Mood</span>
          </div>
          <div className="mood-tracker-legend-item">
            <div className="mood-tracker-legend-line mood-tracker-line-sleep"></div>
            <Moon size={14} />
            <span>Sleep</span>
          </div>
          <div className="mood-tracker-legend-item">
            <div className="mood-tracker-legend-line mood-tracker-line-stress"></div>
            <AlertCircle size={14} />
            <span>Stress</span>
          </div>
        </div>

        {/* Chart */}
        <div className="mood-tracker-chart-container">
          <svg className="mood-tracker-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => {
              const y = getYPosition(level)
              if (y === null) return null
              return (
                <line
                  key={level}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  className="mood-tracker-grid-line"
                />
              )
            })}

            {/* Mood line (dotted) */}
            <path
              d={getPathD('mood', days)}
              className="mood-tracker-line mood-tracker-line-mood"
              fill="none"
              strokeWidth="1.5"
            />

            {/* Sleep line (solid) */}
            <path
              d={getPathD('sleep', days)}
              className="mood-tracker-line mood-tracker-line-sleep"
              fill="none"
              strokeWidth="2"
            />

            {/* Stress line (dashed) */}
            <path
              d={getPathD('stress', days)}
              className="mood-tracker-line mood-tracker-line-stress"
              fill="none"
              strokeWidth="1.5"
            />

            {/* Data points - always show all 3 dots if entry exists */}
            {days.map((day, i) => {
              const entry = entries[day.date]
              if (!entry) return null

              const x = (i / (days.length - 1)) * 100

              return (
                <g key={day.date}>
                  {/* Mood dot - always show if entry exists */}
                  <circle
                    cx={x}
                    cy={getYPosition(entry.mood || 5)}
                    r="2"
                    className="mood-tracker-dot mood-tracker-dot-mood"
                  />
                  {/* Sleep dot - always show if entry exists */}
                  <circle
                    cx={x}
                    cy={getYPosition(entry.sleep || 5)}
                    r="2"
                    className="mood-tracker-dot mood-tracker-dot-sleep"
                  />
                  {/* Stress dot - always show if entry exists */}
                  <circle
                    cx={x}
                    cy={getYPosition(entry.stress || 5)}
                    r="2"
                    className="mood-tracker-dot mood-tracker-dot-stress"
                  />
                </g>
              )
            })}
          </svg>
        </div>

        {/* Day labels */}
        <div className="mood-tracker-days">
          {days.map((day, i) => {
            const entry = entries[day.date]
            const hasEntry = entry && (entry.mood || entry.sleep || entry.stress)
            const today = isToday(day.date)

            return (
              <button
                key={day.date}
                className={`mood-tracker-day ${today ? 'mood-tracker-day-today' : ''} ${hasEntry ? 'mood-tracker-day-has-entry' : ''}`}
                onClick={() => handleDayClick(day)}
                aria-label={`${day.dayLabel} ${day.day}`}
              >
                <span className="mood-tracker-day-number">{day.day}</span>
                {hasEntry && <span className="mood-tracker-day-dot"></span>}
              </button>
            )
          })}
        </div>

        {/* Scale labels */}
        <div className="mood-tracker-scale">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </ModernCard>
      </div>

      {/* Input Modal */}
      {showInputModal && (
        <div className="mood-tracker-modal-overlay" onClick={() => setShowInputModal(false)}>
          <div 
            className="mood-tracker-modal" 
            onClick={(e) => e.stopPropagation()}
            style={window.innerWidth > 768 && modalPosition.top > 0 ? {
              position: 'absolute',
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              transform: 'none',
              margin: 0
            } : {}}
          >
            <div className="mood-tracker-modal-header">
              <h3>
                {editingDate === getTodayDate() ? "Today's Entry" : new Date(editingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
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
        </div>
      )}
    </>
  )
}

export default MoodTracker

