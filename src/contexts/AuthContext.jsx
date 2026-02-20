import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import { pushNotificationService } from '../services/pushNotificationService'
import { getAuthRedirectBaseUrl } from '../utils/authRedirect'
// import { logDebug, logInfo, logWarn, logError } from '../utils/logger'

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

const AuthProviderComponent = ({ children }) => {
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
      // logDebug('📝 createDefaultProfile: Starting profile creation for user:', userId)
      
      // Get user email from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        // logError(new Error('No user email found for profile creation'), 'createDefaultProfile')
        setProfile(null)
        return
      }

      // logDebug('📧 createDefaultProfile: User email found:', user.email)

      // Check if profile already exists (maybeSingle avoids 406 when 0 rows)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (existingProfile) {
        // If profile exists but missing name/avatar (e.g. created without trigger), fill from auth
        const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0]
        const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture
        const needsUpdate = (fullName && !existingProfile.full_name) || (avatarUrl && !existingProfile.avatar_url)
        if (needsUpdate) {
          const updates = { ...(fullName && { full_name: fullName }), ...(avatarUrl && { avatar_url: avatarUrl }) }
          const { data: updated } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
          if (updated) setProfile(updated)
          else setProfile(existingProfile)
        } else {
          setProfile(existingProfile)
        }
        return
      }

      // logDebug('🆕 createDefaultProfile: Creating new profile...')

      // From OAuth (Google): user_metadata has full_name, name, avatar_url, picture
      const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? ''
      const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null

      // Create new profile with id, email, full_name, avatar_url so it's not a "dump" account
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          ...(fullName && { full_name: fullName }),
          ...(avatarUrl && { avatar_url: avatarUrl })
        })
        .select()
        .single()

      if (error) {
        // logError(error, 'createDefaultProfile - Error creating profile')
        // logDebug('Error details:', error.message, error.code, error.details)
        setProfile(null)
        return
      }

      // logDebug('✅ createDefaultProfile: Profile created successfully:', data)
      setProfile(data)
      
      // Check if we've already sent welcome email for this user in this session
      const welcomeEmailSentKey = `welcome_email_sent_${userId}`
      const alreadySent = sessionStorage.getItem(welcomeEmailSentKey)
      
      if (!alreadySent) {
        // Mark as sent to avoid duplicate emails
        sessionStorage.setItem(welcomeEmailSentKey, 'true')
        // Send welcome email for new OAuth users (non-blocking)
        sendWelcomeEmailForNewUser(user.email, user.user_metadata?.full_name || user.email?.split('@')[0] || 'there')
          .catch(err => {
            // logDebug('Welcome email send failed (non-critical):', err)
          })
      } else {
        // logDebug('📧 createDefaultProfile: Welcome email already sent for this user in this session')
      }
    } catch (error) {
      // logError(error, 'createDefaultProfile - Exception')
      setProfile(null)
    }
  }, [])

  const fetchProfile = useCallback(async (userId, retryCount = 0, forceRefresh = false) => {
    const MAX_RETRIES = 2
    try {
      // logDebug('📥 fetchProfile: Starting profile fetch for user:', userId)
      
      // Try to get cache from sessionStorage first
      const cacheKey = `profile_${userId}`
      const stored = sessionStorage.getItem('app_data_cache') || localStorage.getItem('app_data_cache')
      if (stored && !forceRefresh) {
        try {
          const parsed = JSON.parse(stored)
          const cached = parsed?.data?.[cacheKey]
          if (cached?.data) {
            // logDebug('✅ fetchProfile: Using cached profile')
            setProfile(cached.data)
            // If we have a cached profile, we can clear loading earlier
            setLoading(false)
            return
          }
        } catch (e) {}
      }
      
      // Direct fetch with 5s timeout
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
          .maybeSingle()
      )

      if (error) {
        // Network/DB/server errors: retry on timeout, network, or 500 (server/trigger may be temporary)
        const isRetryable =
          error.code === 'PGRST301' ||
          error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.message?.includes('500') ||
          (error.message && error.message.toLowerCase().includes('internal'))
        if (retryCount < MAX_RETRIES && isRetryable) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return fetchProfile(userId, retryCount + 1)
        }
        // Don't treat as profile exists; avoid surfacing unhandled error to UI
        return
      }

      if (!data) {
        // Profile doesn't exist, create a default one
        await createDefaultProfile(userId)
        return
      }

      // logDebug('✅ fetchProfile: Profile fetched successfully:', data)
      setProfile(data)
      
      // Check if this is a new profile (created in the last 30 seconds)
      // This helps detect new OAuth users who just signed up
      if (data?.created_at) {
        const createdAt = new Date(data.created_at)
        const now = new Date()
        const secondsSinceCreation = (now - createdAt) / 1000
        
        if (secondsSinceCreation < 30) {
          // Check if we've already sent welcome email for this user in this session
          const welcomeEmailSentKey = `welcome_email_sent_${userId}`
          const alreadySent = sessionStorage.getItem(welcomeEmailSentKey)
          
          if (!alreadySent) {
            // logDebug('🆕 fetchProfile: New profile detected (created', secondsSinceCreation.toFixed(1), 'seconds ago)')
            // Mark as sent to avoid duplicate emails
            sessionStorage.setItem(welcomeEmailSentKey, 'true')
            // This is a new profile, send welcome email (non-blocking)
            sendWelcomeEmailForNewUser(data.email, data.full_name || data.email?.split('@')[0] || 'there')
              .catch(err => {
                // logDebug('Welcome email send failed (non-critical):', err)
              })
          } else {
            // logDebug('📧 fetchProfile: Welcome email already sent for this user in this session')
          }
        }
      }
    } catch (error) {
      if (error && error.message === 'PROFILE_FETCH_TIMEOUT') {
        // Retry on timeout
        if (retryCount < MAX_RETRIES) {
          // logWarn(`⏳ fetchProfile: Timeout, retrying (${retryCount + 1}/${MAX_RETRIES})...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return fetchProfile(userId, retryCount + 1)
        }
        // logWarn('⏳ fetchProfile: Timed out after retries; proceeding without blocking UI')
      } else {
        // logError(error, 'fetchProfile - Exception')
      }
      // Don't clear profile on error - preserve existing state to prevent UI flicker
    }
  }, [createDefaultProfile])

  useEffect(() => {
    // Prevent re-initialization if we already have a valid session and profile
    if (isInitializedRef.current && user && profile) {
      return // Skip re-initialization if we already have valid state
    }
    
    // logDebug('🔍 AuthContext: Starting authentication check...')

    // Force timeout to prevent infinite loading (8 seconds max - reduced from 15s)
    const forceTimeout = setTimeout(() => {
      // logWarn('⏰ AuthContext: Force timeout reached, setting loading to false')
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

    // OAuth callback error: Supabase redirects to redirectTo with hash like #error=...&error_description=...
    try {
      const hash = window.location.hash?.slice(1) || ''
      if (hash) {
        const params = new URLSearchParams(hash)
        const errorCode = params.get('error_code') || params.get('error')
        const errorDesc = params.get('error_description') || params.get('error_description')
        if (errorCode || errorDesc) {
          const msg = errorDesc || errorCode || 'Sign-in failed'
          toast.error(msg)
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }
    } catch (e) {
      // ignore
    }

    // Helper to wrap promises with timeout
    // Reduced timeout to 3s for session check - should be fast
    const withTimeout = (promise, ms = 3000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SESSION_CHECK_TIMEOUT')), ms)
        )
      ])
    }

    // Try to get last user from storage for optimistic profile fetch
    try {
      const lastUser = localStorage.getItem('supabase.auth.token');
      if (lastUser) {
        const parsed = JSON.parse(lastUser);
        const userId = parsed?.currentSession?.user?.id;
        if (userId && !profile) {
          // logDebug('🚀 AuthContext: Optimistic profile fetch for:', userId);
          fetchProfile(userId);
        }
      }
    } catch (e) {
      // Ignore errors in optimistic fetch
    }

    // Get initial session with timeout
    withTimeout(supabase.auth.getSession())
      .then(({ data: { session }, error: sessionError }) => {
        // logDebug('👤 AuthContext: Initial session check:', session?.user ? 'User found' : 'No user')
        
        setUser(prevUser => {
          const newUser = session?.user ?? null;
          if (prevUser?.id === newUser?.id) return prevUser;
          return newUser;
        })

        if (session?.user) {
          // Initialize push notifications for logged-in user
          pushNotificationService.initialize(session.user.id).catch(err => {
            console.error('Error initializing push notifications:', err)
          })
          
          // logDebug('📥 AuthContext: Fetching profile for user:', session.user.id)
          // Fetch profile without blocking loading if we already have it optimistically
          fetchProfile(session.user.id)
            .then(() => {
              // logDebug('✅ AuthContext: Profile fetch completed')
              isInitializedRef.current = true
              clearLoadingSafely()
            })
            .catch((err) => {
              // logError(err, 'AuthContext - Profile fetch error')
              clearLoadingSafely()
            })
        } else {
          // logDebug('✅ AuthContext: No user, setting loading to false')
          isInitializedRef.current = true
          clearLoadingSafely()
        }
      })
      .catch((error) => {
        if (error && error.message === 'SESSION_CHECK_TIMEOUT') {
          // logWarn('⏰ AuthContext: Session check timed out, proceeding without blocking UI')
        } else {
          // logError(error, 'AuthContext - Error getting session')
        }
        clearLoadingSafely()
      })

    // Listen for auth changes - use a ref to prevent multiple subscriptions
    let subscription = null
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
        // logDebug('🔄 AuthContext: Auth state changed:', event, session?.user ? 'User found' : 'No user')
        
        // Handle INITIAL_SESSION first - this fires immediately when the app loads
        // If there's no session, we can immediately clear loading without waiting
        if (event === 'INITIAL_SESSION') {
          if (!session?.user) {
            // logDebug('✅ AuthContext: INITIAL_SESSION with no user - clearing loading immediately')
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
          // Cleanup push notifications
          pushNotificationService.cleanup().catch(err => {
            console.error('Error cleaning up push notifications:', err)
          })
          // Clear welcome email flags from sessionStorage
          try {
            Object.keys(sessionStorage).forEach(key => {
              if (key.startsWith('welcome_email_sent_')) {
                sessionStorage.removeItem(key)
              }
            })          } catch (e) {
            // Ignore errors when clearing sessionStorage
          }
          return
        }
        
        if (event === 'TOKEN_REFRESHED' && !session?.user) {
          // Token refresh failed - clear profile but keep user if session exists
          setProfile(null)
          setLoading(false)
          return
        }
        
        // For INITIAL_SESSION with session, SIGNED_IN, or TOKEN_REFRESHED with session
        // Use functional update to prevent unnecessary re-renders when user ID hasn't changed
        setUser(prevUser => {
          const newUser = session?.user ?? null;
          // If IDs match, return the OLD reference to prevent re-renders
          if (prevUser?.id === newUser?.id) return prevUser;
          return newUser;
        })
        
        if (session?.user) {
          // Initialize push notifications for logged-in user
          pushNotificationService.initialize(session.user.id).catch(err => {
            console.error('Error initializing push notifications:', err)
          })
          
          // Only fetch profile if we don't already have it for this user
          // This prevents unnecessary fetches during navigation
          if (!profile || profile.id !== session.user.id) {
            // logDebug('📥 AuthContext: Fetching profile after auth change for user:', session.user.id)
            await fetchProfile(session.user.id)
          } else {
            // Si on a déjà le profile, on ne fait rien - pas besoin de recharger
            // logDebug('✅ AuthContext: Profile already loaded, skipping fetch')
          }
          isInitializedRef.current = true
        }
        
        // IMPORTANT: Ne jamais remettre loading à true si on a déjà un profile
        // Cela évite l'impression de rechargement lors des événements TOKEN_REFRESHED
        // qui se déclenchent quand on change de fenêtre
        if (isInitializedRef.current && profile && user) {
          // logDebug('✅ AuthContext: Already initialized with profile, keeping loading false')
          // Ne pas toucher à loading - on garde l'état actuel
          return
        }
        
        // logDebug('✅ AuthContext: Auth state change completed, setting loading to false')
        setLoading(false)
      }
      )
      
      subscription = authSubscription
    } catch (error) {
      // logError(error, 'AuthContext - Error setting up auth listener')
    }

    return () => {
      // logDebug('🧹 AuthContext: Cleaning up auth subscription and timeout')
      clearTimeout(forceTimeout)
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          // logError(error, 'AuthContext - Error unsubscribing from auth')
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfile])

  const signUp = async (email, password, userData = {}) => {
    try {
      // logDebug('Starting signup process for:', email)
      
      // Single signup attempt - let the database trigger handle profile creation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        // logError(error, 'Signup failed')
        throw error
      }
      
      // logDebug('Signup successful:', data)
      
      // Send sign-up confirmation email (non-blocking)
      // Try Supabase Edge Function first, then fall back to server API
      try {
        const userName = userData?.full_name || data.user?.user_metadata?.full_name || null
        
        
        // Skip Supabase Edge Function - it doesn't exist (404 error)
        // Go directly to server API using relative URL
        
        fetch('/api/send-signup-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            userName
          }),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
          .then(response => {
            if (!response.ok && response.status !== 503) {
              response.json().then(errorData => {
                // logWarn('Failed to send welcome email (async):', errorData);
              }).catch(() => {
                // logWarn('Failed to send welcome email (async): Unknown error');
              });
            } else if (response.ok) {
              response.json().then(result => {
                if (!result.success) {
                  // logWarn('Welcome email send returned success: false (async):', result);
                } else {
                  // logDebug('✅ Welcome email sent successfully (async)');
                }
              }).catch(() => {
                // logWarn('Failed to parse welcome email response (async):');
              });
            }
          })
          .catch(fetchError => {
            if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
              // logDebug('Welcome email request timed out (non-critical, async)');
            } else if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('NetworkError')) {
              // logDebug('Network error sending welcome email (non-critical, async)');
            } else {
              // logWarn('Error sending welcome email (non-critical, async):', fetchError);
            }
          });
      } catch (emailError) {
        // Handle timeout and network errors gracefully
        if (emailError.name === 'AbortError' || emailError.message?.includes('timeout')) {
        } else if (emailError.message?.includes('Failed to fetch') || emailError.message?.includes('NetworkError')) {
        } else {
        }
        // Don't fail signup if email fails - this is non-critical
      }

      // Handle successful signup
      if (data.user && data.session) {
        // User is immediately signed in
        // logDebug('User created and signed in immediately')
        toast.success('Account created successfully!')
        return { data, error: null }
      } else if (data.user && !data.session) {
        // Email confirmation is required
        // logDebug('User created, email confirmation required')
        toast.success('Account created! Please check your email to verify your account.')
        return { data, error: null }
      } else {
        throw new Error('Unexpected signup response')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign up error:', error?.message || error, error)
      }
      toast.error(error?.message || 'Inscription impossible')
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
      import('../services/emailService')
        .then(({ emailService }) => {
          const loginTime = new Date().toLocaleString()
          const userName = profile?.full_name || data.user?.user_metadata?.full_name || null
          const ipAddress = null // Can be enhanced to get from request
          emailService.sendSignInConfirmation(
            email,
            userName,
            loginTime,
            ipAddress
          ).catch(err => {
            // logDebug('Sign-in email send failed (non-critical, async):', err)
          })
        })
        .catch(emailError => {
          // logDebug('Sign-in email import/send error (non-critical, async):', emailError)
        })
      
      return { data, error: null }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign in error:', error?.message || error, error)
      }
      toast.error(error?.message || 'Connexion impossible')
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      // logDebug('🔓 signOut: Starting sign out process...')
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Explicitly clear local state immediately
      // logDebug('🔓 signOut: Clearing local state...')
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      // logDebug('✅ signOut: Sign out successful')
      toast.success('Signed out successfully')
      return { error: null }
    } catch (error) {
      // logError(error, 'signOut - Sign out error')
      toast.error(error.message)
      return { error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getAuthRedirectBaseUrl()}/reset-password`
      })

      if (error) throw error
      
      toast.success('Password reset email sent!')
      return { error: null }
    } catch (error) {
      // logError(error, 'Reset password error')
      toast.error(error.message)
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      // logDebug('🔄 AuthContext: Updating profile with:', updates)
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      // logDebug('✅ AuthContext: Profile updated, new data:', data)
      setProfile(data)
      // Don't show toast here - let the caller handle it
      return { data, error: null }
    } catch (error) {
      // logError(error, 'AuthContext - Update profile error')
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      // On native (Android/iOS), use a fixed URL so Supabase/Google allow the redirect.
      // Add this URL to Supabase Redirect URLs and (if custom scheme) to Android intent filters.
      // See OAUTH_SETUP.md and ANDROID_OAUTH.md.
      const baseUrl = getAuthRedirectBaseUrl()
      const redirectTo = `${baseUrl}/dashboard`
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      })

      if (error) throw error
      
      // logDebug('✅ signInWithGoogle: OAuth flow initiated successfully')
      // Note: The user will be redirected to Google, then back to the app
      // The auth state change listener will handle the rest
      // Welcome email will be sent if it's a new user (detected in fetchProfile)
      return { data, error: null }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign in with Google error:', error?.message || error, error)
      }
      toast.error(error?.message || 'Connexion Google impossible')
      return { data: null, error }
    }
  }

  // Helper function to send welcome email for new users (OAuth or regular signup)
  const sendWelcomeEmailForNewUser = async (email, userName) => {
    if (!email) {
      // logWarn('sendWelcomeEmailForNewUser: No email provided')
      return
    }

    try {
      // logDebug('📧 sendWelcomeEmailForNewUser: Sending welcome email to:', email)
      
      fetch('/api/send-signup-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userName: userName || 'there'
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
        .then(response => {
          if (!response.ok && response.status !== 503) {
            response.json().then(errorData => {
              // logWarn('Failed to send welcome email (async):', errorData);
            }).catch(() => {
              // logWarn('Failed to send welcome email (async): Unknown error');
            });
          } else if (response.ok) {
            response.json().then(result => {
              if (!result.success) {
                // logWarn('Welcome email send returned success: false (async):', result);
              } else {
                // logDebug('✅ Welcome email sent successfully (async)');
              }
            }).catch(() => {
              // logWarn('Failed to parse welcome email response (async):');
            });
          }
        })
        .catch(fetchError => {
          if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
            // logDebug('Welcome email request timed out (non-critical, async)');
          } else if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('NetworkError')) {
            // logDebug('Network error sending welcome email (non-critical, async)');
          } else {
            // logWarn('Error sending welcome email (non-critical, async):', fetchError);
          }
        });
    } catch (fetchError) {
      // Network errors are OK - email is non-critical
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
        // logDebug('Welcome email request timed out (non-critical)')
      } else if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('NetworkError')) {
        // logDebug('Network error sending welcome email (non-critical)')
      } else {
        // logWarn('Error sending welcome email (non-critical):', fetchError)
      }
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
    fetchProfile,
    signInWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProviderComponent as AuthProvider }