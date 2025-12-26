-- Fix Storage RLS Policies for Avatar and Background Image Uploads
-- This migration fixes the "new row violates row-level security policy" error

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

-- Step 3: Drop existing policies if they exist (to recreate them correctly)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Public can view backgrounds" ON storage.objects;

-- Step 4: Create RLS policies for avatars bucket
-- Allow authenticated users to upload avatars to their own folder
-- Note: The 'name' field is the path within the bucket, so '{userId}/avatar.jpg'
-- We check that the path starts with the user's ID
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (
    (storage.foldername(name))[0] = auth.uid()::text
    OR name LIKE auth.uid()::text || '/%'
  )
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[0] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[0] = auth.uid()::text
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[0] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Step 5: Create RLS policies for backgrounds bucket
-- Allow authenticated users to upload backgrounds to their own folder
-- Note: The 'name' field is the path within the bucket, so '{userId}/background.jpg'
-- We check that the path starts with the user's ID
CREATE POLICY "Users can upload their own backgrounds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'backgrounds' 
  AND (
    (storage.foldername(name))[0] = auth.uid()::text
    OR name LIKE auth.uid()::text || '/%'
  )
);

-- Allow users to update their own backgrounds
CREATE POLICY "Users can update their own backgrounds"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'backgrounds' 
  AND (storage.foldername(name))[0] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'backgrounds' 
  AND (storage.foldername(name))[0] = auth.uid()::text
);

-- Allow users to delete their own backgrounds
CREATE POLICY "Users can delete their own backgrounds"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'backgrounds' 
  AND (storage.foldername(name))[0] = auth.uid()::text
);

-- Allow public read access to backgrounds
CREATE POLICY "Public can view backgrounds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'backgrounds');

-- Step 6: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

