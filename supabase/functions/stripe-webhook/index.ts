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
    console.log('📥 Webhook event received:', event.type)
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('🔄 Processing checkout.session.completed:', {
          sessionId: session.id,
          mode: session.mode,
          subscriptionId: session.subscription,
          customerId: session.customer,
          userId: session.metadata?.userId
        })
        
        if (session.mode === 'subscription' && session.subscription) {
          console.log('✅ Subscription checkout detected, syncing via FDW function...')
          
          // SIMPLE: Use the sync function we created - it handles everything!
          // This function reads from stripe.subscriptions (FDW) and updates both subscriptions and profiles tables
          const { data: syncResult, error: syncError } = await supabaseClient.rpc(
            'sync_single_subscription_from_stripe',
            { p_stripe_subscription_id: session.subscription as string }
          )

          if (syncError) {
            console.error('❌ Error syncing subscription via FDW function:', syncError)
            console.error('Error details:', {
              message: syncError.message,
              code: syncError.code,
              details: syncError.details,
              hint: syncError.hint
            })
            
            // Fallback: Try manual update if sync function fails
            console.log('⚠️ Falling back to manual update...')
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
            const customerId = session.customer as string
            let userId = session.metadata?.userId

            // Find user by customer ID if userId not in metadata
            if (!userId) {
              console.log('⚠️ No userId in metadata, searching by customer ID:', customerId)
              const { data: profileByCustomer } = await supabaseClient
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single()
              if (profileByCustomer) {
                userId = profileByCustomer.id
                console.log('✅ Found user by customer ID:', userId)
              } else {
                console.error('❌ Could not find user by customer ID')
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
                console.log('📝 Role determined from metadata planType: Teacher')
              } else if (planType === 'student' || planType === 'Student') {
                newRole = 'Student'
                console.log('📝 Role determined from metadata planType: Student')
              } else if (priceId === 'price_1SBPN62MKT6HumxnBoQgAdd0') {
                newRole = 'Teacher'
                console.log('📝 Role determined from price ID: Teacher')
              } else {
                // Default to Student for any subscription (student price IDs or unknown)
                newRole = 'Student'
                console.log('📝 Role defaulting to Student (planType:', planType, ', priceId:', priceId, ')')
              }

              // Get current role
              const { data: currentProfile } = await supabaseClient
                .from('profiles')
                .select('role, subscription_status, subscription_id')
                .eq('id', userId)
                .single()

              const currentRole = currentProfile?.role || 'Free'
              console.log('📊 Current profile state:', {
                role: currentRole,
                subscription_status: currentProfile?.subscription_status,
                subscription_id: currentProfile?.subscription_id
              })
              console.log('🔄 Will update to:', {
                role: newRole,
                subscription_status: 'active',
                subscription_id: subscription.id
              })

              // Update profile - ALWAYS update subscription fields, role only if not Admin
              const updateData: any = {
                subscription_status: 'active',
                subscription_id: subscription.id,
                stripe_customer_id: customerId,
              }

              if (currentRole !== 'Admin') {
                updateData.role = newRole
                console.log(`✅ Will update role from "${currentRole}" to "${newRole}"`)
              } else {
                console.log('⚠️ User is Admin - preserving Admin role, only updating subscription fields')
              }

              // BULLETPROOF: Update profile with retry logic
              let updateResult = null
              let updateError = null
              
              console.log('🔄 Attempting to update profile with data:', updateData)
              
              for (let attempt = 1; attempt <= 3; attempt++) {
                console.log(`🔄 Database update attempt ${attempt}/3 for userId: ${userId}`)
                
                const { data, error } = await supabaseClient
                  .from('profiles')
                  .update(updateData)
                  .eq('id', userId)
                  .select('role, subscription_status, subscription_id')

                if (error) {
                  updateError = error
                  console.error(`❌ Attempt ${attempt} failed:`, error.message)
                  
                  if (attempt < 3) {
                    // Wait before retry (exponential backoff)
                    const delay = attempt * 500 // 500ms, 1000ms
                    console.log(`⏳ Waiting ${delay}ms before retry...`)
                    await new Promise(resolve => setTimeout(resolve, delay))
                  }
                } else {
                  updateResult = data
                  updateError = null
                  console.log(`✅ Profile updated successfully on attempt ${attempt} (fallback):`, data)
                  break
                }
              }

              if (updateError) {
                console.error('❌ Error updating profile after 3 attempts:', updateError)
                console.error('Error details:', {
                  message: updateError.message,
                  code: updateError.code,
                  details: updateError.details,
                  hint: updateError.hint
                })
              } else if (updateResult && updateResult.length > 0) {
                const updated = updateResult[0]
                console.log('✅ Profile update confirmed:', {
                  role: updated.role,
                  subscription_status: updated.subscription_status,
                  subscription_id: updated.subscription_id
                })
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
                  console.error(`❌ Error updating subscriptions table (attempt ${attempt}):`, subError)
                  if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, attempt * 500))
                  }
                } else {
                  console.log(`✅ Subscription record updated successfully on attempt ${attempt} (fallback)`)
                  subUpdateSuccess = true
                  break
                }
              }
              
              if (!subUpdateSuccess) {
                console.error('❌ Failed to update subscriptions table after 3 attempts')
              }
            } else {
              console.error('❌ Cannot update: userId not found')
            }
          } else {
            console.log('✅ Subscription synced successfully via FDW function:', syncResult)
            if (syncResult && syncResult.length > 0) {
              const result = syncResult[0]
              console.log('Sync result:', {
                success: result.success,
                message: result.message,
                subscription_id: result.subscription_id
              })
              
              // Verify the role was updated correctly
              const userId = session.metadata?.userId
              if (userId) {
                const { data: verifyProfile } = await supabaseClient
                  .from('profiles')
                  .select('role, subscription_status, subscription_id')
                  .eq('id', userId)
                  .single()
                
                if (verifyProfile) {
                  console.log('✅ Verification - Profile state after sync:', {
                    role: verifyProfile.role,
                    subscription_status: verifyProfile.subscription_status,
                    subscription_id: verifyProfile.subscription_id
                  })
                  
                  // If role is still Free and user is not Admin, we need to update it
                  if (verifyProfile.role === 'Free' || verifyProfile.role === null) {
                    console.log('⚠️ Role is still Free after sync, updating manually...')
                    const planType = session.metadata?.planType || 'student'
                    const newRole = (planType === 'teacher' || planType === 'Teacher') ? 'Teacher' : 'Student'
                    
                    const { error: fixError } = await supabaseClient
                      .from('profiles')
                      .update({ role: newRole })
                      .eq('id', userId)
                    
                    if (fixError) {
                      console.error('❌ Error fixing role after sync:', fixError)
                    } else {
                      console.log(`✅ Role fixed from Free to ${newRole}`)
                    }
                  }
                }
              }
            }
          }
        } else {
          console.log('⚠️ Session is not a subscription, skipping')
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`🔄 Processing customer.subscription.${event.type === 'customer.subscription.created' ? 'created' : 'updated'} for subscription:`, subscription.id)
        console.log('Subscription status:', subscription.status)
        
        // AUTOMATIQUE: La fonction sync crée automatiquement les utilisateurs manquants
        const { data: syncResult, error: syncError } = await supabaseClient.rpc(
          'sync_single_subscription_from_stripe',
          { p_stripe_subscription_id: subscription.id }
        )

        if (syncError) {
          console.error('❌ Error syncing subscription:', syncError)
          console.error('Error details:', {
            message: syncError.message,
            code: syncError.code,
            details: syncError.details
          })
          
          // Fallback to manual update
          console.log('⚠️ Falling back to manual update...')
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
              console.log('📝 Role determined from subscription metadata planType: Teacher')
            } else if (planType === 'student' || planType === 'Student') {
              newRole = 'Student'
              console.log('📝 Role determined from subscription metadata planType: Student')
            } else if (priceId === 'price_1SBPN62MKT6HumxnBoQgAdd0') {
              newRole = 'Teacher'
              console.log('📝 Role determined from price ID: Teacher')
            } else {
              newRole = 'Student'
              console.log('📝 Role defaulting to Student (planType:', planType, ', priceId:', priceId, ')')
            }

            // Get current role to preserve Admin
            const { data: currentProfile } = await supabaseClient
              .from('profiles')
              .select('role, subscription_status')
              .eq('id', profile.id)
              .single()

            const currentRole = currentProfile?.role || 'Free'
            console.log('📊 Current profile state:', {
              role: currentRole,
              subscription_status: currentProfile?.subscription_status
            })
            console.log('🔄 Will update to:', {
              role: newRole,
              subscription_status: subscription.status
            })
            
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
                console.error(`❌ Error updating subscriptions table (attempt ${attempt}):`, subError)
                if (attempt < 3) {
                  await new Promise(resolve => setTimeout(resolve, attempt * 500))
                }
              } else {
                console.log(`✅ Subscription record updated successfully on attempt ${attempt} (fallback)`)
                subUpdateSuccess = true
                break
              }
            }
            
            if (!subUpdateSuccess) {
              console.error('❌ Failed to update subscriptions table after 3 attempts')
            }

            // Update profile - include role update if not Admin
            const updateData: any = {
              subscription_status: subscription.status,
            }

            if (currentRole !== 'Admin') {
              updateData.role = newRole
              console.log(`✅ Will update role from "${currentRole}" to "${newRole}"`)
            } else {
              console.log('⚠️ User is Admin - preserving Admin role, only updating subscription status')
            }

            // BULLETPROOF: Update profile with retry logic
            let updateResult = null
            let updateError = null
            
            console.log('🔄 Attempting to update profile with data:', updateData)
            
            for (let attempt = 1; attempt <= 3; attempt++) {
              console.log(`🔄 Database update attempt ${attempt}/3 for userId: ${profile.id}`)
              
              const { data, error } = await supabaseClient
                .from('profiles')
                .update(updateData)
                .eq('id', profile.id)
                .select('role, subscription_status')

              if (error) {
                updateError = error
                console.error(`❌ Attempt ${attempt} failed:`, error.message)
                
                if (attempt < 3) {
                  const delay = attempt * 500
                  console.log(`⏳ Waiting ${delay}ms before retry...`)
                  await new Promise(resolve => setTimeout(resolve, delay))
                }
              } else {
                updateResult = data
                updateError = null
                console.log(`✅ Profile updated successfully on attempt ${attempt} (fallback):`, data)
                break
              }
            }

            if (updateError) {
              console.error('❌ Error updating profile after 3 attempts:', updateError)
              console.error('Error details:', {
                message: updateError.message,
                code: updateError.code,
                details: updateError.details
              })
            } else if (updateResult && updateResult.length > 0) {
              const updated = updateResult[0]
              console.log('✅ Profile update confirmed:', {
                role: updated.role,
                subscription_status: updated.subscription_status
              })
            }
          } else {
            console.error('❌ Profile not found for customer:', customerId)
          }
        } else {
          console.log('✅ Subscription update synced successfully via FDW function:', syncResult)
          
          // Verify the role was updated correctly
          const customerId = subscription.customer as string
          const { data: verifyProfile } = await supabaseClient
            .from('profiles')
            .select('id, role, subscription_status')
            .eq('stripe_customer_id', customerId)
            .single()
          
          if (verifyProfile) {
            console.log('✅ Verification - Profile state after sync:', {
              userId: verifyProfile.id,
              role: verifyProfile.role,
              subscription_status: verifyProfile.subscription_status
            })
            
            // If role is still Free/null and user is not Admin, update it
            if ((verifyProfile.role === 'Free' || verifyProfile.role === null) && verifyProfile.role !== 'Admin') {
              console.log('⚠️ Role is still Free/null after sync, updating manually...')
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
                console.error('❌ Error fixing role after sync:', fixError)
              } else {
                console.log(`✅ Role fixed from ${verifyProfile.role} to ${newRole}`)
              }
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log('🔄 Processing customer.subscription.deleted for subscription:', subscription.id)
        console.log('Customer ID:', customerId)

        // Get user by customer ID
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id, role, subscription_status')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          console.log('📊 Current profile state:', {
            userId: profile.id,
            role: profile.role,
            subscription_status: profile.subscription_status
          })
          
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
              console.error(`❌ Error updating subscriptions table (attempt ${attempt}):`, subError)
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, attempt * 500))
              }
            } else {
              console.log(`✅ Subscription record updated successfully on attempt ${attempt}`)
              subUpdateSuccess = true
              break
            }
          }
          
          if (!subUpdateSuccess) {
            console.error('❌ Failed to update subscriptions table after 3 attempts')
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
            console.log(`✅ Will downgrade role from "${currentRole}" to "Free"`)
          } else {
            console.log('⚠️ User is Admin - preserving Admin role, only updating subscription status')
          }

          // BULLETPROOF: Update profile with retry logic
          let updateResult = null
          let updateError = null
          
          console.log('🔄 Attempting to update profile with data:', updateData)
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`🔄 Database update attempt ${attempt}/3 for userId: ${profile.id}`)
            
            const { data, error } = await supabaseClient
              .from('profiles')
              .update(updateData)
              .eq('id', profile.id)
              .select('role, subscription_status')

            if (error) {
              updateError = error
              console.error(`❌ Attempt ${attempt} failed:`, error.message)
              
              if (attempt < 3) {
                const delay = attempt * 500
                console.log(`⏳ Waiting ${delay}ms before retry...`)
                await new Promise(resolve => setTimeout(resolve, delay))
              }
            } else {
              updateResult = data
              updateError = null
              console.log(`✅ Profile updated successfully on attempt ${attempt}:`, data)
              break
            }
          }

          if (updateError) {
            console.error('❌ Error updating profile after 3 attempts:', updateError)
          } else if (updateResult && updateResult.length > 0) {
            const updated = updateResult[0]
            console.log('✅ Profile update confirmed:', {
              role: updated.role,
              subscription_status: updated.subscription_status
            })
          }
        } else {
          console.error('❌ Profile not found for customer:', customerId)
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
