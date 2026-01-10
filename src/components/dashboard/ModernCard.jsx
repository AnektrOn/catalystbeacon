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
    /* Modern Card - Uses Global Ethereal Design System Variables */
    .modern-card {
      /* Use global CSS variables from ethereal-design-system.css */
      background: var(--ethereal-bg-glass);
      backdrop-filter: blur(var(--ethereal-card-blur));
      -webkit-backdrop-filter: blur(var(--ethereal-card-blur));
      border: 1px solid var(--ethereal-border);
      border-radius: var(--ethereal-card-radius);
      color: var(--ethereal-text);
      font-family: var(--font-ethereal-body);
      
      /* Layout & Box Model */
      padding: var(--ethereal-card-padding-medium);
      position: relative;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      
      /* Centering */
      margin-left: auto;
      margin-right: auto;
      
      /* Transitions */
      transition: all 0.5s ease;
      
      /* Initial Shadow - Using global variable */
      box-shadow: var(--ethereal-shadow-base);
    }
    
    .modern-card:hover {
      box-shadow: var(--ethereal-shadow-hover);
      border-color: var(--ethereal-border-hover);
      background: var(--ethereal-bg-hover);
    }

    /* Ambient Light Source - Uses global animation from ethereal-design-system.css */
    .modern-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 50% 50%, var(--ethereal-light-color), transparent 60%);
      pointer-events: none;
      z-index: 0;
      animation: breathe-light 8s ease-in-out infinite;
    }

    /* Content wrapper to ensure z-index stays above the glow */
    .modern-card > * {
      position: relative;
      z-index: 1;
    }

    /* Elevated Variant - Uses global variable */
    .modern-card-elevated {
      box-shadow: var(--ethereal-shadow-elevated);
    }

    /* Interactive Variant */
    .modern-card-interactive {
      cursor: pointer;
    }

    @media (hover: hover) {
      .modern-card-interactive:hover {
        transform: translateY(-2px);
      }
    }

    .modern-card-interactive:active {
      transform: translateY(-1px);
    }

    /* Responsive - Uses global variables */
    @media (max-width: 768px) {
      .modern-card {
        padding: var(--ethereal-card-padding-small);
        border-radius: var(--ethereal-card-radius-small);
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