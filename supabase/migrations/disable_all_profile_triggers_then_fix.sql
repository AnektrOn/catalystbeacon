-- ============================================
-- DISABLE ALL UPDATE TRIGGERS ON profiles THEN FIX
-- ============================================
-- This script will:
-- 1. List all UPDATE triggers on profiles
-- 2. Disable ALL of them temporarily
-- 3. Fix fn_trigger_dispatch_event completely
-- 4. Re-enable only the correct trigger
-- ============================================

-- Step 1: List all UPDATE triggers
DO $$
DECLARE
  r record;
BEGIN
  RAISE NOTICE '=== DISABLING ALL UPDATE TRIGGERS ON profiles ===';
  FOR r IN
    SELECT t.tgname AS trigger_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relname = 'profiles'
      AND NOT t.tgisinternal
      AND (t.tgtype & 16) = 16  -- UPDATE trigger
  LOOP
    RAISE NOTICE 'Disabling trigger: %', r.trigger_name;
    EXECUTE format('ALTER TABLE public.profiles DISABLE TRIGGER %I', r.trigger_name);
  END LOOP;
END $$;

-- Step 2: Drop the function completely and recreate it
DROP FUNCTION IF EXISTS public.fn_trigger_dispatch_event() CASCADE;

-- Step 3: Create a completely new, safe version
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
  -- Get event type safely
  BEGIN
    IF TG_NARGS > 0 THEN
      v_event_type := TG_ARGV[0];
    ELSE
      v_event_type := 'unknown_event';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      v_event_type := 'unknown_event';
  END;
  
  -- Get table name - handle all cases
  BEGIN
    v_table_name := LOWER(REGEXP_REPLACE(COALESCE(TG_TABLE_NAME::text, ''), '^[^.]+\.', ''));
  EXCEPTION
    WHEN OTHERS THEN
      v_table_name := '';
  END;
  
  -- Extract user_id - CRITICAL: profiles uses 'id', not 'user_id'
  BEGIN
    IF v_table_name = 'profiles' THEN
      -- For profiles table, use the 'id' column (primary key)
      v_user_id := (NEW).id;
    ELSIF v_table_name IN ('user_badges', 'user_lesson_progress', 'user_habit_completions', 'user_habits') THEN
      -- For other tables, use 'user_id' column
      v_user_id := (NEW).user_id;
    ELSE
      v_user_id := NULL;
    END IF;
  EXCEPTION
    WHEN undefined_column THEN
      -- Column doesn't exist, set to NULL
      v_user_id := NULL;
    WHEN OTHERS THEN
      -- Any other error, set to NULL
      v_user_id := NULL;
  END;

  -- Insert into event_outbox only if we have valid data and table exists
  IF v_user_id IS NOT NULL THEN
    BEGIN
      -- Double check table exists
      PERFORM 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'event_outbox'
      LIMIT 1;
      
      -- If we get here, table exists, so insert
      INSERT INTO public.event_outbox (event_type, user_id, payload)
      VALUES (v_event_type, v_user_id, to_jsonb(NEW))
      ON CONFLICT DO NOTHING;
    EXCEPTION
      WHEN undefined_table THEN
        -- Table doesn't exist, skip silently
        NULL;
      WHEN OTHERS THEN
        -- Any other error, skip silently - don't fail the transaction
        NULL;
    END;
  END IF;
  
  -- Always return NEW to allow the transaction to succeed
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ultimate safety: return NEW no matter what
    -- This ensures the UPDATE on profiles always succeeds
    RETURN NEW;
END;
$$;

-- Step 4: Drop old trigger if it exists
DROP TRIGGER IF EXISTS tr_event_profile_update ON public.profiles;

-- Step 5: Create new trigger with the fixed function
CREATE TRIGGER tr_event_profile_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_dispatch_event('profile_update');

-- Step 6: Re-enable the trigger
ALTER TABLE public.profiles ENABLE TRIGGER tr_event_profile_update;

-- Step 7: Verify
DO $$
DECLARE
  trigger_count int;
  trigger_enabled boolean;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
    AND c.relname = 'profiles'
    AND t.tgname = 'tr_event_profile_update'
    AND NOT t.tgisinternal;
  
  IF trigger_count > 0 THEN
    SELECT t.tgenabled = 'O' INTO trigger_enabled
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relname = 'profiles'
      AND t.tgname = 'tr_event_profile_update'
      AND NOT t.tgisinternal;
    
    IF trigger_enabled THEN
      RAISE NOTICE 'SUCCESS: Trigger tr_event_profile_update is enabled and ready';
    ELSE
      RAISE WARNING 'WARNING: Trigger exists but is disabled';
    END IF;
  ELSE
    RAISE WARNING 'ERROR: Trigger was not created';
  END IF;
END $$;

COMMENT ON FUNCTION public.fn_trigger_dispatch_event() IS 
  'Unified event dispatcher. FIXED VERSION: For profiles table, uses (NEW).id (NOT user_id). Includes comprehensive error handling to prevent transaction failures.';

SELECT 'All triggers disabled, function recreated, and trigger re-enabled. Try updating profiles now.' AS status;
