-- Fix Storage RLS Policies for Background Image Uploads
-- Run this in Supabase SQL Editor if you still get RLS errors

-- Step 1: Ensure backgrounds bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backgrounds',
  'backgrounds', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies for backgrounds bucket
DROP POLICY IF EXISTS "Users can upload their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Public can view backgrounds" ON storage.objects;

-- Step 3: Create RLS policies for backgrounds bucket
-- Path format: {userId}/background-{timestamp}.{ext}
CREATE POLICY "Users can upload their own backgrounds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'backgrounds' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
);

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

CREATE POLICY "Users can delete their own backgrounds"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'backgrounds' 
  AND (name LIKE auth.uid()::text || '/%' OR name = auth.uid()::text || '/')
);

CREATE POLICY "Public can view backgrounds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'backgrounds');

-- Step 4: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

