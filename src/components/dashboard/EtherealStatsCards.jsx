import React from 'react'
import { Flame, Brain, Activity, Crown } from 'lucide-react'

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
      icon: <Flame size={20} />,
      color: '#fb923c', // Orange/Gold
      delay: '0s'
    },
    {
      id: 2,
      label: 'Engrams', // Replaces Currency (Lessons/Modules)
      value: lessonsDisplay,
      subtext: 'Modules Integrated', // Lessons Completed
      icon: <Brain size={20} />,
      color: '#38bdf8', // Sky Blue
      delay: '0.1s'
    },
    {
      id: 3,
      label: 'Clarity',
      value: learningTimeDisplay,
      subtext: 'Neural Precision', // Learning Time
      icon: <Activity size={20} />,
      color: '#34d399', // Emerald
      delay: '0.2s'
    },
    {
      id: 4,
      label: 'Ascension',
      value: achievementsDisplay,
      subtext: 'Current Plane', // Achievements Unlocked
      icon: <Crown size={20} />,
      color: '#a78bfa', // Violet
      delay: '0.3s'
    }
  ]

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600;700&display=swap');

    .ethereal-stats-wrapper {
      width: 100%;
      max-width: 100%;
      display: block;
      box-sizing: border-box;
      overflow: hidden;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      font-family: 'Rajdhani', sans-serif;
      box-sizing: border-box;
      overflow: hidden;
    }

    @media (min-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
    }

    @media (max-width: 767px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        min-width: 0;
        width: 100%;
        max-width: 100%;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        gap: 6px;
        padding: 0;
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
      gap: 12px;
      min-height: 140px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      min-width: 0;
    }

    @media (max-width: 767px) {
      .stat-card {
        padding: 16px;
        min-height: 120px;
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .stat-card {
        padding: 12px;
        min-height: 110px;
        gap: 6px;
      }
    }

    .stat-card:hover {
      transform: translateY(-5px);
      background: rgba(20, 20, 25, 0.6);
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
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
    .stat-card:hover::before {
      opacity: 0.15;
    }

    /* Icon Container */
    .icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--card-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .stat-card:hover .icon-box {
      background: var(--card-color);
      color: #000;
      box-shadow: 0 0 15px var(--card-color);
      transform: scale(1.1);
    }

    /* Text */
    .stat-label {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.4);
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      line-height: 1;
      text-shadow: 0 0 20px rgba(0,0,0,0.5);
    }

    .stat-subtext {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 0.5px;
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
    
    .stat-card:hover .card-particle {
      animation: float-up 2s infinite ease-out;
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
      <div className="ethereal-stats-wrapper" style={{ width: '100%' }}>
        <div className="stats-grid">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="stat-card fade-in"
              style={{ 
                '--card-color': card.color,
                animationDelay: card.delay 
              }}
            >
              <div className="icon-box">
                {card.icon}
              </div>
              <div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-subtext">{card.subtext}</div>
              </div>

              {/* Decorative Particles that appear on hover */}
              <div className="card-particle" style={{ left: '20%', bottom: '10%', animationDelay: '0s' }}></div>
              <div className="card-particle" style={{ left: '80%', bottom: '20%', animationDelay: '0.5s' }}></div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default EtherealStatsCards
