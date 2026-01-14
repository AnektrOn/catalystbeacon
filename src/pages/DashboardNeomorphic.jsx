import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePageTransition } from '../contexts/PageTransitionContext'
import { supabase } from '../lib/supabaseClient'
import SEOHead from '../components/SEOHead'
import levelsService from '../services/levelsService'
import courseService from '../services/courseService'
import socialService from '../services/socialService'
import useSubscription from '../hooks/useSubscription'
import UpgradeModal from '../components/UpgradeModal'
import OnboardingModal from '../components/dashboard/OnboardingModal'
import toast from 'react-hot-toast'
import { getTodayStartISO } from '../utils/dateUtils'

// Import Dashboard Components
import XPCircleWidgetV2 from '../components/dashboard/XPCircleWidgetV2'
import XPProgressChart from '../components/dashboard/XPProgressChart'
import MoodTracker from '../components/dashboard/MoodTracker'
import SchoolProgressAreaChartMobile from '../components/dashboard/SchoolProgressAreaChartMobile'
import SchoolProgressAreaChartDesktop from '../components/dashboard/SchoolProgressAreaChartDesktop'
import AllLessonsCard from '../components/dashboard/AllLessonsCard'
import HabitsCompletedCard from '../components/dashboard/HabitsCompletedCard'
import ConstellationNavigatorWidget from '../components/dashboard/ConstellationNavigatorWidget'
import TeacherFeedWidget from '../components/dashboard/TeacherFeedWidget'
import EtherealStatsCards from '../components/dashboard/EtherealStatsCards'

import './DashboardNeomorphic.css'

