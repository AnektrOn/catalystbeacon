import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import SEOHead from '../components/SEOHead'
import courseService from '../services/courseService'
import socialService from '../services/socialService'
import levelsService from '../services/levelsService'
import useSubscription from '../hooks/useSubscription'
import UpgradeModal from '../components/UpgradeModal'
import OnboardingModal from '../components/dashboard/OnboardingModal'
import { getLocalDateString, getTodayStartISO } from '../utils/dateUtils'

// Import Dashboard Widgets
import XPProgressWidget from '../components/dashboard/XPProgressWidget'
import DailyRitualWidget from '../components/dashboard/DailyRitualWidget'
import CoherenceWidget from '../components/dashboard/CoherenceWidget'
import AchievementsWidget from '../components/dashboard/AchievementsWidget'
import CurrentLessonWidget from '../components/dashboard/CurrentLessonWidget'
import ConstellationNavigatorWidget from '../components/dashboard/ConstellationNavigatorWidget'
import TeacherFeedWidget from '../components/dashboard/TeacherFeedWidget'
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget'
import EtherealStatsCards from '../components/dashboard/EtherealStatsCards'

const Dashboard = () => {
  const { user, profile, fetchProfile } = useAuth()
  const { isFreeUser, isAdmin } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  
  // DEBUG: Log component mount and URL params
  useEffect(() => {
    const payment = new URLSearchParams(window.location.search).get('payment')
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    console.log('🚀 Dashboard mounted/updated:', { payment, sessionId, hasUser: !!user, userId: user?.id })
  }, [user])
  
  // Track navigation and state
  useEffect(() => {
    
    return () => {
    }
  }, [])
  
  // Track state changes
  useEffect(() => {
  }, [user, profile])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [, setLoading] = useState(true)
  
  // Show upgrade modal if redirected from restricted route (not for admins)
  // Show onboarding modal for new users - 100% RELIABLE with database flag
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
      console.log('🎯 New user detected (URL param or database flag), showing onboarding modal')
      setShowOnboardingModal(true)
    } else if (upgradePrompt === 'true' && !isAdmin) {
      setShowUpgradeModal(true)
      // Clean up URL
      navigate('/dashboard', { replace: true })
    } else if (upgradePrompt === 'true' && isAdmin) {
      // Just clean up URL for admins, don't show modal
      navigate('/dashboard', { replace: true })
    }
  }, [searchParams, navigate, isAdmin, user, profile])
  const [levelData, setLevelData] = useState({
    level: 1,
    levelTitle: '',
    currentXP: 0,
    nextLevelXP: 1000,
    xpToNext: 1000
  })

  // Dashboard data from Supabase
  const [dashboardData, setDashboardData] = useState({
    ritual: {
      completed: false,
      streak: 0,
      xpReward: 50
    },
    coherence: {
      energy: 0,
      mind: 0,
      heart: 0
    },
    achievements: {
      recent: [],
      total: 0,
      nextUnlock: null
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
    }
  })

  // Load daily ritual data (habits completion streak)
  const loadRitualData = useCallback(async () => {
    if (!user || !profile) return
    
    try {
      const streak = profile.completion_streak || 0
      
      // Check if ritual completed today (any habit completed today)
      // Use local timezone to get accurate "today"
      const todayStart = getTodayStartISO()
      
      // Check habit completions for today (using local timezone)
      const { data: completions, error: completionsError } = await supabase
        .from('user_habit_completions')
        .select('id')
        .eq('user_id', user.id)
        .gte('completed_at', todayStart)
        .limit(1)
      
      if (completionsError && completionsError.code !== 'PGRST116') {
        console.warn('Error loading habit completions:', completionsError)
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
      console.error('Error loading ritual data:', error)
    }
  }, [user, profile])

  // Load coherence data (master stats: energy, mind, heart)
  const loadCoherenceData = useCallback(async () => {
    if (!user) return
    
    try {
      // Get user master stats for coherence calculation
      const { data: masterStats, error: statsError } = await supabase
        .from('user_master_stats')
        .select(`
          current_value,
          master_stats!inner (
            name,
            display_name
          )
        `)
        .eq('user_id', user.id)
      
      if (statsError && statsError.code !== 'PGRST116') {
        console.warn('Error loading master stats:', statsError)
      }
      
      if (!masterStats || masterStats.length === 0) {
        // Default values if no stats exist
        setDashboardData(prev => ({
          ...prev,
          coherence: { energy: 0, mind: 0, heart: 0 }
        }))
        return
      }

      // Map stats to coherence values
      let energy = 0, mind = 0, heart = 0
      
      masterStats.forEach(stat => {
        const statName = stat.master_stats?.name?.toLowerCase() || ''
        const value = stat.current_value || 0
        
        if (statName.includes('energy') || statName.includes('vitality')) {
          energy = Math.min(100, value)
        } else if (statName.includes('mind') || statName.includes('cognitive') || statName.includes('focus')) {
          mind = Math.min(100, value)
        } else if (statName.includes('heart') || statName.includes('emotional') || statName.includes('compassion')) {
          heart = Math.min(100, value)
        }
      })

      // If no specific stats found, use average of all stats
      if (energy === 0 && mind === 0 && heart === 0) {
        const avg = Math.round(masterStats.reduce((sum, s) => sum + (s.current_value || 0), 0) / masterStats.length)
        energy = mind = heart = avg
      }

      setDashboardData(prev => ({
        ...prev,
        coherence: { energy, mind, heart }
      }))
    } catch (error) {
      console.error('Error loading coherence data:', error)
    }
  }, [user])

  // Load achievements/badges data
  const loadAchievementsData = useCallback(async () => {
    if (!user) return
    
    try {
      // Get user badges
      const { data: userBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (
            id,
            title,
            description,
            badge_image_url,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false })
        .limit(10)

      if (badgesError && badgesError.code !== 'PGRST116') {
        console.warn('Error loading user badges:', badgesError)
      }

      const recent = (userBadges || []).slice(0, 3).map(ub => ({
        name: ub.badges?.title || 'Achievement',
        iconUrl: ub.badges?.badge_image_url || null
      }))

      // Get next unlockable badge (first badge user doesn't have)
      const { data: allBadges, error: allBadgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('xp_reward', { ascending: true })
        .limit(20)

      if (allBadgesError && allBadgesError.code !== 'PGRST116') {
        console.warn('Error loading all badges:', allBadgesError)
      }

      const userBadgeIds = new Set((userBadges || []).map(ub => ub.badge_id))
      const nextBadge = allBadges?.find(b => !userBadgeIds.has(b.id))

      let nextUnlock = null
      if (nextBadge) {
        // Calculate progress based on criteria
        const criteria = nextBadge.criteria || {}
        let progress = 0
        let total = 10

        if (criteria.type === 'habits_completed') {
          const totalCompletions = profile?.habits_completed_total || 0
          progress = Math.min(totalCompletions, criteria.count || 10)
          total = criteria.count || 10
        } else if (criteria.type === 'streak') {
          progress = Math.min(profile?.completion_streak || 0, criteria.days || 7)
          total = criteria.days || 7
        } else if (criteria.type === 'xp') {
          progress = Math.min(profile?.current_xp || 0, criteria.amount || 1000)
          total = criteria.amount || 1000
        }

        nextUnlock = {
          name: nextBadge.title,
          progress,
          total
        }
      }

      setDashboardData(prev => ({
        ...prev,
        achievements: {
          recent,
          total: userBadges?.length || 0,
          nextUnlock
        }
      }))
    } catch (error) {
      console.error('Error loading achievements data:', error)
    }
  }, [user, profile])

  // Load stats data (learning time and lessons completed)
  const loadStatsData = useCallback(async () => {
    if (!user || !profile) return
    
    try {
      // Get learning time from XP logs (estimate hours from XP earned this week)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { data: xpLogs, error: xpError } = await supabase
        .from('xp_logs')
        .select('xp_earned, created_at')
        .eq('user_id', user.id)
        .gte('created_at', oneWeekAgo.toISOString())

      if (xpError && xpError.code !== 'PGRST116') {
        console.warn('Error loading XP logs:', xpError)
      }

      // Estimate hours (assuming 50 XP per hour of learning)
      const totalXP = xpLogs?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0
      const learningTime = Math.floor(totalXP / 50)

      // Get lessons completed count
      const { count: lessonsCount, error: lessonsError } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)

      if (lessonsError && lessonsError.code !== 'PGRST116') {
        console.warn('Error loading lessons completed:', lessonsError)
      }

      // Calculate average score from lesson progress (if available)
      // For now, we'll use a placeholder or calculate from completed lessons
      let averageScore = 0
      try {
        const { data: lessonProgress, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('score')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .not('score', 'is', null)

        if (!progressError && lessonProgress && lessonProgress.length > 0) {
          const scores = lessonProgress.map(lp => lp.score || 0).filter(s => s > 0)
          if (scores.length > 0) {
            averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
          }
        }
      } catch (err) {
        console.warn('Error calculating average score:', err)
      }

      setDashboardData(prev => ({
        ...prev,
        stats: {
          learningTime,
          lessonsCompleted: lessonsCount || 0,
          averageScore
        }
      }))
    } catch (error) {
      console.error('Error loading stats data:', error)
    }
  }, [user, profile])

  // Load current lesson data
  const loadCurrentLesson = useCallback(async () => {
    if (!user) return
    
    try {
      // Get user's most recent course progress
      const { data: courseProgressData, error: progressError } = await supabase
        .from('user_course_progress')
        .select(`
          *,
          course_metadata (
            id,
            course_title
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('last_accessed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (progressError && progressError.code !== 'PGRST116') {
        console.warn('Error loading course progress:', progressError)
      }

      const courseProgress = courseProgressData

      if (!courseProgress) {
        setDashboardData(prev => ({
          ...prev,
          currentLesson: {
            lessonId: null,
            lessonTitle: 'No active lesson',
            courseTitle: '',
            progressPercentage: 0,
            timeRemaining: 0,
            thumbnailUrl: null
          }
        }))
        return
      }

      // Get the most recent lesson progress for this course
      const courseId = courseProgress.course_metadata_id
      if (!courseId || isNaN(courseId)) {
        console.warn('Invalid course_metadata_id:', courseProgress.course_metadata_id)
        return
      }
      
      try {
        const { data: course, error: courseError } = await courseService.getCourseById(courseId)
        
        if (courseError || !course || !course.data) {
          if (courseError) console.warn('Error loading course:', courseError)
          return
        }

        // Get lesson structure to find current lesson
        const { data: structure, error: structureError } = await courseService.getCourseStructure(course.data.course_id)
        
        if (structureError || !structure || structure.length === 0) {
          if (structureError) console.warn('Error loading course structure:', structureError)
          return
        }

        // Find the first incomplete lesson
        let currentLesson = null
        for (const chapter of structure) {
          if (!chapter || !chapter.lessons) continue
          for (const lesson of chapter.lessons) {
            if (!lesson) continue
            try {
              const { data: lessonProgress, error: lessonError } = await courseService.getUserLessonProgress(
                user.id,
                course.data.course_id,
                chapter.chapter_number,
                lesson.lesson_number
              )
              
              if (lessonError) {
                console.warn('Error loading lesson progress:', lessonError)
                continue
              }
              
              if (!lessonProgress || !lessonProgress.is_completed) {
                currentLesson = {
                  chapterNum: chapter.chapter_number,
                  lessonNum: lesson.lesson_number,
                  title: lesson.title || `Chapter ${chapter.chapter_number}, Lesson ${lesson.lesson_number}`,
                  courseTitle: course.data.title
                }
                break
              }
            } catch (err) {
              console.warn('Error processing lesson:', err)
              continue
            }
          }
          if (currentLesson) break
        }

        if (currentLesson) {
          setDashboardData(prev => ({
            ...prev,
            currentLesson: {
              lessonId: `${course.data.course_id}-${currentLesson.chapterNum}-${currentLesson.lessonNum}`,
              lessonTitle: currentLesson.title,
              courseTitle: currentLesson.courseTitle,
              progressPercentage: courseProgress.progress_percentage || 0,
              timeRemaining: 0, // Calculate based on lesson duration if available
              thumbnailUrl: null // thumbnail_url column doesn't exist in course_metadata
            }
          }))
        }
      } catch (innerError) {
        console.warn('Error processing course data:', innerError)
      }
    } catch (error) {
      console.error('Error loading current lesson:', error)
    }
  }, [user])

  // Load constellation data (current school and progress)
  const loadConstellationData = useCallback(async () => {
    if (!user || !profile) return
    
    try {
      // Get user's current school based on XP
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('unlock_xp', { ascending: true })

      if (schoolsError && schoolsError.code !== 'PGRST116') {
        console.warn('Error loading schools:', schoolsError)
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

      // Get courses for current school (as constellation nodes)
      const { data: courses, error: coursesError } = await courseService.getAllCourses({
        masterschool: currentSchool,
        userId: user.id
      })

      if (coursesError) {
        console.warn('Error loading courses:', coursesError)
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

      // Get user progress for these courses
      const nodes = await Promise.all(
        courses.slice(0, 5).map(async (course, index) => {
          try {
            // Use course.course_id (integer) not course.id (UUID) for getUserCourseProgress
            if (!course.course_id) {
              console.warn('Course missing course_id:', course);
              return null;
            }
            const { data: progress, error: progressError } = await courseService.getUserCourseProgress(user.id, course.course_id)
            if (progressError) {
              console.warn('Error loading course progress:', progressError)
              return null
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
            console.warn('Error processing course:', err)
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
      console.error('Error loading constellation data:', error)
    }
  }, [user, profile])

  // Load teacher feed (posts from teachers/admins)
  const loadTeacherFeed = useCallback(async () => {
    try {
      const { data: posts, error: postsError } = await socialService.getPosts(5)
      
      if (postsError) {
        console.warn('Error loading teacher feed:', postsError)
        setDashboardData(prev => ({
          ...prev,
          teacherFeed: { posts: [] }
        }))
        return
      }
      
      // Filter posts to only show those from teachers/admins
      const teacherPosts = posts?.filter(post => {
        const userRole = post.profiles?.role
        return userRole === 'Teacher' || userRole === 'Admin' || userRole === 'teacher' || userRole === 'admin'
      }) || []
      
      setDashboardData(prev => ({
        ...prev,
        teacherFeed: { posts: teacherPosts }
      }))
    } catch (error) {
      console.error('Error loading teacher feed:', error)
      setDashboardData(prev => ({
        ...prev,
        teacherFeed: { posts: [] }
      }))
    }
  }, [])

  // Load level data from Supabase
  const loadLevelData = useCallback(async () => {
    if (!user || !profile) return
    
    try {
      const currentXP = profile.current_xp || 0
      
      // Get level title from profile.rank or fetch from levels table
      let levelTitle = profile.rank || ''
      
      // Use xp_to_next_level from profile if available (calculated by database trigger)
      if (profile.xp_to_next_level !== undefined && profile.xp_to_next_level !== null) {
        const nextLevelXP = currentXP + profile.xp_to_next_level
        
        // If we don't have level title, fetch it from levels table
        if (!levelTitle && profile.level) {
          const { data: levelData } = await levelsService.getLevelByNumber(profile.level)
          levelTitle = levelData?.title || ''
        }
        
        setLevelData({
          level: profile.level || 1,
          levelTitle: levelTitle || `Level ${profile.level || 1}`,
          currentXP,
          nextLevelXP,
          xpToNext: profile.xp_to_next_level
        })
        return
      }

      // Otherwise, calculate from levels table
      const { data: levelInfo, error: levelError } = await levelsService.getCurrentAndNextLevel(currentXP)
      
      if (levelError) {
        console.warn('Error loading level data:', levelError)
        // Fallback to simple calculation
        setLevelData({
          level: profile.level || 1,
          levelTitle: profile.rank || `Level ${profile.level || 1}`,
          currentXP,
          nextLevelXP: (profile.level || 1) * 1000,
          xpToNext: ((profile.level || 1) * 1000) - currentXP
        })
        return
      }

      if (levelInfo && levelInfo.currentLevel) {
        const currentLevel = levelInfo.currentLevel
        const nextLevel = levelInfo.nextLevel
        
        const nextLevelXP = nextLevel ? nextLevel.xp_threshold : currentLevel.xp_threshold
        const xpToNext = nextLevel ? (nextLevel.xp_threshold - currentXP) : 0

        setLevelData({
          level: currentLevel.level_number || profile.level || 1,
          levelTitle: currentLevel.title || profile.rank || `Level ${currentLevel.level_number || 1}`,
          currentXP,
          nextLevelXP,
          xpToNext
        })
      } else {
        // Fallback
        setLevelData({
          level: profile.level || 1,
          levelTitle: profile.rank || `Level ${profile.level || 1}`,
          currentXP,
          nextLevelXP: (profile.level || 1) * 1000,
          xpToNext: ((profile.level || 1) * 1000) - currentXP
        })
      }
    } catch (error) {
      console.error('Error loading level data:', error)
      // Fallback
      setLevelData({
        level: profile?.level || 1,
        levelTitle: profile?.rank || `Level ${profile?.level || 1}`,
        currentXP: profile?.current_xp || 0,
        nextLevelXP: (profile?.level || 1) * 1000,
        xpToNext: ((profile?.level || 1) * 1000) - (profile?.current_xp || 0)
      })
    }
  }, [user, profile])

  // 100% RELIABLE: Check for pending role updates from localStorage (fallback)
  useEffect(() => {
    if (!user || !profile) return
    
    const pendingRole = localStorage.getItem(`pending_role_update_${user.id}`)
    if (pendingRole && profile.role !== pendingRole) {
      console.log('🔄 Found pending role update, verifying...')
      // Check if role was updated
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data && data.role === pendingRole) {
            console.log('✅ Pending role update confirmed, clearing localStorage')
            localStorage.removeItem(`pending_role_update_${user.id}`)
            fetchProfile(user.id)
          }
        })
        .catch(err => console.warn('Error checking pending role:', err))
    }
  }, [user, profile, fetchProfile])

  // Load all dashboard data from Supabase
  useEffect(() => {
    if (!user) return
    
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          loadLevelData(),
          loadRitualData(),
          loadCoherenceData(),
          loadAchievementsData(),
          loadCurrentLesson(),
          loadConstellationData(),
          loadTeacherFeed(),
          loadStatsData()
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, profile, loadLevelData, loadRitualData, loadCoherenceData, loadAchievementsData, loadCurrentLesson, loadConstellationData, loadTeacherFeed, loadStatsData])

  // Handle payment success redirect - 100% RELIABLE with retry logic
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')

    console.log('🔍 Payment success check:', { payment, sessionId, hasUser: !!user, userId: user?.id, searchParams: searchParams.toString() })

    // Si on a payment=success mais pas encore user, attendre un peu
    if (payment === 'success' && sessionId && !user) {
      console.log('⏳ Waiting for user to load before processing payment...')
      return
    }

    if (payment === 'success' && sessionId && user) {
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

      // DIRECT: Appel direct à Supabase (plus rapide et fiable, pas besoin de l'API)
      const processPaymentSuccess = async () => {
        try {
          console.log('🔄 Processing payment success via Supabase...', { sessionId, userId: user.id })
          
          let subscriptionId = null
          let syncError = null
          
          // Méthode 1: Essayer la fonction SQL directe (si elle existe)
          try {
            console.log('📞 Attempting sync_subscription_from_session_id...')
            const { data: syncResult, error: rpcError } = await supabase
              .rpc('sync_subscription_from_session_id', {
                p_session_id: sessionId
              })
            
            console.log('📥 RPC Response:', { syncResult, rpcError })
            
            if (rpcError) {
              console.error('❌ RPC Error:', rpcError)
              // Si la fonction n'existe pas (code 42883), continuer vers la méthode 2
              if (rpcError.code === '42883' || rpcError.message?.includes('does not exist')) {
                console.log('⚠️ Function sync_subscription_from_session_id does not exist, trying alternative method...')
              } else {
                syncError = rpcError
              }
            } else if (syncResult && syncResult.length > 0) {
              const result = syncResult[0]
              console.log('📊 Sync result:', result)
              if (result.success) {
                console.log('✅ Subscription synced successfully via SQL function:', result)
                toast.success('✅ Subscription activated!')
                // Attendre un peu pour que la DB se mette à jour
                await new Promise(resolve => setTimeout(resolve, 1000))
                await fetchProfile(user.id)
                return { success: true }
              } else {
                console.warn('⚠️ Sync returned false:', result.message)
                subscriptionId = result.subscription_id // Peut-être qu'on a quand même le subscription_id
              }
            }
          } catch (sqlError) {
            console.log('⚠️ SQL function error (will try Edge Function):', sqlError)
          }
          
          // Méthode 2: Récupérer subscription_id via Edge Function, puis sync
          if (!subscriptionId) {
            try {
              console.log('📞 Attempting get-subscription-from-session Edge Function...')
              const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
              const { data: { session: authSession } } = await supabase.auth.getSession()
              
              if (SUPABASE_URL && authSession) {
                const response = await fetch(`${SUPABASE_URL}/functions/v1/get-subscription-from-session`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authSession.access_token}`,
                  },
                  body: JSON.stringify({ session_id: sessionId }),
                  signal: AbortSignal.timeout(5000)
                })
                
                console.log('📥 Edge Function response status:', response.status)
                
                if (response.ok) {
                  const data = await response.json()
                  subscriptionId = data.subscription_id
                  console.log('✅ Got subscription_id from Edge Function:', subscriptionId)
                } else {
                  const errorText = await response.text()
                  console.error('❌ Edge Function error:', response.status, errorText)
                }
              } else {
                console.warn('⚠️ Missing SUPABASE_URL or auth session')
              }
            } catch (edgeError) {
              console.log('⚠️ Edge Function not available:', edgeError)
            }
          }
          
          // Méthode 3: Si on a le subscription_id, appeler directement la fonction de sync
          if (subscriptionId) {
            console.log('📞 Calling sync_single_subscription_from_stripe with subscription_id:', subscriptionId)
            const { data: syncResult, error: rpcError } = await supabase
              .rpc('sync_single_subscription_from_stripe', {
                p_stripe_subscription_id: subscriptionId
              })
            
            console.log('📥 sync_single_subscription_from_stripe response:', { syncResult, rpcError })
            
            if (rpcError) {
              console.error('❌ sync_single_subscription_from_stripe error:', rpcError)
              syncError = rpcError
            } else if (syncResult && syncResult.length > 0) {
              const result = syncResult[0]
              if (result.success) {
                console.log('✅ Subscription synced successfully:', result)
                toast.success('✅ Subscription activated!')
                // Attendre un peu pour que la DB se mette à jour
                await new Promise(resolve => setTimeout(resolve, 1000))
                await fetchProfile(user.id)
                return { success: true }
              } else {
                console.warn('⚠️ Sync returned false:', result.message)
                toast.warning('Payment successful! ' + (result.message || 'Subscription update may take a moment.'))
                await fetchProfile(user.id)
                return null
              }
            } else {
              console.warn('⚠️ sync_single_subscription_from_stripe returned empty result')
            }
          }
          
          // Si on arrive ici, aucune méthode n'a fonctionné
          console.error('❌ All sync methods failed', {
            hasSubscriptionId: !!subscriptionId,
            syncError,
            sessionId
          })
          
          // Fallback: Le webhook s'en chargera automatiquement
          console.log('⚠️ Could not sync immediately, webhook will handle it')
          toast.warning('Payment successful! Subscription update may take a moment. Please refresh the page in a few seconds.')
          
          // Attendre 2 secondes puis rafraîchir le profil (le webhook devrait avoir fait le travail)
          await new Promise(resolve => setTimeout(resolve, 2000))
          await fetchProfile(user.id)
          
          return null
          
        } catch (error) {
          console.error('❌ Payment success error:', error)
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          })
          toast.warning('Payment successful! Subscription update may take a moment. Please refresh if needed.')
          
          // Toujours rafraîchir le profil au cas où
          await new Promise(resolve => setTimeout(resolve, 2000))
          await fetchProfile(user.id)
          
          return null
        }
      }
      
      // Start processing
      processPaymentSuccess()
        .then(() => {
          // Clean up URL
          const newParams = new URLSearchParams(searchParams)
          newParams.delete('payment')
          newParams.delete('session_id')
          navigate({ search: newParams.toString() }, { replace: true })
        })
        .catch(error => {
          console.error('❌ Error processing payment success:', error)
          // Clean up URL even on error
          const newParams = new URLSearchParams(searchParams)
          newParams.delete('payment')
          newParams.delete('session_id')
          navigate({ search: newParams.toString() }, { replace: true })
        })
    }
  }, [searchParams, user, profile, fetchProfile, navigate])

  const displayName = useMemo(() => profile?.full_name || user?.email || 'User', [profile?.full_name, user?.email])
  const userRole = useMemo(() => profile?.role || 'Free', [profile?.role])

  // Determine phase based on level - memoized for performance
  const getPhase = useCallback((level) => {
    if (level >= 50) return 'god_mode'
    if (level >= 30) return 'transformation'
    if (level >= 10) return 'insight'
    return 'ignition'
  }, [])

  return (
    <>
      <style>{`
        /* Global mobile overflow fix */
        @media (max-width: 767px) {
          html, body {
            overflow-x: hidden !important;
            max-width: 100vw !important;
          }
          
          /* Override AppShell padding for Dashboard on mobile */
          .glass-main-panel {
            padding: 0 !important;
            margin: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          
          .glass-main-panel > div.p-4,
          .glass-main-panel > div[class*="p-"] {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          
          .dashboard-container {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          
          /* Force all grid items to respect container */
          .stats-grid > * {
            min-width: 0 !important;
            max-width: 100% !important;
          }
          
          .dashboard-container > * {
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          
          .dashboard-container header {
            padding-left: 0 !important;
            padding-right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Ensure EtherealStatsCards container doesn't overflow */
          .ethereal-stats-container {
            width: 100% !important;
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            overflow-x: hidden !important;
          }
          
          /* Center any XP widgets */
          .xp-widget-container,
          [class*="xp"],
          [class*="XP"] {
            margin-left: auto !important;
            margin-right: auto !important;
            max-width: 100% !important;
          }
        }
      `}</style>
      <div 
        className="w-full max-w-7xl mx-auto dashboard-container" 
        style={{ 
          width: '100%', 
          maxWidth: '100%', 
          boxSizing: 'border-box', 
          overflowX: 'hidden'
        }}
      >
        <SEOHead 
        title="Dashboard - The Human Catalyst University"
        description="Track your progress, view your achievements, and continue your learning journey"
      />
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Dashboard
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Welcome back, <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{displayName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium border`} style={userRole === 'Free' ? { backgroundColor: 'var(--color-old-lace)', color: 'var(--color-kobicha)', borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' } :
              userRole === 'Student' ? { backgroundColor: 'var(--color-bone)', color: 'var(--color-kobicha)', borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' } :
                { backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)' }
            }>
              {userRole} Plan
            </span>
          </div>
        </div>
      </header>

      {/* Top Metric Cards Row - Ethereal Stats Cards */}
      <div className="mb-8 ethereal-stats-container" style={{ 
        width: '100%', 
        maxWidth: '100%', 
        boxSizing: 'border-box', 
        overflowX: 'hidden', 
        padding: 0,
        margin: 0,
        marginBottom: '2rem'
      }}>
        <EtherealStatsCards
          streak={dashboardData.ritual.streak}
          lessonsCompleted={dashboardData.stats.lessonsCompleted}
          learningTime={dashboardData.stats.learningTime}
          achievementsUnlocked={dashboardData.achievements.total}
        />
      </div>

      {/* Main Content Row - Only show for paid users and admins */}
      {(!isFreeUser || isAdmin) && (
        <>
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
        </>
      )}

      {/* Upgrade prompt for free users (not admins) */}
      {isFreeUser && !isAdmin && (
        <div 
          className="mb-8 p-6 rounded-xl border"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, var(--color-warning, #F59E0B) 10%, transparent), color-mix(in srgb, var(--color-warning, #F59E0B) 15%, transparent))`,
            borderColor: 'color-mix(in srgb, var(--color-warning, #F59E0B) 30%, transparent)'
          }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Upgrade to Unlock Full Dashboard
          </h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            Get access to course progress, constellation navigation, teacher feed, and more!
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 font-medium rounded-lg transition-all shadow-lg"
            style={{
              background: `linear-gradient(to right, var(--color-warning, #F59E0B), color-mix(in srgb, var(--color-warning, #F59E0B) 80%, black))`,
              color: 'white',
              boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--color-warning, #F59E0B) 30%, transparent)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, var(--color-warning, #F59E0B) 90%, white), var(--color-warning, #F59E0B))`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, var(--color-warning, #F59E0B), color-mix(in srgb, var(--color-warning, #F59E0B) 80%, black))`;
            }}
          >
            View Plans
          </button>
        </div>
      )}

      {/* Upgrade Modal - Only show for non-admins */}
      {!isAdmin && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          restrictedFeature={searchParams.get('restrictedFeature')}
        />
      )}
      
      {/* Onboarding Modal - Show for new users - 100% RELIABLE */}
      <OnboardingModal 
        isOpen={showOnboardingModal} 
        onClose={async () => {
          setShowOnboardingModal(false)
          
          // Mark onboarding as completed in database (100% persistence)
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
                console.error('Error marking onboarding complete:', updateError)
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
                console.log('✅ Onboarding marked as completed in database')
                // Refresh profile to get updated flag
                await fetchProfile(user.id)
              }
            } catch (error) {
              console.error('Error updating onboarding status:', error)
              // Store in localStorage as fallback
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
    </>
  )
}

export default Dashboard