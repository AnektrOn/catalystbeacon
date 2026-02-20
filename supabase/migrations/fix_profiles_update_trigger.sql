-- ============================================
-- Fix profiles UPDATE trigger that references user_id incorrectly
-- ============================================
-- Error: "record 'new' has no field 'user_id'" when updating profiles
-- This ensures fn_trigger_dispatch_event correctly handles profiles table
-- ============================================

-- 1. Check and fix fn_trigger_dispatch_event to ensure it handles profiles correctly
CREATE OR REPLACE FUNCTION public.fn_trigger_dispatch_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_event_type text := TG_ARGV[0];
  v_table_name text;
BEGIN
  -- Get table name (remove schema prefix if present)
  v_table_name := LOWER(REGEXP_REPLACE(TG_TABLE_NAME, '^[^.]+\.', ''));
  
  -- Extract user_id based on table name
  v_user_id := CASE v_table_name
    WHEN 'profiles' THEN NEW.id  -- profiles uses 'id', not 'user_id'
    WHEN 'user_badges' THEN NEW.user_id
    WHEN 'user_lesson_progress' THEN NEW.user_id
    WHEN 'user_habit_completions' THEN NEW.user_id
    WHEN 'user_habits' THEN NEW.user_id
    ELSE NULL
  END;

  -- Only insert if we have a valid user_id
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.event_outbox (event_type, user_id, payload)
    VALUES (v_event_type, v_user_id, to_jsonb(NEW));
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Ensure the trigger exists and is correct
DROP TRIGGER IF EXISTS tr_event_profile_update ON public.profiles;
CREATE TRIGGER tr_event_profile_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_dispatch_event('profile_update');

-- 3. Verify no other triggers on profiles reference user_id incorrectly
-- List all triggers on profiles for debugging
DO $$
DECLARE
  r record;
BEGIN
  RAISE NOTICE '=== Triggers on profiles table ===';
  FOR r IN
    SELECT 
      t.tgname AS trigger_name,
      p.proname AS function_name,
      pg_get_functiondef(p.oid) AS function_definition
    FROM pg_trigger t
    JOIN pg_proc p ON t.tgfoid = p.oid
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relname = 'profiles'
      AND NOT t.tgisinternal
  LOOP
    RAISE NOTICE 'Trigger: %, Function: %', r.trigger_name, r.function_name;
  END LOOP;
END $$;

COMMENT ON FUNCTION public.fn_trigger_dispatch_event() IS 
  'Unified event dispatcher. For profiles table, uses NEW.id (not NEW.user_id).';
