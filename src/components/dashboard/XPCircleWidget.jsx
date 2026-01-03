import React from 'react'
import NeomorphicCard from './NeomorphicCard'
import './XPCircleWidget.css'

/**
 * XP Circle Widget - Hero element for dashboard
 * Large circular progress indicator showing XP and level
 */
const XPCircleWidget = ({ 
  currentXP = 0, 
  levelXP = 1000,
  level = 1,
  nextLevel = 2 
}) => {
  const progress = (currentXP / levelXP) * 100
  const circumference = 2 * Math.PI * 90 // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <NeomorphicCard size="xl" className="xp-circle-widget" elevated>
      <div className="xp-circle-container">
        {/* Background circle */}
        <svg className="xp-circle-svg" viewBox="0 0 200 200">
          {/* Outer glow effect */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#1a1a1d"
            strokeWidth="12"
            opacity="0.8"
          />
          
          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            filter="url(#glow)"
            className="xp-circle-progress"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-secondary)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="xp-circle-content">
          <div className="xp-level-badge">
            <span className="xp-level-label">Level</span>
            <span className="xp-level-number">{level}</span>
          </div>
          
          <div className="xp-progress-text">
            <span className="xp-current">{currentXP.toLocaleString()}</span>
            <span className="xp-separator">/</span>
            <span className="xp-total">{levelXP.toLocaleString()}</span>
          </div>
          
          <div className="xp-subtitle">XP to Level {nextLevel}</div>
        </div>

        {/* Rotating decorative dots */}
        <div className="xp-orbit-dots">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <div
              key={angle}
              className="xp-orbit-dot"
              style={{
                transform: `rotate(${angle}deg) translateX(110px)`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </NeomorphicCard>
  )
}

export default XPCircleWidget

