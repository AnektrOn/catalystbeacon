-- ============================================
-- User roadmap batch: store the current 10 lessons per user/masterschool
-- So the roadmap is stable until all 10 are completed; completion comes from user_lesson_progress
-- ============================================

-- Table: one row per (user_id, masterschool), stores the current 10 as JSONB
CREATE TABLE IF NOT EXISTS public.user_roadmap_batch (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  masterschool TEXT NOT NULL,
  lessons JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, masterschool)
);

COMMENT ON TABLE public.user_roadmap_batch IS 'Current batch of 10 roadmap lessons for the user. Replaced when all 10 are completed. is_completed is always read from user_lesson_progress.';

ALTER TABLE public.user_roadmap_batch ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roadmap batch" ON public.user_roadmap_batch;
CREATE POLICY "Users can read own roadmap batch" ON public.user_roadmap_batch
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own roadmap batch" ON public.user_roadmap_batch;
CREATE POLICY "Users can insert own roadmap batch" ON public.user_roadmap_batch
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own roadmap batch" ON public.user_roadmap_batch;
CREATE POLICY "Users can update own roadmap batch" ON public.user_roadmap_batch
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own roadmap batch" ON public.user_roadmap_batch;
CREATE POLICY "Users can delete own roadmap batch" ON public.user_roadmap_batch
  FOR DELETE USING (auth.uid() = user_id);

-- RPC: get current 10 for roadmap. Creates batch from generate_roadmap_nodes if none or if all 10 completed.
CREATE OR REPLACE FUNCTION public.get_roadmap_batch(
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
  is_completed BOOLEAN,
  school_name TEXT,
  course_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_priority TEXT[];
  v_batch_lessons JSONB;
  v_completed_count INT;
BEGIN
  -- Require institute priority
  SELECT p.institute_priority INTO v_priority
  FROM profiles p
  WHERE p.id = p_user_id;
  IF v_priority IS NULL OR array_length(v_priority, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Get existing batch
  SELECT urb.lessons INTO v_batch_lessons
  FROM user_roadmap_batch urb
  WHERE urb.user_id = p_user_id AND urb.masterschool = p_masterschool;

  -- If we have a batch with 10 lessons, count how many are completed (from user_lesson_progress)
  IF v_batch_lessons IS NOT NULL AND jsonb_array_length(v_batch_lessons) >= 10 THEN
    SELECT COUNT(*) INTO v_completed_count
    FROM jsonb_array_elements(v_batch_lessons) AS elem
    JOIN user_lesson_progress ulp
      ON ulp.user_id = p_user_id
      AND ulp.course_id = (elem->>'course_id')::INT
      AND ulp.chapter_number = (elem->>'chapter_number')::INT
      AND ulp.lesson_number = (elem->>'lesson_number')::INT
      AND ulp.is_completed = true;

    -- If not all 10 completed: return batch with current is_completed from user_lesson_progress
    IF v_completed_count < 10 THEN
      RETURN QUERY
      SELECT
        (elem->>'lesson_id')::TEXT,
        (elem->>'course_id')::INT,
        (elem->>'chapter_number')::INT,
        (elem->>'lesson_number')::INT,
        COALESCE(elem->>'lesson_title', 'Lesson'),
        (elem->>'difficulty_numeric')::INT,
        COALESCE(ulp.is_completed, false),
        (elem->>'school_name')::TEXT,
        (elem->>'course_title')::TEXT
      FROM jsonb_array_elements(v_batch_lessons) AS elem
      LEFT JOIN user_lesson_progress ulp
        ON ulp.user_id = p_user_id
        AND ulp.course_id = (elem->>'course_id')::INT
        AND ulp.chapter_number = (elem->>'chapter_number')::INT
        AND ulp.lesson_number = (elem->>'lesson_number')::INT
      LIMIT 10;
      RETURN;
    END IF;
  END IF;

  -- No batch or all 10 completed: get next 10 from generate_roadmap_nodes and save as new batch
  INSERT INTO user_roadmap_batch (user_id, masterschool, lessons, updated_at)
  SELECT
    p_user_id,
    p_masterschool,
    (SELECT jsonb_agg(jsonb_build_object(
      'lesson_id', l.lesson_id, 'course_id', l.course_id, 'chapter_number', l.chapter_number,
      'lesson_number', l.lesson_number, 'lesson_title', l.lesson_title, 'difficulty_numeric', l.difficulty_numeric,
      'school_name', l.school_name, 'course_title', l.course_title
    )) FROM generate_roadmap_nodes(p_user_id, p_masterschool, 10) l),
    NOW()
  ON CONFLICT (user_id, masterschool)
  DO UPDATE SET
    lessons = EXCLUDED.lessons,
    updated_at = EXCLUDED.updated_at;

  -- Return the new batch with is_completed from user_lesson_progress
  RETURN QUERY
  SELECT
    (elem->>'lesson_id')::TEXT,
    (elem->>'course_id')::INT,
    (elem->>'chapter_number')::INT,
    (elem->>'lesson_number')::INT,
    COALESCE(elem->>'lesson_title', 'Lesson'),
    (elem->>'difficulty_numeric')::INT,
    COALESCE(ulp.is_completed, false),
    (elem->>'school_name')::TEXT,
    (elem->>'course_title')::TEXT
  FROM user_roadmap_batch urb,
       jsonb_array_elements(urb.lessons) AS elem
  LEFT JOIN user_lesson_progress ulp
    ON ulp.user_id = p_user_id
    AND ulp.course_id = (elem->>'course_id')::INT
    AND ulp.chapter_number = (elem->>'chapter_number')::INT
    AND ulp.lesson_number = (elem->>'lesson_number')::INT
  WHERE urb.user_id = p_user_id AND urb.masterschool = p_masterschool
  LIMIT 10;
END;
$$;

COMMENT ON FUNCTION public.get_roadmap_batch(UUID, TEXT) IS
  'Returns the current 10 roadmap lessons for the user. Stored in user_roadmap_batch; is_completed from user_lesson_progress. When all 10 are completed, fetches next 10 and updates batch.';

GRANT EXECUTE ON FUNCTION public.get_roadmap_batch(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_roadmap_batch(UUID, TEXT) TO anon;

-- Invalidate batch when user changes institute priority (so next load gets fresh 10 in new order)
CREATE OR REPLACE FUNCTION public.update_institute_priority(
  p_user_id UUID,
  p_institute_priority TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET institute_priority = p_institute_priority,
      updated_at = NOW()
  WHERE id = p_user_id;

  DELETE FROM public.user_roadmap_batch WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Institute priority updated successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_institute_priority(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_institute_priority(UUID, TEXT[]) TO anon;
