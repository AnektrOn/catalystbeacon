import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataCacheProvider } from './contexts/DataCacheContext'
import { PageTransitionProvider } from './contexts/PageTransitionContext'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import AppShell from './components/AppShell'
import ProtectedSubscriptionRoute from './components/ProtectedSubscriptionRoute'
import CosmicLoader from './components/ui/CosmicLoader'
import SkeletonLoader from './components/ui/SkeletonLoader'
import WelcomeModal from './components/WelcomeModal'
import { OnboardingProvider } from './contexts/OnboardingContext'
import OnboardingTour from './components/Onboarding/OnboardingTour'
import DevRouteElements from './routes/DevRoutes'
import { deepLinkingService } from './utils/deepLinking'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Keyboard } from '@capacitor/keyboard'
import './styles/glassmorphism.css'
import './styles/mobile-responsive.css'


// Lazy load pages for code splitting (webpackChunkName enables intent-based prefetch)
const LoginPage = React.lazy(() => import(/* webpackChunkName: "auth" */ './pages/LoginPage'))
const SignupPage = React.lazy(() => import(/* webpackChunkName: "auth" */ './pages/SignupPage'))
const DashboardNeomorphic = React.lazy(() => import(/* webpackChunkName: "dashboard-feature" */ './pages/DashboardNeomorphic'))
const PricingPage = React.lazy(() => import(/* webpackChunkName: "pricing" */ './pages/PricingPage'))
const ProfilePage = React.lazy(() => import(/* webpackChunkName: "profile" */ './pages/ProfilePage'))
const Mastery = React.lazy(() => import(/* webpackChunkName: "mastery-feature" */ './pages/Mastery'))
const CommunityPage = React.lazy(() => import(/* webpackChunkName: "community" */ './pages/CommunityPage'))
const SettingsPage = React.lazy(() => import(/* webpackChunkName: "settings" */ './pages/SettingsPage'))
const CourseCatalogPage = React.lazy(() => import(/* webpackChunkName: "courses-feature" */ './pages/CourseCatalogPage'))
const CourseDetailPage = React.lazy(() => import(/* webpackChunkName: "courses-feature" */ './pages/CourseDetailPage'))
const CoursePlayerPage = React.lazy(() => import(/* webpackChunkName: "courses-feature" */ './pages/CoursePlayerPage'))
const CourseCreationPage = React.lazy(() => import(/* webpackChunkName: "courses-feature" */ './pages/CourseCreationPage'))
const StellarMapPage = React.lazy(() => import(/* webpackChunkName: "stellar-map" */ './pages/StellarMapPage'))
const AchievementsPage = React.lazy(() => import(/* webpackChunkName: "achievements" */ './pages/Achievements'))
const ForgotPasswordPage = React.lazy(() => import(/* webpackChunkName: "auth" */ './pages/ForgotPasswordPage'))
const TermsPage = React.lazy(() => import(/* webpackChunkName: "legal" */ './pages/TermsPage'))
const PrivacyPage = React.lazy(() => import(/* webpackChunkName: "legal" */ './pages/PrivacyPage'))
const AwakeningLandingPage = React.lazy(() => import(/* webpackChunkName: "landing" */ './pages/AwakeningLandingPage'))
const SchoolRoadmap = React.lazy(() => import(/* webpackChunkName: "roadmap-feature" */ './pages/SchoolRoadmap'))

