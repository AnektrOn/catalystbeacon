import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import SEOHead from '../components/SEOHead'
import courseService from '../services/courseService'
import masteryService from '../services/masteryService'
import socialService from '../services/socialService'
import levelsService from '../services/levelsService'

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
  const [loading, setLoading] = useState(true)
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
    }
  })

  // Load daily ritual data (habits completion streak)
  const loadRitualData = useCallback(async () => {
    if (!user || !profile) return
    
    try {
      const streak = profile.completion_streak || 0
      
      // Check if ritual completed today (any habit completed today)
      const today = new Date().toISOString().split('T')[0]
      
      // Check habit completions for today
      const { data: completions, error: completionsError } = await supabase
        .from('user_habit_completions')
        .select('id')
        .eq('user_id', user.id)
        .gte('completed_at', `${today}T00:00:00`)
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
            title,
            thumbnail_url
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
      if (!courseId) return
      
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
              thumbnailUrl: courseProgress.course_metadata?.thumbnail_url || null
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
            const { data: progress, error: progressError } = await courseService.getUserCourseProgress(user.id, course.id)
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
      }
      
      if (posts && posts.length > 0) {
        setDashboardData(prev => ({
          ...prev,
          teacherFeed: { posts }
        }))
      }
    } catch (error) {
      console.error('Error loading teacher feed:', error)
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
          loadTeacherFeed()
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, profile, loadLevelData, loadRitualData, loadCoherenceData, loadAchievementsData, loadCurrentLesson, loadConstellationData, loadTeacherFeed])

  // Handle payment success redirect
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')

    if (payment === 'success' && sessionId && user) {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'
      
      toast.success('🎉 Payment completed! Processing your subscription...')

      fetch(`${API_URL}/api/payment-success?session_id=${sessionId}`)
        .then(response => response.json())
        .then(data => {
          toast.success(`✅ Subscription activated! Your role is now: ${data.role}`)
          fetchProfile(user.id)
          navigate('/dashboard', { replace: true })
        })
        .catch(error => {
          console.error('Error processing payment success:', error)
          toast.error('⚠️ Payment completed but there was an error updating your subscription.')
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
      <SEOHead 
        title="Dashboard - The Human Catalyst University"
        description="Track your progress, view your achievements, and continue your learning journey"
      />
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
          level={levelData.level}
          levelTitle={levelData.levelTitle}
          currentXP={levelData.currentXP}
          nextLevelXP={levelData.nextLevelXP}
          phase={getPhase(levelData.level)}
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