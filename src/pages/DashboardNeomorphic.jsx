import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import SEOHead from '../components/SEOHead'
import levelsService from '../services/levelsService'
import useSubscription from '../hooks/useSubscription'
import UpgradeModal from '../components/UpgradeModal'
import { Clock, BookOpen, Award, Target, TrendingUp, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

// Import Dashboard Components
import StreakCard from '../components/dashboard/StreakCard'
import ActiveCourseCard from '../components/dashboard/ActiveCourseCard'
import QuickActionsGrid from '../components/dashboard/QuickActionsGrid'
import StatCard from '../components/dashboard/StatCard'
import StatCardV2 from '../components/dashboard/StatCardV2'
import XPCircleWidgetV2 from '../components/dashboard/XPCircleWidgetV2'
import XPProgressChart from '../components/dashboard/XPProgressChart'
import MoodTracker from '../components/dashboard/MoodTracker'
import SchoolProgressAreaChartMobile from '../components/dashboard/SchoolProgressAreaChartMobile'
import SchoolProgressAreaChartDesktop from '../components/dashboard/SchoolProgressAreaChartDesktop'
import AllLessonsCard from '../components/dashboard/AllLessonsCard'
import HabitsCompletedCard from '../components/dashboard/HabitsCompletedCard'

import './DashboardNeomorphic.css'

const DashboardNeomorphic = () => {
  const { user, profile, fetchProfile } = useAuth()
  const { isFreeUser, isAdmin } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentProcessed, setPaymentProcessed] = useState(false)
  
  // Level data
  const [levelData, setLevelData] = useState({
    level: 1,
    levelTitle: '',
    currentXP: 0,
    nextLevelXP: 1000,
    xpToNext: 1000
  })

  // Dashboard stats
  const [stats, setStats] = useState({
    streak: 0,
    streakRecord: 0,
    timeThisWeek: '0h',
    lessonsCompleted: 0,
    achievementsUnlocked: 0,
    coursesActive: 0
  })

  // Active course
  const [activeCourse, setActiveCourse] = useState(null)

  // Show upgrade modal if redirected from restricted route
  useEffect(() => {
    const upgradePrompt = searchParams.get('upgradePrompt')
    if (upgradePrompt === 'true' && !isAdmin) {
      setShowUpgradeModal(true)
      navigate('/dashboard', { replace: true })
    } else if (upgradePrompt === 'true' && isAdmin) {
      navigate('/dashboard', { replace: true })
    }
  }, [searchParams, navigate, isAdmin])

  // Handle payment success redirect - PRIMARY: Use API server directly
  useEffect(() => {
    // CRITICAL: Always check URL params directly from window.location (more reliable)
    const urlParams = new URLSearchParams(window.location.search)
    const payment = urlParams.get('payment') || searchParams.get('payment')
    const sessionId = urlParams.get('session_id') || searchParams.get('session_id')

    // CRITICAL: Always log this to debug - FORCE LOG even in production
    console.log('🔍🔍🔍 Payment success check (DashboardNeomorphic - FORCED LOG):', { 
      payment, 
      sessionId, 
      hasUser: !!user, 
      userId: user?.id, 
      hasProfile: !!profile,
      profileRole: profile?.role,
      searchParams: searchParams.toString(),
      windowLocation: window.location.href,
      timestamp: new Date().toISOString(),
      paymentProcessed
    })

    // Prevent duplicate processing
    if (paymentProcessed) {
      console.log('⚠️ Payment already processed, skipping...')
      return
    }

    // Si on a payment=success mais pas encore user, attendre un peu avec retry
    if (payment === 'success' && sessionId && !user) {
      console.log('⏳ Waiting for user to load before processing payment...')
      // Retry après 1 seconde
      const retryTimer = setTimeout(() => {
        console.log('🔄 Retrying payment processing after user load delay...')
        // Le useEffect se re-déclenchera quand user sera chargé
      }, 1000)
      return () => clearTimeout(retryTimer)
    }

    // CRITICAL: Process payment immediately when conditions are met
    if (payment === 'success' && sessionId && user && !paymentProcessed) {
      setPaymentProcessed(true) // Mark as processed immediately
      
      console.log('🎯🎯🎯 PAYMENT SUCCESS DETECTED - STARTING PROCESSING 🎯🎯🎯')
      console.log('🎯 PAYMENT SUCCESS DETECTED:', { payment, sessionId, userId: user.id })
      console.log('🎯 Current profile role:', profile?.role)
      
      // Determine API URL: use Vite env var with proper fallback
      const API_URL = import.meta.env.VITE_API_URL || 
                      (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                        ? 'http://localhost:3001' 
                        : window.location.origin)
      
      toast.success('🎉 Payment completed! Processing your subscription...')
      console.log('🔄 Processing payment success for session:', sessionId)
      console.log('📍 API URL:', API_URL)

      // PRIMARY: Use API server directly (most reliable)
      const processPaymentSuccess = async () => {
        try {
          console.log('🔄 Processing payment success via API server...', { sessionId, userId: user.id })
          
          // PRIMARY METHOD: Call API server directly
          try {
            console.log('📞 Calling API server to update subscription...')
            const API_URL = import.meta.env.VITE_API_URL || 
                            (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                              ? 'http://localhost:3001' 
                              : window.location.origin)
            
            console.log('🌐 API server URL:', `${API_URL}/api/payment-success?session_id=${sessionId}`)
            
            const response = await fetch(`${API_URL}/api/payment-success?session_id=${sessionId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: AbortSignal.timeout(20000) // 20 second timeout
            })
            
            console.log('📥 API server response status:', response.status)
            
            if (response.ok) {
              const data = await response.json()
              console.log('✅ API server updated subscription successfully:', data)
              toast.success('✅ Subscription activated!')
              // Wait a bit for DB to update
              await new Promise(resolve => setTimeout(resolve, 1500))
              if (fetchProfile) {
                await fetchProfile(user.id)
              }
              return { success: true }
            } else {
              const errorText = await response.text()
              console.error('❌ API server error:', response.status, errorText)
              throw new Error(`API server returned ${response.status}: ${errorText}`)
            }
          } catch (apiError) {
            console.error('❌ API server call failed:', apiError)
            console.error('API Error details:', {
              message: apiError.message,
              name: apiError.name,
              stack: apiError.stack
            })
            throw apiError
          }
          
        } catch (error) {
          console.error('❌ Payment success processing error:', error)
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          })
          
          // Show user-friendly message
          toast.warning('Payment successful! Subscription update may take a moment. Please refresh the page in a few seconds.')
          
          // Always refresh profile in case update happened anyway
          await new Promise(resolve => setTimeout(resolve, 2000))
          if (fetchProfile) {
            await fetchProfile(user.id)
          }
          
          return null
        }
      }
      
      // Start processing IMMEDIATELY
      console.log('🚀 Starting payment processing function...')
      processPaymentSuccess()
        .then((result) => {
          console.log('✅ Payment processing completed:', result)
          // Clean up URL
          const newParams = new URLSearchParams(searchParams)
          newParams.delete('payment')
          newParams.delete('session_id')
          navigate({ search: newParams.toString() }, { replace: true })
        })
        .catch(error => {
          console.error('❌ Error processing payment success:', error)
          console.error('Error stack:', error.stack)
          // Clean up URL even on error
          const newParams = new URLSearchParams(searchParams)
          newParams.delete('payment')
          newParams.delete('session_id')
          navigate({ search: newParams.toString() }, { replace: true })
        })
    } else {
      // Log when conditions are not met
      if (payment === 'success' && !sessionId) {
        console.warn('⚠️ Payment=success but no session_id in URL')
      }
      if (payment === 'success' && sessionId && !user) {
        console.log('⏳ Payment success detected but user not loaded yet')
      }
    }
  }, [searchParams, user, profile, fetchProfile, navigate, paymentProcessed])

  // Load level data
  const loadLevelData = useCallback(async () => {
    if (!profile) return

    try {
      const currentXP = profile.current_xp || 0

      // Prefer DB-provided rank/level when available
      let level = profile.level || 0
      let levelTitle = profile.rank || ''
      let nextLevelXP = (level + 1) * 1000
      let xpToNext = Math.max(0, nextLevelXP - currentXP)

      // If we have xp_to_next_level from DB triggers, use it for accuracy
      if (profile.xp_to_next_level !== undefined && profile.xp_to_next_level !== null) {
        xpToNext = Math.max(0, profile.xp_to_next_level)
        nextLevelXP = currentXP + xpToNext
      }

      // Fetch canonical level titles/thresholds from levels table when possible
      const { data: levelInfo, error } = await levelsService.getCurrentAndNextLevel(currentXP)
      if (!error && levelInfo?.currentLevel) {
        level = levelInfo.currentLevel.level_number ?? level
        levelTitle = levelInfo.currentLevel.title || levelTitle
        if (levelInfo.nextLevel?.xp_threshold !== undefined && levelInfo.nextLevel?.xp_threshold !== null) {
          nextLevelXP = levelInfo.nextLevel.xp_threshold
          xpToNext = Math.max(0, nextLevelXP - currentXP)
        } else {
          xpToNext = 0
        }
      }

      setLevelData({
        level: level || 0,
        levelTitle: levelTitle || `Level ${level || 0}`,
        currentXP,
        nextLevelXP,
        xpToNext
      })
    } catch (error) {
      console.error('Error loading level data:', error)
    }
  }, [profile])

  // Load streak data - Get max streak from all habits
  const loadStreakData = useCallback(async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('user_habits')
        .select('streak, streak_record')
        .eq('user_id', profile.id)

      if (!error && data && data.length > 0) {
        const maxStreak = Math.max(...data.map(h => h.streak || 0))
        const maxStreakRecord = Math.max(...data.map(h => h.streak_record || 0))
        setStats(prev => ({
          ...prev,
          streak: maxStreak,
          streakRecord: maxStreakRecord
        }))
      } else {
        setStats(prev => ({
          ...prev,
          streak: 0,
          streakRecord: 0
        }))
      }
    } catch (error) {
      console.error('Error loading streak:', error)
    }
  }, [profile])

  // Load stats
  const loadStats = useCallback(async () => {
    if (!profile) return

    try {
      // Get time this week (from XP logs)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { data: xpLogs } = await supabase
        .from('xp_logs')
        .select('xp_earned, created_at')
        .eq('user_id', profile.id)
        .gte('created_at', oneWeekAgo.toISOString())

      // Estimate hours (assuming 50 XP per hour of learning)
      const totalXP = xpLogs?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0
      const hours = Math.floor(totalXP / 50)
      
      // Get lessons completed
      const { count: lessonsCount } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_completed', true)

      // Get achievements
      const { count: achievementsCount } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      // Get active courses
      const { count: coursesCount } = await supabase
        .from('user_lesson_progress')
        .select('course_id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_completed', false)

      setStats(prev => ({
        ...prev,
        timeThisWeek: `${hours}h`,
        lessonsCompleted: lessonsCount || 0,
        achievementsUnlocked: achievementsCount || 0,
        coursesActive: coursesCount || 0
      }))
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [profile])

  // Load active course
  const loadActiveCourse = useCallback(async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select(`
          *,
          courses:course_id (
            id,
            title,
            thumbnail_url,
            description
          )
        `)
        .eq('user_id', profile.id)
        .eq('is_completed', false)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data && data.courses) {
        // Get total lessons count
        const { count } = await supabase
          .from('course_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', data.courses.id)

        // Get completed lessons count
        const { count: completedCount } = await supabase
          .from('user_lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('course_id', data.courses.id)
          .eq('is_completed', true)

        const progress = count > 0 ? Math.round((completedCount / count) * 100) : 0
        
        setActiveCourse({
          title: data.courses.title,
          image: data.courses.thumbnail_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          progress,
          lessonsCompleted: completedCount || 0,
          totalLessons: count || 0,
          timeRemaining: `${Math.ceil((count - completedCount) * 0.5)}h`,
          courseId: data.courses.id
        })
      }
    } catch (error) {
      console.error('Error loading active course:', error)
    }
  }, [profile])

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      await Promise.all([
        loadLevelData(),
        loadStreakData(),
        loadStats(),
        loadActiveCourse()
      ])
      setLoading(false)
    }

    if (profile) {
      loadAllData()
    }
  }, [profile, loadLevelData, loadStreakData, loadStats, loadActiveCourse])

  // Handle quick action clicks
  const handleActionClick = (actionId) => {
    const routes = {
      courses: '/courses',
      achievements: '/achievements',
      calendar: '/mastery?tab=calendar',
      goals: '/mastery',
      community: '/community',
      favorites: '/courses',
      boost: '/pricing',
      settings: '/settings'
    }
    
    if (routes[actionId]) {
      navigate(routes[actionId])
    }
  }

  // Handle course click
  const handleCourseClick = () => {
    if (activeCourse) {
      navigate(`/course/${activeCourse.courseId}`)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-neomorphic">
      <SEOHead
        title="Dashboard | HC University"
        description="Your personalized learning dashboard"
      />

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {(() => {
              const hour = new Date().getHours();
              const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
              const name = profile?.full_name ? profile.full_name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : 'Student';
              return `${greeting}, ${name}!`;
            })()}
          </h1>
          <p className="dashboard-subtitle">Continue your transformation journey</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Hero - XP Circle */}
        <div className="grid-hero">
          <XPCircleWidgetV2
            currentXP={levelData.currentXP}
            levelXP={levelData.nextLevelXP}
            level={levelData.level}
            nextLevel={levelData.level + 1}
            levelTitle={levelData.levelTitle}
            isActive={true}
          />
        </div>

        {/* Stats Row */}
        <div className="grid-stats">
          <StreakCard 
            streak={stats.streak} 
            record={stats.streakRecord} 
          />
          <StatCardV2
            icon={Clock}
            value={stats.timeThisWeek}
            label="This Week"
            subtitle="Learning time"
          />
          <StatCardV2
            icon={BookOpen}
            value={stats.lessonsCompleted}
            label="Lessons"
            subtitle="Completed"
          />
          <StatCardV2
            icon={Award}
            value={stats.achievementsUnlocked}
            label="Achievements"
            subtitle="Unlocked"
          />
        </div>

        {/* Mood Tracker */}
        <div className="grid-mood-tracker">
          <MoodTracker userId={profile?.id} />
        </div>

        {/* XP Progress Chart */}
        <div className="grid-chart">
          <XPProgressChart userId={profile?.id} />
        </div>

        {/* School Progress Area Chart */}
        {/* School Progress Chart - Temporarily hidden until visibility issue is fixed */}
        {/* <div className="grid-chart">
          <div className="lg:hidden">
            <SchoolProgressAreaChartMobile userId={profile?.id} />
          </div>
          <div className="hidden lg:block">
            <SchoolProgressAreaChartDesktop userId={profile?.id} />
          </div>
        </div> */}

        {/* All Lessons Card */}
        <div className="grid-chart">
          <AllLessonsCard />
        </div>

        {/* Habits Completed Card */}
        <div className="grid-chart">
          <HabitsCompletedCard />
        </div>

        {/* Active Course */}
        {activeCourse && (
          <div className="grid-course">
            <ActiveCourseCard
              title={activeCourse.title}
              image={activeCourse.image}
              progress={activeCourse.progress}
              lessonsCompleted={activeCourse.lessonsCompleted}
              totalLessons={activeCourse.totalLessons}
              timeRemaining={activeCourse.timeRemaining}
              onClick={handleCourseClick}
            />
          </div>
        )}

        {/* Quick Actions - Removed on mobile (menu already provides navigation) */}

        {/* Additional Stats - Only for paid users */}
        {(!isFreeUser || isAdmin) && (
          <div className="grid-stats-extra">
            <div className="grid-stat-extra">
              <StatCardV2
                icon={Target}
                value={`${Math.round((stats.lessonsCompleted / (stats.lessonsCompleted + 10)) * 100)}%`}
                label="Weekly Goal"
                subtitle="On track"
              />
            </div>
            <div className="grid-stat-extra">
              <StatCardV2
                icon={TrendingUp}
                value={stats.coursesActive}
                label="Active Courses"
                subtitle="In progress"
              />
            </div>
            <div className="grid-stat-extra">
              <StatCardV2
                icon={Calendar}
                value="5"
                label="This Month"
                subtitle="Sessions planned"
              />
            </div>
          </div>
        )}
      </div>

      {/* Upgrade prompt for free users */}
      {isFreeUser && !isAdmin && (
        <div className="upgrade-prompt">
          <h3>🚀 Unlock Your Full Potential</h3>
          <p>
            Upgrade to access advanced analytics, unlimited courses, and exclusive content!
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="upgrade-button"
          >
            View Plans
          </button>
        </div>
      )}

      {/* Upgrade Modal */}
      {!isAdmin && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          restrictedFeature={searchParams.get('restrictedFeature')}
        />
      )}
    </div>
  )
}

export default DashboardNeomorphic

