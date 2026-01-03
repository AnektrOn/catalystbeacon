import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import SEOHead from '../components/SEOHead'
import levelsService from '../services/levelsService'
import useSubscription from '../hooks/useSubscription'
import UpgradeModal from '../components/UpgradeModal'
import { Clock, BookOpen, Award, Target, TrendingUp, Calendar } from 'lucide-react'

// Import Neomorphic Components
import {
  XPCircleWidget,
  StreakCard,
  ActiveCourseCard,
  QuickActionsGrid,
  StatCard
} from '../components/dashboard'

import './DashboardNeomorphic.css'

const DashboardNeomorphic = () => {
  const { user, profile } = useAuth()
  const { isFreeUser, isAdmin } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  
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

  // Load level data
  const loadLevelData = useCallback(async () => {
    if (!profile) return

    try {
      const data = await levelsService.getCurrentLevel(profile.id)
      if (data) {
        setLevelData({
          level: data.level,
          levelTitle: data.level_title,
          currentXP: data.current_xp,
          nextLevelXP: data.next_level_xp,
          xpToNext: data.xp_to_next_level
        })
      }
    } catch (error) {
      console.error('Error loading level data:', error)
    }
  }, [profile])

  // Load streak data
  const loadStreakData = useCallback(async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('user_habits')
        .select('streak, streak_record')
        .eq('user_id', profile.id)
        .single()

      if (!error && data) {
        setStats(prev => ({
          ...prev,
          streak: data.streak || 0,
          streakRecord: data.streak_record || 0
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
        .eq('completed', true)

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
        .eq('completed', false)

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
        .eq('completed', false)
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
          .eq('completed', true)

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
          <h1 className="dashboard-title">Welcome back, {profile?.full_name || 'Student'}!</h1>
          <p className="dashboard-subtitle">Continue your transformation journey</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Hero - XP Circle */}
        <div className="grid-hero">
          <XPCircleWidget
            currentXP={levelData.currentXP}
            levelXP={levelData.nextLevelXP}
            level={levelData.level}
            nextLevel={levelData.level + 1}
          />
        </div>

        {/* Stats Row */}
        <div className="grid-stats">
          <StreakCard 
            streak={stats.streak} 
            record={stats.streakRecord} 
          />
          <StatCard
            icon={Clock}
            value={stats.timeThisWeek}
            label="This Week"
            subtitle="Keep it up!"
            trend={15}
          />
          <StatCard
            icon={BookOpen}
            value={stats.lessonsCompleted}
            label="Lessons"
            subtitle="Completed"
          />
          <StatCard
            icon={Award}
            value={stats.achievementsUnlocked}
            label="Achievements"
            subtitle="Unlocked"
          />
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

        {/* Quick Actions */}
        <div className="grid-actions">
          <QuickActionsGrid onActionClick={handleActionClick} />
        </div>

        {/* Additional Stats - Only for paid users */}
        {(!isFreeUser || isAdmin) && (
          <>
            <div className="grid-stat-extra">
              <StatCard
                icon={Target}
                value={`${Math.round((stats.lessonsCompleted / (stats.lessonsCompleted + 10)) * 100)}%`}
                label="Weekly Goal"
                subtitle="On track"
                trend={8}
              />
            </div>
            <div className="grid-stat-extra">
              <StatCard
                icon={TrendingUp}
                value={stats.coursesActive}
                label="Active Courses"
                subtitle="In progress"
              />
            </div>
            <div className="grid-stat-extra">
              <StatCard
                icon={Calendar}
                value="5"
                label="This Month"
                subtitle="Sessions planned"
              />
            </div>
          </>
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

