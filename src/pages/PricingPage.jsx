import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PRICE_IDS } from '../lib/stripe'
import { supabase } from '../lib/supabaseClient'

const PricingPage = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Check if PRICE_IDS are loaded
  useEffect(() => {
    if (!PRICE_IDS || !PRICE_IDS.STUDENT_MONTHLY || !PRICE_IDS.TEACHER_MONTHLY) {
      console.error('⚠️ PRICE_IDS not properly loaded:', PRICE_IDS)
      toast.error('Pricing configuration error. Please refresh the page.')
    }
  }, [])

  const plans = [
    {
      name: 'Free',
      price: '€0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Basic access to content',
        'Community participation',
        'Basic progress tracking',
        'Email support'
      ],
      buttonText: 'Current Plan',
      buttonStyle: 'bg-gray-500',
      disabled: true
    },
    {
      name: 'Student',
      price: '€55',
      period: 'month',
      description: 'Full access to all learning content',
      features: [
        'All courses and lessons',
        'Advanced progress tracking',
        'Priority support',
        'Community features',
        'Mobile app access'
      ],
      buttonText: 'Subscribe',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700',
      priceId: PRICE_IDS?.STUDENT_MONTHLY,
      paymentLink: process.env.REACT_APP_STRIPE_PAYMENT_LINK_MONTHLY || null
    },
    {
      name: 'Student',
      price: '€550',
      period: 'year',
      description: 'Best value - Save 17% with annual billing',
      features: [
        'All courses and lessons',
        'Advanced progress tracking',
        'Priority support',
        'Community features',
        'Mobile app access',
        'Save €110 per year'
      ],
      buttonText: 'Subscribe',
      buttonStyle: 'bg-green-600 hover:bg-green-700',
      priceId: PRICE_IDS?.STUDENT_YEARLY,
      paymentLink: process.env.REACT_APP_STRIPE_PAYMENT_LINK_YEARLY || null
    }
  ]

  const handleSubscribe = async (priceId, paymentLink) => {
    if (!user) {
      navigate('/login')
      return
    }

    // If there's a payment link, use it directly (simplest method)
    if (paymentLink) {
      window.location.href = paymentLink
      return
    }

    if (!priceId) {
      toast.error('Invalid price ID. Please contact support.')
      console.error('Price ID is missing:', priceId)
      return
    }

    setLoading(true)

    try {
      // Get environment variables - use Vite format with fallback
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
      const API_URL = import.meta.env.VITE_API_URL || 
                      (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                        ? 'http://localhost:3001' 
                        : window.location.origin)
      
      // Debug: Log what we're getting
      console.log('🔍 Payment Debug - Environment Check:', {
        SUPABASE_URL: SUPABASE_URL || 'UNDEFINED',
        API_URL: API_URL || 'UNDEFINED',
        nodeEnv: import.meta.env.MODE || process.env.NODE_ENV
      })
      
      // Determine plan type from price ID (always student now)
      const planType = 'student'
      
      // Prioritize Supabase Edge Function (if available)
      if (SUPABASE_URL) {
        try {
          const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !authSession) {
            throw new Error('You must be logged in to subscribe')
          }
          
          const supabaseEndpoint = `${SUPABASE_URL}/functions/v1/create-checkout-session`
          
          const accessToken = authSession.access_token
          
          console.log('Using Supabase Edge Function:', supabaseEndpoint)
          console.log('Request payload:', { priceId, planType })
          
          // Add 5s timeout to prevent hanging
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)
          
          const response = await fetch(supabaseEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              priceId: priceId,
              planType: planType
            }),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          console.log('Response status:', response.status, response.statusText)
          
          if (!response.ok) {
            // If 401, 404, 503, or other server errors, fall through to API server
            if (response.status === 401 || response.status === 404 || response.status === 503 || response.status >= 500) {
              const statusText = response.status === 404 ? 'Edge Function not deployed' : 
                                response.status === 503 ? 'Service unavailable' : 
                                `HTTP ${response.status}`
              console.warn(`⚠️ Supabase Edge Function returned ${response.status} (${statusText}), falling back to API server`)
              throw new Error('FALLBACK_TO_API_SERVER') // Special error to trigger fallback
            }
            
            const errorData = await response.json().catch(() => ({ 
              error: `HTTP ${response.status}: ${response.statusText}` 
            }))
            console.error('Supabase function error:', errorData)
            throw new Error(errorData.error || `Server error: ${response.status}`)
          }
          
          const sessionData = await response.json()
          console.log('Checkout session created:', sessionData)
          
          if (sessionData.error) {
            // Show detailed error message to user
            const errorMsg = sessionData.details 
              ? `${sessionData.error}: ${sessionData.details}`
              : sessionData.error
            console.error('Edge function returned error:', sessionData)
            toast.error(errorMsg || 'Failed to create checkout session')
            throw new Error(errorMsg || 'FALLBACK_TO_API_SERVER')
          }
          
          // Handle both response formats: {id, url} or {sessionId, url}
          const checkoutUrl = sessionData.url || sessionData.checkoutUrl
          if (!checkoutUrl) {
            console.error('No checkout URL in response:', sessionData)
            throw new Error('FALLBACK_TO_API_SERVER') // Fall back to server API
          }
          
          // Redirect to Stripe Checkout
          console.log('✅ Redirecting to Stripe Checkout via Edge Function:', checkoutUrl)
          window.location.href = checkoutUrl
          return
        } catch (supabaseError) {
          console.error('Supabase Edge Function error:', supabaseError)
          
          // Always fall back to API server if Edge Function fails
          // (401, 503, network errors, timeouts, etc.)
          if (supabaseError.name === 'AbortError' || 
              supabaseError.message === 'FALLBACK_TO_API_SERVER' || 
              supabaseError.message?.includes('Failed to fetch') ||
              supabaseError.message?.includes('401') ||
              supabaseError.message?.includes('503') ||
              supabaseError.message?.includes('Unauthorized') ||
              supabaseError.message?.includes('NetworkError') ||
              supabaseError.message?.includes('timeout')) {
            console.log('Falling back to API server due to:', supabaseError.name || supabaseError.message)
            // Continue to API server fallback below
          } else {
            // For other errors, still try API server as fallback
            console.log('Supabase Edge Function failed, falling back to API server')
          }
        }
      }
      
      // Fall back to API server if Supabase Edge Function failed or doesn't exist
      // Optimized: Try server API with reduced retry logic
      const apiBaseUrl = API_URL
      
      console.log('Using API server (fallback):', `${apiBaseUrl}/api/create-checkout-session`)
      
      // Retry logic: Try up to 2 times with exponential backoff (reduced from 3)
      let lastError = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (attempt > 1) {
            // Wait before retry: 1s
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log(`🔄 Retry attempt ${attempt}/2 for checkout session...`)
          }
          
          const response = await fetch(`${apiBaseUrl}/api/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priceId: priceId,
              userId: user.id,
              userEmail: user.email
            }),
            // Reduced timeout from 10s to 8s
            signal: AbortSignal.timeout(8000) // 8 second timeout
          })

          console.log(`API server response (attempt ${attempt}):`, response.status, response.statusText)

          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`
            let errorDetails = null
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorMessage
              errorDetails = errorData.details
            } catch (e) {
              const text = await response.text().catch(() => '')
              if (text) errorMessage = text
            }
            
            // Don't retry on 4xx errors (client errors)
            if (response.status >= 400 && response.status < 500) {
              console.error('❌ Client error (no retry):', errorMessage)
              if (response.status === 503) {
                errorMessage = 'Payment service is not available. Please contact support or try again later.'
                toast.error('Payment service unavailable. Please try again in a moment.')
              }
              throw new Error(errorMessage)
            }
            
            // Retry on 5xx errors (server errors)
            lastError = new Error(errorMessage)
            if (attempt < 3) continue // Retry
            throw lastError
          }

          const session = await response.json()
          console.log('✅ Checkout session received:', { id: session.id, hasUrl: !!session.url })

          if (session.error) {
            const errorMsg = session.details 
              ? `${session.error}: ${session.details}`
              : session.error
            throw new Error(errorMsg)
          }

          const checkoutUrl = session.url || session.checkoutUrl
          if (!checkoutUrl) {
            throw new Error('No checkout URL received from server')
          }

          // Success! Redirect to Stripe Checkout
          console.log('✅ Redirecting to Stripe Checkout via Server API:', checkoutUrl)
          window.location.href = checkoutUrl
          return // Success, exit
          
        } catch (error) {
          lastError = error
          if (error.name === 'AbortError') {
            console.warn(`⚠️ Request timeout (attempt ${attempt}/2)`)
            if (attempt < 2) continue
          }
          if (attempt === 2) {
            // Final attempt failed
            console.error('❌ All checkout attempts failed:', error)
            toast.error('Unable to create checkout session. Please try again or contact support.')
            throw error
          }
        }
      }
      
      // Should never reach here, but just in case
      throw lastError || new Error('Failed to create checkout session after all retries')
    } catch (error) {
      console.error('Error creating checkout session:', error)
      
      // Provide more helpful error messages
      let errorMessage = 'Something went wrong. Please try again.'
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin
        errorMessage = `Cannot connect to server at ${apiUrl}. Please make sure the server is running.`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      console.error('Full error details:', {
        error,
        API_URL: import.meta.env.VITE_API_URL || window.location.origin,
        SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
        priceId,
        envCheck: {
          hasReactAppSupabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
          hasReactAppApiUrl: !!process.env.REACT_APP_API_URL
        }
      })
    } finally {
      setLoading(false)
    }
  }

  // Determine current plan from role and subscription status
  // Only show as current plan if subscription is active
  const getCurrentPlan = () => {
    if (!profile) return 'Free'
    
    const role = profile.role || 'Free'
    const subscriptionStatus = profile.subscription_status
    
    // Only highlight as current plan if:
    // 1. Role is Student or Teacher AND
    // 2. Subscription status is 'active'
    if ((role === 'Student' || role === 'Teacher') && subscriptionStatus === 'active') {
      return role
    }
    
    return 'Free'
  }
  
  const currentPlan = getCurrentPlan()
  const hasActiveSubscription = profile?.subscription_status === 'active'
  
  // Debug logging
  useEffect(() => {
    if (user && profile) {
      console.log('📊 Pricing Page - User Info:', {
        userId: user.id,
        userEmail: user.email,
        role: profile.role,
        subscriptionStatus: profile.subscription_status,
        subscriptionId: profile.subscription_id,
        currentPlan: currentPlan,
        hasActiveSubscription: hasActiveSubscription
      })
    }
    
    // Debug environment variables (without exposing secrets)
    const supabaseUrlValue = process.env.REACT_APP_SUPABASE_URL
    console.log('🔧 Pricing Page - Environment Config:', {
      hasSupabaseUrl: !!supabaseUrlValue,
      supabaseUrl: supabaseUrlValue ? `Set (${supabaseUrlValue.substring(0, 40)}...)` : 'Missing - RESTART SERVER!',
      hasApiUrl: !!process.env.REACT_APP_API_URL,
      apiUrl: process.env.REACT_APP_API_URL || 'Not set (will use Supabase)',
      hasStripeKey: !!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
      hasPriceIds: {
        student: !!process.env.REACT_APP_STRIPE_STUDENT_MONTHLY_PRICE_ID,
        teacher: !!process.env.REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID
      },
      nodeEnv: process.env.NODE_ENV,
      allReactAppKeys: Object.keys(process.env).filter(k => k.startsWith('REACT_APP_'))
    })
    
    // Warn if Supabase URL is missing
    if (!supabaseUrlValue) {
      console.warn('⚠️ REACT_APP_SUPABASE_URL is not set!', {
        message: 'Make sure your .env file exists in the project root and contains REACT_APP_SUPABASE_URL',
        instruction: 'After creating/updating .env file, you MUST restart the development server (Ctrl+C then npm start)'
      })
    }
  }, [user, profile, currentPlan, hasActiveSubscription])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose your plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Select the perfect plan for your learning journey
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 bg-white border-2 rounded-2xl shadow-sm flex flex-col ${
                plan.name === currentPlan
                  ? 'border-indigo-500 ring-2 ring-indigo-500'
                  : 'border-gray-200'
              }`}
            >
              {plan.name === currentPlan && hasActiveSubscription && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-xl font-semibold">
                    /{plan.period}
                  </span>
                </p>
                <p className="mt-6 text-gray-500">{plan.description}</p>

                <ul className="mt-6 space-y-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <svg
                        className="flex-shrink-0 w-6 h-6 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan.priceId, plan.paymentLink)}
                disabled={plan.disabled || loading || (plan.name === currentPlan && hasActiveSubscription)}
                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center text-sm font-medium text-white ${plan.buttonStyle} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : (plan.name === currentPlan && hasActiveSubscription ? 'Current Plan' : plan.buttonText)}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center space-y-4">
          {hasActiveSubscription && profile?.role && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm font-medium text-green-800">
                <strong>Active Subscription:</strong> You are currently on the <strong>{profile.role}</strong> plan
                {profile.subscription_status && (
                  <span className="ml-2">({profile.subscription_status})</span>
                )}
              </p>
              {profile.subscription_id && (
                <p className="text-xs text-green-600 mt-1">
                  Subscription ID: {profile.subscription_id}
                </p>
              )}
            </div>
          )}
          <p className="text-sm text-gray-500">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PricingPage