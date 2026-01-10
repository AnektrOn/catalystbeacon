// Load environment variables from server.env file FIRST
const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(__dirname, 'server.env') })

// Debug: Check what Stripe vars are loaded
console.log('STRIPE_SECRET_KEY loaded:', process.env.STRIPE_SECRET_KEY ? 'YES (' + process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...)' : 'NO')
console.log('All STRIPE vars:', Object.keys(process.env).filter(k => k.includes('STRIPE')))

// Verify Stripe key is loaded and not a placeholder
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key')) {
  console.error('ERROR: STRIPE_SECRET_KEY is not set correctly in server.env!')
  console.error('Please check server.env file and add your actual Stripe secret key')
  console.error('Get your key from: https://dashboard.stripe.com/test/apikeys')
  console.error('Current value:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'NOT SET')
  process.exit(1)
}

const express = require('express')
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')
const rateLimit = require('express-rate-limit')

// Email service (using your own SMTP server via Nodemailer)
let emailService
try {
  emailService = require('./server/emailService')
  console.log('✅ Email service loaded (SMTP)')
} catch (error) {
  console.warn('⚠️ Email service not available:', error.message)
  emailService = null
}

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy MUST be set FIRST (before rate limiters) - required when behind reverse proxy/load balancer
app.set('trust proxy', true)

// Stripe Price IDs from environment variables
const STRIPE_PRICE_IDS = {
  STUDENT_MONTHLY: process.env.STRIPE_STUDENT_MONTHLY_PRICE_ID || 'price_1RutXI2MKT6Humxnh0WBkhCp',
  STUDENT_YEARLY: process.env.STRIPE_STUDENT_YEARLY_PRICE_ID || 'price_1SB9e52MKT6Humxnx7qxZ2hj',
  TEACHER_MONTHLY: process.env.STRIPE_TEACHER_MONTHLY_PRICE_ID || 'price_1SBPN62MKT6HumxnBoQgAdd0',
  TEACHER_YEARLY: process.env.STRIPE_TEACHER_YEARLY_PRICE_ID || 'price_1SB9co2MKT6HumxnOSALvAM4'
}

// Helper function to determine role from price ID
function getRoleFromPriceId(priceId) {
  if (priceId === STRIPE_PRICE_IDS.STUDENT_MONTHLY || priceId === STRIPE_PRICE_IDS.STUDENT_YEARLY) {
    return 'Student'
  } else if (priceId === STRIPE_PRICE_IDS.TEACHER_MONTHLY || priceId === STRIPE_PRICE_IDS.TEACHER_YEARLY) {
    return 'Teacher'
  }
  return 'Free'
}

// Supabase client
// CRITICAL: Verify Supabase configuration is loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ CRITICAL: Supabase configuration missing!')
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING')
  console.error('Please check your server.env file!')
  process.exit(1)
}

console.log('✅ Supabase client initialized:', {
  url: process.env.SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// BULLETPROOF: Helper function to send email via Supabase Edge Function
// This is called from webhooks and API endpoints
async function sendEmailViaSupabase(emailType, emailData) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ Supabase configuration missing - cannot send email')
      return { success: false, error: 'Supabase configuration missing' }
    }

    // Add 5s timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    console.log(`📧 Calling send-email Edge Function for: ${emailType} to ${emailData.email}`)

    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        emailType,
        ...emailData
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { error: errorText || 'Failed to send email' }
      }
      console.error('❌ Supabase Edge Function error:', error)
      throw new Error(error.error || 'Failed to send email')
    }

    const result = await response.json()
    console.log('✅ Email sent via Supabase Edge Function:', result)
    return { success: true, ...result }
  } catch (error) {
    // Handle timeout gracefully
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      console.warn('⚠️ Email send timeout via Supabase Edge Function')
      return { success: false, error: 'Email service timeout' }
    }
    console.error('❌ Error sending email via Supabase:', error)
    return { success: false, error: error.message }
  }
}

// Rate limiting middleware (trust proxy is already set above)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
// CORS configuration - restrict origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://humancatalystbeacon.com'])
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json())

// Add CSP header that allows Stripe scripts (only for HTML pages, not API)
app.use((req, res, next) => {
  // Only add CSP for HTML pages, not API routes or static assets
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/static/') && req.path !== '/favicon.ico') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com " +
      "'sha256-BNulBYV1JXGvq9NQg7814ZyyVZCqfRI1aq5d+PSIdgI=' " +
      "'sha256-5Hr21t1F1f0L2UiWkQNDZLeFImeo/+Mjhgju4d39sLA=' " +
      "'sha256-4LRRm+CrRt91043ELDDzsKtE9mgb52p2iOlf9CRXTJ0=' " +
      "'sha256-ieoeWczDHkReVBsRBqaal5AFMlBtNjMzgwKvLqi/tSU='; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://*.stripe.com https://*.supabase.co https://api.stripe.com; " +
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com; " +
      "frame-ancestors 'self';"
    )
  }
  next()
})

// Apply general rate limiting to all routes (AFTER trust proxy is set)
app.use('/api/', generalLimiter)

