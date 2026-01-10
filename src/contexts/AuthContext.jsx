import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import { logDebug, logInfo, logWarn, logError } from '../utils/logger'

// Safe cache access - returns null if DataCacheProvider is not available
let dataCacheContext = null

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  // Use refs to track initialization and prevent state loss on remounts
  const isInitializedRef = React.useRef(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Get cache context (will be null if DataCacheProvider is not available)
  // We need to import and use it conditionally, but hooks must be called unconditionally
  // So we'll handle it in fetchProfile by checking if cache methods exist

  const createDefaultProfile = useCallback(async (userId) => {
    try {
      logDebug('📝 createDefaultProfile: Starting profile creation for user:', userId)
      
      // Get user email from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        logError(new Error('No user email found for profile creation'), 'createDefaultProfile')
        setProfile(null)
        return
      }

      logDebug('📧 createDefaultProfile: User email found:', user.email)

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (existingProfile) {
        logDebug('✅ createDefaultProfile: Profile already exists:', existingProfile)
        setProfile(existingProfile)
        return
      }

      logDebug('🆕 createDefaultProfile: Creating new profile...')

      // Create new profile (insert only safe, guaranteed columns to avoid schema mismatches)
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email
        })
        .select()
        .single()

      if (error) {
        logError(error, 'createDefaultProfile - Error creating profile')
        logDebug('Error details:', error.message, error.code, error.details)
        setProfile(null)
        return
      }

      logDebug('✅ createDefaultProfile: Profile created successfully:', data)
      setProfile(data)
    } catch (error) {
      logError(error, 'createDefaultProfile - Exception')
      setProfile(null)
    }
  }, [])

  const fetchProfile = useCallback(async (userId, retryCount = 0, forceRefresh = false) => {
    const MAX_RETRIES = 2
    try {
      logDebug('📥 fetchProfile: Starting profile fetch for user:', userId)
      
      // Try to get cache context dynamically (if available)
      let dataCache = null
      try {
        // Can't call hook here, so we'll check sessionStorage directly for cache
        const cacheKey = `profile_${userId}`
        const stored = sessionStorage.getItem('app_data_cache')
        if (stored && !forceRefresh) {
          try {
            const parsed = JSON.parse(stored)
            const cached = parsed?.data?.[cacheKey]
            if (cached?.data) {
              const age = Date.now() - cached.timestamp
              if (age < cached.ttl) {
                logDebug('✅ fetchProfile: Using cached profile from sessionStorage')
                setProfile(cached.data)
                return
              }
            }
          } catch (e) {
            // Ignore cache parse errors
          }
        }
      } catch (e) {
        // Cache not available, continue with direct fetch
      }
      
      // Try to get from cache first (unless forcing refresh) - legacy code path
      if (dataCache && !forceRefresh) {
        const cacheKey = `profile_${userId}`
        const cached = dataCache.getCached(cacheKey)
        if (cached?.data) {
          const age = Date.now() - cached.timestamp
          if (age < cached.ttl) {
            logDebug('✅ fetchProfile: Using cached profile data')
            setProfile(cached.data)
            return
          }
        }
        
        // Use cache fetch function
        try {
          const result = await dataCache.fetchWithCache(
            cacheKey,
            async () => {
              const withTimeout = (promise, ms = 5000) => {
                return Promise.race([
                  promise,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('PROFILE_FETCH_TIMEOUT')), ms))
                ])
              }

              const { data, error } = await withTimeout(
                supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', userId)
                  .single()
              )
              
              if (error) throw error
              return { data }
            },
            { force: forceRefresh, ttl: 300000 } // 5 minute TTL for profile
          )
          
          if (result?.data) {
            setProfile(result.data)
            return
          }
        } catch (cacheError) {
          logWarn('📦 fetchProfile: Cache fetch failed, falling back to direct fetch:', cacheError)
          // Fall through to direct fetch
        }
      }
      
      // Direct fetch (no cache or cache failed)
      const withTimeout = (promise, ms = 5000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('PROFILE_FETCH_TIMEOUT')), ms))
        ])
      }

      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
      )

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create a default one
          logDebug('📝 fetchProfile: Profile not found, creating default profile for user:', userId)
          await createDefaultProfile(userId)
          return
        }
        
        // Retry on transient errors (network issues, temporary failures)
        if (retryCount < MAX_RETRIES && (error.code === 'PGRST301' || error.message?.includes('network') || error.message?.includes('timeout'))) {
          logWarn(`⏳ fetchProfile: Retrying (${retryCount + 1}/${MAX_RETRIES})...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return fetchProfile(userId, retryCount + 1)
        }
        
        logError(error, 'fetchProfile - Error fetching profile')
        logDebug('Error details:', error.message, error.code, error.details)
        // Don't clear profile on error - preserve existing state to prevent UI flicker
        return
      }

      logDebug('✅ fetchProfile: Profile fetched successfully:', data)
      setProfile(data)
      
      // Cache the profile if cache is available
      if (dataCache && data) {
        dataCache.setCached(`profile_${userId}`, data, 300000) // 5 minute TTL
      }
    } catch (error) {
      if (error && error.message === 'PROFILE_FETCH_TIMEOUT') {
        // Retry on timeout
        if (retryCount < MAX_RETRIES) {
          logWarn(`⏳ fetchProfile: Timeout, retrying (${retryCount + 1}/${MAX_RETRIES})...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return fetchProfile(userId, retryCount + 1)
        }
        logWarn('⏳ fetchProfile: Timed out after retries; proceeding without blocking UI')
      } else {
        logError(error, 'fetchProfile - Exception')
      }
      // Don't clear profile on error - preserve existing state to prevent UI flicker
    }
  }, [createDefaultProfile])

  useEffect(() => {
    // Prevent re-initialization if we already have a valid session and profile
    if (isInitializedRef.current && user && profile) {
      return // Skip re-initialization if we already have valid state
    }
    
    logDebug('🔍 AuthContext: Starting authentication check...')

    // Force timeout to prevent infinite loading (8 seconds max - enough for session + profile fetch)
    const forceTimeout = setTimeout(() => {
      logWarn('⏰ AuthContext: Force timeout reached, setting loading to false')
      setLoading(false)
    }, 8000)

    let loadingCleared = false
    const clearLoadingSafely = () => {
      if (!loadingCleared) {
        loadingCleared = true
        clearTimeout(forceTimeout)
        setLoading(false)
      }
    }

    // Helper to wrap promises with timeout
    const withTimeout = (promise, ms = 3000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SESSION_CHECK_TIMEOUT')), ms)
        )
      ])
    }

    // Get initial session with timeout
    withTimeout(supabase.auth.getSession())
      .then(({ data: { session }, error: sessionError }) => {
        logDebug('👤 AuthContext: Initial session check:', session?.user ? 'User found' : 'No user')
        setUser(session?.user ?? null)
        if (session?.user) {
          logDebug('📥 AuthContext: Fetching profile for user:', session.user.id)
          // Fetch profile with its own timeout, but ensure loading is cleared ONLY after profile is loaded
          fetchProfile(session.user.id)
            .then(() => {
              logDebug('✅ AuthContext: Profile fetch completed - user data fully loaded')
              isInitializedRef.current = true
              // Wait a bit to ensure profile state is updated before clearing loading
              setTimeout(() => {
                clearLoadingSafely()
              }, 200)
            })
            .catch((err) => {
              logError(err, 'AuthContext - Profile fetch error')
              // Even on error, wait a bit to ensure state is stable
              setTimeout(() => {
                clearLoadingSafely()
              }, 500)
            })
        } else {
          logDebug('✅ AuthContext: No user, setting loading to false')
          isInitializedRef.current = true // Mark as initialized even without user
          clearLoadingSafely()
        }
      })
      .catch((error) => {
        if (error && error.message === 'SESSION_CHECK_TIMEOUT') {
          logWarn('⏰ AuthContext: Session check timed out, proceeding without blocking UI')
        } else {
          logError(error, 'AuthContext - Error getting session')
        }
        clearLoadingSafely()
      })

    // Listen for auth changes - use a ref to prevent multiple subscriptions
    let subscription = null
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
        logDebug('🔄 AuthContext: Auth state changed:', event, session?.user ? 'User found' : 'No user')
        
        // Handle INITIAL_SESSION first - this fires immediately when the app loads
        // If there's no session, we can immediately clear loading without waiting
        if (event === 'INITIAL_SESSION') {
          if (!session?.user) {
            logDebug('✅ AuthContext: INITIAL_SESSION with no user - clearing loading immediately')
            setLoading(false)
            isInitializedRef.current = true
            return
          }
          // If there is a session, continue with normal flow below
        }
        
        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          // Explicit sign out - clear everything
          setUser(null)
          setProfile(null)
          isInitializedRef.current = false
          setLoading(false)
          return
        }
        
        if (event === 'TOKEN_REFRESHED' && !session?.user) {
          // Token refresh failed - clear profile but keep user if session exists
          setProfile(null)
          setLoading(false)
          return
        }
        
        // For INITIAL_SESSION with session, SIGNED_IN, or TOKEN_REFRESHED with session
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Only fetch profile if we don't already have it for this user
          // This prevents unnecessary fetches during navigation
          if (!profile || profile.id !== session.user.id) {
            logDebug('📥 AuthContext: Fetching profile after auth change for user:', session.user.id)
            await fetchProfile(session.user.id)
          }
          isInitializedRef.current = true
        }
        
        logDebug('✅ AuthContext: Auth state change completed, setting loading to false')
        setLoading(false)
      }
      )
      
      subscription = authSubscription
    } catch (error) {
      logError(error, 'AuthContext - Error setting up auth listener')
    }

    return () => {
      logDebug('🧹 AuthContext: Cleaning up auth subscription and timeout')
      clearTimeout(forceTimeout)
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          logError(error, 'AuthContext - Error unsubscribing from auth')
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfile])

  const signUp = async (email, password, userData = {}) => {
    try {
      logDebug('Starting signup process for:', email)
      
      // Single signup attempt - let the database trigger handle profile creation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        logError(error, 'Signup failed')
        throw error
      }
      
      logDebug('Signup successful:', data)
      
      // Send sign-up confirmation email (non-blocking)
      // Try Supabase Edge Function first, then fall back to server API
      try {
        const userName = userData?.full_name || data.user?.user_metadata?.full_name || null
        
        console.log('📧 Attempting to send sign-up confirmation email to:', email)
        
        // Try Supabase Edge Function first
        const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
        const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY
        
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
          try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                emailType: 'sign-up',
                email,
                userName: userName || 'there'
              })
            })
            
            if (response.ok) {
              const result = await response.json()
              console.log('✅ Sign-up confirmation email sent via Supabase Edge Function')
              return // Success, exit early
            } else if (response.status === 404) {
              console.warn('⚠️ send-email Edge Function not deployed (404). Trying server API...')
            } else {
              console.warn('⚠️ Supabase Edge Function error:', response.status)
            }
          } catch (supabaseError) {
            console.warn('⚠️ Supabase Edge Function unavailable:', supabaseError.message)
          }
        }
        
        // Fall back to server API
        let API_URL = process.env.REACT_APP_API_URL
        if (!API_URL) {
          if (process.env.NODE_ENV === 'development') {
            API_URL = 'http://localhost:3001'
          } else {
            API_URL = window.location.origin
          }
        }
        
        console.log('📧 Falling back to server API:', API_URL)
        
        const response = await fetch(`${API_URL}/api/send-signup-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            userName
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to send email' }))
          console.warn('⚠️ Sign-up email send failed:', errorData.error || errorData.message)
          if (errorData.warning) {
            console.warn('Email service warning:', errorData.warning)
          }
        } else {
          const result = await response.json()
          if (result.success) {
            console.log('✅ Sign-up confirmation email sent via server API')
          } else {
            console.warn('⚠️ Sign-up email not sent:', result.message || 'Unknown error')
          }
        }
      } catch (emailError) {
        console.warn('⚠️ Sign-up email error (non-critical):', emailError.message)
        // Don't fail signup if email fails - this is non-critical
      }

      // Handle successful signup
      if (data.user && data.session) {
        // User is immediately signed in
        logDebug('User created and signed in immediately')
        toast.success('Account created successfully!')
        return { data, error: null }
      } else if (data.user && !data.session) {
        // Email confirmation is required
        logDebug('User created, email confirmation required')
        toast.success('Account created! Please check your email to verify your account.')
        return { data, error: null }
      } else {
        throw new Error('Unexpected signup response')
      }
    } catch (error) {
      logError(error, 'Sign up error')
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      toast.success('Welcome back!')
      
      // Send sign-in confirmation email via Supabase (non-blocking)
      try {
        const { emailService } = await import('../services/emailService')
        const loginTime = new Date().toLocaleString()
        const userName = profile?.full_name || data.user?.user_metadata?.full_name || null
        
        // Get IP address if available (from headers or client)
        const ipAddress = null // Can be enhanced to get from request
        
        await emailService.sendSignInConfirmation(
          email,
          userName,
          loginTime,
          ipAddress
        ).catch(err => {
          logDebug('Sign-in email send failed (non-critical):', err)
          // Don't fail sign-in if email fails
        })
      } catch (emailError) {
        logDebug('Sign-in email error (non-critical):', emailError)
        // Don't fail sign-in if email fails
      }
      
      return { data, error: null }
    } catch (error) {
      logError(error, 'Sign in error')
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      logDebug('🔓 signOut: Starting sign out process...')
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Explicitly clear local state immediately
      logDebug('🔓 signOut: Clearing local state...')
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      logDebug('✅ signOut: Sign out successful')
      toast.success('Signed out successfully')
      return { error: null }
    } catch (error) {
      logError(error, 'signOut - Sign out error')
      toast.error(error.message)
      return { error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      
      toast.success('Password reset email sent!')
      return { error: null }
    } catch (error) {
      logError(error, 'Reset password error')
      toast.error(error.message)
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      logDebug('🔄 AuthContext: Updating profile with:', updates)
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      logDebug('✅ AuthContext: Profile updated, new data:', data)
      setProfile(data)
      // Don't show toast here - let the caller handle it
      return { data, error: null }
    } catch (error) {
      logError(error, 'AuthContext - Update profile error')
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    fetchProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}