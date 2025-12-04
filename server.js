const express = require('express')
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 3001

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
  try {
    const { priceId, userId, userEmail } = req.body

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
      success_url: `http://localhost:3000/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/pricing?payment=cancelled`,
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
    let role = 'Free'
    const priceId = subscription.items.data[0].price.id
    if (priceId === 'price_1RutXI2MKT6Humxnh0WBkhCp') {
      role = 'Student'
    } else if (priceId === 'price_1SBPN62MKT6HumxnBoQgAdd0') {
      role = 'Teacher'
    }

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
    let role = 'Student' // default
    
    // Determine role based on price ID
    if (priceId === 'price_1SBPN62MKT6HumxnBoQgAdd0') {
      role = 'Teacher'
    }

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
    let role = 'Student' // default
    
    // Determine role based on price ID
    if (priceId === 'price_1SBPN62MKT6HumxnBoQgAdd0') {
      role = 'Teacher'
    }

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})