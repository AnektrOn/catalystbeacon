import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useSubscription from '../hooks/useSubscription'
import toast from 'react-hot-toast'

/**
 * Protected route component that checks subscription status
 * Redirects free users to dashboard with upgrade message
 */
const ProtectedSubscriptionRoute = ({ children, requiredFeature = null }) => {
  const { profile, loading } = useAuth()
  const { isFreeUser, isAdmin } = useSubscription()
  const location = useLocation()
  
  // Early admin check from profile (before subscription hook finishes loading)
  const role = profile?.role || 'Free'
  const isAdminUser = role === 'Admin' || role === 'admin'

  // Debug logging for admin access
  if (profile) {
    console.log('🔐 ProtectedRoute Check:', {
      role,
      isAdminUser,
      isAdmin,
      hasProfile: !!profile,
      loading,
      path: location.pathname
    })
  }

  // Admin users have access to everything - allow immediately (check both sources)
  // Check profile role directly first, then fallback to hook result
  if (isAdminUser && profile) {
    console.log('✅ Admin access granted via profile role')
    return children
  }
  
  if (isAdmin && profile) {
    console.log('✅ Admin access granted via subscription hook')
    return children
  }

  // Show loading while checking auth (but only if not admin)
  if (loading && !isAdminUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is free and trying to access restricted route, redirect to dashboard (admins already handled above)
  if (isFreeUser && profile && !isAdminUser && !isAdmin) {
    // Show toast message
    toast.error('This feature requires an active subscription', {
      duration: 4000,
      icon: '🔒'
    })
    
    // Build redirect URL
    const redirectUrl = `/dashboard?upgradePrompt=true&restrictedFeature=${requiredFeature || ''}`
    
    // Redirect to dashboard with upgrade prompt
    return <Navigate to={redirectUrl} replace />
  }
  
  // If still loading, show loading state
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedSubscriptionRoute

