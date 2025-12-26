-- Fix Storage RLS Policies for Avatar and Background Image Uploads (V2 - Simplified)
-- This migration fixes the "new row violates row-level security policy" error
-- Uses simpler string matching instead of foldername function

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

-- Step 3: Drop ALL existing policies for these buckets
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Public can view backgrounds" ON storage.objects;

-- Step 4: Create SIMPLIFIED RLS policies for avatars bucket
-- Allow authenticated users to upload to avatars bucket if path starts with their user ID
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Step 5: Create SIMPLIFIED RLS policies for backgrounds bucket
-- Allow authenticated users to upload to backgrounds bucket if path starts with their user ID
CREATE POLICY "Users can upload their own backgrounds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'backgrounds' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
);

-- Allow users to update their own backgrounds
CREATE POLICY "Users can update their own backgrounds"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'backgrounds' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
)
WITH CHECK (
  bucket_id = 'backgrounds' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
);

-- Allow users to delete their own backgrounds
CREATE POLICY "Users can delete their own backgrounds"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'backgrounds' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
);

-- Allow public read access to backgrounds
CREATE POLICY "Public can view backgrounds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'backgrounds');

-- Step 6: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

