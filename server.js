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

const app = express()
const PORT = process.env.PORT || 3001

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
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Rate limiting middleware
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
app.use(cors())
app.use(express.json())

// Apply general rate limiting to all routes
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

// Create checkout session
app.post('/api/create-checkout-session', paymentLimiter, async (req, res) => {
  console.log('=== CREATE CHECKOUT SESSION REQUEST ===')
  console.log('Body:', req.body)
  console.log('Origin:', req.headers.origin)
  
  try {
    const { priceId, userId, userEmail } = req.body
    
    if (!priceId || !userId || !userEmail) {
      console.error('Missing required fields:', { priceId: !!priceId, userId: !!userId, userEmail: !!userEmail })
      return res.status(400).json({ error: 'Missing required fields: priceId, userId, and userEmail are required' })
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

    res.json({ id: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: error.message })
  }
})

// Handle successful payment
app.get('/api/payment-success', paymentLimiter, async (req, res) => {
  try {
    const { session_id } = req.query
    console.log('=== PAYMENT SUCCESS ENDPOINT CALLED ===')
    console.log('Session ID:', session_id)

    const session = await stripe.checkout.sessions.retrieve(session_id)
    console.log('Stripe session retrieved:', {
      id: session.id,
      userId: session.metadata?.userId,
      planType: session.metadata?.planType,
      subscriptionId: session.subscription
    })

    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    console.log('Stripe subscription retrieved:', {
      id: subscription.id,
      priceId: subscription.items.data[0].price.id,
      status: subscription.status
    })

    // Determine role based on price
    const priceId = subscription.items.data[0].price.id
    const role = getRoleFromPriceId(priceId)

    console.log('Determined role:', role, 'for price ID:', priceId)

    // Update user profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: role,
        subscription_status: 'active',
        subscription_id: subscription.id,
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.metadata.userId)

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    console.log('Profile updated successfully:', data)
    console.log('=== PAYMENT SUCCESS COMPLETE ===')

    res.json({ success: true, role })
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
  console.log('Handling checkout.session.completed for session:', session.id)
  
  if (session.mode === 'subscription') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    const customerId = session.customer
    const userId = session.metadata?.userId
    const planType = session.metadata?.planType

    console.log('Subscription checkout completed:', {
      userId,
      planType,
      customerId,
      subscriptionId: subscription.id
    })

    if (!userId) {
      console.error('No userId in session metadata')
      return
    }

    // Determine role based on plan type from metadata
    let role = 'Student' // default
    if (planType === 'teacher' || planType === 'Teacher') {
      role = 'Teacher'
    }

    console.log('Updating profile with role:', role)

    // Update profile with role and subscription info
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: role,
        subscription_status: subscription.status,
        subscription_id: subscription.id,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error)
    } else {
      console.log('Profile updated successfully:', data)
    }

    // Create or update subscription record
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_type: subscription.items.data[0]?.price.recurring?.interval || 'monthly',
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
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
    const priceId = subscription.items.data[0]?.price.id
    const role = getRoleFromPriceId(priceId)

    console.log('Subscription created, updating role to:', role)

    await supabase
      .from('profiles')
      .update({
        role: role,
        subscription_status: subscription.status,
        subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
  }
}

async function handleSubscriptionUpdate(subscription) {
  console.log('Handling customer.subscription.updated for subscription:', subscription.id)
  
  const customerId = subscription.customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    // Get the price ID to determine if role should change
    const priceId = subscription.items.data[0]?.price.id
    const role = getRoleFromPriceId(priceId)

    console.log('Subscription updated, setting role to:', role)

    await supabase
      .from('profiles')
      .update({
        role: role,
        subscription_status: subscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Handling customer.subscription.deleted for subscription:', subscription.id)
  
  const customerId = subscription.customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    console.log('Subscription cancelled, downgrading to Free')
    
    await supabase
      .from('profiles')
      .update({
        role: 'Free',
        subscription_status: 'cancelled',
        subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
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
// Use app.use() instead of app.get('*') for Express 5 compatibility
app.use((req, res, next) => {
  // Only handle GET requests for serving HTML
  if (req.method !== 'GET') {
    return next()
  }
  
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next()
  }
  
  // Skip requests for static files (they should have been handled by express.static)
  if (req.path.startsWith('/static/') || 
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next()
  }
  
  // Serve index.html for all other GET routes (React Router will handle routing)
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err)
      res.status(500).send('Error loading application')
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Serving React app from: ${buildPath}`)
})