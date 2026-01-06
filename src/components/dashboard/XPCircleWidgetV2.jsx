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
  levelTitle = '',
  isActive = true
}) => {
  // Force a stable visual format (avoid locale spaces that look like line breaks)
  const xpText = new Intl.NumberFormat('en-US').format(currentXP ?? 0)
  const xpDigits = xpText.replace(/[^0-9]/g, '').length
  const nextXpText = new Intl.NumberFormat('en-US').format(levelXP ?? 0)

  // Calculate progress for the circle
  const radius = 70
  const circumference = 2 * Math.PI * radius
  // Ensure progress never exceeds 100%
  const progress = Math.min(Math.max(currentXP / levelXP, 0), 1)
  const strokeDashoffset = circumference - progress * circumference
  const progressPercentage = Math.round(progress * 100)

  return (
    <ModernCard className="xp-circle-widget-v2" elevated>
      {/* Header */}
      <div className="xp-widget-header">
        <div>
          <h2 className="xp-widget-title">Level {level}</h2>
          {levelTitle && (
            <p className="xp-widget-level-name">{levelTitle}</p>
          )}
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
        <div className="xp-circle-wrapper">
          <svg className="w-full h-full transform -rotate-90">
            <defs>
              {/* Gradient for progress arc */}
              <linearGradient id="xpProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              </linearGradient>
              {/* Glow filter */}
              <filter id="xpGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Background track */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth="20"
              fill="transparent"
              strokeLinecap="round"
              opacity="0.3"
            />
            {/* Progress arc with gradient and glow */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="url(#xpProgressGradient)"
              strokeWidth="20"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`xp-progress-arc transition-all duration-500 ease-out ${
                isActive ? 'xp-progress-arc-active' : 'opacity-20 grayscale'
              }`}
              style={{ 
                filter: isActive ? 'url(#xpGlow)' : 'none'
              }}
            />
          </svg>

          {/* Center content */}
          <div className="xp-circle-center">
            <div className="flex items-center justify-center flex-col">
              <div className="flex items-baseline justify-center gap-1">
                <span 
                  className={`xp-circle-value ${isActive ? 'xp-circle-value-active' : 'xp-circle-value-inactive'}`}
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace' }}
                  data-digits={xpDigits}
                >
                  {xpText}
                </span>
                <span 
                  className={`xp-circle-unit ${isActive ? 'xp-circle-unit-active' : 'xp-circle-unit-inactive'}`}
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
              {isActive && (
                <>
                  <div className="xp-progress-percentage" aria-label={`${progressPercentage}% progress`}>
                    {progressPercentage}%
                  </div>
                  <div className="xp-next-threshold" aria-label={`Next level at ${nextXpText} XP`}>
                    Next at <span className="xp-next-threshold-value">{nextXpText}</span>
                  </div>
                </>
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

