import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook to check if user has free subscription
 * Checks both profile.role and profile.subscription_status, and also queries subscriptions table
 */
export const useSubscription = () => {
  const { profile, loading, user } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  
  // Fetch subscription data from subscriptions table
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) {
        setSubscriptionData(null)
        setSubscriptionLoading(false)
        return
      }
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('status, stripe_subscription_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (error && error.code !== 'PGRST116') {
        }
        
        setSubscriptionData(data)
      } catch (error) {
        setSubscriptionData(null)
      } finally {
        setSubscriptionLoading(false)
      }
    }
    
    fetchSubscription()
  }, [user?.id])
  
  // Check role early, even during loading, to allow admins immediate access
  const role = profile?.role || 'Free'
  const isAdmin = role === 'Admin' || role === 'admin'
  
  // If admin, return immediately (don't wait for subscription data)
  if (isAdmin && profile) {
    return {
      isFreeUser: false,
      hasActiveSubscription: true,
      isAdmin: true,
      profile
    }
  }
  
  // If still loading subscription data, default to free (restrictive) for non-admins
  if (loading || subscriptionLoading || !profile) {
    return {
      isFreeUser: true,
      hasActiveSubscription: false,
      isAdmin: false,
      profile: null
    }
  }
  
  const profileSubscriptionStatus = profile.subscription_status || null
  const subscriptionTableStatus = subscriptionData?.status || null
  
  // Check subscription status from both sources
  // User is free if:
  // 1. role is 'Free' OR
  // 2. profile.subscription_status is not 'active' AND
  // 3. subscriptions table status is not 'active'
  const hasActiveProfileStatus = profileSubscriptionStatus === 'active'
  const hasActiveTableStatus = subscriptionTableStatus === 'active'
  const hasActiveSubscription = hasActiveProfileStatus || hasActiveTableStatus
  
  const isFreeUser = role === 'Free' || !hasActiveSubscription
  
  // Debug logging
  
  return {
    isFreeUser,
    hasActiveSubscription,
    isAdmin: false,
    profile
  }
}

export default useSubscription

