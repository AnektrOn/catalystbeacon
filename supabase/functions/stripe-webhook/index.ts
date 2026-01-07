import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing signature or webhook secret' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const customerId = session.customer as string
          const userId = session.metadata?.userId
          const planType = session.metadata?.planType

          if (!userId) {
            console.error('No userId in session metadata')
            break
          }

          // Determine role based on plan type
          let newRole = 'Student' // default
          if (planType === 'teacher') {
            newRole = 'Teacher'
          }

          // Get current user profile to check if they're an Admin
          const { data: currentProfile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

          const currentRole = currentProfile?.role || 'Free'
          console.log('Current user role:', currentRole, 'New role would be:', newRole)

          // Prepare update object - only update role if user is NOT an Admin
          const updateData: any = {
            subscription_status: 'active',
            subscription_id: subscription.id,
          }

          // Only update role if user is not an Admin (preserve Admin role)
          if (currentRole !== 'Admin') {
            updateData.role = newRole
            console.log('Updating role from', currentRole, 'to', newRole)
          } else {
            console.log('⚠️ User is Admin - preserving Admin role, only updating subscription info')
          }

          // Update profile with subscription info (and role only if not Admin)
          await supabaseClient
            .from('profiles')
            .update(updateData)
            .eq('id', userId)

          // Create subscription record
          await supabaseClient
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              plan_type: subscription.items.data[0]?.price.recurring?.interval || 'monthly',
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by customer ID
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          // Update subscription status
          await supabaseClient
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

          // Update profile status
          await supabaseClient
            .from('profiles')
            .update({
              subscription_status: subscription.status,
            })
            .eq('id', profile.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by customer ID
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          // Update subscription status
          await supabaseClient
            .from('subscriptions')
            .update({
              status: 'cancelled',
            })
            .eq('stripe_subscription_id', subscription.id)

          // Get current role to check if user is Admin
          const { data: currentProfile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', profile.id)
            .single()

          const currentRole = currentProfile?.role || 'Free'
          
          // Prepare update - only downgrade role if user is NOT an Admin
          const updateData: any = {
            subscription_status: 'cancelled',
            subscription_id: null,
          }

          // Only downgrade to Free if user is not an Admin
          if (currentRole !== 'Admin') {
            updateData.role = 'Free'
            console.log('Downgrading role from', currentRole, 'to Free')
          } else {
            console.log('⚠️ User is Admin - preserving Admin role, only updating subscription status')
          }

          // Update profile
          await supabaseClient
            .from('profiles')
            .update(updateData)
            .eq('id', profile.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
