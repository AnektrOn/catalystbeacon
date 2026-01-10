-- Add onboarding completion flag to profiles table
-- This ensures onboarding modal shows reliably even if URL params are lost

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(has_completed_onboarding);

-- Add comment
COMMENT ON COLUMN profiles.has_completed_onboarding IS 'Whether user has completed the initial onboarding flow';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when onboarding was completed';
