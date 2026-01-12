-- ============================================
-- SUPABASE DATABASE TRIGGERS FOR EMAIL NOTIFICATIONS
-- ============================================
-- These triggers call N8N webhooks when specific events occur
-- Make sure to enable pg_net extension: CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- 1. LEVEL UP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION notify_level_up()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
BEGIN
  -- Only trigger if level actually increased
  IF NEW.level > OLD.level THEN
    -- Get user email and name
    SELECT email, raw_user_meta_data->>'full_name' INTO user_email, user_name
    FROM auth.users
    WHERE id = NEW.id;
    
    -- Call N8N webhook
    PERFORM net.http_post(
      url := n8n_webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'emailType', 'level-up',
        'email', user_email,
        'userName', COALESCE(user_name, 'there'),
        'oldLevel', OLD.level,
        'newLevel', NEW.level,
        'totalXP', NEW.current_xp
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_level_up ON profiles;
CREATE TRIGGER trigger_level_up
  AFTER UPDATE OF level ON profiles
  FOR EACH ROW
  WHEN (NEW.level > OLD.level)
  EXECUTE FUNCTION notify_level_up();

-- ============================================
-- 2. ACHIEVEMENT/BADGE UNLOCKED TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION notify_achievement_unlocked()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  badge_data RECORD;
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
BEGIN
  -- Get badge information
  SELECT title, description, badge_image_url, xp_reward, category
  INTO badge_data
  FROM badges
  WHERE id = NEW.badge_id;
  
  -- Get user email and name
  SELECT email, raw_user_meta_data->>'full_name' INTO user_email, user_name
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Call N8N webhook
  PERFORM net.http_post(
    url := n8n_webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'emailType', 'achievement-unlocked',
      'email', user_email,
      'userName', COALESCE(user_name, 'there'),
      'badgeTitle', badge_data.title,
      'badgeDescription', badge_data.description,
      'badgeImageUrl', badge_data.badge_image_url,
      'xpReward', badge_data.xp_reward,
      'category', badge_data.category
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_achievement_unlocked ON user_badges;
CREATE TRIGGER trigger_achievement_unlocked
  AFTER INSERT ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_unlocked();

-- ============================================
-- 3. LESSON COMPLETED TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION notify_lesson_completed()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  lesson_data RECORD;
  course_data RECORD;
  xp_earned INT;
  total_xp INT;
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
BEGIN
  -- Only trigger when lesson is marked as completed
  IF NEW.is_completed = TRUE AND (OLD.is_completed IS NULL OR OLD.is_completed = FALSE) THEN
    -- Get lesson information
    SELECT title INTO lesson_data
    FROM lessons
    WHERE course_id = NEW.course_id
      AND chapter_number = NEW.chapter_number
      AND lesson_number = NEW.lesson_number;
    
    -- Get course information
    SELECT title INTO course_data
    FROM courses
    WHERE id = NEW.course_id;
    
    -- Get XP earned from xp_logs (most recent for this lesson)
    SELECT xp_earned INTO xp_earned
    FROM xp_logs
    WHERE user_id = NEW.user_id
      AND source_type = 'lesson_completion'
      AND source_id::text = (NEW.course_id || '-' || NEW.chapter_number || '-' || NEW.lesson_number)
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Get total XP from profile
    SELECT current_xp INTO total_xp
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Get user email and name
    SELECT email, raw_user_meta_data->>'full_name' INTO user_email, user_name
    FROM auth.users
    WHERE id = NEW.user_id;
    
    -- Call N8N webhook
    PERFORM net.http_post(
      url := n8n_webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'emailType', 'lesson-completed',
        'email', user_email,
        'userName', COALESCE(user_name, 'there'),
        'lessonTitle', COALESCE(lesson_data.title, 'Lesson'),
        'courseName', COALESCE(course_data.title, 'Course'),
        'xpEarned', COALESCE(xp_earned, 0),
        'totalXP', COALESCE(total_xp, 0)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_lesson_completed ON user_lesson_progress;
CREATE TRIGGER trigger_lesson_completed
  AFTER UPDATE OF is_completed ON user_lesson_progress
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND (OLD.is_completed IS NULL OR OLD.is_completed = FALSE))
  EXECUTE FUNCTION notify_lesson_completed();

-- ============================================
-- 4. XP MILESTONE TRIGGER (1000, 5000, 10000, etc.)
-- ============================================
CREATE OR REPLACE FUNCTION notify_xp_milestone()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  milestones INT[] := ARRAY[1000, 5000, 10000, 25000, 50000, 100000];
  milestone INT;
  old_milestone INT;
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
BEGIN
  -- Check if XP crossed a milestone
  FOREACH milestone IN ARRAY milestones
  LOOP
    -- Check if we crossed this milestone
    IF OLD.current_xp < milestone AND NEW.current_xp >= milestone THEN
      -- Get user email and name
      SELECT email, raw_user_meta_data->>'full_name' INTO user_email, user_name
      FROM auth.users
      WHERE id = NEW.id;
      
      -- Call N8N webhook
      PERFORM net.http_post(
        url := n8n_webhook_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
          'emailType', 'xp-milestone',
          'email', user_email,
          'userName', COALESCE(user_name, 'there'),
          'milestoneXP', milestone,
          'totalXP', NEW.current_xp
        )
      );
      
      -- Only send one email per update (first milestone crossed)
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_xp_milestone ON profiles;
CREATE TRIGGER trigger_xp_milestone
  AFTER UPDATE OF current_xp ON profiles
  FOR EACH ROW
  WHEN (NEW.current_xp > OLD.current_xp)
  EXECUTE FUNCTION notify_xp_milestone();

-- ============================================
-- 5. STREAK MILESTONE TRIGGER (7, 30, 100, 365 days)
-- ============================================
CREATE OR REPLACE FUNCTION notify_streak_milestone()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  milestones INT[] := ARRAY[7, 30, 100, 365];
  milestone INT;
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
BEGIN
  -- Check if streak reached a milestone
  FOREACH milestone IN ARRAY milestones
  LOOP
    IF NEW.completion_streak = milestone THEN
      -- Get user email and name
      SELECT email, raw_user_meta_data->>'full_name' INTO user_email, user_name
      FROM auth.users
      WHERE id = NEW.id;
      
      -- Call N8N webhook
      PERFORM net.http_post(
        url := n8n_webhook_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
          'emailType', 'streak-milestone',
          'email', user_email,
          'userName', COALESCE(user_name, 'there'),
          'streakDays', milestone,
          'totalDays', NEW.completion_streak
        )
      );
      
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_streak_milestone ON profiles;
CREATE TRIGGER trigger_streak_milestone
  AFTER UPDATE OF completion_streak ON profiles
  FOR EACH ROW
  WHEN (NEW.completion_streak > OLD.completion_streak)
  EXECUTE FUNCTION notify_streak_milestone();

-- ============================================
-- NOTES:
-- ============================================
-- 1. Replace 'https://n8n.yourdomain.com/webhook/send-email' with your actual N8N webhook URL
-- 2. Make sure pg_net extension is enabled: CREATE EXTENSION IF NOT EXISTS pg_net;
-- 3. Test triggers in development before deploying to production
-- 4. Monitor webhook calls to ensure they're working correctly
-- 5. Consider adding error handling and retry logic for webhook failures
