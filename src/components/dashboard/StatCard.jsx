import React from 'react'
import NeomorphicCard from './NeomorphicCard'
import './StatCard.css'

/**
 * Generic Stat Card - Reusable for any metric
 * Small card with icon, number, and label
 */
const StatCard = ({ 
  icon: Icon,
  value,
  label,
  subtitle,
  trend,
  color = 'var(--color-dark-goldenrod)'
}) => {
  return (
    <NeomorphicCard size="small" className="stat-card">
      <div className="stat-card-content">
        {/* Icon */}
        {Icon && (
          <div className="stat-icon-wrapper" style={{ '--stat-color': color }}>
            <Icon className="stat-icon" size={24} strokeWidth={2} />
          </div>
        )}

        {/* Value and label */}
        <div className="stat-info">
          <div className="stat-value-row">
            <span className="stat-value">{value}</span>
            {trend && (
              <span className={`stat-trend stat-trend-${trend > 0 ? 'up' : 'down'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          <div className="stat-label">{label}</div>
          {subtitle && (
            <div className="stat-subtitle">{subtitle}</div>
          )}
        </div>
      </div>
    </NeomorphicCard>
  )
}

export default StatCard

