-- ============================================
-- FIX "Database error saving new user" / "record new has no field user_id"
-- Run this in Supabase SQL Editor - project mbffycgrqfeesfnhhcdm (your production project).
-- Copy-paste the ENTIRE file and click Run. Check for "Success" at the bottom.
-- ============================================

-- Step 1: Drop EVERY user-created trigger on auth.users (not system triggers)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT t.tgname AS name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND NOT t.tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', r.name);
    RAISE NOTICE 'Dropped trigger: %', r.name;
  END LOOP;
END $$;

-- Step 2: Create the correct function (uses NEW.id, not NEW.user_id)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- Step 3: Create our trigger (AFTER INSERT on auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Done. Try signup again.
SELECT 'Trigger fixed. Try signing up again.' AS status;
