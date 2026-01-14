import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This Edge Function processes pending emails from the queue
// It should be called by a Supabase cron job every minute
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get pending emails from queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .rpc('get_pending_emails', { limit_count: 10 })

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending emails' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }


    // Process each email by calling the send-email Edge Function
    const results = []
    for (const email of pendingEmails) {
      try {
        // Update status to processing
        await supabase.rpc('mark_email_processing', { email_id: email.id })
        await supabase
          .from('email_queue')
          .update({ attempts: (email.attempts || 0) + 1 })
          .eq('id', email.id)

        // Call send-email Edge Function
        const sendEmailUrl = `${supabaseUrl}/functions/v1/send-email`
        const sendResponse = await fetch(sendEmailUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            emailType: email.email_type,
            email: email.recipient_email,
            ...email.email_data,
            queueId: email.id // Pass queue ID so send-email can mark it as sent
          })
        })

        if (sendResponse.ok) {
          const result = await sendResponse.json()
          if (result.success) {
            // Mark as sent
            await supabase
              .from('email_queue')
              .update({ status: 'sent', sent_at: new Date().toISOString() })
              .eq('id', email.id)
            results.push({ id: email.id, status: 'sent' })
          } else {
            // Mark as failed (but allow retry if attempts < max)
            const newStatus = (email.attempts + 1) >= (email.max_attempts || 3) ? 'failed' : 'pending'
            await supabase
              .from('email_queue')
              .update({ 
                status: newStatus,
                error_message: result.error || 'Unknown error'
              })
              .eq('id', email.id)
            results.push({ id: email.id, status: 'failed', error: result.error })
          }
        } else {
          const errorText = await sendResponse.text()
          const newStatus = (email.attempts + 1) >= (email.max_attempts || 3) ? 'failed' : 'pending'
          await supabase
            .from('email_queue')
            .update({ 
              status: newStatus,
              error_message: `HTTP ${sendResponse.status}: ${errorText}`
            })
            .eq('id', email.id)
          results.push({ id: email.id, status: 'failed', error: errorText })
        }
      } catch (error) {
        const newStatus = (email.attempts + 1) >= (email.max_attempts || 3) ? 'failed' : 'pending'
        await supabase
          .from('email_queue')
          .update({ 
            status: newStatus,
            error_message: error.message
          })
          .eq('id', email.id)
        results.push({ id: email.id, status: 'failed', error: error.message })
      }
    }

    const sent = results.filter(r => r.status === 'sent').length
    const failed = results.filter(r => r.status === 'failed').length

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: pendingEmails.length,
        sent,
        failed,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