// Create Stripe customer
app.post('/api/create-customer', async (req, res) => {
  try {
    const { email, userId } = req.body

    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userId
      }
    })

    // Update user profile with Stripe customer ID
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId)

    res.json({ customerId: customer.id })
  } catch (error) {
    console.error('Error creating customer:', error)
    res.status(500).json({ error: error.message })
  }
})

// Send sign-up confirmation email via Supabase Edge Function
app.post('/api/send-signup-email', async (req, res) => {
  try {
    const { email, userName } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ Supabase configuration missing - cannot send email')
      return res.json({ 
        success: false, 
        message: 'Email service not configured. Account created but no email sent.',
        warning: 'Supabase configuration missing'
      })
    }

    console.log('📧 Sending sign-up confirmation email via Supabase to:', email)

    // Use Supabase Edge Function for email
    const result = await sendEmailViaSupabase('sign-up', {
      email,
      userName: userName || 'there'
    })

    if (result.success) {
      console.log('✅ Sign-up email sent successfully via Supabase')
      return res.json({ success: true, message: 'Email sent successfully' })
    } else {
      console.error('❌ Failed to send sign-up email:', result.error)
      // Don't fail the request - email is non-critical
      return res.json({ 
        success: false, 
        message: 'Email could not be sent, but account was created successfully',
        error: result.error 
      })
    }
  } catch (error) {
    console.error('❌ Error sending sign-up email:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

// Create checkout session
app.post('/api/create-checkout-session', paymentLimiter, async (req, res) => {
  console.log('=== CREATE CHECKOUT SESSION REQUEST ===')
  console.log('Body:', req.body)
  console.log('Origin:', req.headers.origin)
  console.log('Headers:', req.headers)
  
  try {
    const { priceId, userId, userEmail } = req.body
    
    if (!priceId || !userId || !userEmail) {
      console.error('Missing required fields:', { priceId: !!priceId, userId: !!userId, userEmail: !!userEmail })
      return res.status(400).json({ error: 'Missing required fields: priceId, userId, and userEmail are required' })
    }

    // Validate Stripe key
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key')) {
      console.error('❌ ERROR: STRIPE_SECRET_KEY is not configured')
      console.error('Please set STRIPE_SECRET_KEY in server.env file')
      return res.status(503).json({ 
        error: 'Payment service is not configured. Please contact support.',
        details: process.env.NODE_ENV === 'development' ? 'STRIPE_SECRET_KEY is missing or invalid in server.env' : undefined
      })
    }

    // Get or create Stripe customer
    let customerId
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    console.log('Creating Stripe checkout session with customer:', customerId)
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'http://localhost:3000'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/pricing?payment=cancelled`,
      metadata: {
        userId: userId
      }
    })

    console.log('Checkout session created successfully:', { id: session.id, url: session.url ? 'YES' : 'NO' })
    
    res.json({ id: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    })
    
    // Return appropriate status code
    const statusCode = error.statusCode || 500
    res.status(statusCode).json({ 
      error: error.message || 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Handle successful payment
app.get('/api/payment-success', paymentLimiter, async (req, res) => {
  try {
    const { session_id } = req.query
    
    if (!session_id) {
      console.error('❌ Missing session_id in payment success request')
      return res.status(400).json({ error: 'Missing session_id parameter' })
    }
    
    console.log('=== PAYMENT SUCCESS ENDPOINT CALLED ===')
    console.log('Session ID:', session_id)
    console.log('Request origin:', req.headers.origin)
    console.log('Request IP:', req.ip)
    console.log('Supabase config check:', {
      hasUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : 'MISSING'
    })

    const session = await stripe.checkout.sessions.retrieve(session_id)
    console.log('Stripe session retrieved:', {
      id: session.id,
      userId: session.metadata?.userId,
      planType: session.metadata?.planType,
      subscriptionId: session.subscription
    })

    // CRITICAL: Check if session has subscription
    if (!session.subscription) {
      console.error('❌ No subscription in session:', session.id)
      throw new Error('No subscription found in checkout session')
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    
    // Safety check for subscription data
    if (!subscription || !subscription.items || !subscription.items.data || subscription.items.data.length === 0) {
      console.error('❌ Invalid subscription data:', subscription)
      throw new Error('Invalid subscription data - no items found')
    }
    
    const priceItem = subscription.items.data[0]
    if (!priceItem || !priceItem.price || !priceItem.price.id) {
      console.error('❌ Invalid price item in subscription:', priceItem)
      throw new Error('Invalid price item in subscription')
    }
    
    console.log('Stripe subscription retrieved:', {
      id: subscription.id,
      priceId: priceItem.price.id,
      status: subscription.status,
      customer: subscription.customer,
      itemsCount: subscription.items.data.length
    })

    // Determine role based on price
    const priceId = priceItem.price.id
    
    const newRole = getRoleFromPriceId(priceId)
    console.log('Determined role:', newRole, 'for price ID:', priceId)
    
    // CRITICAL: Get userId from metadata or try to find by customer ID
    let userId = session.metadata?.userId
    
    if (!userId) {
      console.warn('⚠️ No userId in session metadata, trying to find by customer ID')
      // Try to find user by stripe_customer_id
      const { data: profileByCustomer } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', session.customer)
        .single()
      
      if (profileByCustomer) {
        userId = profileByCustomer.id
        console.log('✅ Found user by customer ID:', userId)
      } else {
        throw new Error('Missing userId in session metadata and could not find user by customer ID')
      }
    }
    
    console.log('🔑 Using userId:', userId)

    // Get current user profile to check if they're an Admin
    const { data: currentProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('role, subscription_status, subscription_id')
      .eq('id', userId)
      .single()

    if (profileFetchError) {
      console.error('❌ Error fetching profile:', profileFetchError)
      throw new Error(`Failed to fetch user profile: ${profileFetchError.message}`)
    }

    if (!currentProfile) {
      throw new Error(`User profile not found for userId: ${userId}`)
    }

    const currentRole = currentProfile?.role || 'Free'
    console.log('Current user profile:', {
      role: currentRole,
      subscription_status: currentProfile.subscription_status,
      subscription_id: currentProfile.subscription_id
    })

    // CRITICAL: Prepare update object - ensure subscription is always set to active
    // Only update role if user is NOT an Admin (preserve Admin role)
    const updateData = {
      subscription_status: 'active', // Always set to active for successful payment
      subscription_id: subscription.id,
      stripe_customer_id: session.customer,
      updated_at: new Date().toISOString()
    }

    // Only update role if user is not an Admin (preserve Admin role)
    if (currentRole !== 'Admin') {
      updateData.role = newRole
      console.log('Updating role from', currentRole, 'to', newRole)
    } else {
      console.log('⚠️ User is Admin - preserving Admin role, only updating subscription info')
    }

    // BULLETPROOF: Update user profile with retry logic
    let updateResult = null
    let updateError = null
    
    console.log('🔄 Attempting to update profile with data:', updateData)
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`🔄 Database update attempt ${attempt}/3 for userId: ${userId}`)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()

      if (error) {
        updateError = error
        console.error(`❌ Supabase update error (attempt ${attempt}/3):`, {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        if (attempt < 3) {
          // Wait before retry: 500ms, 1s
          await new Promise(resolve => setTimeout(resolve, attempt * 500))
          continue
        }
        throw error
      } else {
        updateResult = data
        console.log(`✅ Profile updated successfully (attempt ${attempt}):`, updateResult)
        
        // Verify the update actually happened
        if (updateResult && updateResult.length > 0) {
          const updated = updateResult[0]
          console.log('✅ VERIFIED UPDATE:', {
            id: updated.id,
            role: updated.role,
            subscription_status: updated.subscription_status,
            subscription_id: updated.subscription_id
          })
        } else {
          console.warn('⚠️ Update returned no data - verifying manually...')
          // Verify manually
          const { data: verifyData } = await supabase
            .from('profiles')
            .select('role, subscription_status, subscription_id')
            .eq('id', userId)
            .single()
          console.log('📊 Manual verification:', verifyData)
        }
        break
      }
    }

    if (updateError) {
      console.error('❌ All update attempts failed:', updateError)
      throw updateError
    }
    
    if (!updateResult || updateResult.length === 0) {
      throw new Error('Profile update returned no data')
    }
    
    // CRITICAL: Create or update subscription record in subscriptions table
    // Do this synchronously and ensure it succeeds
    let subData = null
    let subError = null
    
    try {
      console.log('🔄 Creating subscription record:', {
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscription.id,
        plan_type: priceItem.price.recurring?.interval || 'monthly',
        status: subscription.status
      })
      
      const subscriptionData = {
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscription.id,
        plan_type: priceItem.price.recurring?.interval || 'monthly',
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // BULLETPROOF: Try insert first (most common case - new subscription)
      const { data: insertData, error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()

      if (insertError) {
        // If insert fails (likely duplicate), try update
        console.log('⚠️ Insert failed (likely duplicate), trying update:', insertError.message)
        console.log('📋 Insert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        })
        
        // Try update (if record exists)
        const { data: updateData, error: updateError } = await supabase
          .from('subscriptions')
          .update({
            user_id: userId,
            stripe_customer_id: session.customer,
            plan_type: priceItem.price.recurring?.interval || 'monthly',
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)
          .select()

        if (updateError) {
          subError = updateError
          console.error('❌ All subscription record methods failed:', {
            insertError: insertError.message,
            updateError: updateError.message,
            code: updateError.code,
            details: updateError.details
          })
        } else {
          subData = updateData
          console.log('✅ Subscription record updated successfully:', subData)
        }
      } else {
        subData = insertData
        console.log('✅ Subscription record inserted successfully:', subData)
      }

      if (subError) {
        console.error('❌ CRITICAL: Failed to create/update subscription record:', subError)
        // Don't fail the request, but log it as critical
      } else if (!subData || subData.length === 0) {
        console.error('❌ CRITICAL: Subscription record operation returned no data')
      }

    } catch (subErr) {
      console.error('❌ CRITICAL: Exception creating subscription record:', subErr)
      console.error('Exception details:', {
        name: subErr.name,
        message: subErr.message,
        stack: subErr.stack
      })
      // Don't fail the request, but this is critical
    }
    
    console.log('=== PAYMENT SUCCESS COMPLETE ===')
    console.log('📊 Final state:', {
      userId,
      role: currentRole === 'Admin' ? 'Admin' : newRole,
      subscription_status: 'active',
      subscription_id: subscription.id
    })

    // Return the role that was actually set (or preserved)
    const finalRole = currentRole === 'Admin' ? 'Admin' : newRole
    res.json({ 
      success: true, 
      role: finalRole, 
      subscriptionId: subscription.id,
      subscriptionStatus: 'active',
      userId: userId
    })
  } catch (error) {
    console.error('Error handling payment success:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create customer portal session
app.post('/api/create-portal-session', paymentLimiter, async (req, res) => {
  try {
    const { userId } = req.body

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.origin}/dashboard`,
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    res.status(500).json({ error: error.message })
  }
})

// Stripe webhook
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await handleCheckoutSessionCompleted(session)
        break
      case 'customer.subscription.created':
        const createdSubscription = event.data.object
        await handleSubscriptionCreated(createdSubscription)
        break
      case 'customer.subscription.updated':
        const subscription = event.data.object
        await handleSubscriptionUpdate(subscription)
        break
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        await handleSubscriptionDeleted(deletedSubscription)
        break
      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        await handleInvoicePaymentSucceeded(invoice)
        break
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object
        await handleInvoicePaymentFailed(failedInvoice)
        break
      case 'invoice.upcoming':
        const upcomingInvoice = event.data.object
        await handleInvoiceUpcoming(upcomingInvoice)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    res.status(500).json({ error: error.message })
  }
})

