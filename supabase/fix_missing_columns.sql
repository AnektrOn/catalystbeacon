-- Fix for PGRST204 error (Column not found)
-- This script adds missing columns to user_habits and profiles tables
-- to support the Mastery and Dashboard features correctly.

-- 1. Fix user_habits table
DO $$ 
BEGIN 
    -- Add show_on_calendar column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_habits' AND column_name = 'show_on_calendar') THEN
        ALTER TABLE public.user_habits ADD COLUMN show_on_calendar BOOLEAN DEFAULT true;
    END IF;

    -- Add completion_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_habits' AND column_name = 'completion_count') THEN
        ALTER TABLE public.user_habits ADD COLUMN completion_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Fix profiles table for completion stats
DO $$ 
BEGIN 
    -- Add completion_streak if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'completion_streak') THEN
        ALTER TABLE public.profiles ADD COLUMN completion_streak INTEGER DEFAULT 0;
    END IF;

    -- Add longest_streak if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'longest_streak') THEN
        ALTER TABLE public.profiles ADD COLUMN longest_streak INTEGER DEFAULT 0;
    END IF;

    -- Add habits_completed_today if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'habits_completed_today') THEN
        ALTER TABLE public.profiles ADD COLUMN habits_completed_today INTEGER DEFAULT 0;
    END IF;

    -- Add habits_completed_week if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'habits_completed_week') THEN
        ALTER TABLE public.profiles ADD COLUMN habits_completed_week INTEGER DEFAULT 0;
    END IF;

    -- Add habits_completed_month if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'habits_completed_month') THEN
        ALTER TABLE public.profiles ADD COLUMN habits_completed_month INTEGER DEFAULT 0;
    END IF;

    -- Add habits_completed_total if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'habits_completed_total') THEN
        ALTER TABLE public.profiles ADD COLUMN habits_completed_total INTEGER DEFAULT 0;
    END IF;

    -- Add last_activity_date if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_activity_date') THEN
        ALTER TABLE public.profiles ADD COLUMN last_activity_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Fix user_lesson_progress table for score tracking
DO $$
BEGIN
    -- Add score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_lesson_progress' AND column_name = 'score') THEN
        ALTER TABLE public.user_lesson_progress ADD COLUMN score NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 3. Verify and Refresh Schema Cache
-- PostgREST needs to know about the new columns
NOTIFY pgrst, 'reload schema';
