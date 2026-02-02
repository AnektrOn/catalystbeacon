-- ============================================
-- TRIGGER AUDIT: List and drop legacy webhook triggers
-- ============================================
-- Run this in Supabase SQL Editor to see current triggers.
-- After applying migrations/event_outbox_unified_trigger.sql, only
-- tr_event_* triggers should remain. Legacy webhook triggers should be dropped.

-- 1. List all triggers on public tables (run to audit)
SELECT
  trigger_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 2. Drop legacy triggers (if migration was not run or triggers were recreated)
-- Uncomment and run only if you need to manually clean up:
/*
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
*/
