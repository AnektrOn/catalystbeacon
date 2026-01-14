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
        
        
        if (session.mode === 'subscription' && session.subscription) {
          
          // SIMPLE: Use the sync function we created - it handles everything!
          // This function reads from stripe.subscriptions (FDW) and updates both subscriptions and profiles tables
          const { data: syncResult, error: syncError } = await supabaseClient.rpc(
            'sync_single_subscription_from_stripe',
            { p_stripe_subscription_id: session.subscription as string }
          )

          if (syncError) {
            
            // Fallback: Try manual update if sync function fails
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
            const customerId = session.customer as string
            let userId = session.metadata?.userId

            // Find user by customer ID if userId not in metadata
            if (!userId) {
              const { data: profileByCustomer } = await supabaseClient
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single()
              if (profileByCustomer) {
                userId = profileByCustomer.id
              } else {
              }
            }

            if (userId) {
              // Determine role from price or metadata
              const priceId = subscription.items.data[0]?.price.id
              const planType = session.metadata?.planType || subscription.metadata?.planType
              
              let newRole = 'Student' // Default for student plans
              
              // Priority: metadata planType > price ID
              if (planType === 'teacher' || planType === 'Teacher') {
                newRole = 'Teacher'
              } else if (planType === 'student' || planType === 'Student') {
                newRole = 'Student'
              } else if (priceId === 'price_1SBPN62MKT6HumxnBoQgAdd0') {
                newRole = 'Teacher'
              } else {
                // Default to Student for any subscription (student price IDs or unknown)
                newRole = 'Student'
              }

              // Get current role
              const { data: currentProfile } = await supabaseClient
                .from('profiles')
                .select('role, subscription_status, subscription_id')
                .eq('id', userId)
                .single()

              const currentRole = currentProfile?.role || 'Free'

              // Update profile - ALWAYS update subscription fields, role only if not Admin
              const updateData: any = {
                subscription_status: 'active',
                subscription_id: subscription.id,
                stripe_customer_id: customerId,
              }

              if (currentRole !== 'Admin') {
                updateData.role = newRole
              } else {
              }

              // BULLETPROOF: Update profile with retry logic
              let updateResult = null
              let updateError = null
              
              
              for (let attempt = 1; attempt <= 3; attempt++) {
                
                const { data, error } = await supabaseClient
                  .from('profiles')
                  .update(updateData)
                  .eq('id', userId)
                  .select('role, subscription_status, subscription_id')

                if (error) {
                  updateError = error
                  
                  if (attempt < 3) {
                    // Wait before retry (exponential backoff)
                    const delay = attempt * 500 // 500ms, 1000ms
                    await new Promise(resolve => setTimeout(resolve, delay))
                  }
                } else {
                  updateResult = data
                  updateError = null
                  break
                }
              }

              if (updateError) {
              } else if (updateResult && updateResult.length > 0) {
                const updated = updateResult[0]
              }

              // Update subscriptions table with retry logic
              let subUpdateSuccess = false
              for (let attempt = 1; attempt <= 3; attempt++) {
                const { error: subError } = await supabaseClient
                  .from('subscriptions')
                  .upsert({
                    user_id: userId,
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
                  if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, attempt * 500))
                  }
                } else {
                  subUpdateSuccess = true
                  break
                }
              }
              
              if (!subUpdateSuccess) {
              }
            } else {
            }
          } else {
            if (syncResult && syncResult.length > 0) {
              const result = syncResult[0]
              
              // Verify the role was updated correctly
              const userId = session.metadata?.userId
              if (userId) {
                const { data: verifyProfile } = await supabaseClient
                  .from('profiles')
                  .select('role, subscription_status, subscription_id')
                  .eq('id', userId)
                  .single()
                
                if (verifyProfile) {
                  
                  // If role is still Free and user is not Admin, we need to update it
                  if (verifyProfile.role === 'Free' || verifyProfile.role === null) {
                    const planType = session.metadata?.planType || 'student'
                    const newRole = (planType === 'teacher' || planType === 'Teacher') ? 'Teacher' : 'Student'
                    
                    const { error: fixError } = await supabaseClient
                      .from('profiles')
                      .update({ role: newRole })
                      .eq('id', userId)
                    
                    if (fixError) {
                    } else {
                    }
                  }
                }
              }
            }
          }
        } else {
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // AUTOMATIQUE: La fonction sync crée automatiquement les utilisateurs manquants
        const { data: syncResult, error: syncError } = await supabaseClient.rpc(
          'sync_single_subscription_from_stripe',
          { p_stripe_subscription_id: subscription.id }
        )

        if (syncError) {
          
          // Fallback to manual update
          const customerId = subscription.customer as string
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            // Determine role from price or subscription metadata
            const priceId = subscription.items.data[0]?.price.id
            const planType = subscription.metadata?.planType
            
            let newRole = 'Student' // Default
            
            if (planType === 'teacher' || planType === 'Teacher') {
              newRole = 'Teacher'
            } else if (planType === 'student' || planType === 'Student') {
              newRole = 'Student'
            } else if (priceId === 'price_1SBPN62MKT6HumxnBoQgAdd0') {
              newRole = 'Teacher'
            } else {
              newRole = 'Student'
            }

            // Get current role to preserve Admin
            const { data: currentProfile } = await supabaseClient
              .from('profiles')
              .select('role, subscription_status')
              .eq('id', profile.id)
              .single()

            const currentRole = currentProfile?.role || 'Free'
            
            // Update subscriptions table with retry logic
            let subUpdateSuccess = false
            for (let attempt = 1; attempt <= 3; attempt++) {
              const { error: subError } = await supabaseClient
                .from('subscriptions')
                .update({
                  status: subscription.status,
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                })
                .eq('stripe_subscription_id', subscription.id)

              if (subError) {
                if (attempt < 3) {
                  await new Promise(resolve => setTimeout(resolve, attempt * 500))
                }
              } else {
                subUpdateSuccess = true
                break
              }
            }
            
            if (!subUpdateSuccess) {
            }

            // Update profile - include role update if not Admin
            const updateData: any = {
              subscription_status: subscription.status,
            }

            if (currentRole !== 'Admin') {
              updateData.role = newRole
            } else {
            }

            // BULLETPROOF: Update profile with retry logic
            let updateResult = null
            let updateError = null
            
            
            for (let attempt = 1; attempt <= 3; attempt++) {
              
              const { data, error } = await supabaseClient
                .from('profiles')
                .update(updateData)
                .eq('id', profile.id)
                .select('role, subscription_status')

              if (error) {
                updateError = error
                
                if (attempt < 3) {
                  const delay = attempt * 500
                  await new Promise(resolve => setTimeout(resolve, delay))
                }
              } else {
                updateResult = data
                updateError = null
                break
              }
            }

            if (updateError) {
            } else if (updateResult && updateResult.length > 0) {
              const updated = updateResult[0]
            }
          } else {
          }
        } else {
          
          // Verify the role was updated correctly
          const customerId = subscription.customer as string
          const { data: verifyProfile } = await supabaseClient
            .from('profiles')
            .select('id, role, subscription_status')
            .eq('stripe_customer_id', customerId)
            .single()
          
          if (verifyProfile) {
            
            // If role is still Free/null and user is not Admin, update it
            if ((verifyProfile.role === 'Free' || verifyProfile.role === null) && verifyProfile.role !== 'Admin') {
              const planType = subscription.metadata?.planType || 'student'
              const priceId = subscription.items.data[0]?.price.id
              const newRole = (planType === 'teacher' || planType === 'Teacher' || priceId === 'price_1SBPN62MKT6HumxnBoQgAdd0') 
                ? 'Teacher' 
                : 'Student'
              
              const { error: fixError } = await supabaseClient
                .from('profiles')
                .update({ role: newRole })
                .eq('id', verifyProfile.id)
              
              if (fixError) {
              } else {
              }
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string


        // Get user by customer ID
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id, role, subscription_status')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          
          // Update subscription status with retry logic
          let subUpdateSuccess = false
          for (let attempt = 1; attempt <= 3; attempt++) {
            const { error: subError } = await supabaseClient
              .from('subscriptions')
              .update({
                status: 'cancelled',
              })
              .eq('stripe_subscription_id', subscription.id)

            if (subError) {
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, attempt * 500))
              }
            } else {
              subUpdateSuccess = true
              break
            }
          }
          
          if (!subUpdateSuccess) {
          }

          const currentRole = profile.role || 'Free'
          
          // Prepare update - only downgrade role if user is NOT an Admin
          const updateData: any = {
            subscription_status: 'cancelled',
            subscription_id: null,
          }

          // Only downgrade to Free if user is not an Admin
          if (currentRole !== 'Admin') {
            updateData.role = 'Free'
          } else {
          }

          // BULLETPROOF: Update profile with retry logic
          let updateResult = null
          let updateError = null
          
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            
            const { data, error } = await supabaseClient
              .from('profiles')
              .update(updateData)
              .eq('id', profile.id)
              .select('role, subscription_status')

            if (error) {
              updateError = error
              
              if (attempt < 3) {
                const delay = attempt * 500
                await new Promise(resolve => setTimeout(resolve, delay))
              }
            } else {
              updateResult = data
              updateError = null
              break
            }
          }

          if (updateError) {
          } else if (updateResult && updateResult.length > 0) {
            const updated = updateResult[0]
          }
        } else {
        }
        break
      }

      default:
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
