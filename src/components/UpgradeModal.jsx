import React from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Lock, Sparkles, BookOpen, Target, Calendar, Settings } from 'lucide-react'

const UpgradeModal = ({ isOpen, onClose, restrictedFeature = null }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleUpgrade = () => {
    onClose()
    navigate('/pricing')
  }

  const getFeatureInfo = () => {
    const features = {
      courses: {
        icon: BookOpen,
        title: 'Courses',
        description: 'Access our full library of courses and learning materials'
      },
      stellarMap: {
        icon: Sparkles,
        title: 'Stellar Map',
        description: 'Explore the interactive learning constellation map'
      },
      community: {
        icon: Target,
        title: 'Community',
        description: 'Connect with other learners and share your progress'
      },
      achievements: {
        icon: Target,
        title: 'Achievements',
        description: 'View and unlock all achievements'
      },
      toolbox: {
        icon: Target,
        title: 'Toolbox Creation',
        description: 'Create custom toolbox items'
      },
      habits: {
        icon: Target,
        title: 'Habit Creation',
        description: 'Create custom habits'
      },
      calendar: {
        icon: Calendar,
        title: 'Event Creation',
        description: 'Create custom events in your calendar'
      },
      profile: {
        icon: Settings,
        title: 'Profile Features',
        description: 'Access full profile features and statistics'
      }
    }

    return features[restrictedFeature] || {
      icon: Lock,
      title: 'Premium Feature',
      description: 'This feature requires an active subscription'
    }
  }

  const featureInfo = getFeatureInfo()
  const Icon = featureInfo.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-floating rounded-2xl p-6 sm:p-8 max-w-md w-full animate-scale-in border border-white/10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={20} className="text-gray-400" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <Icon size={32} className="text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Subscribe to Unlock
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {featureInfo.description}
        </p>

        {/* Free Plan Limitations */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
            Free Plan Includes:
          </h3>
          <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
            <li>✓ Dashboard (Stats only)</li>
            <li>✓ Habits Tab (Library selection only)</li>
            <li>✓ Toolbox Tab (Library selection only)</li>
            <li>✓ Calendar (View only, no event creation)</li>
            <li>✓ Profile Settings</li>
          </ul>
        </div>

        {/* Upgrade Benefits */}
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">
            Upgrade to Unlock:
          </h3>
          <ul className="text-sm text-emerald-800 dark:text-emerald-300 space-y-1">
            <li>✓ Full course access</li>
            <li>✓ Stellar Map exploration</li>
            <li>✓ Community features</li>
            <li>✓ Create custom habits & toolbox items</li>
            <li>✓ Create calendar events</li>
            <li>✓ Full profile features</li>
            <li>✓ All achievements</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium transition-all shadow-lg hover:shadow-amber-500/50"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpgradeModal

