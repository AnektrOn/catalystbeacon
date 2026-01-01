-- =====================================================
-- ROADMAP SYSTEM MIGRATION
-- =====================================================
-- This migration creates the roadmap system for Ignition, Insight, and Transformation
-- It includes: roadmap_progress, roadmap_notifications, and enhances user_lesson_progress

-- =====================================================
-- 1. STANDARDIZE DIFFICULTY LEVELS
-- =====================================================
-- Add a numeric difficulty field to course_metadata
ALTER TABLE course_metadata 
ADD COLUMN IF NOT EXISTS difficulty_numeric INTEGER DEFAULT 5 CHECK (difficulty_numeric >= 1 AND difficulty_numeric <= 10);

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_course_metadata_difficulty_numeric ON course_metadata(difficulty_numeric);
CREATE INDEX IF NOT EXISTS idx_course_metadata_masterschool ON course_metadata(masterschool);
CREATE INDEX IF NOT EXISTS idx_course_metadata_masterschool_difficulty ON course_metadata(masterschool, difficulty_numeric);

-- Update existing difficulty levels to numeric (mapping common text values)
UPDATE course_metadata 
SET difficulty_numeric = CASE 
  WHEN LOWER(difficulty_level) IN ('beginner', 'easy', 'basic') THEN 2
  WHEN LOWER(difficulty_level) IN ('intermediate', 'medium', 'moderate') THEN 5
  WHEN LOWER(difficulty_level) IN ('advanced', 'hard', 'difficult') THEN 8
  WHEN LOWER(difficulty_level) IN ('expert', 'master', 'very hard') THEN 10
  ELSE 5
END
WHERE difficulty_numeric IS NULL OR difficulty_numeric = 5;

COMMENT ON COLUMN course_metadata.difficulty_numeric IS 'Numeric difficulty level (1-10) for roadmap sorting';

-- =====================================================
-- 2. CREATE ROADMAP_PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  masterschool TEXT NOT NULL CHECK (masterschool IN ('Ignition', 'Insight', 'Transformation')),
  current_lesson_id TEXT,
  lessons_completed JSONB DEFAULT '[]'::jsonb,
  total_lessons_completed INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, masterschool)
);

-- Create indexes for roadmap_progress
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_id ON roadmap_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_masterschool ON roadmap_progress(masterschool);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_masterschool ON roadmap_progress(user_id, masterschool);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_lessons_completed ON roadmap_progress USING gin(lessons_completed);

-- Enable RLS
ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roadmap_progress
DROP POLICY IF EXISTS "Users can view their own roadmap progress" ON roadmap_progress;
CREATE POLICY "Users can view their own roadmap progress" ON roadmap_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own roadmap progress" ON roadmap_progress;
CREATE POLICY "Users can insert their own roadmap progress" ON roadmap_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own roadmap progress" ON roadmap_progress;
CREATE POLICY "Users can update their own roadmap progress" ON roadmap_progress
  FOR UPDATE USING (auth.uid() = user_id);

COMMENT ON TABLE roadmap_progress IS 'Tracks user progress through masterschool roadmaps';
COMMENT ON COLUMN roadmap_progress.lessons_completed IS 'JSONB array of completed lesson objects with timestamps and details';