async function handleCheckoutSessionCompleted(session) {
  console.log('=== WEBHOOK: checkout.session.completed ===')
  console.log('Session ID:', session.id)
  console.log('Session mode:', session.mode)
  console.log('Session metadata:', session.metadata)
  
  if (session.mode === 'subscription') {
    if (!session.subscription) {
      console.error('❌ No subscription in session')
      return
    }
    
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    const customerId = session.customer
    let userId = session.metadata?.userId
    const planType = session.metadata?.planType

    console.log('Subscription checkout completed:', {
      userId,
      planType,
      customerId,
      subscriptionId: subscription.id
    })

    // CRITICAL: If no userId in metadata, try to find by customer ID
    if (!userId) {
      console.warn('⚠️ No userId in session metadata, trying to find by customer ID')
      const { data: profileByCustomer } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      
      if (profileByCustomer) {
        userId = profileByCustomer.id
        console.log('✅ Found user by customer ID:', userId)
      } else {
        console.error('❌ No userId in session metadata and could not find user by customer ID')
        return
      }
    }

    // Determine role based on plan type from metadata
    let newRole = 'Student' // default
    if (planType === 'teacher' || planType === 'Teacher') {
      newRole = 'Teacher'
    }

    // Get current user profile to check if they're an Admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    const currentRole = currentProfile?.role || 'Free'
    console.log('Current user role:', currentRole, 'New role would be:', newRole)

    // Prepare update object - only update role if user is NOT an Admin
    // CRITICAL: Always set subscription_status to 'active' for successful payments
    // Get price ID safely
    const priceItem = subscription.items.data[0]
    if (!priceItem || !priceItem.price) {
      console.error('❌ WEBHOOK: Invalid subscription items:', subscription.items)
      throw new Error('Invalid subscription items')
    }
    
    const updateData = {
      subscription_status: 'active', // Force active status for successful checkout
      subscription_id: subscription.id,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString()
    }

    // Only update role if user is not an Admin (preserve Admin role)
    if (currentRole !== 'Admin') {
      updateData.role = newRole
      console.log('Updating role from', currentRole, 'to', newRole)
    } else {
      console.log('⚠️ User is Admin - preserving Admin role, only updating subscription info')
    }

    // BULLETPROOF: Update profile with retry logic (webhook must succeed)
    let updateResult = null
    let updateError = null
    
    console.log('🔄 WEBHOOK: Attempting to update profile with data:', updateData)
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`🔄 WEBHOOK: Database update attempt ${attempt}/3 for userId: ${userId}`)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()

      if (error) {
        updateError = error
        console.error(`❌ WEBHOOK: Error updating profile (attempt ${attempt}/3):`, {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        if (attempt < 3) {
          // Wait before retry: 500ms, 1s
          await new Promise(resolve => setTimeout(resolve, attempt * 500))
          continue
        }
        throw error // Fail webhook if all retries fail
      } else {
        updateResult = data
        console.log(`✅ WEBHOOK: Profile updated successfully (attempt ${attempt}):`, updateResult)
        
        // Verify the update
        if (updateResult && updateResult.length > 0) {
          const updated = updateResult[0]
          console.log('✅ WEBHOOK: VERIFIED UPDATE:', {
            id: updated.id,
            role: updated.role,
            subscription_status: updated.subscription_status,
            subscription_id: updated.subscription_id
          })
        }
        break
      }
    }

    if (updateError) {
      console.error('❌ WEBHOOK: All update attempts failed:', updateError)
      throw updateError
    }
    
    if (!updateResult || updateResult.length === 0) {
      console.error('❌ WEBHOOK: Profile update returned no data')
      throw new Error('Profile update returned no data')
    }
    
    // Email processing removed for speed - will be handled separately if needed

    // CRITICAL: Create or update subscription record (webhook must succeed)
    try {
      console.log('🔄 WEBHOOK: Creating subscription record:', {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id
      })
      
      // SIMPLE: Try insert first, if fails (duplicate), try update
      const subscriptionData = {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_type: priceItem.price.recurring?.interval || 'monthly',
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()

      if (insertError) {
        // If insert fails (likely duplicate), try update
        console.log('⚠️ WEBHOOK: Insert failed (likely duplicate), trying update:', insertError.message)
        
        const { data: updateData, error: updateError } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('stripe_subscription_id', subscription.id)
          .select()

        if (updateError) {
          console.error('❌ WEBHOOK: CRITICAL - Both insert and update failed:', {
            insertError: insertError.message,
            updateError: updateError.message,
            code: updateError.code,
            details: updateError.details,
            subscriptionId: subscription.id
          })
        } else {
          console.log('✅ WEBHOOK: Subscription record updated:', updateData)
        }
      } else {
        console.log('✅ WEBHOOK: Subscription record inserted:', insertData)
      }
    } catch (subErr) {
      console.error('❌ WEBHOOK: CRITICAL - Exception creating subscription record:', subErr)
    }
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Handling customer.subscription.created for subscription:', subscription.id)
  
  const customerId = subscription.customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    // Get the price ID to determine the plan type
    if (!subscription.items || !subscription.items.data || subscription.items.data.length === 0) {
      console.error('❌ WEBHOOK: Invalid subscription items in handleSubscriptionCreated')
      return
    }
    
    const priceItem = subscription.items.data[0]
    if (!priceItem || !priceItem.price || !priceItem.price.id) {
      console.error('❌ WEBHOOK: Invalid price item in handleSubscriptionCreated')
      return
    }
    
    const priceId = priceItem.price.id
    const newRole = getRoleFromPriceId(priceId)

    // Get current role to check if user is Admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', profile.id)
      .single()

    const currentRole = currentProfile?.role || 'Free'
    console.log('Current user role:', currentRole, 'New role would be:', newRole)

    // Prepare update - only update role if user is NOT an Admin
    // CRITICAL: Always set subscription_status to 'active' for new subscriptions
    const updateData = {
      subscription_status: 'active', // Force active for new subscriptions
      subscription_id: subscription.id,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString()
    }

    // Only update role if user is not an Admin
    if (currentRole !== 'Admin') {
      updateData.role = newRole
      console.log('Updating role from', currentRole, 'to', newRole)
    } else {
      console.log('⚠️ User is Admin - preserving Admin role, only updating subscription info')
    }

    // BULLETPROOF: Update with retry logic
    let updateResult = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)
        .select()

      if (error) {
        console.error(`❌ WEBHOOK handleSubscriptionCreated: Update error (attempt ${attempt}/3):`, error)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 500))
          continue
        }
        throw error
      } else {
        updateResult = data
        console.log(`✅ WEBHOOK handleSubscriptionCreated: Profile updated (attempt ${attempt}):`, updateResult)
        break
      }
    }
    
    if (!updateResult) {
      throw new Error('Failed to update profile in handleSubscriptionCreated')
    }
  }
}

