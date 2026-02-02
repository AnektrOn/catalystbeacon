import './DashboardNeomorphic.css'
import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePageTransition } from '../contexts/PageTransitionContext'
import { supabase } from '../lib/supabaseClient'
import SEOHead from '../components/SEOHead'
import levelsService from '../services/levelsService'
import courseService from '../services/courseService'
import socialService from '../services/socialService'
import dashboardService from '../services/dashboardService'
import useSubscription from '../hooks/useSubscription'
import UpgradeModal from '../components/UpgradeModal'
import BreathworkModal from '../components/dashboard/BreathworkModal'
import SkeletonLoader from '../components/ui/SkeletonLoader'
import toast from 'react-hot-toast'

const XPCircleWidgetV2 = lazy(() => import('../components/dashboard/XPCircleWidgetV2'))
const XPProgressChart = lazy(() => import('../components/dashboard/XPProgressChart'))
const MoodTracker = lazy(() => import('../components/dashboard/MoodTracker'))
const SchoolProgressAreaChartMobile = lazy(() => import('../components/dashboard/SchoolProgressAreaChartMobile'))
const SchoolProgressAreaChartDesktop = lazy(() => import('../components/dashboard/SchoolProgressAreaChartDesktop'))
const HabitsCompletedCard = lazy(() => import('../components/dashboard/HabitsCompletedCard'))
const ConstellationNavigatorWidget = lazy(() => import('../components/dashboard/ConstellationNavigatorWidget'))
const EtherealStatsCards = lazy(() => import('../components/dashboard/EtherealStatsCards'))

const DashboardNeomorphic = () => {
  const { user, profile, fetchProfile } = useAuth()
  const { isFreeUser, isAdmin } = useSubscription()
  const { startTransition, endTransition } = usePageTransition()
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
      
      toast.success('🎉 Payment completed! Processing your subscription...')

      // PRIMARY: Use API server directly (most reliable) with relative URL
      const processPaymentSuccess = async () => {
        try {
          // PRIMARY METHOD: Call API server directly using relative URL
          try {
            const response = await fetch(`/api/payment-success?session_id=${sessionId}`, {
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

  useEffect(() => {
    const loadAllData = async () => {
      if (!user || !profile) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const { data, error } = await dashboardService.getDashboardDataCached(user.id)
        if (error || !data) {
          console.error('Error fetching dashboard data via RPC:', error)
          setLoading(false)
          return
        }
        const { levelData: newLevelData, dashboardData: newDashboardData } = dashboardService.mapDashboardRpcToState(data, profile)
        setLevelData(newLevelData)
        setDashboardData(newDashboardData)
      } catch (error) {
        console.error('Exception fetching dashboard data via RPC:', error)
      } finally {
        setLoading(false)
      }
    }
    if (user && profile) {
      loadAllData()
    } else {
      setLoading(false)
    }
  }, [user, profile, fetchProfile])

  if (loading && !profile) {
    return <SkeletonLoader type="dashboard" />;
  }

  return (
    <div className="dashboard-neomorphic">
      <SEOHead
        title="Dashboard | HC Beacon"
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
      <div id="dashboard-widgets" className="dashboard-grid">
        {/* 1. Hero - XP Circle */}
        <div id="dashboard-xp-circle" className="grid-hero">
          <Suspense fallback={<div>Loading XP Circle...</div>}>
            <XPCircleWidgetV2
              currentXP={levelData.currentXP}
              levelXP={levelData.nextLevelXP}
              level={levelData.level}
              nextLevel={levelData.level + 1}
              levelTitle={levelData.levelTitle}
              isActive={true}
            />
          </Suspense>
        </div>

        {/* 17. Ethereal Stats Cards */}
        <div id="dashboard-stats-cards" className="grid-stats">
          <Suspense fallback={<div>Loading Stats...</div>}>
            <EtherealStatsCards
              streak={dashboardData.ritual.streak}
              lessonsCompleted={dashboardData.stats.lessonsCompleted}
              learningTime={dashboardData.stats.learningTime}
              achievementsUnlocked={dashboardData.achievements.total}
            />
          </Suspense>
        </div>

        {/* 4. Mood Tracker */}
        <div className="grid-mood-tracker">
          <Suspense fallback={<div>Loading Mood Tracker...</div>}>
            <MoodTracker userId={profile?.id} />
          </Suspense>
        </div>

        {/* 5. XP Progress Chart */}
        <div className="grid-chart">
          <Suspense fallback={<div>Loading XP Chart...</div>}>
            <XPProgressChart userId={profile?.id} />
          </Suspense>
        </div>

        {/* 7. Habits Completed Card */}
        <div className="grid-chart">
          <Suspense fallback={<div>Loading Habits Card...</div>}>
            <HabitsCompletedCard />
          </Suspense>
        </div>

        {/* School Progress Area Chart */}
        <div className="grid-chart">
          <div className="lg:hidden">
            <Suspense fallback={<div>Loading Mobile Chart...</div>}>
              <SchoolProgressAreaChartMobile userId={profile?.id} />
            </Suspense>
          </div>
          <div className="hidden lg:block">
            <Suspense fallback={<div>Loading Desktop Chart...</div>}>
              <SchoolProgressAreaChartDesktop userId={profile?.id} />
            </Suspense>
          </div>
        </div>

        {/* 12. Constellation Navigator - Only show for paid users and admins */}
        {(!isFreeUser || isAdmin) && (
          <div className="grid-full-width">
            <Suspense fallback={<div>Loading Constellation...</div>}>
              <ConstellationNavigatorWidget
                currentSchool={dashboardData.constellation.currentSchool}
                currentConstellation={dashboardData.constellation.currentConstellation}
              />
            </Suspense>
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