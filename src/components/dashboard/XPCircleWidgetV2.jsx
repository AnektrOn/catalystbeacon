import React from 'react'
import ModernCard from './ModernCard'
import { Award, TrendingUp } from 'lucide-react'
import './XPCircleWidgetV2.css'

/**
 * XP Circle Widget - Hero element inspired by thermostat design
 * Large circular progress gauge with center content
 */
const XPCircleWidgetV2 = ({ 
  currentXP = 0, 
  levelXP = 1000,
  level = 1,
  nextLevel = 2,
  isActive = true
}) => {
  // Calculate progress for the circle
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(currentXP / levelXP, 0), 1)
  const strokeDashoffset = circumference - progress * circumference

  return (
    <ModernCard className="xp-circle-widget-v2" elevated>
      {/* Header */}
      <div className="xp-widget-header">
        <div>
          <h2 className="xp-widget-title">Level {level}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span 
              className={`xp-status-dot ${isActive ? 'xp-status-dot-active' : 'xp-status-dot-inactive'}`}
            />
            <p className="xp-widget-subtitle">Experience Points</p>
          </div>
        </div>
      </div>

      {/* Central Circle Visualization */}
      <div className="xp-circle-container">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth="20"
              fill="transparent"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="hsl(var(--primary))"
              strokeWidth="20"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ease-out ${
                isActive ? 'opacity-100' : 'opacity-20 grayscale'
              }`}
              style={{ 
                filter: isActive 
                  ? `drop-shadow(0 0 6px hsl(var(--primary) / 0.4))` 
                  : 'none' 
              }}
            />
          </svg>

          {/* Center content */}
          <div className="xp-circle-center">
            <div className="flex items-start transform translate-x-2">
              <span 
                className={`text-6xl font-bold tracking-tighter transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-gray-600'
                }`}
              >
                {currentXP.toLocaleString()}
              </span>
              <span 
                className={`text-2xl mt-1 font-medium ${
                  isActive ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                XP
              </span>
            </div>
            <div 
              className={`xp-status-badge ${isActive ? 'xp-status-active' : 'xp-status-inactive'}`}
            >
              {isActive ? (
                <>
                  <Award size={12} />
                  <span>Level {nextLevel}</span>
                </>
              ) : (
                <span>Off</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress info */}
      <div className="xp-widget-footer">
        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
          <span>0</span>
          <span>{levelXP.toLocaleString()}</span>
        </div>
      </div>
    </ModernCard>
  )
}

export default XPCircleWidgetV2

