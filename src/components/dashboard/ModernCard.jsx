import React from 'react'
/*import './ModernCard.css'*/

/**
 * Modern Card - Base component inspired by smart home UI
 * Clean, flat design with perfect spacing
 *//*
const ModernCard = ({ 
  children, 
  className = '',
  elevated = false,
  interactive = false,
  onClick
}) => {
  const classes = [
    'modern-card',
    'glass-effect',
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

*/



/**
 * Modern Card - Ethereal Variant Base Component
 * Aligned with the sci-fi/glassmorphism design system
 * Self-contained styles included
 */
const ModernCard = ({ 
  children, 
  className = '',
  elevated = false,
  interactive = false,
  onClick
}) => {
  // Combine base classes with conditional props
  const classes = [
    'modern-card',
    elevated && 'modern-card-elevated',
    interactive && 'modern-card-interactive',
    className
  ].filter(Boolean).join(' ')

  const styles = `
    /* Modern Card - Ethereal Variant */
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600&display=swap');

    :root {
      --ethereal-bg: rgba(8, 8, 12, 0.4);
      --ethereal-border: rgba(255, 255, 255, 0.08);
      --ethereal-hover-bg: rgba(20, 20, 25, 0.6);
      --ethereal-hover-border: rgba(255, 255, 255, 0.15);
      --ethereal-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      --radius-lg: 24px;
    }

    .modern-card {
      /* Glassmorphism Base - Matching Ethereal Card */
      background: var(--ethereal-bg, rgba(8, 8, 12, 0.4));
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--ethereal-border, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-lg, 24px);
      color: #e0e0e0;
      font-family: 'Rajdhani', sans-serif;
      
      /* Layout & Box Model */
      padding: 32px;
      position: relative;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      
      /* Transitions */
      transition: all 0.5s ease;
      
      /* Initial Shadow */
      box-shadow: 
        0 20px 50px rgba(0, 0, 0, 0.5),
        inset 0 0 80px rgba(165, 243, 252, 0.05);
    }

    /* Ambient Light Source (Pseudo-element) */
    .modern-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 50% 50%, rgba(165, 243, 252, 0.08), transparent 60%);
      pointer-events: none;
      z-index: 0;
      animation: breathe-light-card 8s ease-in-out infinite;
    }

    @keyframes breathe-light-card {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }

    /* Content wrapper to ensure z-index stays above the glow */
    .modern-card > * {
      position: relative;
      z-index: 1;
    }

    /* Elevated Variant */
    .modern-card-elevated {
      box-shadow: 
        0 30px 60px rgba(0, 0, 0, 0.6),
        inset 0 0 90px rgba(165, 243, 252, 0.08);
    }

    /* Interactive Variant (Hover Effects) */
    .modern-card-interactive {
      cursor: pointer;
    }

    @media (hover: hover) {
      .modern-card-interactive:hover {
        transform: translateY(-5px);
        background: var(--ethereal-hover-bg, rgba(20, 20, 25, 0.6));
        border-color: var(--ethereal-hover-border, rgba(255, 255, 255, 0.15));
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.6),
          inset 0 0 100px rgba(165, 243, 252, 0.08);
      }
    }

    .modern-card-interactive:active {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modern-card {
        padding: 24px;
        border-radius: 16px;
      }
    }
  `

  return (
    <>
      <style>{styles}</style>
      <div 
        className={classes}
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
      >
        {/* Optional: Add particle effects if needed, could be added as children or here */}
        <div className="particles-container" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden'}}>
            <div style={{position: 'absolute', background: 'white', borderRadius: '50%', width: '2px', height: '2px', top: '80%', left: '20%', opacity: 0, animation: 'float-particle-card 12s infinite linear'}}></div>
            <div style={{position: 'absolute', background: 'white', borderRadius: '50%', width: '1px', height: '1px', top: '60%', left: '80%', opacity: 0, animation: 'float-particle-card 15s infinite linear 2s'}}></div>
        </div>
        <style>{`
            @keyframes float-particle-card {
                0% { transform: translateY(0) translateX(0); opacity: 0; }
                20% { opacity: 0.8; }
                80% { opacity: 0.8; }
                100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
            }
        `}</style>
        {children}
      </div>
    </>
  )
}

export default ModernCard