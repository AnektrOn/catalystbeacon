CREATE OR REPLACE FUNCTION complete_lesson_transaction(
  p_user_id UUID,
  p_lesson_id TEXT,
  p_course_id INT,
  p_chapter_number INT,
  p_lesson_number INT,
  p_masterschool TEXT,
  p_lesson_title TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  xp_earned INT
) AS $$
DECLARE
  v_can_complete BOOLEAN;
  v_is_completed BOOLEAN;
  v_xp_reward INT;
  v_difficulty_numeric INT;
BEGIN
  -- Check if requirements are met
  SELECT can_complete, is_completed INTO v_can_complete, v_is_completed
  FROM user_lesson_progress
  WHERE user_id = p_user_id
    AND course_id = p_course_id
    AND chapter_number = p_chapter_number
    and lesson_number = p_lesson_number;

  -- If already completed, return early
  IF v_is_completed THEN
    RETURN QUERY SELECT true, 'Lesson already completed', 0;
    RETURN;
  END IF;

  -- Check if can complete
  IF NOT v_can_complete THEN
    RETURN QUERY SELECT false, 'Requirements not met. Please spend at least 2 minutes and scroll to the end of the lesson.', 0;
    RETURN;
  END IF;

  -- Get difficulty_numeric to calculate XP
  SELECT difficulty_numeric INTO v_difficulty_numeric
  FROM course_metadata
  WHERE course_id = p_course_id;
  
  v_xp_reward := v_difficulty_numeric * 10;

  -- Award XP
  UPDATE profiles
  SET current_xp = current_xp + v_xp_reward,
      total_xp_earned = total_xp_earned + v_xp_reward
  WHERE id = p_user_id;

  -- Update roadmap progress (optional: table/function may not exist in all envs)
  BEGIN
    PERFORM update_roadmap_progress(
      p_user_id,
      p_masterschool,
      p_lesson_id,
      p_lesson_title,
      p_course_id,
      p_chapter_number,
      p_lesson_number
    );
  EXCEPTION WHEN OTHERS THEN
    -- Don't fail the whole transaction if roadmap_progress is missing or errors
    NULL;
  END;

  -- Mark lesson as completed (source of truth for roadmap "completed" and next node)
  UPDATE user_lesson_progress
  SET is_completed = true,
      completed_at = NOW()
  WHERE user_id = p_user_id
    AND course_id = p_course_id
    AND chapter_number = p_chapter_number
    AND lesson_number = p_lesson_number;

  RETURN QUERY SELECT true, 'Lesson completed successfully!', v_xp_reward;
END;
$$ LANGUAGE plpgsql;
