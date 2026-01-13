import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataCacheProvider } from './contexts/DataCacheContext'
import { PageTransitionProvider } from './contexts/PageTransitionContext'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import AppShell from './components/AppShell'
import ProtectedSubscriptionRoute from './components/ProtectedSubscriptionRoute'
import CosmicLoader from './components/ui/CosmicLoader'
import './styles/glassmorphism.css'
import './styles/mobile-responsive.css'


// Lazy load pages for code splitting
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const SignupPage = React.lazy(() => import('./pages/SignupPage'))
const DashboardNeomorphic = React.lazy(() => import('./pages/DashboardNeomorphic'))
const PricingPage = React.lazy(() => import('./pages/PricingPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const Mastery = React.lazy(() => import('./pages/Mastery'))
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))
const CourseCatalogPage = React.lazy(() => import('./pages/CourseCatalogPage'))
const CourseDetailPage = React.lazy(() => import('./pages/CourseDetailPage'))
const CoursePlayerPage = React.lazy(() => import('./pages/CoursePlayerPage'))
const CourseCreationPage = React.lazy(() => import('./pages/CourseCreationPage'))
const StellarMapPage = React.lazy(() => import('./pages/StellarMapPage'))
const AchievementsPage = React.lazy(() => import('./pages/Achievements'))
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'))
const TermsPage = React.lazy(() => import('./pages/TermsPage'))
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'))
const AwakeningLandingPage = React.lazy(() => import('./pages/AwakeningLandingPage'))
const RoadmapIgnition = React.lazy(() => import('./pages/RoadmapIgnition'))

// Loading component - Now using Cosmic Loader
// Désactivé: Ne plus montrer de loader pour éviter l'impression de rechargement
// Les composants lazy-loaded sont mis en cache par React, donc pas besoin de loader à chaque navigation
const LoadingScreen = () => {
  // Retourner null pour éviter l'affichage du loader
  // Les composants se chargeront en arrière-plan sans bloquer l'UI
  return null
  // Alternative: Si vous voulez garder un loader très discret:
  // return <div style={{ minHeight: '200px' }} /> // Placeholder invisible
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
        {/* Remplace cette ligne : */}
        {/* <Route path="/roadmap/ignition" element={<ErrorBoundary><React.Suspense...><RoadmapIgnition /></React.Suspense></ErrorBoundary>} /> */}

        {/* Par celle-ci (Note le :masterschool) : */}
        <Route path="/roadmap/:masterschool" element={
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingScreen />}>
              {/* On affiche toujours le même composant pour l'instant */}
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
            <PageTransitionProvider>
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
              </div>
            </PageTransitionProvider>
          </Router>
        </AuthProvider>
      </DataCacheProvider>
    </ThemeProvider>
  )
}

export default App