import React, { useState, useEffect } from 'react'
import ModernCard from './ModernCard'
import { Heart, Moon, AlertCircle, Plus, Edit2 } from 'lucide-react'
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
  const [todayEntry, setTodayEntry] = useState({
    mood: 5,
    sleep: 5,
    stress: 5
  })
  const [editingDate, setEditingDate] = useState(null)

  // Get last 31 days
  const getLast31Days = () => {
    const days = []
    const today = new Date()
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' })
      })
    }
    return days
  }

  const days = getLast31Days()

  useEffect(() => {
    if (!userId) return
    loadEntries()
  }, [userId])

  const loadEntries = async () => {
    try {
      setLoading(true)
      const thirtyOneDaysAgo = new Date()
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31)

      const { data, error } = await supabase
        .from('user_daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('date', thirtyOneDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error

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
      toast.error('Failed to load mood tracker data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEntry = async (date) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('user_daily_tracking')
        .upsert({
          user_id: userId,
          date: date,
          mood: todayEntry.mood,
          sleep: todayEntry.sleep,
          stress: todayEntry.stress,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        })

      if (error) throw error

      toast.success('Entry saved!')
      setShowInputModal(false)
      setEditingDate(null)
      loadEntries()
    } catch (error) {
      console.error('Error saving entry:', error)
      toast.error('Failed to save entry')
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
    setShowInputModal(true)
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const isToday = (date) => {
    return date === getTodayDate()
  }

  const getMaxValue = () => {
    let max = 1
    Object.values(entries).forEach(entry => {
      if (entry.mood) max = Math.max(max, entry.mood)
      if (entry.sleep) max = Math.max(max, entry.sleep)
      if (entry.stress) max = Math.max(max, entry.stress)
    })
    return Math.max(max, 5) // Minimum scale of 5
  }

  const maxValue = getMaxValue()
  const chartHeight = 120
  const chartTopPadding = 10

  const getYPosition = (value) => {
    if (!value) return null
    return chartHeight - chartTopPadding - ((value / 10) * (chartHeight - chartTopPadding * 2))
  }

  const getPathD = (metric, days) => {
    const points = days
      .map((day, i) => {
        const value = entries[day.date]?.[metric]
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
      <ModernCard className="mood-tracker-card">
        <div className="mood-tracker-header">
          <h3 className="mood-tracker-title">Daily Tracker</h3>
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

            {/* Data points */}
            {days.map((day, i) => {
              const entry = entries[day.date]
              if (!entry) return null

              const x = (i / (days.length - 1)) * 100

              return (
                <g key={day.date}>
                  {entry.mood && (
                    <circle
                      cx={x}
                      cy={getYPosition(entry.mood)}
                      r="1.5"
                      className="mood-tracker-dot mood-tracker-dot-mood"
                    />
                  )}
                  {entry.sleep && (
                    <circle
                      cx={x}
                      cy={getYPosition(entry.sleep)}
                      r="2"
                      className="mood-tracker-dot mood-tracker-dot-sleep"
                    />
                  )}
                  {entry.stress && (
                    <circle
                      cx={x}
                      cy={getYPosition(entry.stress)}
                      r="1.5"
                      className="mood-tracker-dot mood-tracker-dot-stress"
                    />
                  )}
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

      {/* Input Modal */}
      {showInputModal && (
        <div className="mood-tracker-modal-overlay" onClick={() => setShowInputModal(false)}>
          <div className="mood-tracker-modal" onClick={(e) => e.stopPropagation()}>
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

