-- ============================================
-- UNIFIED EVENT OUTBOX (replaces chatty webhook triggers)
-- ============================================
-- Inserts into a buffer ~1ms; webhooks ~200ms+. This removes transaction latency.
-- A background worker or single n8n webhook should process event_outbox in batches.

-- 1. High-speed event buffer
CREATE TABLE IF NOT EXISTS public.event_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payload jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_outbox_processed_created
  ON public.event_outbox (processed, created_at)
  WHERE processed = false;

ALTER TABLE public.event_outbox ENABLE ROW LEVEL SECURITY;

-- No GRANT to anon/authenticated: only triggers (SECURITY DEFINER) insert; service role bypasses RLS for worker/backend.
COMMENT ON TABLE public.event_outbox IS 'Unified event buffer; worker or webhook processes rows and sets processed=true';

-- 2. Unified trigger function (minimal logic: insert only)
CREATE OR REPLACE FUNCTION public.fn_trigger_dispatch_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_event_type text := TG_ARGV[0];
BEGIN
  v_user_id := CASE TG_TABLE_NAME
    WHEN 'profiles' THEN NEW.id
    WHEN 'user_badges' THEN NEW.user_id
    WHEN 'user_lesson_progress' THEN NEW.user_id
    WHEN 'user_habit_completions' THEN NEW.user_id
    WHEN 'user_habits' THEN NEW.user_id
    ELSE NULL
  END;

  INSERT INTO public.event_outbox (event_type, user_id, payload)
  VALUES (v_event_type, v_user_id, to_jsonb(NEW));
  RETURN NEW;
END;
$$;

-- 3. Drop ALL legacy webhook triggers (stops synchronous HTTP from inside transactions)
DROP TRIGGER IF EXISTS trigger_level_up ON public.profiles;
DROP TRIGGER IF EXISTS trigger_xp_milestone ON public.profiles;
DROP TRIGGER IF EXISTS trigger_streak_milestone ON public.profiles;
DROP TRIGGER IF EXISTS trigger_achievement_unlocked ON public.user_badges;
DROP TRIGGER IF EXISTS trigger_lesson_completed ON public.user_lesson_progress;
DROP TRIGGER IF EXISTS "level-up-webhook" ON public.profiles;
DROP TRIGGER IF EXISTS "xp-milestone-webhook" ON public.profiles;
DROP TRIGGER IF EXISTS "streak-milestone-webhook" ON public.profiles;
DROP TRIGGER IF EXISTS "achievement-webhook" ON public.user_badges;
DROP TRIGGER IF EXISTS "lesson-completed-webhook" ON public.user_lesson_progress;
DROP TRIGGER IF EXISTS "new-user-webhook" ON public.profiles;
DROP TRIGGER IF EXISTS "user-signup-webhook" ON public.profiles;
DROP TRIGGER IF EXISTS "profiles-update-webhook" ON public.profiles;
DROP TRIGGER IF EXISTS tr_habit_outbox ON public.habits;
DROP TRIGGER IF EXISTS "habit-completed-webhook" ON public.user_habit_completions;
DROP TRIGGER IF EXISTS "habit-completed-webhook" ON public.user_habits;

-- 4. Consolidated triggers (insert into outbox only)
CREATE TRIGGER tr_event_profile_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_dispatch_event('profile_update');

CREATE TRIGGER tr_event_profile_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_dispatch_event('user_signup');

CREATE TRIGGER tr_event_achievement_unlocked
  AFTER INSERT ON public.user_badges
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_dispatch_event('achievement_unlocked');

CREATE TRIGGER tr_event_lesson_completed
  AFTER UPDATE ON public.user_lesson_progress
  FOR EACH ROW
  WHEN (
    NEW.is_completed = true
    AND (OLD.is_completed IS NOT DISTINCT FROM false OR OLD.is_completed IS NULL)
  )
  EXECUTE FUNCTION public.fn_trigger_dispatch_event('lesson_completed');

-- Habit completion: one row per completion (user_habit_completions INSERT)
CREATE TRIGGER tr_event_habit_completed
  AFTER INSERT ON public.user_habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_dispatch_event('habit_completed');
