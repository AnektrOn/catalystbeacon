-- ============================================
-- 1) completed_at on user_lesson_progress (for tracking + analytics)
-- 2) lesson_completion_events table (user_id + lesson when completed — pour tracker les meilleurs et préférences)
-- 3) complete_lesson_transaction returns next_lesson_id so roadmap can unlock next node without refetch
-- ============================================

-- 1) Ensure completed_at exists on user_lesson_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_lesson_progress' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.user_lesson_progress ADD COLUMN completed_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

-- 2) Table for completion events: who completed what and when (for analytics, "meilleurs", préférences)
CREATE TABLE IF NOT EXISTS public.lesson_completion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INT NOT NULL,
  chapter_number INT NOT NULL,
  lesson_number INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  masterschool TEXT,
  -- For future: preference, rating, etc.
  CONSTRAINT lesson_completion_events_user_lesson_unique UNIQUE (user_id, course_id, chapter_number, lesson_number)
);

CREATE INDEX IF NOT EXISTS idx_lesson_completion_events_user ON public.lesson_completion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completion_events_completed_at ON public.lesson_completion_events(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_completion_events_course ON public.lesson_completion_events(course_id);

ALTER TABLE public.lesson_completion_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own completion events" ON public.lesson_completion_events;
CREATE POLICY "Users can read own completion events" ON public.lesson_completion_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert completion events" ON public.lesson_completion_events;
CREATE POLICY "Service can insert completion events" ON public.lesson_completion_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.lesson_completion_events IS 'Audit trail of lesson completions per user. Used for roadmap next-node and for analytics (top performers, preferences).';

-- 3) Update complete_lesson_transaction: insert event + return next_lesson_id (must DROP first when changing return type)
DROP FUNCTION IF EXISTS complete_lesson_transaction(UUID, TEXT, INT, INT, INT, TEXT, TEXT);

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
  xp_earned INT,
  next_lesson_id TEXT
) AS $$
DECLARE
  v_can_complete BOOLEAN;
  v_is_completed BOOLEAN;
  v_xp_reward INT;
  v_difficulty_numeric INT;
  v_next_lesson_id TEXT;
BEGIN
  SELECT ulp.can_complete, ulp.is_completed INTO v_can_complete, v_is_completed
  FROM user_lesson_progress ulp
  WHERE ulp.user_id = p_user_id
    AND ulp.course_id = p_course_id
    AND ulp.chapter_number = p_chapter_number
    AND ulp.lesson_number = p_lesson_number;

  IF v_is_completed THEN
    RETURN QUERY SELECT true, 'Lesson already completed'::TEXT, 0, NULL::TEXT;
    RETURN;
  END IF;

  IF NOT v_can_complete THEN
    RETURN QUERY SELECT false, 'Requirements not met. Please spend at least 2 minutes and scroll to the end of the lesson.'::TEXT, 0, NULL::TEXT;
    RETURN;
  END IF;

  SELECT cm.difficulty_numeric INTO v_difficulty_numeric
  FROM course_metadata cm
  WHERE cm.course_id = p_course_id;
  v_xp_reward := COALESCE(v_difficulty_numeric, 5) * 10;

  UPDATE profiles p
  SET current_xp = p.current_xp + v_xp_reward,
      total_xp_earned = p.total_xp_earned + v_xp_reward
  WHERE p.id = p_user_id;

  BEGIN
    PERFORM update_roadmap_progress(
      p_user_id, p_masterschool, p_lesson_id, p_lesson_title,
      p_course_id, p_chapter_number, p_lesson_number
    );
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  UPDATE user_lesson_progress ulp2
  SET is_completed = true,
      completed_at = NOW()
  WHERE ulp2.user_id = p_user_id
    AND ulp2.course_id = p_course_id
    AND ulp2.chapter_number = p_chapter_number
    AND ulp2.lesson_number = p_lesson_number;

  -- Enregistrer l'événement de complétion (user_id + lesson) pour analytics / préférences
  INSERT INTO public.lesson_completion_events (user_id, course_id, chapter_number, lesson_number, masterschool, completed_at)
  VALUES (p_user_id, p_course_id, p_chapter_number, p_lesson_number, p_masterschool, NOW())
  ON CONFLICT (user_id, course_id, chapter_number, lesson_number) DO UPDATE
  SET completed_at = NOW(), masterschool = EXCLUDED.masterschool;

  -- Récupérer le prochain nœud (première leçon incomplète) dans la même transaction
  SELECT l.lesson_id INTO v_next_lesson_id
  FROM generate_roadmap_nodes(p_user_id, p_masterschool, 1) l
  LIMIT 1;

  RETURN QUERY SELECT true, 'Lesson completed successfully!'::TEXT, v_xp_reward, v_next_lesson_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION complete_lesson_transaction(UUID, TEXT, INT, INT, INT, TEXT, TEXT) IS
  'Completes a lesson, awards XP, records lesson_completion_events, and returns next_lesson_id for roadmap.';
