import React from 'react'
import ModernCard from './ModernCard'
import './NeomorphicCard.css'

/**
 * Base Neomorphic Card Component
 * Wrapper around ModernCard for backward compatibility
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
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <ModernCard
      className={classes}
      elevated={elevated}
      interactive={interactive}
      onClick={onClick}
      style={style}
    >
      {children}
    </ModernCard>
  )
}

export default NeomorphicCard

