-- =====================================================
-- CREATE MISSING TABLES MIGRATION
-- =====================================================
-- This migration creates the notifications, badges, and user_badges tables
-- that are missing and causing 404 errors in the application

-- =====================================================
-- 1. CREATE NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'error', 'achievement', etc.
  is_read BOOLEAN DEFAULT false,
  link_url TEXT, -- Optional link to related page
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 2. CREATE BADGES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  badge_image_url TEXT,
  category VARCHAR(100), -- e.g., 'milestone', 'streak', 'achievement', 'custom'
  criteria JSONB, -- e.g., {"type": "habits_completed", "count": 10}
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for badges
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_is_active ON badges(is_active);
CREATE INDEX IF NOT EXISTS idx_badges_xp_reward ON badges(xp_reward);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
DROP POLICY IF EXISTS "Badges viewable by everyone" ON badges;
CREATE POLICY "Badges viewable by everyone" ON badges
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage badges" ON badges;
CREATE POLICY "Admins can manage badges" ON badges
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'Admin'
  );

-- =====================================================
-- 3. CREATE USER_BADGES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  awarded_by UUID REFERENCES auth.users(id), -- NULL for automatic, admin ID for manual
  UNIQUE(user_id, badge_id)
);

-- Create indexes for user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_awarded_at ON user_badges(awarded_at DESC);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_badges
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can award badges" ON user_badges;
CREATE POLICY "Admins can award badges" ON user_badges
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'Admin'
  );

-- =====================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE notifications IS 'User notifications for achievements, updates, and system messages';
COMMENT ON TABLE badges IS 'Library of available badges that can be earned';
COMMENT ON TABLE user_badges IS 'Badges earned by users';
COMMENT ON COLUMN badges.criteria IS 'JSON criteria for earning the badge';
COMMENT ON COLUMN badges.category IS 'Badge category: milestone, streak, achievement, custom';
COMMENT ON COLUMN user_badges.awarded_by IS 'NULL for automatic awards, admin ID for manual awards';
