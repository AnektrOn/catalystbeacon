-- ============================================
-- Fix 42702 "column reference is_completed is ambiguous"
-- Run this entire file in Supabase Dashboard → SQL Editor → New query → Run
-- ============================================

DROP FUNCTION IF EXISTS generate_roadmap_nodes(UUID, TEXT, INT);

CREATE OR REPLACE FUNCTION generate_roadmap_nodes(
  p_user_id UUID,
  p_masterschool TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  lesson_id TEXT,
  course_id INT,
  chapter_number INT,
  lesson_number INT,
  lesson_title TEXT,
  difficulty_numeric INT,
  is_completed BOOLEAN,
  school_name TEXT,
  course_title TEXT
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_institute_priority TEXT[];
  v_institute_index INT;
  v_institute_name TEXT;
  v_first_incomplete_index INT;
BEGIN
  SELECT p.institute_priority INTO v_institute_priority
  FROM profiles p
  WHERE p.id = p_user_id;

  IF v_institute_priority IS NULL OR array_length(v_institute_priority, 1) IS NULL THEN
    RETURN;
  END IF;

  CREATE TEMP TABLE temp_roadmap_lessons (
    lesson_id TEXT,
    course_id INT,
    chapter_number INT,
    lesson_number INT,
    lesson_title TEXT,
    difficulty_numeric INT,
    is_completed BOOLEAN,
    school_name TEXT,
    course_title TEXT,
    sort_key BIGINT
  ) ON COMMIT DROP;

  FOR v_institute_index IN 1..array_length(v_institute_priority, 1) LOOP
    v_institute_name := v_institute_priority[v_institute_index];

    INSERT INTO temp_roadmap_lessons (
      lesson_id, course_id, chapter_number, lesson_number,
      lesson_title, difficulty_numeric, is_completed, school_name, course_title, sort_key
    )
    SELECT
      (cc.course_id::text || '-' || cc.chapter_number::text || '-' || cc.lesson_number::text),
      cc.course_id,
      cc.chapter_number,
      cc.lesson_number,
      COALESCE(cc.lesson_title, 'Lesson'),
      COALESCE(cm.difficulty_numeric, 5),
      COALESCE(ulp.is_completed, false),
      cm.school_name,
      COALESCE(cm.course_title, 'Unknown Course'),
      (v_institute_index::BIGINT * 1000000) + (cc.lesson_number::BIGINT * 10000) + (cc.chapter_number::BIGINT * 100) + (cc.course_id::BIGINT)
    FROM course_metadata cm
    INNER JOIN course_content cc ON cc.course_id = cm.course_id
    LEFT JOIN user_lesson_progress ulp
      ON ulp.user_id = p_user_id AND ulp.course_id = cc.course_id
     AND ulp.chapter_number = cc.chapter_number AND ulp.lesson_number = cc.lesson_number
    WHERE cm.masterschool = p_masterschool AND cm.status = 'published'
      AND cm.school_name = v_institute_name
      AND cm.course_id IN (SELECT DISTINCT cs.course_id FROM public.course_structure cs);
  END LOOP;

  -- Qualified refs only: avoid "is_completed" / "sort_key" ambiguous with RETURNS TABLE
  SELECT MIN(ranked.row_num) INTO v_first_incomplete_index
  FROM (
    SELECT
      ROW_NUMBER() OVER (ORDER BY t.sort_key) as row_num,
      t.is_completed
    FROM temp_roadmap_lessons t
  ) ranked
  WHERE NOT ranked.is_completed;

  IF v_first_incomplete_index IS NULL THEN
    v_first_incomplete_index := 1;
  END IF;

  RETURN QUERY
  SELECT
    trl.lesson_id,
    (trl.course_id)::INT,
    (trl.chapter_number)::INT,
    (trl.lesson_number)::INT,
    trl.lesson_title,
    (trl.difficulty_numeric)::INT,
    trl.is_completed,
    trl.school_name,
    trl.course_title
  FROM (
    SELECT
      t.lesson_id,
      t.course_id,
      t.chapter_number,
      t.lesson_number,
      t.lesson_title,
      t.difficulty_numeric,
      t.is_completed,
      t.school_name,
      t.course_title,
      t.sort_key,
      ROW_NUMBER() OVER (ORDER BY t.sort_key) as row_num
    FROM temp_roadmap_lessons t
  ) trl
  WHERE trl.row_num >= v_first_incomplete_index
  ORDER BY trl.sort_key
  LIMIT p_limit;

  DROP TABLE IF EXISTS temp_roadmap_lessons;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_roadmap_nodes(UUID, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_roadmap_nodes(UUID, TEXT, INT) TO anon;
