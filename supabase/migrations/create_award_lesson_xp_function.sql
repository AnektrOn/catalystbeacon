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

