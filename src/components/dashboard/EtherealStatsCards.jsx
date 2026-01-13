import React from 'react'
import { Flame, Brain, Activity, Crown } from 'lucide-react'

// Verify all icons are imported correctly
if (!Flame || !Brain || !Activity || !Crown) {
  console.error('Missing icons from lucide-react')
}

const EtherealStatsCards = ({ 
  streak = 0, 
  lessonsCompleted = 0, 
  learningTime = 0, // hours
  achievementsUnlocked = 0
}) => {
  // Format data
  const streakDisplay = streak > 0 ? `${streak}d` : '0d' 
  const lessonsDisplay = lessonsCompleted.toString()
  const learningTimeDisplay = learningTime > 0 ? `${learningTime}h` : '0h'
  const achievementsDisplay = achievementsUnlocked.toString()

  const cards = [
    {
      id: 1,
      label: 'Resonance',
      value: streakDisplay,
      subtext: 'Harmonic Streak',
      icon: Flame,
      color: 'var(--ethereal-violet)', // Use Ethereal Violet
      delay: '0s'
    },
    {
      id: 2,
      label: 'Engrams',
      value: lessonsDisplay,
      subtext: 'Modules Integrated',
      icon: Brain,
      color: 'var(--ethereal-cyan)', // Use Ethereal Cyan
      delay: '0.1s'
    },
    {
      id: 3,
      label: 'Clarity',
      value: learningTimeDisplay,
      subtext: 'Neural Precision',
      icon: Activity,
      color: 'var(--ethereal-cyan)', // Use Ethereal Cyan
      delay: '0.2s'
    },
    {
      id: 4,
      label: 'Ascension',
      value: achievementsDisplay,
      subtext: 'Current Plane',
      icon: Crown,
      color: 'var(--ethereal-violet)', // Use Ethereal Violet
      delay: '0.3s'
    }
  ]

  const styles = `
    /* Uses global fonts and variables from ethereal-design-system.css */

    .ethereal-stats-wrapper {
      width: 100%;
      box-sizing: border-box;
      margin-top: 0;
      display: block;
      background: transparent;
      border: none;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    /* Desktop: Grid Layout */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr); 
      gap: 12px;
      width: 100%;
      font-family: 'Rajdhani', sans-serif;
      background: transparent;
      border: none;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      padding: 0;
      margin: 0;
    }

    .stat-card {
      position: relative;
      background: var(--ethereal-bg-glass);
      backdrop-filter: blur(var(--ethereal-card-blur));
      -webkit-backdrop-filter: blur(var(--ethereal-card-blur));
      border: 1px solid var(--ethereal-border);
      border-radius: var(--ethereal-card-radius-small);
      padding: 24px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 12px;
      align-items: center;
      height: 100%;
      min-height: 120px;
      width: 100%;
      box-sizing: border-box;
      box-shadow: var(--ethereal-shadow-base);
    }

    /* Inner Glow Gradient */
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at top right, var(--card-color), transparent 60%);
      opacity: 0.08;
      transition: opacity 0.3s;
      pointer-events: none;
    }

    /* Icon Container */
    .icon-box {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ethereal-bg-glass);
      border: 1px solid var(--ethereal-border);
      color: var(--card-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      flex-shrink: 0; /* Prevent icon squishing */
    }
    
    .icon-box svg {
      width: 18px;
      height: 18px;
    }

    /* Text */
    .stat-info {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-width: 0; /* Important for flex child truncation */
      gap: 6px;
      align-items: flex-start;
    }

    .stat-label {
      font-size: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--ethereal-text);
      opacity: 0.7;
      margin-bottom: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }

    .stat-value {
      font-size: 42px;
      font-weight: 800;
      color: var(--ethereal-white);
      line-height: 1;
      text-shadow: 0 0 15px rgba(0,0,0,0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.02em;
      margin: 0;
      font-family: 'Cinzel', serif;
    }

    .stat-subtext {
      font-size: 11px;
      color: var(--ethereal-text);
      opacity: 0.6;
      margin-top: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }

    /* MOBILE OPTIMIZATIONS (Max Width 768px) */
    /* Switched to Grid with minmax(0, 1fr) to force exact equal widths */
    @media (max-width: 768px) {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 6px;
        width: 100%;
      }

      .stat-card {
        width: 100%;
        min-width: 0; /* Crucial: allows grid item to shrink smaller than its content */
        padding: 14px;
        min-height: auto; 
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px;
        align-items: center;
        text-align: left;
        border-radius: 12px;
        height: 100%;
      }

      .icon-box {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        margin-bottom: 0;
        flex-shrink: 0;
      }
      
      .icon-box svg {
        width: 14px;
        height: 14px;
      }

      .stat-info {
        align-items: flex-start; 
        width: 100%;
        gap: 4px;
        min-width: 0;
      }

      .stat-label {
        font-size: 8px; 
        letter-spacing: 0;
        opacity: 0.7;
        margin-bottom: 0;
        width: 100%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
      }

      .stat-value {
        font-size: 28px;
        font-weight: 800;
        width: 100%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .stat-subtext {
        display: none; 
      }
    }

    /* Hover Effects (Desktop Only) */
    @media (min-width: 769px) {
      .stat-card:hover {
        transform: translateY(-4px);
        background: var(--ethereal-bg-hover);
        border-color: var(--ethereal-border-hover);
        box-shadow: var(--ethereal-shadow-hover);
      }
      .stat-card:hover .icon-box {
        background: var(--card-color);
        color: #000;
        box-shadow: 0 0 15px var(--card-color);
      }
    }

    /* Animation */
    .fade-in {
      animation: fade-enter 0.6s backwards;
    }
    @keyframes fade-enter {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `

  return (
    <div className="ethereal-stats-wrapper">
      <style>{styles}</style>
      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div 
              key={card.id} 
              className="stat-card fade-in"
              style={{ 
                '--card-color': card.color,
                animationDelay: card.delay 
              }}
            >
              <div className="icon-box">
                {Icon && <Icon />}
              </div>
              <div className="stat-info">
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-subtext">{card.subtext}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EtherealStatsCards