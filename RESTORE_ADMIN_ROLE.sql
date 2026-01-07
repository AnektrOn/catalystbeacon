-- Restore Admin Role for User
-- Run this in Supabase SQL Editor if you lost your Admin role due to subscription

-- Replace 'your-user-id' with your actual user ID
-- You can find your user ID in the profiles table or from the auth.users table

-- Option 1: Restore by email
UPDATE profiles
SET role = 'Admin'
WHERE email = 'humancatalystnote@gmail.com'
RETURNING id, email, role, subscription_status, subscription_id;

-- Option 2: Restore by user ID (if you know it)
-- UPDATE profiles
-- SET role = 'Admin'
-- WHERE id = '8c94448d-e21c-4b7b-be9a-88a5692dc5d6'
-- RETURNING id, email, role, subscription_status, subscription_id;

-- Verify the updatex
SELECT id, email, full_name, role, subscription_status, subscription_id
FROM profiles
WHERE email = 'humancatalystnote@gmail.com';

