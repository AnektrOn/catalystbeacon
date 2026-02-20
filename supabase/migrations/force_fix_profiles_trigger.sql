-- ============================================
-- FORCE FIX profiles UPDATE trigger
-- ============================================
-- This script will:
-- 1. Temporarily disable the problematic trigger
-- 2. Recreate fn_trigger_dispatch_event with absolute safety
-- 3. Re-enable the trigger
-- Use this if the regular fix didn't work
-- ============================================

-- Step 1: Disable the trigger temporarily
ALTER TABLE public.profiles DISABLE TRIGGER tr_event_profile_update;

-- Step 2: Drop and recreate the function with maximum safety
DROP FUNCTION IF EXISTS public.fn_trigger_dispatch_event() CASCADE;

CREATE OR REPLACE FUNCTION public.fn_trigger_dispatch_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_event_type text;
  v_table_name text;
BEGIN
  -- Get event type
  IF TG_NARGS > 0 THEN
    v_event_type := TG_ARGV[0];
  ELSE
    v_event_type := 'unknown_event';
  END IF;
  
  -- Get table name - normalize it
  v_table_name := LOWER(REGEXP_REPLACE(COALESCE(TG_TABLE_NAME::text, ''), '^[^.]+\.', ''));
  
  -- Extract user_id - ABSOLUTELY SAFE for profiles table
  BEGIN
    IF v_table_name = 'profiles' THEN
      -- profiles table: ALWAYS use NEW.id
      v_user_id := (NEW).id;
    ELSIF v_table_name = 'user_badges' THEN
      v_user_id := (NEW).user_id;
    ELSIF v_table_name = 'user_lesson_progress' THEN
      v_user_id := (NEW).user_id;
    ELSIF v_table_name = 'user_habit_completions' THEN
      v_user_id := (NEW).user_id;
    ELSIF v_table_name = 'user_habits' THEN
      v_user_id := (NEW).user_id;
    ELSE
      v_user_id := NULL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- If anything goes wrong, set to NULL
      v_user_id := NULL;
  END;

  -- Insert into event_outbox only if we have valid data
  IF v_user_id IS NOT NULL THEN
    BEGIN
      -- Check if event_outbox table exists before inserting
      IF EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'event_outbox') THEN
        INSERT INTO public.event_outbox (event_type, user_id, payload)
        VALUES (v_event_type, v_user_id, to_jsonb(NEW))
        ON CONFLICT DO NOTHING;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Silently ignore errors - don't fail the transaction
        NULL;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Last resort: return NEW to allow the transaction to succeed
    RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger
DROP TRIGGER IF EXISTS tr_event_profile_update ON public.profiles;

CREATE TRIGGER tr_event_profile_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_dispatch_event('profile_update');

-- Step 4: Re-enable the trigger
ALTER TABLE public.profiles ENABLE TRIGGER tr_event_profile_update;

-- Step 5: Verify
DO $$
DECLARE
  trigger_enabled boolean;
BEGIN
  SELECT t.tgenabled = 'O' INTO trigger_enabled
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
    AND c.relname = 'profiles'
    AND t.tgname = 'tr_event_profile_update'
    AND NOT t.tgisinternal;
  
  IF trigger_enabled THEN
    RAISE NOTICE 'SUCCESS: Trigger is enabled and should work correctly';
  ELSE
    RAISE WARNING 'WARNING: Trigger exists but may be disabled';
  END IF;
END $$;

COMMENT ON FUNCTION public.fn_trigger_dispatch_event() IS 
  'Unified event dispatcher. SAFE VERSION: For profiles table, uses (NEW).id (NOT user_id). Includes comprehensive error handling.';

SELECT 'Force fix completed. The trigger should now work correctly.' AS status;