-- =====================================================
-- 3. CREATE ROADMAP_NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS roadmap_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  masterschool TEXT NOT NULL CHECK (masterschool IN ('Ignition', 'Insight', 'Transformation')),
  message TEXT NOT NULL,
  lessons_added JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT false,
  notification_type TEXT DEFAULT 'lessons_added' CHECK (notification_type IN ('lessons_added', 'roadmap_update', 'difficulty_changed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for roadmap_notifications
CREATE INDEX IF NOT EXISTS idx_roadmap_notifications_user_id ON roadmap_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_notifications_masterschool ON roadmap_notifications(masterschool);
CREATE INDEX IF NOT EXISTS idx_roadmap_notifications_is_read ON roadmap_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_roadmap_notifications_user_unread ON roadmap_notifications(user_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE roadmap_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roadmap_notifications
DROP POLICY IF EXISTS "Users can view their own roadmap notifications" ON roadmap_notifications;
CREATE POLICY "Users can view their own roadmap notifications" ON roadmap_notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own roadmap notifications" ON roadmap_notifications;
CREATE POLICY "Users can update their own roadmap notifications" ON roadmap_notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert roadmap notifications" ON roadmap_notifications;
CREATE POLICY "System can insert roadmap notifications" ON roadmap_notifications
  FOR INSERT WITH CHECK (true);

COMMENT ON TABLE roadmap_notifications IS 'Notifications for roadmap changes and new lessons';
COMMENT ON COLUMN roadmap_notifications.lessons_added IS 'JSONB array of new lesson details';

-- =====================================================
-- 4. ENHANCE USER_LESSON_PROGRESS TABLE
-- =====================================================
-- Add new columns for tracking
ALTER TABLE user_lesson_progress 
ADD COLUMN IF NOT EXISTS scroll_percentage INTEGER DEFAULT 0 CHECK (scroll_percentage >= 0 AND scroll_percentage <= 100);

ALTER TABLE user_lesson_progress 
ADD COLUMN IF NOT EXISTS minimum_time_met BOOLEAN DEFAULT false;

ALTER TABLE user_lesson_progress 
ADD COLUMN IF NOT EXISTS can_complete BOOLEAN DEFAULT false;

ALTER TABLE user_lesson_progress 
ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

ALTER TABLE user_lesson_progress 
ADD COLUMN IF NOT EXISTS skills_earned JSONB DEFAULT '{}'::jsonb;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_can_complete ON user_lesson_progress(can_complete);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_course ON user_lesson_progress(user_id, course_id);

COMMENT ON COLUMN user_lesson_progress.scroll_percentage IS 'Percentage of lesson scrolled (0-100)';
COMMENT ON COLUMN user_lesson_progress.minimum_time_met IS 'Whether user spent minimum 5 minutes on lesson';
COMMENT ON COLUMN user_lesson_progress.can_complete IS 'Whether lesson can be completed (time + scroll requirements met)';
COMMENT ON COLUMN user_lesson_progress.xp_earned IS 'XP earned from completing this lesson';
COMMENT ON COLUMN user_lesson_progress.skills_earned IS 'Skill points earned from this lesson';

-- =====================================================
-- 5. CREATE FUNCTION TO AWARD ROADMAP LESSON XP
-- =====================================================
CREATE OR REPLACE FUNCTION award_roadmap_lesson_xp(
  p_user_id UUID,
  p_lesson_id TEXT,
  p_course_id INTEGER,
  p_chapter_number SMALLINT,
  p_lesson_number SMALLINT
)
RETURNS JSONB AS $$
DECLARE
  v_difficulty INTEGER;
  v_xp_amount INTEGER;
  v_stats_linked TEXT[];
  v_skill_points INTEGER := 1;
  v_result JSONB;
  v_skill_name TEXT;
  v_skill_id UUID;
BEGIN
  -- Get difficulty and stats from course_metadata
  SELECT difficulty_numeric, stats_linked
  INTO v_difficulty, v_stats_linked
  FROM course_metadata
  WHERE course_id = p_course_id;

  -- Calculate XP: 10 XP per difficulty level
  v_xp_amount := COALESCE(v_difficulty, 5) * 10;

  -- Update user XP
  UPDATE profiles
  SET 
    total_xp_earned = total_xp_earned + v_xp_amount,
    current_xp = current_xp + v_xp_amount
  WHERE id = p_user_id;

  -- Create XP transaction
  INSERT INTO xp_transactions (user_id, amount, source, description)
  VALUES (
    p_user_id,
    v_xp_amount,
    'roadmap_lesson',
    'Completed lesson ' || p_lesson_id
  );

  -- Award skill points for each linked stat
  IF v_stats_linked IS NOT NULL AND array_length(v_stats_linked, 1) > 0 THEN
    FOREACH v_skill_name IN ARRAY v_stats_linked
    LOOP
      -- Get skill ID from name
      SELECT id INTO v_skill_id
      FROM skills
      WHERE name = v_skill_name OR display_name = v_skill_name
      LIMIT 1;

      IF v_skill_id IS NOT NULL THEN
        -- Update or insert user skill
        INSERT INTO user_skills (user_id, skill_id, current_value, points_earned)
        VALUES (p_user_id, v_skill_id, v_skill_points, v_skill_points)
        ON CONFLICT (user_id, skill_id) 
        DO UPDATE SET 
          current_value = user_skills.current_value + v_skill_points,
          points_earned = user_skills.points_earned + v_skill_points,
          last_awarded_at = NOW();
      END IF;
    END LOOP;
  END IF;

  -- Update lesson progress
  UPDATE user_lesson_progress
  SET 
    is_completed = true,
    completed_at = NOW(),
    xp_earned = v_xp_amount,
    skills_earned = jsonb_build_object('stats', v_stats_linked, 'points', v_skill_points),
    updated_at = NOW()
  WHERE user_id = p_user_id 
    AND course_id = p_course_id 
    AND chapter_number = p_chapter_number 
    AND lesson_number = p_lesson_number;

  -- Build result
  v_result := jsonb_build_object(
    'xp_earned', v_xp_amount,
    'skills_earned', v_stats_linked,
    'skill_points', v_skill_points,
    'difficulty', v_difficulty
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_roadmap_lesson_xp IS 'Awards XP and skill points for completing a roadmap lesson';

-- =====================================================
-- 6. CREATE FUNCTION TO UPDATE ROADMAP PROGRESS
-- =====================================================
CREATE OR REPLACE FUNCTION update_roadmap_progress(
  p_user_id UUID,
  p_masterschool TEXT,
  p_lesson_id TEXT,
  p_lesson_title TEXT,
  p_course_id INTEGER,
  p_chapter_number SMALLINT,
  p_lesson_number SMALLINT
)
RETURNS VOID AS $$
DECLARE
  v_lesson_obj JSONB;
BEGIN
  -- Build lesson completion object
  v_lesson_obj := jsonb_build_object(
    'lesson_id', p_lesson_id,
    'lesson_title', p_lesson_title,
    'course_id', p_course_id,
    'chapter_number', p_chapter_number,
    'lesson_number', p_lesson_number,
    'completed_at', NOW()
  );

  -- Insert or update roadmap progress
  INSERT INTO roadmap_progress (user_id, masterschool, current_lesson_id, lessons_completed, total_lessons_completed)
  VALUES (
    p_user_id,
    p_masterschool,
    p_lesson_id,
    jsonb_build_array(v_lesson_obj),
    1
  )
  ON CONFLICT (user_id, masterschool)
  DO UPDATE SET
    current_lesson_id = p_lesson_id,
    lessons_completed = roadmap_progress.lessons_completed || v_lesson_obj,
    total_lessons_completed = roadmap_progress.total_lessons_completed + 1,
    last_accessed_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_roadmap_progress IS 'Updates user roadmap progress when a lesson is completed';

-- =====================================================
-- 7. CREATE VIEW FOR ROADMAP LESSONS
-- =====================================================
CREATE OR REPLACE VIEW roadmap_lessons AS
SELECT 
  cm.course_id,
  cm.course_title,
  cm.masterschool,
  cm.difficulty_numeric,
  cm.stats_linked,
  cc.lesson_id,
  cc.lesson_title,
  cc.chapter_number,
  cc.lesson_number,
  cc.chapter_id,
  cm.xp_threshold as course_xp_threshold,
  (cm.difficulty_numeric * 10) as lesson_xp_reward
FROM course_metadata cm
JOIN course_content cc ON cm.course_id = cc.course_id
WHERE cm.status = 'published'
  AND cm.masterschool IN ('Ignition', 'Insight', 'Transformation')
ORDER BY cm.masterschool, cm.difficulty_numeric, cm.course_id, cc.chapter_number, cc.lesson_number;

COMMENT ON VIEW roadmap_lessons IS 'View of all lessons available in roadmaps, sorted by masterschool and difficulty';

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================
-- Grant access to authenticated users
GRANT SELECT ON roadmap_lessons TO authenticated;
GRANT EXECUTE ON FUNCTION award_roadmap_lesson_xp TO authenticated;
GRANT EXECUTE ON FUNCTION update_roadmap_progress TO authenticated;

