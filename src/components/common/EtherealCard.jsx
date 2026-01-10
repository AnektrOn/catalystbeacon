import React from 'react'

/**
 * EtherealCard - Reusable card component matching XPCircleWidget design
 * Features: Glassmorphism, floating particles, ambient lighting, ethereal aesthetics
 */
const EtherealCard = ({ 
  children, 
  className = '',
  size = 'medium',
  elevated = false,
  interactive = false,
  withParticles = true,
  onClick,
  style = {}
}) => {
  const sizeClasses = {
    small: { padding: '24px', borderRadius: '20px' },
    medium: { padding: '32px', borderRadius: '24px' },
    large: { padding: '40px', borderRadius: '28px' }
  }

  const sizeStyle = sizeClasses[size] || sizeClasses.medium

  const styles = `
    /* EtherealCard - Uses Global Design System Variables */
    .ethereal-card-base {
      /* Use global CSS variables */
      background: var(--ethereal-bg-glass);
      backdrop-filter: blur(var(--ethereal-card-blur));
      -webkit-backdrop-filter: blur(var(--ethereal-card-blur));
      border: 1px solid var(--ethereal-border);
      color: var(--ethereal-text);
      font-family: var(--font-ethereal-body);
      
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
      transition: all 0.5s ease;
      
      /* Centering */
      margin-left: auto;
      margin-right: auto;
      
      /* Shadows */
      box-shadow: var(--ethereal-shadow-base);
    }

    .ethereal-card-base:hover {
      box-shadow: var(--ethereal-shadow-hover);
      border-color: var(--ethereal-border-hover);
      background: var(--ethereal-bg-hover);
    }

    .ethereal-card-elevated {
      box-shadow: var(--ethereal-shadow-elevated);
    }

    .ethereal-card-interactive {
      cursor: pointer;
    }

    .ethereal-card-interactive:hover {
      transform: translateY(-2px);
    }

    /* Ambient Light Source - Uses global animation */
    .ethereal-light-source {
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

    /* Floating Particles */
    .ethereal-particles {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    
    .ethereal-particle {
      position: absolute;
      background: white;
      border-radius: 50%;
      opacity: 0;
      animation: float-particle 10s infinite linear;
    }
    
    .ethereal-particle.p1 { width: 2px; height: 2px; top: 80%; left: 20%; animation-duration: 12s; animation-delay: 0s; }
    .ethereal-particle.p2 { width: 1px; height: 1px; top: 60%; left: 80%; animation-duration: 15s; animation-delay: 2s; }
    .ethereal-particle.p3 { width: 3px; height: 3px; top: 40%; left: 10%; animation-duration: 18s; animation-delay: 1s; box-shadow: 0 0 5px white; }
    .ethereal-particle.p4 { width: 1px; height: 1px; top: 90%; left: 90%; animation-duration: 20s; animation-delay: 4s; }

    @keyframes float-particle {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      20% { opacity: 0.8; }
      80% { opacity: 0.8; }
      100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
    }

    /* Content wrapper */
    .ethereal-card-content {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
    }
  `

  const cardClasses = [
    'ethereal-card-base',
    elevated && 'ethereal-card-elevated',
    interactive && 'ethereal-card-interactive',
    className
  ].filter(Boolean).join(' ')

  return (
    <>
      <style>{styles}</style>
      <div 
        className={cardClasses}
        style={{
          ...sizeStyle,
          ...style
        }}
        onClick={onClick}
      >
        <div className="ethereal-light-source"></div>
        {withParticles && (
          <div className="ethereal-particles">
            <div className="ethereal-particle p1"></div>
            <div className="ethereal-particle p2"></div>
            <div className="ethereal-particle p3"></div>
            <div className="ethereal-particle p4"></div>
          </div>
        )}
        <div className="ethereal-card-content">
          {children}
        </div>
      </div>
    </>
  )
}

export default EtherealCard