const DashboardNeomorphic = () => {
  const { user, profile, fetchProfile } = useAuth()
  const { isFreeUser, isAdmin } = useSubscription()
  const { startTransition, endTransition } = usePageTransition()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
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


  // Dashboard data for widgets
  const [dashboardData, setDashboardData] = useState({
    ritual: {
      completed: false,
      streak: 0,
      xpReward: 50
    },
    constellation: {
      currentSchool: 'Ignition',
      currentConstellation: {
        name: '',
        nodes: []
      }
    },
    teacherFeed: {
      posts: []
    },
    stats: {
      learningTime: 0, // hours
      lessonsCompleted: 0,
      averageScore: 0
    },
    achievements: {
      total: 0
    }
  })

  // Show upgrade modal if redirected from restricted route
  // Show onboarding modal for new users
  useEffect(() => {
    // Only check for modals when user and profile are loaded
    if (!user || !profile) return
    
    const upgradePrompt = searchParams.get('upgradePrompt')
    const isNewUser = searchParams.get('new_user')

    // Check onboarding: URL param OR database flag (100% reliable)
    const shouldShowOnboarding = isNewUser === 'true' || 
                                 (profile.has_completed_onboarding === false && 
                                  profile.created_at && 
                                  new Date(profile.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Created in last 24 hours

    if (shouldShowOnboarding && !profile.has_completed_onboarding) {
      setShowOnboardingModal(true)
    } else if (upgradePrompt === 'true' && !isAdmin) {
      setShowUpgradeModal(true)
      navigate('/dashboard', { replace: true })
    } else if (upgradePrompt === 'true' && isAdmin) {
      navigate('/dashboard', { replace: true })
    }
  }, [searchParams, navigate, isAdmin, user, profile])

  // Handle payment success redirect - PRIMARY: Use API server directly
  useEffect(() => {
    // CRITICAL: Always check URL params directly from window.location (more reliable)
    const urlParams = new URLSearchParams(window.location.search)
    const payment = urlParams.get('payment') || searchParams.get('payment')
    const sessionId = urlParams.get('session_id') || searchParams.get('session_id')

    // Prevent duplicate processing
    if (paymentProcessed) {
      return
    }

    // Si on a payment=success mais pas encore user, attendre un peu avec retry
    if (payment === 'success' && sessionId && !user) {
      // Retry après 1 seconde
      const retryTimer = setTimeout(() => {
        // Le useEffect se re-déclenchera quand user sera chargé
      }, 1000)
      return () => clearTimeout(retryTimer)
    }

    // CRITICAL: Process payment immediately when conditions are met
    if (payment === 'success' && sessionId && user && !paymentProcessed) {
      setPaymentProcessed(true) // Mark as processed immediately
      
      // Determine API URL: use Create React App env var with proper fallback
      const API_URL = process.env.REACT_APP_API_URL || 
                      (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                        ? 'http://localhost:3001' 
                        : window.location.origin)
      
      toast.success('🎉 Payment completed! Processing your subscription...')

      // PRIMARY: Use API server directly (most reliable)
      const processPaymentSuccess = async () => {
        try {
          // PRIMARY METHOD: Call API server directly
          try {
            const API_URL = process.env.REACT_APP_API_URL || 
                            (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                              ? 'http://localhost:3001' 
                              : window.location.origin)
            
            const response = await fetch(`${API_URL}/api/payment-success?session_id=${sessionId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: AbortSignal.timeout(20000) // 20 second timeout
            })
            
            if (response.ok) {
              const data = await response.json()
              toast.success('✅ Subscription activated!')
              // Wait a bit for DB to update
              await new Promise(resolve => setTimeout(resolve, 1500))
              if (fetchProfile) {
                await fetchProfile(user.id)
              }
              return { success: true }
            } else {
              const errorText = await response.text()
              throw new Error(`API server returned ${response.status}: ${errorText}`)
            }
          } catch (apiError) {
            throw apiError
          }
          
        } catch (error) {
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
      processPaymentSuccess()
        .then((result) => {
          // Clean up URL
          const newParams = new URLSearchParams(searchParams)
          newParams.delete('payment')
          newParams.delete('session_id')
          navigate({ search: newParams.toString() }, { replace: true })
        })
        .catch(error => {
          // Clean up URL even on error
          const newParams = new URLSearchParams(searchParams)
          newParams.delete('payment')
          newParams.delete('session_id')
          navigate({ search: newParams.toString() }, { replace: true })
        })
    }
  }, [searchParams, user, profile, fetchProfile, navigate, paymentProcessed])

  // Load level data
  const loadLevelData = useCallback(async () => {
    if (!profile || !user) return

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
      // Don't show error toast - just continue
    }
  }, [profile, user])


  // Load daily ritual data (habits completion streak)
  const loadRitualData = useCallback(async () => {
    if (!user || !profile) return
    
    try {
      const streak = profile.completion_streak || 0
      
      // Check if ritual completed today (any habit completed today)
      const todayStart = getTodayStartISO()
      
      // Check habit completions for today
      const { data: completions, error: completionsError } = await supabase
        .from('user_habit_completions')
        .select('id')
        .eq('user_id', user.id)
        .gte('completed_at', todayStart)
        .limit(1)
      
      if (completionsError && completionsError.code !== 'PGRST116') {
        // Error loading habit completions
      }
      
      const completed = completions && completions.length > 0

      setDashboardData(prev => ({
        ...prev,
        ritual: {
          completed,
          streak,
          xpReward: 50
        }
      }))
    } catch (error) {
      // Error loading ritual data
    }
  }, [user, profile])


  // Load constellation data (current school and progress)
  const loadConstellationData = useCallback(async () => {
    if (!user || !profile) return
    
    try {
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('unlock_xp', { ascending: true })

      if (schoolsError && schoolsError.code !== 'PGRST116') {
        // Error loading schools
      }

      const userXp = profile.current_xp || 0
      let currentSchool = 'Ignition'
      
      if (schools && schools.length > 0) {
        for (const school of schools) {
          if (userXp >= school.unlock_xp) {
            currentSchool = school.name
          } else {
            break
          }
        }
      }

      const { data: courses, error: coursesError } = await courseService.getAllCourses({
        masterschool: currentSchool,
        userId: user.id
      })

      if (coursesError) {
        // Error loading courses
      }

      if (!courses || courses.length === 0) {
        setDashboardData(prev => ({
          ...prev,
          constellation: {
            currentSchool,
            currentConstellation: { name: `${currentSchool} Courses`, nodes: [] }
          }
        }))
        return
      }

      const nodes = await Promise.all(
        courses.slice(0, 5).map(async (course, index) => {
          try {
            if (!course.course_id) {
              return null;
            }
            const { data: progress, error: progressError } = await courseService.getUserCourseProgress(user.id, course.course_id)
            // Progress errors are non-critical - just continue without progress data
            if (progressError) {
              // Error loading course progress (non-critical)
            }
            const isCompleted = progress?.status === 'completed'
            const isCurrent = index === 0 && progress?.status === 'in_progress'

            return {
              id: course.id,
              name: course.title,
              completed: isCompleted,
              isCurrent
            }
          } catch (err) {
            return null
          }
        })
      )

      const validNodes = nodes.filter(n => n !== null)

      setDashboardData(prev => ({
        ...prev,
        constellation: {
          currentSchool,
          currentConstellation: {
            name: `${currentSchool} Path`,
            nodes: validNodes
          }
        }
      }))
    } catch (error) {
      // Error loading constellation data
    }
  }, [user, profile])

  // Load teacher feed (posts from teachers/admins)
  const loadTeacherFeed = useCallback(async () => {
    try {
      const { data: posts, error: postsError } = await socialService.getPosts(5)
      
      if (postsError) {
        setDashboardData(prev => ({
          ...prev,
          teacherFeed: { posts: [] }
        }))
        return
      }
      
      const teacherPosts = posts?.filter(post => {
        const userRole = post.profiles?.role
        return userRole === 'Teacher' || userRole === 'Admin' || userRole === 'teacher' || userRole === 'admin'
      }) || []
      
      setDashboardData(prev => ({
        ...prev,
        teacherFeed: { posts: teacherPosts }
      }))
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        teacherFeed: { posts: [] }
      }))
    }
  }, [])

  // Load stats data (learning time and lessons completed)
  const loadStatsData = useCallback(async () => {
    if (!user || !profile) return
    
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      let xpLogs = []
      let xpError = null
      try {
        const result = await supabase
          .from('xp_logs')
          .select('xp_earned, created_at')
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString())
        xpLogs = result.data || []
        xpError = result.error
        
        // Handle 404 (table doesn't exist) or other errors gracefully
        if (xpError) {
          // PGRST116 = not found (table or row doesn't exist)
          // 404 = table doesn't exist or RLS blocking
          if (xpError.code === 'PGRST116' || xpError.code === '42P01' || xpError.message?.includes('does not exist')) {
            // Table doesn't exist or RLS issue - use empty array
            xpLogs = []
            xpError = null // Clear error to prevent warning
          }
        }
      } catch (err) {
        // Network or other errors - continue with empty array
        xpLogs = []
        xpError = err
      }

      if (xpError && xpError.code !== 'PGRST116' && xpError.code !== '42P01') {
        // Only log non-404 errors (table missing is expected if not set up)
      }

      const totalXP = xpLogs?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0
      const learningTime = Math.floor(totalXP / 50)

      let lessonsCount = 0
      let lessonsError = null
      try {
        const result = await supabase
          .from('user_lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_completed', true)
        lessonsCount = result.count || 0
        lessonsError = result.error
      } catch (err) {
        lessonsError = err
      }

      if (lessonsError && lessonsError.code !== 'PGRST116') {
        // Error loading lessons completed
      }

      // Get achievements count
      const { count: achievementsCount, error: achievementsError } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (achievementsError && achievementsError.code !== 'PGRST116') {
        // Error loading achievements
      }

      let averageScore = 0
      try {
        // Fix: PostgREST doesn't support .not('score', 'is', null) syntax
        // Instead, fetch all completed lessons and filter in JavaScript
        const { data: lessonProgress, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('score')
          .eq('user_id', user.id)
          .eq('is_completed', true)

        if (!progressError && lessonProgress && lessonProgress.length > 0) {
          // Filter out null scores in JavaScript
          const scores = lessonProgress
            .map(lp => lp.score)
            .filter(score => score !== null && score !== undefined && score > 0)
          
          if (scores.length > 0) {
            averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
          }
        } else if (progressError) {
          // Error loading lesson progress - just continue without average score
        }
      } catch (err) {
        // Error calculating average score - continue without it
      }

      setDashboardData(prev => ({
        ...prev,
        stats: {
          learningTime,
          lessonsCompleted: lessonsCount || 0,
          averageScore
        },
        achievements: {
          total: achievementsCount || 0
        }
      }))
    } catch (error) {
      // Error loading stats data
    }
  }, [user, profile])

  // Load all data - only when both user and profile are ready
  useEffect(() => {
    const loadAllData = async () => {
      if (!user || !profile) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        await Promise.all([
          loadLevelData(),
          loadRitualData(),
          loadConstellationData(),
          loadTeacherFeed(),
          loadStatsData()
        ])
      } catch (error) {
        // Don't show error toast - just continue
      } finally {
        setLoading(false)
      }
    }

    if (user && profile) {
      loadAllData()
    } else {
      setLoading(false)
    }
  }, [user, profile, loadLevelData, loadRitualData, loadConstellationData, loadTeacherFeed, loadStatsData])

  // Use global loader instead of local loading state
  useEffect(() => {
    if (loading) {
      startTransition()
    } else {
      endTransition()
    }
  }, [loading, startTransition, endTransition])

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
        {/* 1. Hero - XP Circle */}
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

        {/* 17. Ethereal Stats Cards */}
        <div className="grid-stats">
          <EtherealStatsCards
            streak={dashboardData.ritual.streak}
            lessonsCompleted={dashboardData.stats.lessonsCompleted}
            learningTime={dashboardData.stats.learningTime}
            achievementsUnlocked={dashboardData.achievements.total}
          />
        </div>

        {/* 4. Mood Tracker */}
        <div className="grid-mood-tracker">
          <MoodTracker userId={profile?.id} />
        </div>

        {/* 5. XP Progress Chart */}
        <div className="grid-chart">
          <XPProgressChart userId={profile?.id} />
        </div>

        {/* 6. All Lessons Card */}
        <div className="grid-chart">
          <AllLessonsCard />
        </div>

        {/* 7. Habits Completed Card */}
        <div className="grid-chart">
          <HabitsCompletedCard />
        </div>

        {/* School Progress Area Chart */}
        <div className="grid-chart">
          <div className="lg:hidden">
            <SchoolProgressAreaChartMobile userId={profile?.id} />
          </div>
          <div className="hidden lg:block">
            <SchoolProgressAreaChartDesktop userId={profile?.id} />
          </div>
        </div>

        {/* 12. Constellation Navigator - Only show for paid users and admins */}
        {(!isFreeUser || isAdmin) && (
          <div className="grid-full-width">
            <ConstellationNavigatorWidget
              currentSchool={dashboardData.constellation.currentSchool}
              currentConstellation={dashboardData.constellation.currentConstellation}
            />
          </div>
        )}

        {/* 13. Teacher Feed - Only show for paid users and admins */}
        {(!isFreeUser || isAdmin) && (
          <div className="grid-full-width">
            <TeacherFeedWidget posts={dashboardData.teacherFeed.posts} />
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

      {/* Onboarding Modal - Show for new users */}
      <OnboardingModal 
        isOpen={showOnboardingModal} 
        onClose={async () => {
          setShowOnboardingModal(false)
          
          // Mark onboarding as completed in database
          if (user && profile && !profile.has_completed_onboarding) {
            try {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  has_completed_onboarding: true,
                  onboarding_completed_at: new Date().toISOString()
                })
                .eq('id', user.id)
              
              if (updateError) {
                // Retry once after 1 second
                setTimeout(async () => {
                  await supabase
                    .from('profiles')
                    .update({ 
                      has_completed_onboarding: true,
                      onboarding_completed_at: new Date().toISOString()
                    })
                    .eq('id', user.id)
                }, 1000)
              } else {
                await fetchProfile(user.id)
              }
            } catch (error) {
              localStorage.setItem(`onboarding_completed_${user.id}`, 'true')
            }
          }
          
          // Clean up URL when closing
          const newParams = new URLSearchParams(searchParams)
          if (newParams.get('new_user')) {
            newParams.delete('new_user')
            navigate({ search: newParams.toString() }, { replace: true })
          }
        }} 
      />
    </div>
  )
}

export default DashboardNeomorphic

