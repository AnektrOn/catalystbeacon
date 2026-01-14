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
    // Validate required environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const siteUrl = Deno.env.get('SITE_URL')

    if (!stripeSecretKey || stripeSecretKey === '') {
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: STRIPE_SECRET_KEY is not set',
          details: 'Please configure STRIPE_SECRET_KEY in Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!supabaseUrl || supabaseUrl === '') {
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: SUPABASE_URL is not set',
          details: 'Please configure SUPABASE_URL in Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!supabaseServiceRoleKey || supabaseServiceRoleKey === '') {
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set',
          details: 'Please configure SUPABASE_SERVICE_ROLE_KEY in Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!supabaseAnonKey || supabaseAnonKey === '') {
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: SUPABASE_ANON_KEY is not set',
          details: 'Please configure SUPABASE_ANON_KEY in Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!siteUrl || siteUrl === '') {
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: SITE_URL is not set',
          details: 'Please configure SITE_URL in Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role for admin operations
    const supabaseServiceClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    )

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize client with user's token for auth operations
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the user from the request
    let user
    try {
      const {
        data: { user: authUser },
        error: userError
      } = await supabaseClient.auth.getUser()
      
      if (userError || !authUser) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Invalid or expired token' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      user = authUser
    } catch (authError) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body with error handling
    let priceId, planType
    try {
      const body = await req.json()
      priceId = body.priceId
      planType = body.planType
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: 'Request body must be valid JSON with priceId and planType'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!priceId || !planType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: priceId, planType' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create or retrieve Stripe customer
    let customerId = null
    
    try {
      // Check if user already has a customer ID in their profile (use service client for admin access)
      const { data: profile, error: profileError } = await supabaseServiceClient
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        throw new Error(`Failed to fetch user profile: ${profileError.message}`)
      }

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        })
        customerId = customer.id

        // Update profile with customer ID (use service client)
        const { error: updateError } = await supabaseServiceClient
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)

        if (updateError) {
          // Don't throw - we can still proceed with checkout
        } else {
        }
      }
    } catch (customerError) {
      throw customerError
    }

    // Create checkout session
    
    let session
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${siteUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/pricing?payment=cancelled`,
        metadata: {
          userId: user.id,
          planType: planType,
        },
      })
    } catch (stripeError) {
      throw stripeError
    }


    // Return response in format expected by PricingPage (both id and sessionId for compatibility)
    return new Response(
      JSON.stringify({ 
        id: session.id,
        sessionId: session.id, 
        url: session.url 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    // Enhanced error logging
    })
    
    // Return detailed error for debugging (but don't expose sensitive info)
    const errorMessage = error?.message || 'Unknown error occurred'
    const isStripeError = error?.type && error.type.startsWith('Stripe')
    
    // Log the full error response that will be sent
    const errorResponse = {
      error: isStripeError ? `Stripe error: ${errorMessage}` : errorMessage,
      type: error?.type || 'UnknownError',
      code: error?.code || undefined,
      // Only include stack in development
      details: Deno.env.get('ENVIRONMENT') === 'development' ? error?.stack : undefined
    }
    
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
