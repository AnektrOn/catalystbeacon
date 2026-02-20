import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Wind, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import '../../styles/ethereal-design-system.css'

const BreathworkModal = ({ isOpen, onClose, userId }) => {
  const [timeLeft, setTimeLeft] = useState(60)
  const [phase, setPhase] = useState('Inhale') // Inhale, Hold, Exhale
  const [showPenaltyWarning, setShowPenaltyWarning] = useState(false)
  const { fetchProfile } = useAuth()
  const timerRef = useRef(null)

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Animation phase logic (approx 4-2-4 rhythm)
      const phaseInterval = setInterval(() => {
        setPhase((prev) => {
          if (prev === 'Inhale') return 'Hold'
          if (prev === 'Hold') return 'Exhale'
          return 'Inhale'
        })
      }, 4000)

      return () => {
        clearInterval(timerRef.current)
        clearInterval(phaseInterval)
      }
    }
  }, [isOpen, timeLeft])

  const handleCloseAttempt = () => {
    if (timeLeft > 0) {
      setShowPenaltyWarning(true)
    } else {
      onClose()
    }
  }

  const applyPenaltyAndClose = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_xp')
        .eq('id', userId)
        .single()

      const currentXP = profile?.current_xp || 0
      const penalty = 50
      const newXP = Math.max(0, currentXP - penalty)

      const { error } = await supabase
        .from('profiles')
        .update({ current_xp: newXP })
        .eq('id', userId)

      if (error) throw error

      // Log the penalty
      await supabase.from('xp_logs').insert({
        user_id: userId,
        xp_earned: -penalty,
        reason: 'Skipped mandatory breathwork'
      })

      toast.error(`-50 XP Penalty Applied`, {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })

      if (fetchProfile) await fetchProfile(userId)
      onClose()
    } catch (error) {
      console.error('Error applying penalty:', error)
      onClose()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className={`ethereal-card elevated size-large max-w-md w-full animate-scale-in relative overflow-hidden transition-all duration-500 ${showPenaltyWarning ? 'border-red-500/50 shadow-red-500/20' : ''}`}>
        
        {/* Close Button */}
        <button
          onClick={handleCloseAttempt}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X size={20} className="text-white/50 hover:text-white" />
        </button>

        {showPenaltyWarning ? (
          <div className="text-center py-8 animate-shake">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <AlertCircle size={32} className="text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Warning: Penalty</h2>
            <p className="text-gray-300 mb-8">
              Skipping this grounding exercise will cost you <span className="text-red-500 font-bold">50 XP</span>.
              Are you sure you want to abandon your focus?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={applyPenaltyAndClose}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-600/20"
              >
                Yes, Skip and Lose 50 XP
              </button>
              <button
                onClick={() => setShowPenaltyWarning(false)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
              >
                No, Continue Breathing
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400">
                <Wind size={24} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 ethereal-heading">Focus & Breathe</h2>
            <p className="text-gray-400 mb-8 ethereal-body">Center yourself before entering the dashboard</p>

            {/* Breathing Animation */}
            <div className="relative flex items-center justify-center h-48 mb-8">
              {/* Outer Glow */}
              <div className={`absolute w-32 h-32 rounded-full bg-cyan-500/20 blur-2xl transition-all duration-4000 ${phase === 'Inhale' ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
              
              {/* Central Circle */}
              <div className={`relative w-32 h-32 rounded-full border-2 border-cyan-400/30 flex items-center justify-center transition-all duration-4000 ease-in-out ${phase === 'Inhale' ? 'scale-150' : 'scale-100'}`}>
                <div className="text-cyan-400 font-bold text-xl uppercase tracking-widest">{phase}</div>
              </div>
              
              {/* Orbiting particle */}
              <div className="absolute w-40 h-40 animate-spin-slow pointer-events-none">
                <div className="w-2 h-2 bg-white rounded-full absolute top-0 left-1/2 -translate-x-1/2 blur-[1px]"></div>
              </div>
            </div>

            {/* Timer */}
            <div className="mb-8">
              <div className="text-4xl font-light text-white mb-1">{timeLeft}s</div>
              <div className="text-xs text-gray-500 uppercase tracking-[0.2em]">Remaining</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              ></div>
            </div>

            {timeLeft === 0 && (
              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold text-lg transition-all shadow-lg"
              >
                Enter Dashboard
              </button>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      ` }} />
    </div>,
    document.body
  )
}

export default BreathworkModal
