import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const createDefaultProfile = useCallback(async (userId) => {
    try {
      console.log('📝 createDefaultProfile: Starting profile creation for user:', userId)
      
      // Get user email from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        console.error('❌ createDefaultProfile: No user email found for profile creation')
        setProfile(null)
        return
      }

      console.log('📧 createDefaultProfile: User email found:', user.email)

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (existingProfile) {
        console.log('✅ createDefaultProfile: Profile already exists:', existingProfile)
        setProfile(existingProfile)
        return
      }

      console.log('🆕 createDefaultProfile: Creating new profile...')

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
        console.error('❌ createDefaultProfile: Error creating profile:', error)
        console.error('❌ createDefaultProfile: Error details:', error.message, error.code, error.details)
        setProfile(null)
        return
      }

      console.log('✅ createDefaultProfile: Profile created successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('❌ createDefaultProfile: Exception during profile creation:', error)
      setProfile(null)
    }
  }, [])

  const fetchProfile = useCallback(async (userId) => {
    try {
      console.log('📥 fetchProfile: Starting profile fetch for user:', userId)
      
      // Guard against long-hanging requests by racing with a timeout
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
          console.log('📝 fetchProfile: Profile not found, creating default profile for user:', userId)
          await createDefaultProfile(userId)
          return
        }
        console.error('❌ fetchProfile: Error fetching profile:', error)
        console.error('❌ fetchProfile: Error details:', error.message, error.code, error.details)
        setProfile(null)
        return
      }

      console.log('✅ fetchProfile: Profile fetched successfully:', data)
      setProfile(data)
    } catch (error) {
      if (error && error.message === 'PROFILE_FETCH_TIMEOUT') {
        console.warn('⏳ fetchProfile: Timed out; proceeding without blocking UI')
      } else {
        console.error('❌ fetchProfile: Exception during profile fetch:', error)
      }
      setProfile(null)
    }
  }, [createDefaultProfile])

  useEffect(() => {
    console.log('🔍 AuthContext: Starting authentication check...')

    // Force timeout to prevent infinite loading (8 seconds max - enough for session + profile fetch)
    const forceTimeout = setTimeout(() => {
      console.warn('⏰ AuthContext: Force timeout reached, setting loading to false')
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
      .then(({ data: { session } }) => {
        console.log('👤 AuthContext: Initial session check:', session?.user ? 'User found' : 'No user')
        setUser(session?.user ?? null)
        if (session?.user) {
          console.log('📥 AuthContext: Fetching profile for user:', session.user.id)
          // Fetch profile with its own timeout, but ensure loading is cleared
          fetchProfile(session.user.id)
            .then(() => {
              console.log('✅ AuthContext: Profile fetch completed')
              clearLoadingSafely()
            })
            .catch((err) => {
              console.error('❌ AuthContext: Profile fetch error:', err)
              clearLoadingSafely()
            })
        } else {
          console.log('✅ AuthContext: No user, setting loading to false')
          clearLoadingSafely()
        }
      })
      .catch((error) => {
        if (error && error.message === 'SESSION_CHECK_TIMEOUT') {
          console.warn('⏰ AuthContext: Session check timed out, proceeding without blocking UI')
        } else {
          console.error('❌ AuthContext: Error getting session:', error)
        }
        clearLoadingSafely()
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:180',message:'onAuthStateChange triggered',data:{event,hasSession:!!session,hasUser:!!session?.user,userId:session?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        console.log('🔄 AuthContext: Auth state changed:', event, session?.user ? 'User found' : 'No user')
        setUser(session?.user ?? null)
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:184',message:'setUser called in onAuthStateChange',data:{userId:session?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (session?.user) {
          console.log('📥 AuthContext: Fetching profile after auth change for user:', session.user.id)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:186',message:'Calling fetchProfile in onAuthStateChange - before',data:{userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          await fetchProfile(session.user.id)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:186',message:'fetchProfile completed in onAuthStateChange - after',data:{userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        } else {
          setProfile(null)
        }
        console.log('✅ AuthContext: Auth state change completed, setting loading to false')
        setLoading(false)
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:191',message:'onAuthStateChange completed - setLoading false',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
    )

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth subscription and timeout')
      clearTimeout(forceTimeout)
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [fetchProfile])

  const signUp = async (email, password, userData = {}) => {
    try {
      console.log('Starting signup process for:', email)
      
      // Single signup attempt - let the database trigger handle profile creation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        console.error('Signup failed:', error.message)
        throw error
      }
      
      console.log('Signup successful:', data)
      
      // Handle successful signup
      if (data.user && data.session) {
        // User is immediately signed in
        console.log('User created and signed in immediately')
        toast.success('Account created successfully!')
        return { data, error: null }
      } else if (data.user && !data.session) {
        // Email confirmation is required
        console.log('User created, email confirmation required')
        toast.success('Account created! Please check your email to verify your account.')
        return { data, error: null }
      } else {
        throw new Error('Unexpected signup response')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:245',message:'signIn called - before supabase call',data:{email:email.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:252',message:'signIn supabase returned - after',data:{hasError:!!error,hasData:!!data,hasUser:!!data?.user,hasSession:!!data?.session,userId:data?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      if (error) throw error
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:254',message:'signIn success - before toast',data:{userId:data?.user?.id,currentUserState:user?.id,currentProfileState:profile?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      toast.success('Welcome back!')
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:255',message:'signIn success - returning',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      return { data, error: null }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:257',message:'signIn error catch',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Sign in error:', error)
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔓 signOut: Starting sign out process...')
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Explicitly clear local state immediately
      console.log('🔓 signOut: Clearing local state...')
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      console.log('✅ signOut: Sign out successful')
      toast.success('Signed out successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ signOut: Sign out error:', error)
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
      console.error('Reset password error:', error)
      toast.error(error.message)
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      console.log('🔄 AuthContext: Updating profile with:', updates)
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ AuthContext: Profile updated, new data:', data)
      setProfile(data)
      // Don't show toast here - let the caller handle it
      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthContext: Update profile error:', error)
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