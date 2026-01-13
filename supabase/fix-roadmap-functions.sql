-- ============================================
-- FIX ROADMAP FUNCTIONS - Replace "lessons" table references
-- ============================================
-- These functions are used by roadmapService.js to complete lessons
-- They must use course_content instead of the non-existent "lessons" table

-- ============================================
-- 1. DROP ALL EXISTING VERSIONS OF award_roadmap_lesson_xp
-- ============================================
-- This removes any ambiguity between INTEGER and SMALLINT versions
DROP FUNCTION IF EXISTS award_roadmap_lesson_xp(UUID, TEXT, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS award_roadmap_lesson_xp(UUID, TEXT, INTEGER, SMALLINT, SMALLINT);
DROP FUNCTION IF EXISTS award_roadmap_lesson_xp(UUID, TEXT, INTEGER, SMALLINT, INTEGER);
DROP FUNCTION IF EXISTS award_roadmap_lesson_xp(UUID, TEXT, INTEGER, INTEGER, SMALLINT);

-- ============================================
-- 2. CREATE award_roadmap_lesson_xp FUNCTION
-- ============================================
-- Using INTEGER for chapter_number and lesson_number to match JavaScript number type
CREATE OR REPLACE FUNCTION award_roadmap_lesson_xp(
  p_user_id UUID,
  p_lesson_id TEXT,
  p_course_id INTEGER,
  p_chapter_number INTEGER,
  p_lesson_number INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_xp_reward INTEGER;
  v_lesson_title TEXT;
  v_xp_earned INTEGER;
  v_difficulty_numeric INTEGER;
  v_stats_linked TEXT[];
  v_skill_id TEXT;
  v_skill_uuid UUID;
  v_skill_points_per_skill NUMERIC := 0.1;
  v_total_skill_points NUMERIC := 0;
  v_skills_earned JSONB := '[]'::jsonb;
  v_existing_skill RECORD;
  v_new_value NUMERIC;
BEGIN
  -- Get lesson title from course_content table
  SELECT lesson_title
  INTO v_lesson_title
  FROM course_content
  WHERE course_id = p_course_id
    AND chapter_number = p_chapter_number
    AND lesson_number = p_lesson_number
  LIMIT 1;

  -- Get course difficulty and stats_linked from course_metadata
  -- stats_linked is a TEXT[] array, not JSONB
  SELECT COALESCE(difficulty_numeric, 5), COALESCE(stats_linked, ARRAY[]::TEXT[])
  INTO v_difficulty_numeric, v_stats_linked
  FROM course_metadata
  WHERE course_id = p_course_id
  LIMIT 1;

  -- Calculate XP reward: difficulty * 10, default to 50 if difficulty not found
  IF v_difficulty_numeric IS NULL THEN
    v_difficulty_numeric := 5;
  END IF;
  
  v_xp_reward := v_difficulty_numeric * 10;

  -- Award XP directly to user profile
  UPDATE profiles
  SET 
    current_xp = COALESCE(current_xp, 0) + v_xp_reward,
    total_xp_earned = COALESCE(total_xp_earned, 0) + v_xp_reward
  WHERE id = p_user_id;
  
  v_xp_earned := v_xp_reward;

  -- Award 0.1 skill points to each skill linked to the course
  -- stats_linked is a TEXT[] array that can contain either skill UUIDs or skill names
  IF v_stats_linked IS NOT NULL AND array_length(v_stats_linked, 1) > 0 THEN
    -- Loop through each skill identifier in stats_linked
    FOR v_skill_id IN SELECT unnest(v_stats_linked)
    LOOP
      -- Try to determine if v_skill_id is a UUID or a skill name
      -- First, try to find skill by UUID
      BEGIN
        v_skill_uuid := v_skill_id::UUID;
      EXCEPTION WHEN OTHERS THEN
        -- If casting to UUID fails, it's a skill name - look it up
        SELECT id INTO v_skill_uuid
        FROM skills
        WHERE name = v_skill_id OR display_name = v_skill_id
        LIMIT 1;
        
        -- If still not found, skip this skill
        IF v_skill_uuid IS NULL THEN
          CONTINUE;
        END IF;
      END;

      -- Check if user already has this skill
      SELECT id, current_value
      INTO v_existing_skill
      FROM user_skills
      WHERE user_id = p_user_id
        AND skill_id = v_skill_uuid
      LIMIT 1;

      IF v_existing_skill IS NOT NULL THEN
        -- Update existing skill: add 0.1, cap at 100
        v_new_value := LEAST(100, COALESCE(v_existing_skill.current_value, 0) + v_skill_points_per_skill);
        
        UPDATE user_skills
        SET 
          current_value = v_new_value,
          updated_at = NOW()
        WHERE id = v_existing_skill.id;
      ELSE
        -- Insert new skill record
        INSERT INTO user_skills (user_id, skill_id, current_value)
        VALUES (p_user_id, v_skill_uuid, v_skill_points_per_skill);
      END IF;

      -- Add skill UUID (as text) to skills_earned array
      v_skills_earned := v_skills_earned || jsonb_build_array(v_skill_uuid::TEXT);
      v_total_skill_points := v_total_skill_points + v_skill_points_per_skill;
    END LOOP;
  END IF;

  -- Return result with skill_points and skills_earned
  RETURN jsonb_build_object(
    'xp_earned', COALESCE(v_xp_earned, v_xp_reward),
    'lesson_title', COALESCE(v_lesson_title, 'Lesson'),
    'skill_points', ROUND(v_total_skill_points::numeric, 1),
    'skills_earned', v_skills_earned,
    'success', true
  );
END;
$$;

-- ============================================
-- 3. DROP ALL EXISTING VERSIONS OF update_roadmap_progress
-- ============================================
DROP FUNCTION IF EXISTS update_roadmap_progress(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_roadmap_progress(UUID, TEXT, TEXT, TEXT, INTEGER, SMALLINT, SMALLINT);
DROP FUNCTION IF EXISTS update_roadmap_progress(UUID, TEXT, TEXT, TEXT, INTEGER, SMALLINT, INTEGER);
DROP FUNCTION IF EXISTS update_roadmap_progress(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER, SMALLINT);

-- ============================================
-- 4. CREATE update_roadmap_progress FUNCTION
-- ============================================
-- Using INTEGER for chapter_number and lesson_number to match JavaScript number type
CREATE OR REPLACE FUNCTION update_roadmap_progress(
  p_user_id UUID,
  p_masterschool TEXT,
  p_lesson_id TEXT,
  p_lesson_title TEXT,
  p_course_id INTEGER,
  p_chapter_number INTEGER,
  p_lesson_number INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_progress JSONB;
  v_lessons_completed JSONB;
  v_lesson_data JSONB;
BEGIN
  -- Get existing roadmap progress
  SELECT lessons_completed, current_lesson_id
  INTO v_lessons_completed, v_existing_progress
  FROM roadmap_progress
  WHERE user_id = p_user_id
    AND masterschool = p_masterschool
  LIMIT 1;

  -- Initialize if doesn't exist
  IF v_lessons_completed IS NULL THEN
    v_lessons_completed := '[]'::jsonb;
  END IF;

  -- Create lesson data object
  v_lesson_data := jsonb_build_object(
    'lesson_id', p_lesson_id,
    'lesson_title', p_lesson_title,
    'course_id', p_course_id,
    'chapter_number', p_chapter_number,
    'lesson_number', p_lesson_number,
    'completed_at', NOW()
  );

  -- Check if lesson already in completed list
  IF NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_lessons_completed) AS lesson
    WHERE lesson->>'course_id' = p_course_id::text
      AND lesson->>'chapter_number' = p_chapter_number::text
      AND lesson->>'lesson_number' = p_lesson_number::text
  ) THEN
    -- Add lesson to completed list
    v_lessons_completed := v_lessons_completed || jsonb_build_array(v_lesson_data);
  END IF;

  -- Upsert roadmap progress
  INSERT INTO roadmap_progress (
    user_id,
    masterschool,
    lessons_completed,
    current_lesson_id,
    updated_at
  )
  VALUES (
    p_user_id,
    p_masterschool,
    v_lessons_completed,
    p_lesson_id,
    NOW()
  )
  ON CONFLICT (user_id, masterschool)
  DO UPDATE SET
    lessons_completed = EXCLUDED.lessons_completed,
    current_lesson_id = EXCLUDED.current_lesson_id,
    updated_at = NOW();
END;
$$;

-- ============================================
-- NOTES:
-- ============================================
-- 1. These functions replace references to the non-existent "lessons" table
-- 2. They now use "course_content" table which contains lesson information
-- 3. All existing versions are dropped first to avoid type ambiguity errors
-- 4. Functions use INTEGER type for chapter_number and lesson_number to match JavaScript
-- 5. Run this script in Supabase SQL Editor to update the functions
-- 6. The functions are called by roadmapService.js when completing lessons
