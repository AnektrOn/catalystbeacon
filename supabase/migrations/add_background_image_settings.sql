-- Add background image settings columns to profiles table
-- These columns allow users to customize how their background image is displayed

-- Add background_fit column (cover, contain, auto, 100% 100%)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS background_fit TEXT DEFAULT 'cover';

-- Add background_position column (center, top, bottom, left, right, etc.)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS background_position TEXT DEFAULT 'center';

-- Add background_zoom column (50-200, represents percentage)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS background_zoom INTEGER DEFAULT 100;

-- Add comments for documentation
COMMENT ON COLUMN profiles.background_fit IS 'How the background image should fit: cover, contain, auto, or 100% 100%';
COMMENT ON COLUMN profiles.background_position IS 'Where to position the background image: center, top, bottom, left, right, or corner positions';
COMMENT ON COLUMN profiles.background_zoom IS 'Zoom level for background image (50-200, where 100 is normal size)';

