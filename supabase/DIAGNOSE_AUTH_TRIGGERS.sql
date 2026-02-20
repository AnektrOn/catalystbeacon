-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR FIRST
-- Copy the results and share them if signup still fails.
-- ============================================

-- 1. List ALL triggers on auth.users (see which one runs on signup)
SELECT
  t.tgname AS trigger_name,
  p.proname AS function_name,
  n.nspname AS function_schema
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace nc ON c.relnamespace = nc.oid
WHERE nc.nspname = 'auth' AND c.relname = 'users'
ORDER BY t.tgname;

-- 2. Check profiles table columns (must have at least id, email)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
