-- ============================================
-- Persist virtual lesson completion so roadmap state is correct "whatever the link"
-- Garde les IDs négatifs tels quels en base (PostgreSQL INT les accepte).
-- ============================================

CREATE OR REPLACE FUNCTION upsert_lesson_completed(
  p_user_id UUID,
  p_course_id INT,
  p_chapter_number INT,
  p_lesson_number INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INT;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: can only update own progress';
  END IF;

  UPDATE user_lesson_progress
  SET is_completed = true,
      can_complete = true,
      completed_at = COALESCE(completed_at, NOW())
  WHERE user_id = p_user_id
    AND course_id = p_course_id
    AND chapter_number = p_chapter_number
    AND lesson_number = p_lesson_number;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    INSERT INTO user_lesson_progress (
      user_id, course_id, chapter_number, lesson_number,
      is_completed, can_complete, completed_at
    )
    VALUES (
      p_user_id, p_course_id, p_chapter_number, p_lesson_number,
      true, true, NOW()
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION upsert_lesson_completed(UUID, INT, INT, INT) IS
  'Marks a lesson as completed (update or insert). Used for virtual courses so progress is persisted and roadmap shows correct state on any URL.';

-- Allow authenticated users to call this function (required - SECURITY DEFINER does not grant execute)
GRANT EXECUTE ON FUNCTION upsert_lesson_completed(UUID, INT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_lesson_completed(UUID, INT, INT, INT) TO anon;
