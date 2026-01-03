import React from 'react'
import StatCardV2 from './StatCardV2'
import { Clock, BookOpen, Award, TrendingUp } from 'lucide-react'

/**
 * Test page to showcase StatCardV2 with different color palettes
 */
const StatCardV2Test = () => {
  return (
    <div style={{ 
      padding: '40px', 
      background: '#1a1a1d',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>
        StatCardV2 - Color Palette Tests
      </h1>

      {/* Dark Mode Tests */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ color: '#a0a0a5', marginBottom: '20px', fontSize: '18px' }}>
          Dark Mode (Default)
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          <StatCardV2
            icon={Clock}
            value="24h"
            label="This Week"
            subtitle="8h more than last"
            accentColor="#B4833D"
          />
          <StatCardV2
            icon={BookOpen}
            value="42"
            label="Lessons"
            subtitle="Completed"
            accentColor="#3B82F6"
          />
          <StatCardV2
            icon={Award}
            value="18"
            label="Achievements"
            subtitle="Unlocked"
            accentColor="#10B981"
          />
          <StatCardV2
            icon={TrendingUp}
            value="85%"
            label="Progress"
            subtitle="On track"
            accentColor="#F97316"
          />
        </div>

        <h3 style={{ color: '#a0a0a5', marginBottom: '20px', fontSize: '16px' }}>
          All Color Palettes
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          {/* Earth Tone */}
          <StatCardV2
            icon={Award}
            value="12"
            label="Earth Tone"
            accentColor="#B4833D"
          />
          
          {/* Ocean Blue */}
          <StatCardV2
            icon={Award}
            value="12"
            label="Ocean Blue"
            accentColor="#3B82F6"
          />
          
          {/* Forest Green */}
          <StatCardV2
            icon={Award}
            value="12"
            label="Forest Green"
            accentColor="#10B981"
          />
          
          {/* Sunset Orange */}
          <StatCardV2
            icon={Award}
            value="12"
            label="Sunset"
            accentColor="#F97316"
          />
          
          {/* Ocean Teal */}
          <StatCardV2
            icon={Award}
            value="12"
            label="Ocean Teal"
            accentColor="#14B8A6"
          />
          
          {/* Rose Pink */}
          <StatCardV2
            icon={Award}
            value="12"
            label="Rose Pink"
            accentColor="#F43F5E"
          />
          
          {/* Lavender */}
          <StatCardV2
            icon={Award}
            value="12"
            label="Lavender"
            accentColor="#A78BFA"
          />
          
          {/* Amber */}
          <StatCardV2
            icon={Award}
            value="12"
            label="Amber"
            accentColor="#F59E0B"
          />
        </div>
      </section>

      {/* Light Mode Tests */}
      <section style={{ 
        background: '#f5f5f7', 
        padding: '40px',
        borderRadius: '20px'
      }}>
        <h2 style={{ color: '#1d1d1f', marginBottom: '20px', fontSize: '18px' }}>
          Light Mode
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          <div className="stat-card-v2 light-mode" style={{ '--accent': '#B4833D' }}>
            <div className="stat-card-v2-icon">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <div className="stat-card-v2-content">
              <div className="stat-card-v2-value">24h</div>
              <div className="stat-card-v2-label">This Week</div>
              <div className="stat-card-v2-subtitle">Earth Tone</div>
            </div>
          </div>

          <div className="stat-card-v2 light-mode" style={{ '--accent': '#3B82F6' }}>
            <div className="stat-card-v2-icon">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <div className="stat-card-v2-content">
              <div className="stat-card-v2-value">42</div>
              <div className="stat-card-v2-label">Lessons</div>
              <div className="stat-card-v2-subtitle">Ocean Blue</div>
            </div>
          </div>

          <div className="stat-card-v2 light-mode" style={{ '--accent': '#10B981' }}>
            <div className="stat-card-v2-icon">
              <Award size={20} strokeWidth={2.5} />
            </div>
            <div className="stat-card-v2-content">
              <div className="stat-card-v2-value">18</div>
              <div className="stat-card-v2-label">Achievements</div>
              <div className="stat-card-v2-subtitle">Forest Green</div>
            </div>
          </div>

          <div className="stat-card-v2 light-mode" style={{ '--accent': '#F97316' }}>
            <div className="stat-card-v2-icon">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <div className="stat-card-v2-content">
              <div className="stat-card-v2-value">85%</div>
              <div className="stat-card-v2-label">Progress</div>
              <div className="stat-card-v2-subtitle">Sunset Orange</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StatCardV2Test

