-- ============================================
-- get_user_roadmap_details RPC
-- ============================================
-- WHY: The new roadmap flow uses this RPC to show lessons with is_completed.
-- BUG: If is_completed is derived only from roadmap_progress.lessons_completed,
--      users who already had progress (stored in user_lesson_progress only, or
--      in a different format in roadmap_progress) see no completion and the
--      roadmap appears broken (empty or wrong "active" lesson).
-- FIX: Derive is_completed from user_lesson_progress (canonical source). That
--      way any user who completed lessons via the app sees them as completed.
-- ============================================

DROP FUNCTION IF EXISTS get_user_roadmap_details(UUID, TEXT);

CREATE OR REPLACE FUNCTION get_user_roadmap_details(
  p_user_id UUID,
  p_masterschool TEXT
)
RETURNS TABLE (
  lesson_id TEXT,
  course_id INT,
  chapter_number INT,
  lesson_number INT,
  lesson_title TEXT,
  difficulty_numeric INT,
  is_completed BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (cc.course_id::text || '-' || cc.chapter_number::text || '-' || cc.lesson_number::text) AS lesson_id,
    cc.course_id,
    cc.chapter_number,
    cc.lesson_number,
    COALESCE(cc.lesson_title, 'Lesson') AS lesson_title,
    COALESCE(cm.difficulty_numeric, 5) AS difficulty_numeric,
    COALESCE(ulp.is_completed, false) AS is_completed
  FROM course_metadata cm
  INNER JOIN course_content cc
    ON cc.course_id = cm.course_id
  LEFT JOIN user_lesson_progress ulp
    ON ulp.user_id = p_user_id
   AND ulp.course_id = cc.course_id
   AND ulp.chapter_number = cc.chapter_number
   AND ulp.lesson_number = cc.lesson_number
  WHERE cm.masterschool = p_masterschool
    AND cm.status = 'published'
    AND cm.course_id IN (SELECT DISTINCT course_id FROM public.course_structure)
  ORDER BY COALESCE(cm.xp_threshold, 0) ASC, cm.course_id, cc.chapter_number, cc.lesson_number;
$$;

COMMENT ON FUNCTION get_user_roadmap_details(UUID, TEXT) IS
  'Returns roadmap lessons for a masterschool with is_completed from user_lesson_progress (canonical source). Fixes roadmap for users who had progress before the new flow.';

-- Rendre l’RPC appelable par les rôles authentifiés et anon (pour le front)
GRANT EXECUTE ON FUNCTION get_user_roadmap_details(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_roadmap_details(UUID, TEXT) TO anon;
