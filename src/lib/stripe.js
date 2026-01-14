import { loadStripe } from '@stripe/stripe-js'
import { API_ENDPOINTS } from '../config'

// Get Stripe publishable key from environment variables
// Create React App uses REACT_APP_ prefix
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY

if (!STRIPE_PUBLISHABLE_KEY) {
}

// Price IDs for the subscription plans (from environment variables)
// Create React App uses REACT_APP_ prefix
export const PRICE_IDS = {
  STUDENT_MONTHLY: process.env.REACT_APP_STRIPE_STUDENT_MONTHLY_PRICE_ID,
  STUDENT_YEARLY: process.env.REACT_APP_STRIPE_STUDENT_YEARLY_PRICE_ID,
  TEACHER_MONTHLY: process.env.REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID,
  TEACHER_YEARLY: process.env.REACT_APP_STRIPE_TEACHER_YEARLY_PRICE_ID
}

// Modern Stripe Checkout approach - create session on backend first
export const createCheckoutSession = async (priceId, userEmail) => {
  try {
    // Use centralized API endpoint configuration
    const checkoutUrl = API_ENDPOINTS.CREATE_CHECKOUT_SESSION
    console.log('🔵 Stripe checkout request sent to:', checkoutUrl)
    
    // Call our backend to create the checkout session using relative URL
    const response = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerEmail: userEmail,
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/pricing`,
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const session = await response.json()
    
    if (session.error) {
      throw new Error(session.error)
    }
    
    // Redirect to Stripe Checkout
    window.location.href = session.url
    
  } catch (error) {
    throw error
  }
}

// Legacy function name for backward compatibility
export const redirectToCheckout = createCheckoutSession