// Loading component - Now using Skeleton Loader for perceived speed
const LoadingScreen = () => {
  return <SkeletonLoader type="page" />
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Main App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes (No AppShell) */}
      <Route path="/login" element={
        <React.Suspense fallback={<LoadingScreen />}>
          <LoginPage />
        </React.Suspense>
      } />
      <Route path="/signup" element={
        <React.Suspense fallback={<LoadingScreen />}>
          <SignupPage />
        </React.Suspense>
      } />
      <Route path="/pricing" element={
        <React.Suspense fallback={<LoadingScreen />}>
          <PricingPage />
        </React.Suspense>
      } />
      <Route path="/forgot-password" element={
        <React.Suspense fallback={<LoadingScreen />}>
          <ForgotPasswordPage />
        </React.Suspense>
      } />
      <Route path="/terms" element={
        <React.Suspense fallback={<LoadingScreen />}>
          <TermsPage />
        </React.Suspense>
      } />
      <Route path="/privacy" element={
        <React.Suspense fallback={<LoadingScreen />}>
          <PrivacyPage />
        </React.Suspense>
      } />
      
      {/* Dev-only routes: Fragment of Route elements so Routes accepts them */}
      {process.env.NODE_ENV === 'development' && DevRouteElements}
     

      {/* Protected Routes (With AppShell) */}
      <Route element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <DashboardNeomorphic />
            </React.Suspense>
          </ErrorBoundary>
        } />

        {/* Profile Routes */}
        <Route path="/profile" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <ProfilePage />
            </React.Suspense>
          </ErrorBoundary>
        } />

        {/* Mastery Routes */}
        <Route path="/mastery" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <Mastery />
            </React.Suspense>
          </ErrorBoundary>
        } />
        <Route path="/mastery/calendar" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <Mastery />
            </React.Suspense>
          </ErrorBoundary>
        } />
        <Route path="/mastery/habits" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <Mastery />
            </React.Suspense>
          </ErrorBoundary>
        } />
        <Route path="/mastery/toolbox" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <Mastery />
            </React.Suspense>
          </ErrorBoundary>
        } />
        <Route path="/mastery/timer" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <Mastery />
            </React.Suspense>
          </ErrorBoundary>
        } />
        {/* Achievements: single source at /achievements; redirect legacy mastery subroute */}
        <Route path="/mastery/achievements" element={<Navigate to="/achievements" replace />} />

        {/* Community Routes - Protected */}
        <Route path="/community" element={
          <ErrorBoundary>
            <ProtectedSubscriptionRoute requiredFeature="community">
              <React.Suspense fallback={<LoadingScreen />}>
                <CommunityPage />
              </React.Suspense>
            </ProtectedSubscriptionRoute>
          </ErrorBoundary>
        } />

        {/* Settings */}
        <Route path="/settings" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <SettingsPage />
            </React.Suspense>
          </ErrorBoundary>
        } />

        {/* Roadmap Routes - Protected; :masterschool drives content via SchoolRoadmap */}
        <Route path="/roadmap/:masterschool" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <SchoolRoadmap />
            </React.Suspense>
          </ErrorBoundary>
        } />
        <Route path="/roadmap/ignition/:statLink" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <SchoolRoadmap />
            </React.Suspense>
          </ErrorBoundary>
        } />

        {/* Course Routes - Protected */}
        <Route path="/courses" element={
          <ErrorBoundary>
            <ProtectedSubscriptionRoute requiredFeature="courses">
              <React.Suspense fallback={<LoadingScreen />}>
                <CourseCatalogPage />
              </React.Suspense>
            </ProtectedSubscriptionRoute>
          </ErrorBoundary>
        } />
        <Route path="/courses/create" element={
          <ErrorBoundary>
            <ProtectedSubscriptionRoute requiredFeature="courses">
              <React.Suspense fallback={<LoadingScreen />}>
                <CourseCreationPage />
              </React.Suspense>
            </ProtectedSubscriptionRoute>
          </ErrorBoundary>
        } />
        <Route path="/courses/:courseId" element={
          <ErrorBoundary>
            <ProtectedSubscriptionRoute requiredFeature="courses">
              <React.Suspense fallback={<LoadingScreen />}>
                <CourseDetailPage />
              </React.Suspense>
            </ProtectedSubscriptionRoute>
          </ErrorBoundary>
        } />
        <Route path="/courses/:courseId/chapters/:chapterNumber/lessons/:lessonNumber" element={
          <ErrorBoundary>
            <ProtectedSubscriptionRoute requiredFeature="courses">
              <React.Suspense fallback={<LoadingScreen />}>
                <CoursePlayerPage />
              </React.Suspense>
            </ProtectedSubscriptionRoute>
          </ErrorBoundary>
        } />

        {/* Stellar Map Routes - Protected */}
        <Route path="/stellar-map" element={
          <ErrorBoundary>
            <ProtectedSubscriptionRoute requiredFeature="stellarMap">
              <React.Suspense fallback={<LoadingScreen />}>
                <StellarMapPage />
              </React.Suspense>
            </ProtectedSubscriptionRoute>
          </ErrorBoundary>
        } />

        {/* Achievements Route - Protected */}
        <Route path="/achievements" element={
          <ErrorBoundary>
            <ProtectedSubscriptionRoute requiredFeature="achievements">
              <React.Suspense fallback={<LoadingScreen />}>
                <AchievementsPage />
              </React.Suspense>
            </ProtectedSubscriptionRoute>
          </ErrorBoundary>
        } />
      </Route>

      {/* Landing Page - Public route, accessible to all users (authenticated or not) */}
      <Route path="/" element={
        <React.Suspense fallback={<LoadingScreen />}>
          <AwakeningLandingPage />
        </React.Suspense>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Deep linking initialization component
const DeepLinkingInitializer = () => {
  const navigate = useNavigate()

  React.useEffect(() => {
    // Initialize deep linking
    deepLinkingService.initialize(navigate).catch(err => {
      console.error('Error initializing deep linking:', err)
    })
  }, [navigate])

  return null
}

// Native (Capacitor) initialization: splash, status bar, keyboard
const MobileNativeInitializer = () => {
  React.useEffect(() => {
    if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) return

    const init = async () => {
      try {
        await SplashScreen.hide()
      } catch (e) {
        // ignore if not available
      }
      try {
        await Keyboard.setAccessoryBarVisible({ isVisible: false })
      } catch (e) {
        // ignore
      }
    }
    init()
  }, [])

  return null
}

function App() {
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches

  return (
    <ThemeProvider>
      <DataCacheProvider>
          <AuthProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <DeepLinkingInitializer />
              <MobileNativeInitializer />
              <OnboardingProvider>
                <PageTransitionProvider>
                  <div 
                    className="App font-sans antialiased min-h-screen"
                    style={{
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <AppRoutes />
                    <OnboardingTour />
                    {/* First-time welcome modal - shows globally on first visit */}
                    <WelcomeModal />
                <Toaster
                  position={isMobile ? 'top-center' : 'top-right'}
                  toastOptions={{
                    style: isMobile ? { marginTop: '64px', zIndex: 10000 } : { zIndex: 10000 },
                  }}
                  containerStyle={{
                    zIndex: 10000,
                    position: 'fixed',
                  }}
                />
              </div>
                </PageTransitionProvider>
              </OnboardingProvider>
            </Router>
          </AuthProvider>
      </DataCacheProvider>
    </ThemeProvider>
  )
}

export default App