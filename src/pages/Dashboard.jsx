import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'

// Import Dashboard Widgets
import XPProgressWidget from '../components/dashboard/XPProgressWidget'
import DailyRitualWidget from '../components/dashboard/DailyRitualWidget'
import CoherenceWidget from '../components/dashboard/CoherenceWidget'
import AchievementsWidget from '../components/dashboard/AchievementsWidget'
import CurrentLessonWidget from '../components/dashboard/CurrentLessonWidget'
import ConstellationNavigatorWidget from '../components/dashboard/ConstellationNavigatorWidget'
import TeacherFeedWidget from '../components/dashboard/TeacherFeedWidget'
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget'

const Dashboard = () => {
  const { user, profile, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Mock data - replace with real API calls
  const [dashboardData, setDashboardData] = useState({
    ritual: {
      completed: false,
      streak: 7,
      xpReward: 50
    },
    coherence: {
      energy: 75,
      mind: 85,
      heart: 90
    },
    achievements: {
      recent: [
        { name: 'First Lesson', iconUrl: null },
        { name: '7-Day Streak', iconUrl: null }
      ],
      total: 12,
      nextUnlock: {
        name: 'Scholar',
        progress: 5,
        total: 10
      }
    },
    currentLesson: {
      lessonId: null,
      lessonTitle: 'No active lesson',
      courseTitle: '',
      progressPercentage: 0,
      timeRemaining: 0,
      thumbnailUrl: null
    },
    constellation: {
      currentSchool: 'Insight',
      currentConstellation: {
        name: 'Consciousness Studies',
        nodes: [
          { id: '1', name: 'The Observer', completed: true, isCurrent: false },
          { id: '2', name: 'Awareness', completed: true, isCurrent: false },
          { id: '3', name: 'Presence', completed: false, isCurrent: true },
          { id: '4', name: 'Being', completed: false, isCurrent: false },
          { id: '5', name: 'Non-Duality', completed: false, isCurrent: false }
        ]
      }
    },
    teacherFeed: {
      posts: []
    }
  })

  // Handle payment success redirect
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')

    if (payment === 'success' && sessionId && user) {
      alert('🎉 Payment completed! Processing your subscription...')

      fetch(`http://localhost:3001/api/payment-success?session_id=${sessionId}`)
        .then(response => response.json())
        .then(data => {
          alert(`✅ Subscription activated! Your role is now: ${data.role}`)
          fetchProfile(user.id)
          navigate('/dashboard', { replace: true })
        })
        .catch(error => {
          console.error('Error processing payment success:', error)
          alert('⚠️ Payment completed but there was an error updating your subscription.')
          fetchProfile(user.id)
          navigate('/dashboard', { replace: true })
        })
    }
  }, [searchParams, user, fetchProfile, navigate])

  const displayName = profile?.full_name || user?.email || 'User'
  const userRole = profile?.role || 'Free'

  // Determine phase based on level
  const getPhase = (level) => {
    if (level >= 50) return 'god_mode'
    if (level >= 30) return 'transformation'
    if (level >= 10) return 'insight'
    return 'ignition'
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Welcome back, <span className="text-[#B4833D] font-medium">{displayName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${userRole === 'Free' ? 'bg-[#F7F1E1] text-[#66371B] border-[#B4833D]/20' :
              userRole === 'Student' ? 'bg-[#E3D8C1] text-[#66371B] border-[#B4833D]/30' :
                'bg-[#B4833D]/20 text-[#B4833D] border-[#B4833D]/40'
              }`}>
              {userRole} Plan
            </span>
          </div>
        </div>
      </header>

      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <XPProgressWidget
          level={profile?.level || 1}
          currentXP={profile?.current_xp || 0}
          nextLevelXP={(profile?.level || 1) * 1000}
          phase={getPhase(profile?.level || 1)}
        />

        <DailyRitualWidget
          completed={dashboardData.ritual.completed}
          streak={dashboardData.ritual.streak}
          xpReward={dashboardData.ritual.xpReward}
        />

        <CoherenceWidget
          energy={dashboardData.coherence.energy}
          mind={dashboardData.coherence.mind}
          heart={dashboardData.coherence.heart}
        />

        <AchievementsWidget
          recentAchievements={dashboardData.achievements.recent}
          totalCount={dashboardData.achievements.total}
          nextUnlock={dashboardData.achievements.nextUnlock}
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <CurrentLessonWidget
            lessonId={dashboardData.currentLesson.lessonId}
            lessonTitle={dashboardData.currentLesson.lessonTitle}
            courseTitle={dashboardData.currentLesson.courseTitle}
            progressPercentage={dashboardData.currentLesson.progressPercentage}
            timeRemaining={dashboardData.currentLesson.timeRemaining}
            thumbnailUrl={dashboardData.currentLesson.thumbnailUrl}
          />
        </div>

        <div>
          <QuickActionsWidget />
        </div>
      </div>

      {/* Constellation Navigator */}
      <div className="mb-8">
        <ConstellationNavigatorWidget
          currentSchool={dashboardData.constellation.currentSchool}
          currentConstellation={dashboardData.constellation.currentConstellation}
        />
      </div>

      {/* Teacher Feed */}
      <div className="mb-8">
        <TeacherFeedWidget posts={dashboardData.teacherFeed.posts} />
      </div>
    </div>
  )
}

export default Dashboard