import React from 'react'
import ModernCard from './ModernCard'
import './StatCardV2.css'

/**
 * Modern Stat Card - Inspired by smart home UI
 * Clean, flat design with perfect balance + engaging graphics
 */
const StatCardV2 = ({ 
  icon: Icon,
  value,
  label,
  subtitle
}) => {
  return (
    <ModernCard className="stat-card-v2">
      {/* Decorative background graphic */}
      <div className="stat-card-v2-graphic" aria-hidden="true">
        <div className="stat-card-v2-graphic-circle"></div>
        <div className="stat-card-v2-graphic-pattern"></div>
      </div>

      {/* Main content */}
      <div className="stat-card-v2-content">
        <div className="stat-card-v2-header">
          {Icon && (
            <div className="stat-card-v2-icon">
              <Icon size={20} strokeWidth={2.5} />
            </div>
          )}
          <div className="stat-card-v2-value">{value}</div>
        </div>
        <div className="stat-card-v2-label">{label}</div>
        {subtitle && (
          <div className="stat-card-v2-subtitle">{subtitle}</div>
        )}
      </div>
    </ModernCard>
  )
}

export default StatCardV2