async function handleSubscriptionUpdate(subscription) {
  console.log('Handling customer.subscription.updated for subscription:', subscription.id)
  
  const customerId = subscription.customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, email, full_name')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    // Get the price ID to determine if role should change
    if (!subscription.items || !subscription.items.data || subscription.items.data.length === 0) {
      console.error('❌ WEBHOOK: Invalid subscription items in handleSubscriptionUpdate')
      return
    }
    
    const priceItem = subscription.items.data[0]
    if (!priceItem || !priceItem.price || !priceItem.price.id) {
      console.error('❌ WEBHOOK: Invalid price item in handleSubscriptionUpdate')
      return
    }
    
    const priceId = priceItem.price.id
    const newRole = getRoleFromPriceId(priceId)
    const oldRole = profile.role

    console.log('Subscription updated, would set role to:', newRole, 'from:', oldRole)

    // Prepare update - only update role if user is NOT an Admin
    // CRITICAL: Ensure subscription_status is set correctly
    const updateData = {
      subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
      subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    }

    // Only update role if user is not an Admin
    if (oldRole !== 'Admin') {
      updateData.role = newRole
      console.log('Updating role from', oldRole, 'to', newRole)
    } else {
      console.log('⚠️ User is Admin - preserving Admin role, only updating subscription status')
    }

    // BULLETPROOF: Update with retry logic
    let updateResult = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)
        .select()

      if (error) {
        console.error(`❌ WEBHOOK handleSubscriptionUpdate: Update error (attempt ${attempt}/3):`, error)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 500))
          continue
        }
        throw error
      } else {
        updateResult = data
        console.log(`✅ WEBHOOK handleSubscriptionUpdate: Profile updated (attempt ${attempt}):`, updateResult)
        break
      }
    }
    
    if (!updateResult) {
      throw new Error('Failed to update profile in handleSubscriptionUpdate')
    }

    // Send email if role changed
    if (oldRole !== newRole && profile.email) {
      try {
        await sendEmailViaSupabase('role-change', {
          email: profile.email,
          userName: profile.full_name || 'there',
          oldRole: oldRole,
          newRole: newRole
        })
      } catch (emailError) {
        console.error('Error sending role change email:', emailError)
      }
    }
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Handling customer.subscription.deleted for subscription:', subscription.id)
  
  const customerId = subscription.customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    console.log('Subscription cancelled, downgrading to Free')
    
    const oldRole = profile.role
    const planName = oldRole === 'Teacher' ? 'Teacher Plan' : 'Student Plan'
    
    await supabase
      .from('profiles')
      .update({
        role: 'Free',
        subscription_status: 'cancelled',
        subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    // Send cancellation email
    if (profile.email) {
      try {
        await sendEmailViaSupabase('subscription-cancelled', {
          email: profile.email,
          userName: profile.full_name || 'there',
          planName: planName,
          cancellationDate: new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        })
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError)
      }
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Handling invoice.payment_succeeded for invoice:', invoice.id)
  
  const customerId = invoice.customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    console.log('Invoice payment succeeded, updating subscription status to active')
    
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Handling invoice.payment_failed for invoice:', invoice.id)
  
  const customerId = invoice.customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    console.log('Invoice payment failed, updating subscription status to past_due')
    
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
  }
}

