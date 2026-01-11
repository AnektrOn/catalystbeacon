import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    
    // Get authenticated user from token
    const authHeader = req.headers.get('Authorization')
    let authenticatedUserId = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await createClient(supabaseUrl, supabaseServiceRoleKey).auth.getUser(token)
      if (!authError && user) {
        authenticatedUserId = user.id
      }
    }
    
    const body = await req.json()
    const { session_id, user_id } = body
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Security: Verify user_id matches authenticated user
    if (authenticatedUserId && authenticatedUserId !== user_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: user_id does not match authenticated user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔄 Processing role update from session:', { session_id, user_id })

    // Récupérer le checkout session depuis Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)
    
    if (!session.subscription) {
      return new Response(
        JSON.stringify({ error: 'No subscription found in checkout session' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer la subscription pour obtenir les détails
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    
    // Déterminer le rôle depuis metadata ou price ID
    const planType = session.metadata?.planType || subscription.metadata?.planType
    const priceId = subscription.items.data[0]?.price.id
    
    let newRole = 'Student' // Default
    
    if (planType === 'teacher' || planType === 'Teacher') {
      newRole = 'Teacher'
    } else if (planType === 'student' || planType === 'Student') {
      newRole = 'Student'
    } else if (priceId === 'price_1SBPN62MKT6HumxnBoQgAdd0') {
      newRole = 'Teacher'
    }
    
    console.log('📝 Determined role:', newRole, 'from planType:', planType, 'priceId:', priceId)

    // Vérifier le rôle actuel pour préserver Admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role, subscription_status')
      .eq('id', user_id)
      .single()

    if (!currentProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentRole = currentProfile.role || 'Free'
    console.log('📊 Current role:', currentRole)

    // Préparer les données de mise à jour
    const updateData: any = {
      subscription_status: 'active',
      subscription_id: subscription.id,
      stripe_customer_id: session.customer as string,
    }

    // Ne mettre à jour le rôle que si l'utilisateur n'est pas Admin
    if (currentRole !== 'Admin') {
      updateData.role = newRole
      console.log(`✅ Will update role from "${currentRole}" to "${newRole}"`)
    } else {
      console.log('⚠️ User is Admin - preserving Admin role')
    }

    // Mettre à jour le profil avec retry
    let updateSuccess = false
    let lastError = null
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`🔄 Update attempt ${attempt}/3`)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user_id)
        .select('role, subscription_status, subscription_id')

      if (error) {
        lastError = error
        console.error(`❌ Attempt ${attempt} failed:`, error.message)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 500))
        }
      } else {
        console.log(`✅ Profile updated successfully on attempt ${attempt}:`, data)
        updateSuccess = true
        break
      }
    }

    if (!updateSuccess) {
      console.error('❌ Failed to update profile after 3 attempts:', lastError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update profile',
          details: lastError?.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mettre à jour la table subscriptions
    const customerId = session.customer as string
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user_id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_type: subscription.items.data[0]?.price.recurring?.interval || 'monthly',
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }, {
        onConflict: 'stripe_subscription_id'
      })

    if (subError) {
      console.error('⚠️ Error updating subscriptions table:', subError)
    } else {
      console.log('✅ Subscription record updated')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        role: updateData.role || currentRole,
        subscription_id: subscription.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
