-- Create user_daily_tracking table for mood, sleep, and stress tracking
-- This table stores daily entries (1-10 scale) for each metric

CREATE TABLE IF NOT EXISTS public.user_daily_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    sleep INTEGER CHECK (sleep >= 1 AND sleep <= 10),
    stress INTEGER CHECK (stress >= 1 AND stress <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_daily_tracking_user_date ON public.user_daily_tracking(user_id, date DESC);

-- Enable RLS
ALTER TABLE public.user_daily_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see and modify their own entries
CREATE POLICY "Users can view their own daily tracking entries"
    ON public.user_daily_tracking
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily tracking entries"
    ON public.user_daily_tracking
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily tracking entries"
    ON public.user_daily_tracking
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily tracking entries"
    ON public.user_daily_tracking
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.user_daily_tracking IS 'Stores daily mood, sleep, and stress tracking data (1-10 scale) for users';

