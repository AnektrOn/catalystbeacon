import React from 'react'
import { Flame, Brain, Activity, Crown } from 'lucide-react'

// Verify all icons are imported correctly
if (!Flame || !Brain || !Activity || !Crown) {
  console.error('Missing icons from lucide-react:', { Flame: !!Flame, Brain: !!Brain, Activity: !!Activity, Crown: !!Crown })
}

const EtherealStatsCards = ({ 
  streak = 0, 
  lessonsCompleted = 0, 
  learningTime = 0, // hours
  achievementsUnlocked = 0
}) => {
  // Format streak
  const streakDisplay = streak > 0 ? `${streak} Days` : '0 Days'
  
  // Format lessons completed
  const lessonsDisplay = lessonsCompleted.toString()
  
  // Format learning time (in hours)
  const learningTimeDisplay = learningTime > 0 ? `${learningTime}h` : '0h'
  
  // Format achievements - show count
  const achievementsDisplay = achievementsUnlocked.toString()

  // Debug log
  console.log('EtherealStatsCards rendering with:', { streak, lessonsCompleted, learningTime, achievementsUnlocked })

  const cards = [
    {
      id: 1,
      label: 'Resonance',
      value: streakDisplay,
      subtext: 'Harmonic Streak', // Learning Streak
      icon: Flame,
      color: '#fb923c', // Orange/Gold
      delay: '0s'
    },
    {
      id: 2,
      label: 'Engrams', // Replaces Currency (Lessons/Modules)
      value: lessonsDisplay,
      subtext: 'Modules Integrated', // Lessons Completed
      icon: Brain,
      color: '#38bdf8', // Sky Blue
      delay: '0.1s'
    },
    {
      id: 3,
      label: 'Clarity',
      value: learningTimeDisplay,
      subtext: 'Neural Precision', // Learning Time
      icon: Activity,
      color: '#34d399', // Emerald
      delay: '0.2s'
    },
    {
      id: 4,
      label: 'Ascension',
      value: achievementsDisplay,
      subtext: 'Current Plane', // Achievements Unlocked
      icon: Crown,
      color: '#a78bfa', // Violet
      delay: '0.3s'
    }
  ]

  // Verify all card icons are defined
  cards.forEach(card => {
    if (!card.icon) {
      console.error(`Card ${card.id} has undefined icon:`, card)
    }
  })

  const styles = `
    /* Uses global fonts and variables from ethereal-design-system.css */

    .ethereal-stats-wrapper {
      width: 100%;
      max-width: 100%;
      display: block;
      box-sizing: border-box;
      overflow: hidden;
    }

    .stats-grid {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 4px !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      font-family: 'Rajdhani', sans-serif;
      overflow: hidden;
      min-width: 0;
    }

    @media (min-width: 768px) {
      .stats-grid {
        gap: 16px !important;
        grid-template-columns: repeat(4, 1fr) !important;
      }
    }

    /* Mobile: Keep 4 columns on 1 row - FORCE IT */
    @media (max-width: 767px) {
      .stats-grid {
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 4px !important;
        min-width: 0;
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      
      .ethereal-stats-wrapper {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }
      
      .stat-card {
        min-width: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        padding: 8px !important;
        min-height: 90px !important;
        gap: 4px !important;
      }
    }

    .stat-card {
      position: relative;
      background: rgba(8, 8, 12, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 20px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: default;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      gap: 12px;
      min-height: 140px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      min-width: 0;
      flex: 1 1 0;
      overflow-wrap: break-word;
      word-wrap: break-word;
      align-self: stretch;
    }

    @media (max-width: 767px) {
      .stat-card {
        padding: 8px;
        min-height: 90px;
        gap: 4px;
        border-radius: 10px;
      }
    }

    /* Hover only works on devices with hover capability (desktop) */
    @media (hover: hover) and (pointer: fine) {
      .stat-card:hover {
        transform: translateY(-5px);
        background: rgba(20, 20, 25, 0.6);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
      }
      
      .stat-card:hover::before {
        opacity: 0.15;
      }
      
      
    }

    /* Inner Glow Gradient */
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at top right, var(--card-color), transparent 60%);
      opacity: 0.05;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    

    /* Icon Container */
    .icon-box {
      width: 36px;
      height: 36px;
      min-width: 36px;
      flex-shrink: 0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--card-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    @media (max-width: 767px) {
      .icon-box {
        width: 24px;
        height: 24px;
        min-width: 24px;
      }
    }
    

    /* Text - Uses global fonts */
    .stat-label {
      font-family: var(--font-ethereal-heading);
      font-size: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.4);
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      font-family: var(--font-ethereal-body);
      color: var(--ethereal-white);
      line-height: 1;
      text-shadow: 0 0 20px rgba(0,0,0,0.5);
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .stat-subtext {
      font-size: 11px;
      font-family: var(--font-ethereal-body);
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 0.5px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    @media (max-width: 767px) {
      .stat-value {
        font-size: 14px;
      }
      .stat-label {
        font-size: 7px;
        letter-spacing: 0.5px;
      }
      .stat-subtext {
        font-size: 8px;
      }
    }


    /* Floating Particles for cards */
    .card-particle {
      position: absolute;
      width: 2px; height: 2px;
      background: var(--card-color);
      border-radius: 50%;
      opacity: 0;
      pointer-events: none;
    }
    
    /* Particles animation on hover (desktop only) */
    @media (hover: hover) and (pointer: fine) {
      .stat-card:hover .card-particle {
        animation: float-up 2s infinite ease-out;
      }
    }

    @keyframes float-up {
      0% { transform: translateY(0); opacity: 0; }
      50% { opacity: 0.8; }
      100% { transform: translateY(-30px); opacity: 0; }
    }

    /* Staggered entrance */
    .fade-in {
      animation: fade-enter 0.6s backwards;
    }
    @keyframes fade-enter {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `

  return (
    <>
      <style>{styles}</style>
      <div className="ethereal-stats-wrapper" style={{ 
        width: '100%', 
        maxWidth: '100%', 
        boxSizing: 'border-box',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        minWidth: 0
      }}>
        <div className="stats-grid" style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
          {cards.map((card) => {
            const Icon = card.icon
            if (!Icon) {
              console.error(`Icon is undefined for card ${card.id}:`, card)
              return null
            }
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
                <Icon size={16} />
              </div>
            <div style={{ width: '100%', minWidth: 0, flex: 1, maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-subtext">{card.subtext}</div>
            </div>

              {/* Decorative Particles that appear on hover */}
              <div className="card-particle" style={{ left: '20%', bottom: '10%', animationDelay: '0s' }}></div>
              <div className="card-particle" style={{ left: '80%', bottom: '20%', animationDelay: '0.5s' }}></div>
            </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default EtherealStatsCards
