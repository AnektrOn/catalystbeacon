import React from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, X, ArrowRight, BookOpen, Target, Users } from 'lucide-react'
import '../../styles/ethereal-design-system.css'

const OnboardingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto" style={{ width: '100vw', height: '100vh' }}>
      <div className="ethereal-card elevated size-large max-w-lg w-full animate-scale-in relative overflow-hidden my-auto with-particles">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} className="text-ethereal-text hover:text-white" />
        </button>

        {/* Header Icon */}
        <div className="flex justify-center mb-6 relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles size={40} className="text-white animate-pulse-slow" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-white mb-3 ethereal-heading">
          Welcome, Traveler
        </h2>
        
        <p className="text-center text-gray-300 mb-8 leading-relaxed ethereal-body">
          Your journey at Human Catalyst Beacon begins now. Here's what awaits you in this realm of transformation.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Master Courses</h3>
              <p className="text-sm text-gray-400">Unlock profound wisdom through our curated learning paths.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Track Progress</h3>
              <p className="text-sm text-gray-400">Monitor your growth, earn XP, and level up your character.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Join the Community</h3>
              <p className="text-sm text-gray-400">Connect with fellow travelers and share your insights.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 group"
        >
          <span>Start My Journey</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>,
    document.body
  )
}

export default OnboardingModal
