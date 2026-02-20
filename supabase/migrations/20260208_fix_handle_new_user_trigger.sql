-- ============================================
-- FIX: "record \"new\" has no field \"user_id\"" on OAuth signup
-- ============================================
-- When a new user signs up (e.g. Google OAuth), a trigger on auth.users
-- runs to create a row in public.profiles. If that trigger uses NEW.user_id
-- it fails because auth.users has "id", not "user_id". This migration
-- replaces the trigger function to use NEW.id and insert correctly.
--
-- If signup still fails after running this, list triggers on auth.users:
--   SELECT trigger_name FROM information_schema.triggers
--   WHERE event_object_schema = 'auth' AND event_object_table = 'users';
-- Then: DROP TRIGGER IF EXISTS <name> ON auth.users;

-- 1. Drop ALL after-insert triggers on auth.users (removes the broken one
--    that uses NEW.user_id, whatever its name is)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth' AND c.relname = 'users'
      AND (t.tgtype & 2) = 0   -- AFTER (not BEFORE)
      AND (t.tgtype & 4) = 4   -- INSERT
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', r.tgname);
  END LOOP;
END $$;
-- Also drop by common names in case the dynamic drop missed one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_insert ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- 2. Create or replace the function that runs on new user insert.
--    Use NEW.id (auth.users.id), not NEW.user_id. Insert into profiles
--    with id, email, full_name. (Table profiles must have id, email, full_name.)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
  RETURN NEW;
END;
$$;

-- 3. Recreate the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates or updates public.profiles when a new auth.users row is inserted (OAuth or email signup). Uses NEW.id, not user_id.';
