# Storage RLS Policy Fix Instructions

## Problem
You're getting the error: **"new row violates row-level security policy"** when trying to upload profile pictures or background images.

## Solution
Run the migration file to fix the RLS policies for storage buckets.

## Steps to Fix

### 1. Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### 2. Run the Migration
Copy and paste the entire contents of `supabase/migrations/fix_storage_rls_policies.sql` into the SQL Editor, then click **"Run"**.

**Or** copy this SQL directly:

```sql
-- Fix Storage RLS Policies for Avatar and Background Image Uploads

-- Step 1: Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create backgrounds bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backgrounds',
  'backgrounds', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Public can view backgrounds" ON storage.objects;

-- Step 4: Create RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Step 5: Create RLS policies for backgrounds bucket
CREATE POLICY "Users can upload their own backgrounds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'backgrounds' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own backgrounds"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'backgrounds' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'backgrounds' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own backgrounds"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'backgrounds' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view backgrounds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'backgrounds');

-- Step 6: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;
```

### 3. Verify the Fix
After running the migration:
1. Try uploading a profile picture or background image again
2. The upload should now work without the RLS error

## What This Fix Does

1. **Creates storage buckets** (`avatars` and `backgrounds`) if they don't exist
2. **Removes old incorrect policies** that were causing the error
3. **Creates new correct policies** that:
   - Allow authenticated users to upload files to their own folder (path must start with their user ID)
   - Allow users to update/delete their own files
   - Allow public read access to all files
4. **Grants necessary permissions** to authenticated users

## File Path Structure
The policies check that files are uploaded to the correct user folder:
- Avatars: `avatars/{userId}/avatar-{timestamp}.{ext}`
- Backgrounds: `backgrounds/{userId}/background-{timestamp}.{ext}`

The policy verifies that `(storage.foldername(name))[1]` (the first folder in the path) matches the user's ID.

## Troubleshooting

If you still get errors after running the migration:

1. **Check if buckets exist:**
   ```sql
   SELECT * FROM storage.buckets WHERE id IN ('avatars', 'backgrounds');
   ```

2. **Check if policies exist:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%' OR policyname LIKE '%background%';
   ```

3. **Verify your user ID matches the folder:**
   - Check the console logs when uploading
   - The file path should start with your user ID

4. **Check storage bucket settings:**
   - Go to Storage in Supabase Dashboard
   - Verify buckets are set to "Public"
   - Check file size limits (should be 5MB)

