import React from 'react'
import { Link } from 'react-router-dom'
import WelcomeOrbCanvas from '../components/welcome/WelcomeOrbCanvas'

const BG = 'linear-gradient(165deg, #061018 0%, #000205 42%, #020617 100%)'
const ACCENT = '#B4833D'
const TEXT_ON_DARK = '#E8E2D9'

const NativeWelcomePage = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between relative"
      style={{
        background: BG,
        paddingTop: 'max(2.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
      }}
    >
      <div aria-hidden className="w-full shrink-0" />

      <div
        className="flex-1 w-full min-h-[min(52vh,440px)] relative"
        style={{ maxHeight: 'min(70vh, 520px)' }}
      >
        <WelcomeOrbCanvas className="absolute inset-0 w-full h-full" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-stretch gap-3 relative z-10">
        <Link
          to="/login"
          className="w-full text-center rounded-full py-4 text-base font-semibold tracking-wide transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: ACCENT,
            color: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(180, 131, 61, 0.35)',
          }}
        >
          Log in
        </Link>
        <Link
          to="/signup"
          className="w-full text-center rounded-full py-4 text-base font-semibold tracking-wide transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: 'transparent',
            color: TEXT_ON_DARK,
            border: `1.5px solid ${ACCENT}`,
          }}
        >
          Create an account
        </Link>
      </div>
    </div>
  )
}

export default NativeWelcomePage