async function handleInvoiceUpcoming(invoice) {
  console.log('Handling invoice.upcoming for invoice:', invoice.id)
  
  const customerId = invoice.customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, subscription_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile && profile.email && profile.subscription_id) {
    // Check if invoice is due in 3 days (approximately)
    const periodEnd = invoice.period_end * 1000 // Convert to milliseconds
    const now = Date.now()
    const daysUntilDue = Math.floor((periodEnd - now) / (1000 * 60 * 60 * 24))
    
    // Send reminder if due in 2-4 days (to account for timing variations)
    if (daysUntilDue >= 2 && daysUntilDue <= 4) {
      console.log(`Sending renewal reminder - ${daysUntilDue} days until renewal`)
      
      try {
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(profile.subscription_id)
        const priceId = subscription.items.data[0]?.price.id
        const role = getRoleFromPriceId(priceId)
        const planName = role === 'Teacher' ? 'Teacher Plan' : 'Student Plan'
        const amount = invoice.amount_due / 100
        const currency = invoice.currency?.toUpperCase() || 'USD'
        
        // Create customer portal session URL for cancellation
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${process.env.SITE_URL || 'https://humancatalystbeacon.com'}/dashboard`,
        })
        
        const renewalDate = new Date(periodEnd).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        
        await sendEmailViaSupabase('renewal-reminder', {
          email: profile.email,
          userName: profile.full_name || 'there',
          planName: planName,
          amount: amount,
          currency: currency,
          renewalDate: renewalDate,
          cancelUrl: portalSession.url
        })
      } catch (emailError) {
        console.error('Error sending renewal reminder email:', emailError)
      }
    }
  }
}

// ============================================================================
// SYSTEME.IO WEBHOOK INTEGRATION
// ============================================================================

// Middleware to verify Systeme.io webhook signature (if you set up webhook secret)
const verifySystemeWebhook = (req, res, next) => {
  // Systeme.io webhook verification
  // You can add signature verification here if Systeme.io provides it
  // For now, we'll trust requests from Systeme.io (you should add IP whitelist in production)
  const webhookSecret = process.env.SYSTEME_WEBHOOK_SECRET
  
  if (webhookSecret) {
    // Add signature verification logic here if Systeme.io provides it
    // const signature = req.headers['x-systeme-signature']
    // if (!verifySignature(req.body, signature, webhookSecret)) {
    //   return res.status(401).json({ error: 'Invalid signature' })
    // }
  }
  
  next()
}

// Create user in Supabase from Systeme.io signup
async function createUserFromSysteme(systemeData) {
  try {
    const { email, first_name, last_name, phone, affiliate_id, systeme_contact_id } = systemeData
    
    console.log('Creating user from Systeme.io:', { email, first_name, last_name })
    
    // Generate a random password (user will need to reset it)
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!'
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: randomPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
        systeme_contact_id: systeme_contact_id,
        affiliate_id: affiliate_id,
        source: 'systeme_io'
      }
    })
    
    if (authError) {
      // If user already exists, find them by email in profiles table
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        console.log('User already exists, fetching existing user:', email)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()
        
        if (existingProfile) {
          // Update profile with Systeme.io data
          await supabase
            .from('profiles')
            .update({
              systeme_contact_id: systeme_contact_id,
              affiliate_id: affiliate_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProfile.id)
          
          // Get the auth user
          const { data: authUsers } = await supabase.auth.admin.listUsers()
          const authUser = authUsers?.users?.find(u => u.email === email)
          
          return { user: authUser || { id: existingProfile.id, email }, isNew: false }
        }
      }
      throw authError
    }
    
    // Profile is automatically created by database trigger, but update it with Systeme.io data
    if (authData.user) {
      await supabase
        .from('profiles')
        .update({
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
          systeme_contact_id: systeme_contact_id,
          affiliate_id: affiliate_id,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)
      
      console.log('User created successfully from Systeme.io:', authData.user.id)
    }
    
    return { user: authData.user, isNew: true }
  } catch (error) {
    console.error('Error creating user from Systeme.io:', error)
    throw error
  }
}

// Systeme.io webhook: Contact created (signup)
app.post('/api/webhook/systeme/contact-created', verifySystemeWebhook, async (req, res) => {
  try {
    console.log('Systeme.io contact created webhook received:', req.body)
    
    const { email, first_name, last_name, phone, contact_id, affiliate_id } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    
    // Create user in Supabase
    const { user, isNew } = await createUserFromSysteme({
      email,
      first_name,
      last_name,
      phone,
      affiliate_id,
      systeme_contact_id: contact_id
    })
    
    res.json({ 
      success: true, 
      userId: user.id,
      isNew,
      message: isNew ? 'User created successfully' : 'User already exists, updated with Systeme.io data'
    })
  } catch (error) {
    console.error('Error handling Systeme.io contact created:', error)
    res.status(500).json({ error: error.message })
  }
})

// Systeme.io webhook: Purchase completed (payment)
app.post('/api/webhook/systeme/purchase-completed', verifySystemeWebhook, async (req, res) => {
  try {
    console.log('Systeme.io purchase completed webhook received:', req.body)
    
    const { 
      email, 
      contact_id, 
      order_id, 
      amount, 
      currency, 
      product_name, 
      affiliate_id,
      purchase_date 
    } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    
    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .single()
    
    if (!profile) {
      console.log('User not found for purchase, creating user:', email)
      // Create user if they don't exist
      const { user } = await createUserFromSysteme({
        email,
        affiliate_id,
        systeme_contact_id: contact_id
      })
      
      if (user) {
        // Update with purchase info
        await supabase
          .from('profiles')
          .update({
            role: 'Student', // Upgrade to Student on purchase
            subscription_status: 'active',
            systeme_order_id: order_id,
            systeme_purchase_amount: amount,
            systeme_purchase_currency: currency,
            systeme_product_name: product_name,
            affiliate_id: affiliate_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        // Create payment record
        await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            systeme_order_id: order_id,
            amount: amount,
            currency: currency,
            product_name: product_name,
            affiliate_id: affiliate_id,
            status: 'completed',
            payment_date: purchase_date || new Date().toISOString()
          })
          .catch(err => console.log('Payments table might not exist:', err))
        
        return res.json({ 
          success: true, 
          userId: user.id,
          message: 'User created and upgraded to Student'
        })
      }
    } else {
      // Update existing user
      await supabase
        .from('profiles')
        .update({
          role: 'Student', // Upgrade to Student on purchase
          subscription_status: 'active',
          systeme_order_id: order_id,
          systeme_purchase_amount: amount,
          systeme_purchase_currency: currency,
          systeme_product_name: product_name,
          affiliate_id: affiliate_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
      
      // Create payment record
      await supabase
        .from('payments')
        .insert({
          user_id: profile.id,
          systeme_order_id: order_id,
          amount: amount,
          currency: currency,
          product_name: product_name,
          affiliate_id: affiliate_id,
          status: 'completed',
          payment_date: purchase_date || new Date().toISOString()
        })
        .catch(err => console.log('Payments table might not exist:', err))
      
      return res.json({ 
        success: true, 
        userId: profile.id,
        message: 'User upgraded to Student'
      })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error handling Systeme.io purchase completed:', error)
    res.status(500).json({ error: error.message })
  }
})

// Systeme.io webhook: Affiliate tracking
app.post('/api/webhook/systeme/affiliate-tracking', verifySystemeWebhook, async (req, res) => {
  try {
    console.log('Systeme.io affiliate tracking webhook received:', req.body)
    
    const { email, contact_id, affiliate_id, affiliate_name, commission_amount } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    
    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    if (profile) {
      // Update affiliate information
      await supabase
        .from('profiles')
        .update({
          affiliate_id: affiliate_id,
          affiliate_name: affiliate_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
      
      // Create affiliate commission record (if table exists)
      await supabase
        .from('affiliate_commissions')
        .insert({
          user_id: profile.id,
          affiliate_id: affiliate_id,
          affiliate_name: affiliate_name,
          commission_amount: commission_amount,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .catch(err => console.log('Affiliate commissions table might not exist:', err))
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error handling Systeme.io affiliate tracking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Generic Systeme.io webhook handler (for any other events)
app.post('/api/webhook/systeme', verifySystemeWebhook, async (req, res) => {
  try {
    console.log('Systeme.io webhook received:', {
      event: req.body.event || req.body.type,
      data: req.body
    })
    
    // Handle different event types
    const eventType = req.body.event || req.body.type
    
    switch (eventType) {
      case 'contact.created':
      case 'contact_created':
        // Handle contact created
        return res.redirect(307, '/api/webhook/systeme/contact-created')
      
      case 'purchase.completed':
      case 'purchase_completed':
        // Handle purchase completed
        return res.redirect(307, '/api/webhook/systeme/purchase-completed')
      
      case 'affiliate.tracking':
      case 'affiliate_tracking':
        // Handle affiliate tracking
        return res.redirect(307, '/api/webhook/systeme/affiliate-tracking')
      
      default:
        console.log('Unhandled Systeme.io event type:', eventType)
        res.json({ received: true, event: eventType })
    }
  } catch (error) {
    console.error('Error handling Systeme.io webhook:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================================================
// EMAIL API ENDPOINTS (Proxy to Supabase Edge Functions)
// ============================================================================

// Send sign-in confirmation email
app.post('/api/email/sign-in-confirmation', generalLimiter, async (req, res) => {
  try {
    const { email, userName, loginTime, ipAddress } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    
    const result = await sendEmailViaSupabase('sign-in', {
      email,
      userName: userName || 'there',
      loginTime: loginTime || new Date().toLocaleString(),
      ipAddress
    })
    
    if (result.success) {
      res.json({ success: true, message: 'Sign-in confirmation email sent' })
    } else {
      res.status(500).json({ error: result.error || 'Failed to send email' })
    }
  } catch (error) {
    console.error('Error in sign-in confirmation endpoint:', error)
    res.status(500).json({ error: error.message })
  }
})

// Send lesson completion email
app.post('/api/email/lesson-completion', generalLimiter, async (req, res) => {
  try {
    const { email, userName, lessonTitle, courseName, xpEarned, totalXP } = req.body
    
    if (!email || !lessonTitle) {
      return res.status(400).json({ error: 'Email and lessonTitle are required' })
    }
    
    const result = await sendEmailViaSupabase('lesson-completion', {
      email,
      userName: userName || 'there',
      lessonTitle,
      courseName: courseName || 'Course',
      xpEarned: xpEarned || 0,
      totalXP: totalXP || 0
    })
    
    if (result.success) {
      res.json({ success: true, message: 'Lesson completion email sent' })
    } else {
      res.status(500).json({ error: result.error || 'Failed to send email' })
    }
  } catch (error) {
    console.error('Error in lesson completion endpoint:', error)
    res.status(500).json({ error: error.message })
  }
})

// Send new lessons available email
app.post('/api/email/new-lessons', generalLimiter, async (req, res) => {
  try {
    const { email, userName, newLessons } = req.body
    
    if (!email || !newLessons || !Array.isArray(newLessons)) {
      return res.status(400).json({ error: 'Email and newLessons array are required' })
    }
    
    const result = await sendEmailViaSupabase('new-lessons', {
      email,
      userName: userName || 'there',
      newLessons
    })
    
    if (result.success) {
      res.json({ success: true, message: 'New lessons email sent' })
    } else {
      res.status(500).json({ error: result.error || 'Failed to send email' })
    }
  } catch (error) {
    console.error('Error in new lessons endpoint:', error)
    res.status(500).json({ error: error.message })
  }
})

// Send app update/announcement email
app.post('/api/email/app-update', generalLimiter, async (req, res) => {
  try {
    const { email, userName, title, message, ctaText, ctaUrl } = req.body
    
    if (!email || !title || !message) {
      return res.status(400).json({ error: 'Email, title, and message are required' })
    }
    
    const result = await sendEmailViaSupabase('app-update', {
      email,
      userName: userName || 'there',
      title,
      message,
      ctaText,
      ctaUrl
    })
    
    if (result.success) {
      res.json({ success: true, message: 'App update email sent' })
    } else {
      res.status(500).json({ error: result.error || 'Failed to send email' })
    }
  } catch (error) {
    console.error('Error in app update endpoint:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================================================
// STATIC FILE SERVING FOR REACT APP
// ============================================================================

// Serve static files from the React app build directory
const buildPath = path.join(__dirname, 'build')

// Check if build directory exists
if (!fs.existsSync(buildPath)) {
  console.error(`⚠️  WARNING: Build directory not found at ${buildPath}`)
  console.error('   Please run "npm run build" to create the production build')
} else {
  console.log(`✅ Serving React app from: ${buildPath}`)
  
  // Check if index.html exists
  const indexPath = path.join(buildPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    console.log(`✅ Found index.html at: ${indexPath}`)
  } else {
    console.error(`⚠️  WARNING: index.html not found at ${indexPath}`)
  }
}

// Serve static files (CSS, JS, images, etc.) - this must come before catch-all
app.use(express.static(buildPath, {
  // Don't serve index.html for static file requests
  index: false
}))

// Catch-all handler: send back React's index.html file for any non-API routes
// This is necessary for React Router to work properly in production
// IMPORTANT: This must be LAST, after all API routes and static file serving
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next()
  }
  
  // Skip static file requests (already handled by express.static)
  if (req.path.startsWith('/static/') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|map|webp)$/)) {
    return next()
  }
  
  // Serve index.html for all other routes (React Router will handle routing)
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err)
      res.status(500).send('Error loading application')
    }
  })
})

// Listen on all interfaces (0.0.0.0) to be accessible via reverse proxy
// This is required for production deployments behind nginx/apache
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Server listening on 0.0.0.0:${PORT} (accessible from all interfaces)`)
  console.log(`Serving React app from: ${buildPath}`)
})