import React from 'react'
import './ModernCard.css'

/**
 * Modern Card - Base component inspired by smart home UI
 * Clean, flat design with perfect spacing
 */
const ModernCard = ({ 
  children, 
  className = '',
  elevated = false,
  interactive = false,
  onClick
}) => {
  const classes = [
    'modern-card',
    elevated && 'modern-card-elevated',
    interactive && 'modern-card-interactive',
    className
  ].filter(Boolean).join(' ')

  return (
    <div 
      className={classes}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default ModernCard

