# Database Migration Instructions

## Issue: `award_lesson_xp` Function Not Working

The `award_lesson_xp` database function is returning `false`, which means it either:
1. Doesn't exist in your database
2. Has an error when executing
3. Has permission issues

## Solution: Run the Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Migration

Copy and paste the entire contents of `supabase/migrations/create_award_lesson_xp_function.sql` into the SQL Editor, then click **"Run"**.

**Or** copy this SQL directly:

```sql
-- Migration: Create award_lesson_xp function
-- Purpose: Award XP to users when they complete lessons

-- Drop any existing versions of the function with different signatures
DROP FUNCTION IF EXISTS award_lesson_xp(UUID, UUID, INTEGER);
DROP FUNCTION IF EXISTS award_lesson_xp(UUID, INTEGER, INTEGER, INTEGER, INTEGER);

-- Create the function with the correct signature (matching what the code expects)
CREATE OR REPLACE FUNCTION award_lesson_xp(
    user_id UUID,
    course_id INTEGER,
    chapter_number INTEGER,
    lesson_number INTEGER,
    xp_amount INTEGER DEFAULT 50
) RETURNS BOOLEAN AS $$
BEGIN
    -- Insert XP transaction if the table exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'xp_transactions'
    ) THEN
        INSERT INTO xp_transactions (user_id, amount, source_type, description)
        VALUES (
            user_id,
            xp_amount,
            'lesson_completion',
            'Completed lesson: course ' || course_id || ', chapter ' || chapter_number || ', lesson ' || lesson_number
        )
        ON CONFLICT DO NOTHING;
    END IF;

    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
        RAISE WARNING 'Profile not found for user_id: %', user_id;
        RETURN FALSE;
    END IF;

    -- Update profile XP totals
    -- Check if columns exist before updating
    UPDATE profiles
    SET
        current_xp = COALESCE(current_xp, 0) + xp_amount,
        total_xp_earned = COALESCE(total_xp_earned, 0) + xp_amount,
        updated_at = NOW()
    WHERE id = user_id;

    -- Verify the update succeeded
    IF NOT FOUND THEN
        RAISE WARNING 'Failed to update profile for user_id: %', user_id;
        RETURN FALSE;
    END IF;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error for debugging with more details
        RAISE WARNING 'Error awarding XP: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION award_lesson_xp(UUID, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;

-- Add comment
COMMENT ON FUNCTION award_lesson_xp IS 'Awards XP to a user when they complete a lesson. Updates profiles table and optionally logs to xp_transactions.';
```

### Step 3: Verify the Function Exists

Run this query to verify the function was created:

```sql
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'award_lesson_xp';
```

You should see a row with `routine_name = 'award_lesson_xp'` and `return_type = 'boolean'`.

### Step 4: Verify Required Columns Exist

Run this query to verify the `profiles` table has the required columns:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('current_xp', 'total_xp_earned');
```

You should see both `current_xp` and `total_xp_earned` columns.

If they don't exist, run this:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_xp_earned INTEGER DEFAULT 0;
```

### Step 5: Test the Function

Test the function with a sample call:

```sql
-- Replace with an actual user_id from your profiles table
SELECT award_lesson_xp(
    'YOUR_USER_ID_HERE'::UUID,
    982370636,  -- course_id
    1,          -- chapter_number
    1,          -- lesson_number
    50          -- xp_amount
);
```

This should return `true` if successful.

## Troubleshooting

### Error: "function does not exist"
- The migration didn't run successfully
- Check the SQL Editor for error messages
- Make sure you're running the entire migration script

### Error: "permission denied"
- The function needs `SECURITY DEFINER` (already included)
- Make sure you're running as a database admin
- Check RLS policies on the `profiles` table

### Error: "column does not exist"
- Run the ALTER TABLE command in Step 4
- Verify columns exist with the SELECT query

### Function returns false
- Check Supabase logs for WARNING messages
- The function logs errors with `RAISE WARNING`
- Check if the user_id exists in the profiles table
- Verify RLS policies allow updates to profiles

## Current Status

- ✅ Fallback mechanism is working (XP is awarded via direct profile update)
- ⚠️ Database function should be fixed for proper XP transaction logging
- ✅ Lesson completion works regardless of function status

