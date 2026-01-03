import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataCacheProvider } from './contexts/DataCacheContext'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import AppShell from './components/AppShell'
import ProtectedSubscriptionRoute from './components/ProtectedSubscriptionRoute'
import EnvTest from './components/EnvTest'
import './styles/glassmorphism.css'
import './styles/mobile-responsive.css'

// Lazy load pages for code splitting
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const SignupPage = React.lazy(() => import('./pages/SignupPage'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const PricingPage = React.lazy(() => import('./pages/PricingPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const Mastery = React.lazy(() => import('./pages/Mastery'))
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))
const CourseCatalogPage = React.lazy(() => import('./pages/CourseCatalogPage'))
const CourseDetailPage = React.lazy(() => import('./pages/CourseDetailPage'))
const CoursePlayerPage = React.lazy(() => import('./pages/CoursePlayerPage'))
const CourseCreationPage = React.lazy(() => import('./pages/CourseCreationPage'))
const StellarMap2DPage = React.lazy(() => import('./pages/StellarMap2DPage'))
const AchievementsPage = React.lazy(() => import('./pages/Achievements'))
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'))
const TermsPage = React.lazy(() => import('./pages/TermsPage'))
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'))
const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const EnhancedLandingPage = React.lazy(() => import('./pages/EnhancedLandingPage'))
const AwakeningLandingPage = React.lazy(() => import('./pages/AwakeningLandingPage'))
const RoadmapIgnition = React.lazy(() => import('./pages/RoadmapIgnition'))

// Loading component
const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
        <p className="text-sm text-muted-foreground/60 mt-2">If this takes too long, check the console for errors</p>
      </div>
    </div>
  )
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
      <Route path="/landing" element={
        <React.Suspense fallback={<LoadingScreen />}>
          <LandingPage />
        </React.Suspense>
      } />
      <Route path="/landing-3d" element={
        <React.Suspense fallback={<LoadingScreen />}>
          <EnhancedLandingPage />
        </React.Suspense>
      } />
      
      {/* Test routes - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <Route path="/test" element={
            <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
              <h1>TEST ROUTE WORKS!</h1>
              <p>If you can see this, routing is working.</p>
            </div>
          } />

          {/* Mastery Test Component - lazy loaded only in development */}
          <Route path="/mastery-test" element={
            <ProtectedRoute>
              {(() => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const MasteryTestComponent = React.lazy(() => import('./components/test/MasteryTestComponent'))
                return (
                  <React.Suspense fallback={<LoadingScreen />}>
                    <MasteryTestComponent />
                  </React.Suspense>
                )
              })()}
            </ProtectedRoute>
          } />
        </>
      )}

      {/* Protected Routes (With AppShell) */}
      <Route element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <Dashboard />
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
        <Route path="/mastery/achievements" element={
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

        {/* Redirect standalone calendar to mastery calendar for now */}
        <Route path="/calendar" element={<Navigate to="/mastery/calendar" replace />} />

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

        {/* Tools Routes */}
        <Route path="/timer" element={<Navigate to="/mastery/timer" replace />} />
        <Route path="/settings" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <SettingsPage />
            </React.Suspense>
          </ErrorBoundary>
        } />

        {/* Roadmap Routes - Protected */}
        <Route path="/roadmap/ignition" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <RoadmapIgnition />
            </React.Suspense>
          </ErrorBoundary>
        } />
        <Route path="/roadmap/ignition/:statLink" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              <RoadmapIgnition />
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
                <StellarMap2DPage />
              </React.Suspense>
            </ProtectedSubscriptionRoute>
          </ErrorBoundary>
        } />
        <Route path="/stellar-map-2d" element={
          <ErrorBoundary>
            <ProtectedSubscriptionRoute requiredFeature="stellarMap">
              <React.Suspense fallback={<LoadingScreen />}>
                <StellarMap2DPage />
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

function App() {
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches

  return (
    <DataCacheProvider>
      <AuthProvider>
        <Router>
          <div 
            className="App font-sans antialiased min-h-screen"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'transparent'
            }}
          >
            <AppRoutes />
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
            {/* Temporary: Environment variable test - remove after fixing */}
            {process.env.NODE_ENV === 'development' && <EnvTest />}
          </div>
        </Router>
      </AuthProvider>
    </DataCacheProvider>
  )
}

export default App