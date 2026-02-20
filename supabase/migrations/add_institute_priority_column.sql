-- ============================================
-- Add institute_priority column to profiles table
-- ============================================
-- This column stores an array of institute names in the user's preferred order.
-- Used to generate custom roadmap journey based on institute priority.
-- ============================================

-- Add institute_priority column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'institute_priority'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN institute_priority TEXT[] DEFAULT NULL;
        
        COMMENT ON COLUMN public.profiles.institute_priority IS 
            'Array of institute names in user preferred order. Used to generate custom roadmap journey.';
    END IF;
END $$;
