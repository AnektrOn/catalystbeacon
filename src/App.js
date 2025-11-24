import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

// Components
import AppShell from './components/AppShell'

// Auth Components
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import PricingPage from './pages/PricingPage'
import ProfilePage from './pages/ProfilePage'
import Mastery from './pages/Mastery'
import CommunityPage from './pages/CommunityPage'
import TimerPage from './pages/TimerPage'
import SettingsPage from './pages/SettingsPage'
import MasteryTestComponent from './components/test/MasteryTestComponent'

// Course Pages
import CourseCatalogPage from './pages/CourseCatalogPage'
import CourseDetailPage from './pages/CourseDetailPage'
import CoursePlayerPage from './pages/CoursePlayerPage'
import CourseCreationPage from './pages/CourseCreationPage'

// Import glassmorphism and mobile styles
import './styles/glassmorphism.css'
import './styles/mobile-responsive.css'

// Loading component
const LoadingScreen = () => {
  console.log('🔄 LoadingScreen: Rendering loading screen')
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

// Auth redirect component
const AuthRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  } else {
    return <Navigate to="/login" replace />
  }
}

// Main App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes (No AppShell) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Test route without authentication */}
      <Route path="/test" element={
        <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
          <h1>TEST ROUTE WORKS!</h1>
          <p>If you can see this, routing is working.</p>
        </div>
      } />

      {/* Mastery Test Component */}
      <Route path="/mastery-test" element={
        <ProtectedRoute>
          <MasteryTestComponent />
        </ProtectedRoute>
      } />

      {/* Protected Routes (With AppShell) */}
      <Route element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Profile Routes */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Mastery Routes */}
        <Route path="/mastery" element={<Mastery />} />
        <Route path="/mastery/calendar" element={<Mastery />} />
        <Route path="/mastery/habits" element={<Mastery />} />
        <Route path="/mastery/toolbox" element={<Mastery />} />

        {/* Redirect standalone calendar to mastery calendar for now */}
        <Route path="/calendar" element={<Navigate to="/mastery/calendar" replace />} />

        {/* Community Routes */}
        <Route path="/community" element={<CommunityPage />} />

        {/* Tools Routes */}
        <Route path="/timer" element={<TimerPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Course Routes */}
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/create" element={<CourseCreationPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/courses/:courseId/chapters/:chapterNumber/lessons/:lessonNumber" element={<CoursePlayerPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<AuthRedirect />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches

  return (
    <AuthProvider>
      <Router>
        <div className="App font-sans antialiased text-foreground bg-background min-h-screen">
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
      </Router>
    </AuthProvider>
  )
}

export default App