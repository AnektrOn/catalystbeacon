import React from 'react'
import NeomorphicCard from './NeomorphicCard'
import { Flame } from 'lucide-react'
import './StreakCard.css'

/**
 * Streak Card - Shows daily streak count
 * Small card with fire icon and streak number
 */
const StreakCard = ({ streak = 0, record = 0 }) => {
  return (
    <NeomorphicCard size="small" className="streak-card">
      <div className="streak-content">
        {/* Fire icon */}
        <div className="streak-icon-container">
          <Flame 
            className="streak-icon" 
            size={32}
            strokeWidth={2}
          />
          {streak > 0 && (
            <div className="streak-glow" />
          )}
        </div>

        {/* Streak number */}
        <div className="streak-info">
          <div className="streak-number">{streak}</div>
          <div className="streak-label">Day Streak</div>
        </div>

        {/* Record indicator */}
        {record > 0 && (
          <div className="streak-record">
            <span className="streak-record-label">Record:</span>
            <span className="streak-record-number">{record}</span>
          </div>
        )}
      </div>
    </NeomorphicCard>
  )
}

export default StreakCard

