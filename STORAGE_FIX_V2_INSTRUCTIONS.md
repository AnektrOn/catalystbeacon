# Storage RLS Fix V2 - SIMPLIFIED

## The Problem
You're getting "new row violates row-level security policy" when uploading images.

## The Solution
I've created a **simpler, more reliable** RLS policy that uses string matching instead of the `foldername` function.

## Steps to Fix

### 1. Open Supabase SQL Editor
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"

### 2. Run the NEW Migration
**Use this file:** `supabase/migrations/fix_storage_rls_policies_v2.sql`

This version uses simple `LIKE` pattern matching instead of `storage.foldername()`, which is more reliable.

### 3. What This Does
- Creates `avatars` and `backgrounds` buckets
- Drops all old policies
- Creates new policies that check: `name LIKE '{userId}/%'`
- This matches files uploaded to paths like: `{userId}/avatar-123.jpg`

### 4. Test the Upload
After running the migration, try uploading again. It should work now!

## Why V2 is Better
- **Simpler**: Uses `LIKE` pattern matching instead of `foldername()` function
- **More reliable**: Works regardless of path structure
- **Easier to debug**: You can see exactly what path is being checked

## If It Still Doesn't Work

Check the console logs when uploading - you should see the file path. The path should be:
- `{your-user-id}/avatar-{timestamp}.jpg` for avatars
- `{your-user-id}/background-{timestamp}.jpg` for backgrounds

If the path is different, let me know and I'll adjust the policy.

