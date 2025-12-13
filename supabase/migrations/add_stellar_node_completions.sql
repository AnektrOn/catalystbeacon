-- Migration: Add user_stellar_node_completions table
-- Purpose: Track which stellar map nodes users have completed to prevent duplicate XP rewards

-- Create completion tracking table
CREATE TABLE IF NOT EXISTS user_stellar_node_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES stellar_map_nodes(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    xp_awarded INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, node_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stellar_completions_user_id ON user_stellar_node_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stellar_completions_node_id ON user_stellar_node_completions(node_id);
CREATE INDEX IF NOT EXISTS idx_user_stellar_completions_user_node ON user_stellar_node_completions(user_id, node_id);

-- Enable Row Level Security
ALTER TABLE user_stellar_node_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own completions
DROP POLICY IF EXISTS "user_stellar_completions_select_own" ON user_stellar_node_completions;
CREATE POLICY "user_stellar_completions_select_own" ON user_stellar_node_completions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own completions
DROP POLICY IF EXISTS "user_stellar_completions_insert_own" ON user_stellar_node_completions;
CREATE POLICY "user_stellar_completions_insert_own" ON user_stellar_node_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete their completions (immutable records)
-- This prevents tampering with completion history

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stellar_completion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_stellar_completions_updated_at ON user_stellar_node_completions;
CREATE TRIGGER update_user_stellar_completions_updated_at
    BEFORE UPDATE ON user_stellar_node_completions
    FOR EACH ROW
    EXECUTE FUNCTION update_stellar_completion_updated_at();
