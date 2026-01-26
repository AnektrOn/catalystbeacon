import React, { useEffect } from 'react'
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
  const searchParams = new URLSearchParams(location.search)
  const fromRoadmap = searchParams.get('fromRoadmap') === 'true'

  // Early admin check from profile (before subscription hook finishes loading)
  const role = profile?.role || 'Free'
  const isAdminUser = role === 'Admin' || role === 'admin'

  // Show toast message (only once when conditions are met and not from roadmap)
  useEffect(() => {
    if (isFreeUser && profile && !isAdminUser && !isAdmin && !fromRoadmap) {
      toast.error('This feature requires an active subscription', {
        duration: 4000,
        icon: '🔒'
      });
    }
  }, [isFreeUser, profile, isAdminUser, isAdmin, fromRoadmap]);
  
  // Admin users have access to everything - allow immediately (check both sources)
  if (isAdminUser && profile) {
    return children
  }
  
  if (isAdmin && profile) {
    return children
  }

  // Show loading while checking auth (but only if not admin and pas de profile)
  if (loading && !isAdminUser && !profile) {
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
  // EXCEPT if coming from roadmap
  if (isFreeUser && profile && !isAdminUser && !isAdmin && !fromRoadmap) {
    const redirectUrl = `/dashboard?upgradePrompt=true&restrictedFeature=${requiredFeature || ''}`
    return <Navigate to={redirectUrl} replace />
  }
  
  if (!profile) {
    // Seulement bloquer si vraiment pas de profile
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