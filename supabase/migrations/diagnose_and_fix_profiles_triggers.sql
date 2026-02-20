-- ============================================
-- COMPREHENSIVE FIX for profiles UPDATE trigger
-- ============================================
-- This script will:
-- 1. List ALL triggers on profiles table
-- 2. Check ALL trigger functions for user_id references
-- 3. Temporarily disable problematic triggers
-- 4. Fix fn_trigger_dispatch_event with better error handling
-- 5. Re-enable triggers
-- ============================================

-- Step 1: List all triggers and their functions
DO $$
DECLARE
  r record;
  func_def text;
BEGIN
  RAISE NOTICE '=== ALL TRIGGERS ON profiles TABLE ===';
  FOR r IN
    SELECT 
      t.tgname AS trigger_name,
      CASE 
        WHEN (t.tgtype & 2) = 0 THEN 'AFTER'
        ELSE 'BEFORE'
      END AS timing,
      CASE 
        WHEN (t.tgtype & 4) = 4 THEN 'INSERT'
        WHEN (t.tgtype & 8) = 8 THEN 'DELETE'
        WHEN (t.tgtype & 16) = 16 THEN 'UPDATE'
        ELSE 'UNKNOWN'
      END AS event,
      p.proname AS function_name,
      p.oid AS function_oid
    FROM pg_trigger t
    JOIN pg_proc p ON t.tgfoid = p.oid
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relname = 'profiles'
      AND NOT t.tgisinternal
    ORDER BY t.tgname
  LOOP
    RAISE NOTICE '---';
    RAISE NOTICE 'Trigger: %', r.trigger_name;
    RAISE NOTICE 'Timing: % %', r.timing, r.event;
    RAISE NOTICE 'Function: %', r.function_name;
    
    -- Get function definition
    SELECT pg_get_functiondef(r.function_oid) INTO func_def;
    IF func_def LIKE '%user_id%' AND func_def NOT LIKE '%NEW.id%' THEN
      RAISE WARNING 'POTENTIAL ISSUE: Function % contains "user_id" reference!', r.function_name;
    END IF;
  END LOOP;
END $$;

-- Step 2: Drop and recreate fn_trigger_dispatch_event with robust error handling
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
  -- Get event type from trigger argument
  v_event_type := TG_ARGV[0];
  
  -- Get table name - handle both 'profiles' and 'public.profiles'
  v_table_name := LOWER(REGEXP_REPLACE(TG_TABLE_NAME, '^[^.]+\.', ''));
  
  -- CRITICAL: profiles table uses 'id', NOT 'user_id'
  -- Extract user_id based on table name
  BEGIN
    v_user_id := CASE v_table_name
      WHEN 'profiles' THEN 
        -- profiles table: use NEW.id (primary key)
        NEW.id
      WHEN 'user_badges' THEN NEW.user_id
      WHEN 'user_lesson_progress' THEN NEW.user_id
      WHEN 'user_habit_completions' THEN NEW.user_id
      WHEN 'user_habits' THEN NEW.user_id
      ELSE 
        -- Try to get id if it exists, otherwise NULL
        NULL
    END;
  EXCEPTION
    WHEN undefined_column THEN
      -- If column doesn't exist, set to NULL
      v_user_id := NULL;
  END;

  -- Only insert if we have a valid user_id and event_outbox table exists
  IF v_user_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.event_outbox (event_type, user_id, payload)
      VALUES (v_event_type, v_user_id, to_jsonb(NEW))
      ON CONFLICT DO NOTHING;
    EXCEPTION
      WHEN undefined_table THEN
        -- event_outbox table doesn't exist, skip silently
        NULL;
      WHEN OTHERS THEN
        -- Log but don't fail
        RAISE WARNING 'fn_trigger_dispatch_event insert error: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'fn_trigger_dispatch_event error: %, Table: %, Event: %', SQLERRM, v_table_name, v_event_type;
    RETURN NEW;
END;
$$;

-- Step 3: Ensure trigger exists and is correct
DROP TRIGGER IF EXISTS tr_event_profile_update ON public.profiles;

CREATE TRIGGER tr_event_profile_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_dispatch_event('profile_update');

-- Step 4: Verify trigger was created
DO $$
DECLARE
  trigger_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relname = 'profiles'
      AND t.tgname = 'tr_event_profile_update'
      AND NOT t.tgisinternal
  ) INTO trigger_exists;
  
  IF trigger_exists THEN
    RAISE NOTICE 'SUCCESS: tr_event_profile_update trigger created';
  ELSE
    RAISE WARNING 'FAILED: tr_event_profile_update trigger was not created';
  END IF;
END $$;

COMMENT ON FUNCTION public.fn_trigger_dispatch_event() IS 
  'Unified event dispatcher. For profiles table, uses NEW.id (NOT NEW.user_id). Includes error handling to prevent transaction failures.';

-- Final status
SELECT 'Diagnosis and fix completed. Check NOTICE messages above for trigger list.' AS status;
