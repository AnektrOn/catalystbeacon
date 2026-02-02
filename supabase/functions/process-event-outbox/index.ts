import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Processes event_outbox in batches and POSTs to n8n webhook.
 * Run via Supabase Cron every 30 seconds (e.g. "*/30 * * * * *" or "0,30 * * * *").
 * Env: N8N_WEBHOOK_URL (required) - n8n webhook URL that accepts { events: [...] }.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL') ?? ''

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: 'N8N_WEBHOOK_URL not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: batch, error: fetchError } = await supabase
      .rpc('get_event_outbox_batch', { p_limit: 50 })

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const events = Array.isArray(batch) ? batch : []
    if (events.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending events' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Payload for n8n: array of { id, event_type, user_id, payload, created_at }
    const payload = {
      events: events.map((e: { id: string; event_type: string; user_id: string | null; payload: unknown; created_at: string }) => ({
        id: e.id,
        event_type: e.event_type,
        user_id: e.user_id,
        payload: e.payload,
        created_at: e.created_at,
      })),
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (webhookResponse.ok) {
      const ids = events.map((e: { id: string }) => e.id)
      const { data: marked, error: markError } = await supabase
        .rpc('mark_event_outbox_processed', { p_ids: ids })

      if (markError) {
        return new Response(
          JSON.stringify({ error: 'Webhook sent but mark failed: ' + markError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          processed: typeof marked === 'number' ? marked : events.length,
          message: 'Events sent to n8n and marked processed',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Do not mark as processed so next run retries
    const errorText = await webhookResponse.text()
    return new Response(
      JSON.stringify({
        success: false,
        processed: 0,
        error: `n8n returned ${webhookResponse.status}: ${errorText}`,
        message: 'Events not marked; will retry on next run',
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
