import React from 'react'
import { Sparkles } from 'lucide-react'

/**
 * Neural XP Widget V4 - "Ethereal Essence"
 * Features: Floating particles, delicate orbital rings, soft diffused lighting
 */
const XPCircleWidgetV2 = ({ 
  currentXP = 0, 
  levelXP = 1000,
  level = 1,
  nextLevel = 2,
  levelTitle = 'Ascendant',
  isActive = true
}) => {
  const xpText = new Intl.NumberFormat('en-US').format(currentXP ?? 0)
  const nextXpText = new Intl.NumberFormat('en-US').format(levelXP ?? 0)

  // Calculate progress
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(currentXP / levelXP, 0), 1)
  const strokeDashoffset = circumference - progress * circumference

  const styles = `
    /* Uses global CSS variables from ethereal-design-system.css */

    .xp-widget-container {
      font-family: var(--font-ethereal-body);
      color: var(--ethereal-text);
      position: relative;
      max-width: 400px;
      width: 100%;
      margin: 0 auto;
      perspective: 1000px;
      box-sizing: border-box;
    }

    /* Mobile optimizations */
    @media (max-width: 640px) {
      .xp-widget-container {
        max-width: 100%;
        padding: 0;
      }
      
      .ethereal-card {
        padding: 16px;
        border-radius: 12px;
      }
      
      .gauge-container {
        width: 200px;
        height: 200px;
      }
      
      .header-content {
        margin-bottom: 8px;
      }
      
      .footer-info {
        margin-top: 8px;
      }
      
      .level-value {
        font-size: 24px;
      }
      
      .xp-value {
        font-size: 32px;
      }
      
      .level-label {
        font-size: 10px;
        letter-spacing: 2px;
      }
    }

    /* --- ETHEREAL CARD - Uses Global Variables --- */
    .ethereal-card {
      background: var(--ethereal-bg-glass);
      backdrop-filter: blur(var(--ethereal-card-blur));
      -webkit-backdrop-filter: blur(var(--ethereal-card-blur));
      border: 1px solid var(--ethereal-border);
      border-radius: var(--ethereal-card-radius);
      padding: 20px;
      box-shadow: var(--ethereal-shadow-base);
      position: relative;
      overflow: hidden;
      transition: all 0.5s ease;
      margin-left: auto;
      margin-right: auto;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }

    /* Hover only works on devices with hover capability (desktop) */
    @media (hover: hover) and (pointer: fine) {
      .ethereal-card:hover {
        box-shadow: var(--ethereal-shadow-hover);
        border-color: var(--ethereal-border-hover);
        background: var(--ethereal-bg-hover);
      }
    }

    /* Ambient Light Source - Uses global animation */
    .light-source {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 50% 50%, var(--ethereal-light-color), transparent 60%);
      pointer-events: none;
      animation: breathe-light 8s ease-in-out infinite;
    }

    /* Floating Particles */
    .particles {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
    }
    .particle {
      position: absolute;
      background: white;
      border-radius: 50%;
      opacity: 0;
      animation: float-particle 10s infinite linear;
    }
    
    /* Generate varying animations for particles */
    .p1 { width: 2px; height: 2px; top: 80%; left: 20%; animation-duration: 12s; animation-delay: 0s; }
    .p2 { width: 1px; height: 1px; top: 60%; left: 80%; animation-duration: 15s; animation-delay: 2s; }
    .p3 { width: 3px; height: 3px; top: 40%; left: 10%; animation-duration: 18s; animation-delay: 1s; box-shadow: 0 0 5px white; }
    .p4 { width: 1px; height: 1px; top: 90%; left: 90%; animation-duration: 20s; animation-delay: 4s; }

    @keyframes float-particle {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      20% { opacity: 0.8; }
      80% { opacity: 0.8; }
      100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
    }

    /* --- HEADER --- */
    .header-content {
      text-align: center;
      position: relative;
      z-index: 2;
      margin-bottom: 12px;
    }

    .level-label {
      font-family: var(--font-ethereal-heading);
      font-size: 12px;
      letter-spacing: 4px;
      color: var(--ethereal-text);
      opacity: 0.7;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .level-value {
      font-size: 32px;
      font-weight: 300;
      font-family: var(--font-ethereal-body);
      color: var(--ethereal-white);
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
      letter-spacing: 2px;
    }

    /* --- GAUGE --- */
    .gauge-container {
      position: relative;
      width: 240px;
      height: 240px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
    }

    .gauge-center {
      position: absolute;
      top: 50%; 
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: float-center 6s ease-in-out infinite;
    }

    @keyframes float-center {
      0%, 100% { transform: translate(-50%, -50%); }
      50% { transform: translate(-50%, -55%); }
    }

    .xp-value {
      font-size: 40px;
      font-weight: 200;
      color: var(--ethereal-white);
      line-height: 1;
      text-shadow: 0 0 30px rgba(165, 243, 252, 0.6);
      font-family: var(--font-ethereal-body);
    }

    .xp-unit {
      font-size: 12px;
      letter-spacing: 2px;
      color: var(--ethereal-text);
      opacity: 0.7;
      margin-top: 4px;
    }

    /* --- ANIMATIONS & SVG --- */
    @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes rotate-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
    
    .orbit-1 { transform-origin: center; animation: rotate-slow 60s linear infinite; opacity: 0.3; will-change: transform; }
    .orbit-2 { transform-origin: center; animation: rotate-rev 45s linear infinite; opacity: 0.2; will-change: transform; }
    .orbit-3 { transform-origin: center; animation: rotate-slow 30s linear infinite; opacity: 0.1; will-change: transform; }

    .progress-glow {
      filter: drop-shadow(0 0 5px var(--ethereal-cyan));
      transition: stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);
      will-change: stroke-dashoffset;
    }

    /* --- FOOTER --- */
    .footer-info {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      color: var(--ethereal-text);
      font-size: 11px;
      letter-spacing: 1px;
      position: relative;
      z-index: 2;
    }

    .next-pill {
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 6px;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      color: var(--ethereal-text);
      opacity: 1;
    }
    
    .next-pill span {
      color: var(--ethereal-text);
      opacity: 1;
      font-weight: 500;
    }

    @media (max-width: 640px) {
      .orbit-1, .orbit-2, .orbit-3 {
        animation-duration: 120s; /* Slower on mobile to save CPU */
      }
      .gauge-center {
        animation: none; /* Disable floating on mobile */
      }
      .particles {
        display: none; /* Hide particles on mobile */
      }
    }

  `

  return (
    <div className="xp-widget-container">
      <style>{styles}</style>
      
      <div className="ethereal-card">
        <div className="light-source"></div>
        <div className="particles">
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
        </div>

        {/* Header */}
        <div className="header-content">
          <div className="level-label">Current Resonance</div>
          <div className="level-value">{levelTitle} • {level}</div>
        </div>

        {/* Ethereal Gauge */}
        <div className="gauge-container">
          <svg width="240" height="240" viewBox="0 0 256 256">
            <defs>
              <linearGradient id="etherealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--ethereal-cyan)" stopOpacity="0" />
                <stop offset="50%" stopColor="var(--ethereal-white)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--ethereal-cyan)" stopOpacity="0" />
              </linearGradient>
              
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* 1. Delicate Orbital Rings */}
            <g className="orbit-1">
               <circle cx="128" cy="128" r="120" stroke="var(--ethereal-border)" strokeWidth="0.5" fill="none" strokeDasharray="1 10" />
            </g>
            <g className="orbit-2">
               <circle cx="128" cy="128" r="105" stroke="var(--ethereal-cyan)" strokeWidth="0.5" fill="none" opacity="0.5" />
               <circle cx="128" cy="128" r="105" stroke="var(--ethereal-cyan)" strokeWidth="1.5" fill="none" strokeDasharray="0.5 30" opacity="0.6" />
            </g>
            <g className="orbit-3">
               <circle cx="128" cy="128" r="95" stroke="var(--ethereal-violet)" strokeWidth="0.5" fill="none" strokeDasharray="4 4" opacity="0.4" />
            </g>

            {/* 2. Main Progress Track (Barely visible) */}
            <circle cx="128" cy="128" r={radius} stroke="var(--ethereal-border)" strokeWidth="2" fill="none" opacity="0.1" />

            {/* 3. Ethereal Progress Arc */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="var(--ethereal-cyan)"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="progress-glow"
              transform="rotate(-90 128 128)"
              style={{ filter: 'url(#softGlow)' }}
            />
            
            {/* 4. Trailing Light Point */}
             <g style={{ transform: `rotate(${(progress * 360) - 90}deg)`, transformOrigin: '128px 128px', transition: 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
               <circle cx={128 + radius} cy="128" r="3" fill="var(--ethereal-cyan)" style={{ filter: 'drop-shadow(0 0 10px var(--ethereal-cyan))' }} />
             </g>
          </svg>

          {/* Center Content */}
          <div className="gauge-center">
            <div className="xp-value">{xpText}</div>
            <div className="xp-unit">EXP POINTS</div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-info">
          <div className="next-pill">
            <Sparkles size={10} style={{ color: 'var(--ethereal-cyan)' }} />
            <span>Target: {nextXpText}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default XPCircleWidgetV2
