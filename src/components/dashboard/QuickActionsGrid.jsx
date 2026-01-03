import React from 'react'
import NeomorphicCard from './NeomorphicCard'
import { 
  BookOpen, 
  Trophy, 
  Calendar, 
  Target, 
  Users, 
  Settings,
  Star,
  Zap
} from 'lucide-react'
import './QuickActionsGrid.css'

/**
 * Quick Actions Grid - Icon grid for common actions
 * Like the icon grids in the smart home inspiration
 */

const DEFAULT_ACTIONS = [
  { id: 'courses', icon: BookOpen, label: 'Courses', color: '#B4833D' },
  { id: 'achievements', icon: Trophy, label: 'Achievements', color: '#B4833D' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', color: '#81754B' },
  { id: 'goals', icon: Target, label: 'Goals', color: '#81754B' },
  { id: 'community', icon: Users, label: 'Community', color: '#66371B' },
  { id: 'favorites', icon: Star, label: 'Favorites', color: '#66371B' },
  { id: 'boost', icon: Zap, label: 'Boost', color: '#B4833D' },
  { id: 'settings', icon: Settings, label: 'Settings', color: '#81754B' },
]

const QuickActionsGrid = ({ 
  actions = DEFAULT_ACTIONS,
  onActionClick
}) => {
  return (
    <NeomorphicCard size="medium" className="quick-actions-grid">
      <div className="quick-actions-header">
        <h3 className="quick-actions-title">Quick Actions</h3>
      </div>

      <div className="quick-actions-container">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              className="quick-action-item"
              onClick={() => onActionClick?.(action.id)}
              aria-label={action.label}
            >
              <div 
                className="quick-action-icon-wrapper"
                style={{ '--action-color': action.color }}
              >
                <Icon className="quick-action-icon" size={24} strokeWidth={2} />
              </div>
              <span className="quick-action-label">{action.label}</span>
            </button>
          )
        })}
      </div>
    </NeomorphicCard>
  )
}

export default QuickActionsGrid

