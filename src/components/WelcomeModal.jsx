import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './ui/button'

/**
 * WelcomeModal - Welcome modal that appears on every app load
 * 
 * This modal appears every time the application loads.
 * 
 * Features:
 * - Shows on every app load/mount
 * - Blocks interaction until dismissed (backdrop prevents clicks outside)
 * - Accessible (focus trap, keyboard dismiss via ESC, ARIA roles)
 * - Responsive design (mobile and desktop)
 * - Clean, minimal design matching app aesthetic
 */
const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef(null)
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)

  // Handle modal dismissal
  const handleDismiss = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Show modal on every mount/load
  // Small delay to ensure smooth rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Focus trap implementation for accessibility
  useEffect(() => {
    if (!isOpen) return

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss()
      }
    }

    // Focus the first button when modal opens
    const timer = setTimeout(() => {
      firstFocusableRef.current?.focus()
    }, 100)

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscape)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleDismiss])

  // Handle primary action button
  const handleEnter = () => {
    handleDismiss()
  }

  // Handle secondary "Continue" button
  const handleContinue = () => {
    handleDismiss()
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Don't render anything if modal shouldn't be shown
  if (!isOpen) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      aria-describedby="welcome-modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
      style={{ width: '100vw', height: '100vh' }}
      onClick={(e) => {
        // Prevent closing on backdrop click - user must use a button
        if (e.target === e.currentTarget) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div
        ref={modalRef}
        className="glass-panel-floating rounded-2xl p-6 sm:p-8 max-w-md w-full animate-scale-in border border-white/20 shadow-2xl relative overflow-hidden my-auto"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
        onClick={(e) => {
          // Prevent clicks inside modal from bubbling to backdrop
          e.stopPropagation()
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2
            id="welcome-modal-title"
            className="text-2xl font-semibold text-white mb-4"
          >
            Welcome to the Beta
          </h2>
          <div
            id="welcome-modal-description"
            className="text-white/90 text-base leading-relaxed space-y-3"
          >
            <p>You have free access to:</p>
            <ul className="list-none space-y-2 text-left pl-0">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The full roadmap</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The habit tracker</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Core training modules</span>
              </li>
            </ul>
            <p className="mt-4">This beta version gives you early access to the system.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          {/* Primary button */}
          <Button
            ref={firstFocusableRef}
            onClick={handleEnter}
            variant="default"
            size="lg"
            className="w-full"
            aria-label="Enter the System"
          >
            Enter the System
          </Button>

          {/* Secondary button */}
          <button
            ref={lastFocusableRef}
            onClick={handleContinue}
            className="text-sm text-white/70 hover:text-white transition-colors py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Continue"
          >
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default WelcomeModal
