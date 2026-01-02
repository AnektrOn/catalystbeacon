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
      priceId: PRICE_IDS?.STUDENT_MONTHLY
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
      priceId: PRICE_IDS?.STUDENT_YEARLY
    }
  ]

  const handleSubscribe = async (priceId) => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!priceId) {
      toast.error('Invalid price ID. Please contact support.')
      console.error('Price ID is missing:', priceId)
      return
    }

    setLoading(true)

    try {
      const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
      const API_URL = process.env.REACT_APP_API_URL
      
      // Determine plan type from price ID (always student now)
      const planType = 'student'
      
      // Use API server if configured (preferred for production)
      if (API_URL && !API_URL.includes('localhost')) {
        console.log('Using API server:', `${API_URL}/api/create-checkout-session`)
        const response = await fetch(`${API_URL}/api/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: priceId,
            userId: user.id,
            userEmail: user.email
          }),
        })

        // Check if response is OK before parsing
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }))
          throw new Error(errorData.error || `Server error: ${response.status}`)
        }

        const session = await response.json()

        if (session.error) {
          throw new Error(session.error)
        }

        if (!session.url) {
          throw new Error('No checkout URL received from server')
        }

        // Redirect to Stripe Checkout using the session URL
        window.location.href = session.url
      } else {
        // Try Supabase Edge Function as fallback (if deployed)
        if (SUPABASE_URL) {
          try {
            const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError || !authSession) {
              throw new Error('You must be logged in to subscribe')
            }
            
            const supabaseEndpoint = `${SUPABASE_URL}/functions/v1/create-checkout-session`
            console.log('Trying Supabase Edge Function:', supabaseEndpoint)
            
            const response = await fetch(supabaseEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authSession.access_token}`,
              },
              body: JSON.stringify({
                priceId: priceId,
                planType: planType
              }),
            })
            
            if (!response.ok) {
              throw new Error(`Edge Function not deployed (${response.status}). Please set REACT_APP_API_URL or deploy the Edge Function.`)
            }
            
            const sessionData = await response.json()
            if (sessionData.error) {
              throw new Error(sessionData.error)
            }
            if (!sessionData.url) {
              throw new Error('No checkout URL received')
            }
            
            window.location.href = sessionData.url
            return
          } catch (edgeFunctionError) {
            console.error('Edge Function error:', edgeFunctionError)
            throw new Error('Payment service unavailable. Please set REACT_APP_API_URL to your backend server URL or deploy the Supabase Edge Function.')
          }
        } else {
          throw new Error('No payment endpoint configured. Please set REACT_APP_API_URL or REACT_APP_SUPABASE_URL in your environment variables.')
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      
      // Provide more helpful error messages
      let errorMessage = 'Something went wrong. Please try again.'
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'
        errorMessage = `Cannot connect to server at ${API_URL}. Please make sure the server is running.`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      console.error('Full error details:', {
        error,
        API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
        SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
        priceId
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
    console.log('🔧 Pricing Page - Environment Config:', {
      hasSupabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Missing',
      hasApiUrl: !!process.env.REACT_APP_API_URL,
      apiUrl: process.env.REACT_APP_API_URL || 'Not set (will use Supabase)',
      hasStripeKey: !!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
      hasPriceIds: {
        student: !!process.env.REACT_APP_STRIPE_STUDENT_MONTHLY_PRICE_ID,
        teacher: !!process.env.REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID
      }
    })
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
                onClick={() => handleSubscribe(plan.priceId)}
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