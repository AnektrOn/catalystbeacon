-- ============================================
-- TEMPORARILY DISABLE profiles UPDATE trigger
-- ============================================
-- Use this if the trigger keeps causing errors
-- This will allow updates to profiles to work
-- while we fix the trigger function
-- ============================================

-- Disable the problematic trigger
ALTER TABLE public.profiles DISABLE TRIGGER tr_event_profile_update;

-- Verify it's disabled
DO $$
DECLARE
  trigger_status text;
BEGIN
  SELECT CASE t.tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
    ELSE 'UNKNOWN'
  END INTO trigger_status
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
    AND c.relname = 'profiles'
    AND t.tgname = 'tr_event_profile_update'
    AND NOT t.tgisinternal;
  
  RAISE NOTICE 'Trigger tr_event_profile_update status: %', trigger_status;
END $$;

SELECT 'Trigger disabled. You can now update profiles without trigger errors.' AS status;
SELECT 'IMPORTANT: Re-enable the trigger later with: ALTER TABLE public.profiles ENABLE TRIGGER tr_event_profile_update;' AS warning;
