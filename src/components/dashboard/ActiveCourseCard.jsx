import React from 'react'
import NeomorphicCard from './NeomorphicCard'
import { Play, Clock, BookOpen } from 'lucide-react'
import './ActiveCourseCard.css'

/**
 * Active Course Card - Shows current course with image and progress
 * Medium-large card with hero image (like sunset photos in inspiration)
 */
const ActiveCourseCard = ({ 
  title = "Course Title",
  image = "/placeholder-course.jpg",
  progress = 0,
  lessonsCompleted = 0,
  totalLessons = 0,
  timeRemaining = "30 min",
  onClick
}) => {
  return (
    <NeomorphicCard 
      size="large" 
      className="active-course-card" 
      interactive 
      elevated
      onClick={onClick}
    >
      {/* Course image */}
      <div className="course-image-container">
        <img 
          src={image} 
          alt={title}
          className="course-image"
        />
        <div className="course-image-overlay" />
        
        {/* Play button overlay */}
        <button className="course-play-button">
          <Play size={24} fill="currentColor" />
        </button>
      </div>

      {/* Course info */}
      <div className="course-info">
        <h3 className="course-title">{title}</h3>
        
        {/* Stats row */}
        <div className="course-stats">
          <div className="course-stat">
            <BookOpen size={14} />
            <span>{lessonsCompleted}/{totalLessons} lessons</span>
          </div>
          <div className="course-stat">
            <Clock size={14} />
            <span>{timeRemaining}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="course-progress-container">
          <div className="course-progress-bar">
            <div 
              className="course-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="course-progress-text">{progress}%</span>
        </div>

        {/* Continue button */}
        <button className="course-continue-button">
          Continue Learning
        </button>
      </div>
    </NeomorphicCard>
  )
}

export default ActiveCourseCard

