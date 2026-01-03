import React from 'react'
import './NeomorphicCard.css'

/**
 * Base Neomorphic Card Component
 * Foundation for all dashboard cards with consistent styling
 */
const NeomorphicCard = ({ 
  children, 
  size = 'medium', // small, medium, large, xl
  className = '',
  elevated = false,
  interactive = false,
  onClick,
  style = {}
}) => {
  const sizeClasses = {
    small: 'neo-card-small',
    medium: 'neo-card-medium',
    large: 'neo-card-large',
    xl: 'neo-card-xl'
  }

  const classes = [
    'neo-card',
    sizeClasses[size],
    elevated && 'neo-card-elevated',
    interactive && 'neo-card-interactive',
    className
  ].filter(Boolean).join(' ')

  return (
    <div 
      className={classes}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}

export default NeomorphicCard

