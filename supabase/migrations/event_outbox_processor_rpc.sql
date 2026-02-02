-- ============================================
-- EVENT OUTBOX PROCESSOR (batch fetch + mark processed)
-- ============================================
-- Used by process-event-outbox Edge Function (cron every 30s).
-- Never call webhooks from inside triggers; this runs outside the transaction.

-- 1. Fetch next unprocessed batch (service role only)
CREATE OR REPLACE FUNCTION public.get_event_outbox_batch(p_limit int DEFAULT 50)
RETURNS SETOF public.event_outbox
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, event_type, user_id, payload, processed, created_at
  FROM public.event_outbox
  WHERE processed = false
  ORDER BY created_at ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 100));
$$;

COMMENT ON FUNCTION public.get_event_outbox_batch(int) IS
  'Returns unprocessed event_outbox rows for the outbox worker. Call with service role.';

-- 2. Mark rows as processed after successful delivery to n8n
CREATE OR REPLACE FUNCTION public.mark_event_outbox_processed(p_ids uuid[])
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;
  UPDATE public.event_outbox
  SET processed = true
  WHERE id = ANY(p_ids);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.mark_event_outbox_processed(uuid[]) IS
  'Marks event_outbox rows as processed after worker sends them to n8n.';
