import React, { useEffect, useState } from 'react'
import ModernCard from './ModernCard'
import { BookOpen, RefreshCw } from 'lucide-react'
import lessonsService from '../../services/lessonsService'
import './AllLessonsCard.css'

/**
 * All Lessons Card - Displays all available lessons in realtime
 */
const AllLessonsCard = () => {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true)
        const result = await lessonsService.getAllLessons()
        
        if (result.error) {
          setError(result.error.message)
        } else {
          setLessons(result.data || [])
          setLastUpdate(new Date())
          setError(null)
        }
      } catch (err) {
        console.error('Error loading lessons:', err)
        setError('Failed to load lessons')
      } finally {
        setLoading(false)
      }
    }

    loadLessons()

    // Subscribe to realtime updates
    const unsubscribe = lessonsService.subscribeToLessons((payload) => {
      console.log('Lessons update:', payload)
      loadLessons() // Reload on any change
    })

    // Refresh every 30 seconds as fallback
    const interval = setInterval(loadLessons, 30000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const result = await lessonsService.getAllLessons()
      if (result.error) {
        setError(result.error.message)
      } else {
        setLessons(result.data || [])
        setLastUpdate(new Date())
        setError(null)
      }
    } catch (err) {
      console.error('Error refreshing lessons:', err)
      setError('Failed to refresh lessons')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModernCard className="all-lessons-card" elevated>
      <div className="all-lessons-header">
        <div className="all-lessons-title-section">
          <BookOpen size={20} />
          <h3 className="all-lessons-title">All Available Lessons</h3>
        </div>
        <button
          className="all-lessons-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh lessons"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {loading && lessons.length === 0 ? (
        <div className="all-lessons-loading">
          <p>Loading lessons...</p>
        </div>
      ) : error ? (
        <div className="all-lessons-error">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="all-lessons-stats">
            <div className="all-lessons-stat">
              <span className="all-lessons-stat-value">{lessons.length}</span>
              <span className="all-lessons-stat-label">Total Lessons</span>
            </div>
            <div className="all-lessons-stat">
              <span className="all-lessons-stat-value">
                {new Set(lessons.map(l => l.course_id)).size}
              </span>
              <span className="all-lessons-stat-label">Courses</span>
            </div>
            <div className="all-lessons-stat">
              <span className="all-lessons-stat-value">
                {new Set(lessons.map(l => l.school_name)).size}
              </span>
              <span className="all-lessons-stat-label">Schools</span>
            </div>
          </div>

          <div className="all-lessons-list">
            {lessons.slice(0, 10).map((lesson, index) => (
              <div key={`${lesson.course_id}-${lesson.chapter_number}-${lesson.lesson_number}`} className="all-lessons-item">
                <div className="all-lessons-item-number">{index + 1}</div>
                <div className="all-lessons-item-content">
                  <div className="all-lessons-item-title">{lesson.lesson_title}</div>
                  <div className="all-lessons-item-meta">
                    <span>{lesson.course_title}</span>
                    <span>•</span>
                    <span>{lesson.school_name}</span>
                  </div>
                </div>
              </div>
            ))}
            {lessons.length > 10 && (
              <div className="all-lessons-more">
                +{lessons.length - 10} more lessons
              </div>
            )}
          </div>

          <div className="all-lessons-footer">
            <span className="all-lessons-update-time">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </>
      )}
    </ModernCard>
  )
}

export default AllLessonsCard

