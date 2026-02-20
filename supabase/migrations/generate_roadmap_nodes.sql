-- ============================================
-- generate_roadmap_nodes RPC
-- ============================================
-- Generates roadmap nodes dynamically based on user's institute priority order.
-- Ordering: Institute Priority → Lesson Number → Chapter Number → Course ID
-- Returns only the next p_limit nodes (starting from first incomplete lesson).
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
  -- Get user's institute priority from profiles (qualified to avoid 42702)
  SELECT p.institute_priority INTO v_institute_priority
  FROM profiles p
  WHERE p.id = p_user_id;

  -- If no priority set, return empty result
  IF v_institute_priority IS NULL OR array_length(v_institute_priority, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Create a temporary table to store ordered lessons
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

  -- For each institute in priority order
  FOR v_institute_index IN 1..array_length(v_institute_priority, 1) LOOP
    v_institute_name := v_institute_priority[v_institute_index];

    -- Insert lessons for this institute
    -- Order: Lesson Number → Chapter Number → Course ID
    INSERT INTO temp_roadmap_lessons (
      lesson_id,
      course_id,
      chapter_number,
      lesson_number,
      lesson_title,
      difficulty_numeric,
      is_completed,
      school_name,
      course_title,
      sort_key
    )
    SELECT
      (cc.course_id::text || '-' || cc.chapter_number::text || '-' || cc.lesson_number::text) AS lesson_id,
      cc.course_id,
      cc.chapter_number,
      cc.lesson_number,
      COALESCE(cc.lesson_title, 'Lesson') AS lesson_title,
      COALESCE(cm.difficulty_numeric, 5) AS difficulty_numeric,
      COALESCE(ulp.is_completed, false) AS is_completed,
      cm.school_name,
      COALESCE(cm.course_title, 'Unknown Course') AS course_title,
      -- Create sort key: institute_order * 1000000 + lesson_number * 10000 + chapter_number * 100 + course_id
      -- This ensures: Institute Priority → Lesson Number → Chapter → Course
      (v_institute_index::BIGINT * 1000000) + 
      (cc.lesson_number::BIGINT * 10000) + 
      (cc.chapter_number::BIGINT * 100) + 
      (cc.course_id::BIGINT) AS sort_key
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
      AND cm.school_name = v_institute_name
      AND cm.course_id IN (SELECT DISTINCT cs.course_id FROM public.course_structure cs);

  END LOOP;

  -- Find the first incomplete lesson index (qualify all refs to avoid 42702 vs RETURNS TABLE)
  SELECT MIN(ranked.row_num) INTO v_first_incomplete_index
  FROM (
    SELECT 
      ROW_NUMBER() OVER (ORDER BY t.sort_key) as row_num,
      t.is_completed
    FROM temp_roadmap_lessons t
  ) ranked
  WHERE NOT ranked.is_completed;

  -- If all lessons are completed, start from beginning
  IF v_first_incomplete_index IS NULL THEN
    v_first_incomplete_index := 1;
  END IF;

  -- Return lessons starting from first incomplete, limited to p_limit
  -- All refs qualified to avoid 42702 ambiguous column vs RETURNS TABLE
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

  -- Clean up temp table
  DROP TABLE IF EXISTS temp_roadmap_lessons;

END;
$$;

COMMENT ON FUNCTION generate_roadmap_nodes(UUID, TEXT, INT) IS
  'Generates roadmap nodes dynamically based on user institute priority. Order: Institute Priority → Lesson Number → Chapter → Course. Returns next p_limit nodes starting from first incomplete lesson.';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_roadmap_nodes(UUID, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_roadmap_nodes(UUID, TEXT, INT) TO anon;
