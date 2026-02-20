-- ============================================================
-- À EXÉCUTER DANS LE SQL EDITOR SUPABASE
-- Corrige : leçons virtuelles (course_id négatif) non persistées
-- Garde les IDs négatifs tels quels en base (PostgreSQL INT les accepte).
-- ============================================================

-- 1. upsert_lesson_completed : utilise course_id tel quel (pas de conversion)
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
  SET is_completed = true, can_complete = true,
      completed_at = COALESCE(completed_at, NOW())
  WHERE user_id = p_user_id AND course_id = p_course_id
    AND chapter_number = p_chapter_number AND lesson_number = p_lesson_number;

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

GRANT EXECUTE ON FUNCTION upsert_lesson_completed(UUID, INT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_lesson_completed(UUID, INT, INT, INT) TO anon;

-- 2. generate_roadmap_nodes : JOIN simple (course_id tel quel)
-- Recréer la fonction complète avec le JOIN mis à jour
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
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_institute_priority TEXT[];
  v_institute_index INT;
  v_institute_name TEXT;
  v_first_incomplete_index INT;
BEGIN
  SELECT p.institute_priority INTO v_institute_priority
  FROM profiles p WHERE p.id = p_user_id;

  IF v_institute_priority IS NULL OR array_length(v_institute_priority, 1) IS NULL THEN
    RETURN;
  END IF;

  CREATE TEMP TABLE temp_roadmap_lessons (
    lesson_id TEXT, course_id INT, chapter_number INT, lesson_number INT,
    lesson_title TEXT, difficulty_numeric INT, is_completed BOOLEAN,
    school_name TEXT, course_title TEXT, sort_key BIGINT
  ) ON COMMIT DROP;

  FOR v_institute_index IN 1..array_length(v_institute_priority, 1) LOOP
    v_institute_name := v_institute_priority[v_institute_index];

    INSERT INTO temp_roadmap_lessons (
      lesson_id, course_id, chapter_number, lesson_number,
      lesson_title, difficulty_numeric, is_completed,
      school_name, course_title, sort_key
    )
    SELECT
      (cc.course_id::text || '-' || cc.chapter_number::text || '-' || cc.lesson_number::text),
      cc.course_id, cc.chapter_number, cc.lesson_number,
      COALESCE(cc.lesson_title, 'Lesson'),
      COALESCE(cm.difficulty_numeric, 5),
      COALESCE(ulp.is_completed, false),
      cm.school_name,
      COALESCE(cm.course_title, 'Unknown Course'),
      (v_institute_index::BIGINT * 1000000) + (cc.lesson_number::BIGINT * 10000)
        + (cc.chapter_number::BIGINT * 100) + (cc.course_id::BIGINT)
    FROM course_metadata cm
    INNER JOIN course_content cc ON cc.course_id = cm.course_id
    LEFT JOIN user_lesson_progress ulp
      ON ulp.user_id = p_user_id
     AND ulp.course_id = cc.course_id
     AND ulp.chapter_number = cc.chapter_number
     AND ulp.lesson_number = cc.lesson_number
    WHERE cm.masterschool = p_masterschool AND cm.status = 'published'
      AND cm.school_name = v_institute_name
      AND cm.course_id IN (SELECT DISTINCT cs.course_id FROM public.course_structure cs);
  END LOOP;

  SELECT MIN(ranked.row_num) INTO v_first_incomplete_index
  FROM (
    SELECT ROW_NUMBER() OVER (ORDER BY t.sort_key) as row_num, t.is_completed
    FROM temp_roadmap_lessons t
  ) ranked
  WHERE NOT ranked.is_completed;

  IF v_first_incomplete_index IS NULL THEN
    v_first_incomplete_index := 1;
  END IF;

  RETURN QUERY
  SELECT trl.lesson_id, (trl.course_id)::INT, (trl.chapter_number)::INT, (trl.lesson_number)::INT,
    trl.lesson_title, (trl.difficulty_numeric)::INT, trl.is_completed,
    trl.school_name, trl.course_title
  FROM (
    SELECT t.lesson_id, t.course_id, t.chapter_number, t.lesson_number,
      t.lesson_title, t.difficulty_numeric, t.is_completed,
      t.school_name, t.course_title, t.sort_key,
      ROW_NUMBER() OVER (ORDER BY t.sort_key) as row_num
    FROM temp_roadmap_lessons t
  ) trl
  WHERE trl.row_num >= v_first_incomplete_index
  ORDER BY trl.sort_key
  LIMIT p_limit;

  DROP TABLE IF EXISTS temp_roadmap_lessons;
END;
$$;

SELECT 'upsert_lesson_completed + generate_roadmap_nodes (IDs sans conversion) appliqués' AS status;
