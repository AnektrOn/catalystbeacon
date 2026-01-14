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
      return
    }

    setLoading(true)
    

    try {
      // Use API server as PRIMARY solution (most reliable)
      // CRITICAL: On mobile, window.location.origin might not work correctly
      // Use explicit protocol detection
      let API_URL = process.env.REACT_APP_API_URL
      if (!API_URL) {
        if (typeof window !== 'undefined') {
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            API_URL = 'http://localhost:3001'
          } else {
            // Use current origin for production
            API_URL = `${window.location.protocol}//${window.location.host}`
          }
        } else {
          API_URL = window.location.origin
        }
      }
      
      
      // Use API server directly (no Edge Function attempts)
      const apiBaseUrl = API_URL
      
      // Test server connectivity first
      try {
        const healthResponse = await fetch(`${apiBaseUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json()
        } else {
        }
      } catch (healthError) {
        toast.error('Server is not accessible. Please check if the server is running.')
        setLoading(false)
        return
      }
      
      
      // Retry logic: Try up to 2 times with exponential backoff
      let lastError = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (attempt > 1) {
            // Wait before retry: 1s
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          
          const response = await fetch(`${apiBaseUrl}/api/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priceId: priceId,
              userId: user.id,
              userEmail: user.email
            }),
            // Increased timeout to 15s for better reliability
            signal: AbortSignal.timeout(15000) // 15 second timeout
          })

          // Check if response is HTML (SPA redirect) instead of JSON
          const contentType = response.headers.get('content-type')
          if (contentType && !contentType.includes('application/json')) {
            const text = await response.text().catch(() => '')
            if (text.includes('<!doctype html>') || text.includes('<html')) {
              console.error('Non-JSON response from checkout endpoint: Received HTML instead of JSON. API_URL may be pointing to frontend.')
              throw new Error('Checkout endpoint returned HTML instead of JSON. Please verify API_URL configuration points to the backend server.')
            }
          }

          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`
            let errorDetails = null
            let errorCode = null
            let errorData = null
            try {
              errorData = await response.json()
              errorMessage = errorData.error || errorMessage
              errorDetails = errorData.details
              errorCode = errorData.code
            } catch (e) {
              const text = await response.text().catch(() => '')
              if (text) {
                // Check if it's HTML (SPA redirect)
                if (text.includes('<!doctype html>') || text.includes('<html')) {
                  errorMessage = 'Checkout endpoint returned HTML instead of JSON. API_URL may be misconfigured.'
                  console.error('Non-JSON response from checkout endpoint:', text.substring(0, 200))
                } else {
                  errorMessage = text
                }
              }
            }
            
            // Don't retry on 4xx errors (client errors)
            if (response.status >= 400 && response.status < 500) {
              if (response.status === 503) {
                // 503 means service unavailable - could be server not running or Stripe not configured
                const detailedError = errorDetails || errorMessage
                
                if (errorCode === 'STRIPE_NOT_CONFIGURED' || detailedError?.includes('STRIPE_SECRET_KEY') || detailedError?.includes('not configured')) {
                  errorMessage = 'Payment service is not configured on the server. Please contact support to enable payments.'
                  toast.error('Payment service is not configured. Please contact support.', {
                    duration: 5000
                  })
                } else if (detailedError?.includes('server.env')) {
                  errorMessage = 'Server configuration error. Please contact support.'
                  toast.error('Server configuration error. Please contact support.', {
                    duration: 5000
                  })
                } else {
                  errorMessage = 'Payment service is temporarily unavailable. The server may not be running or there is a configuration issue.'
                  toast.error('Payment service unavailable. Please contact support if this persists.', {
                    duration: 5000
                  })
                }
              } else if (response.status === 400) {
                errorMessage = errorMessage || 'Invalid request. Please check your payment details.'
                toast.error(errorMessage)
              } else {
                toast.error(errorMessage || 'An error occurred. Please try again.')
              }
              throw new Error(errorMessage)
            }
            
            // Retry on 5xx errors (server errors)
            lastError = new Error(errorMessage)
            if (attempt < 2) continue // Retry once
            throw lastError
          }

          // Ensure response is JSON before parsing (reuse contentType from earlier check)
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text().catch(() => '')
            console.error('Non-JSON response from checkout endpoint:', text.substring(0, 200))
            throw new Error('Checkout endpoint returned non-JSON response. Please verify API_URL configuration.')
          }

          const session = await response.json()

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
          window.location.href = checkoutUrl
          return // Success, exit
          
        } catch (error) {
          lastError = error
          if (error.name === 'AbortError' || error.message?.includes('timeout')) {
            if (attempt < 2) continue
            toast.error('Request timeout. Please check your connection and try again.')
          } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
            if (attempt < 2) continue
            toast.error('Network error. Please check your connection and try again.')
          }
          if (attempt === 2) {
            // Final attempt failed
            if (!error.message?.includes('timeout') && !error.message?.includes('NetworkError')) {
              toast.error('Unable to create checkout session. Please try again or contact support.')
            }
            throw error
          }
        }
      }
      
      // Should never reach here, but just in case
      throw lastError || new Error('Failed to create checkout session after all retries')
    } catch (error) {
      
      // Provide more helpful error messages
      let errorMessage = 'Something went wrong. Please try again.'
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        const apiUrl = process.env.REACT_APP_API_URL || window.location.origin
        errorMessage = `Cannot connect to server at ${apiUrl}. Please make sure the server is running.`
      } else if (error.message?.includes('FALLBACK_TO_API_SERVER')) {
        // This should not happen since we use API server directly
        errorMessage = 'Unable to create checkout session. Please try again or contact support.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
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
    }
    
    // Debug environment variables (without exposing secrets)
    const supabaseUrlValue = process.env.REACT_APP_SUPABASE_URL;
    
    // Warn if Supabase URL is missing
    if (!supabaseUrlValue) {
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