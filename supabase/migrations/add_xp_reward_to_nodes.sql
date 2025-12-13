-- Migration: Add xp_reward column to stellar_map_nodes table
-- Purpose: Store explicit XP reward amount for each node (optional enhancement)

-- Add xp_reward column with default value
ALTER TABLE stellar_map_nodes 
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 50;

-- Add comment to document the column
COMMENT ON COLUMN stellar_map_nodes.xp_reward IS 'XP amount awarded when user completes this node (default: 50)';

-- Update existing nodes to have default XP reward if metadata doesn't specify
-- This is a one-time migration for existing data
UPDATE stellar_map_nodes
SET xp_reward = COALESCE(
    (metadata->>'xp_reward')::INTEGER,
    50
)
WHERE xp_reward IS NULL OR xp_reward = 50;
