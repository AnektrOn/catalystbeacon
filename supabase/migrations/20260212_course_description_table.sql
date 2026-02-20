-- ============================================
-- course_description table
-- ============================================
-- Denormalized course chapter/lesson descriptions.
-- Used by courseService.getCourseDescriptions() and parseCourseDescriptions().
-- One row per course (course_id). Missing table caused 404 / PGRST205.
-- ============================================

CREATE TABLE IF NOT EXISTS public.course_description (
  course_id INT NOT NULL PRIMARY KEY,
  chapter_1_description TEXT,
  chapter_2_description TEXT,
  chapter_3_description TEXT,
  chapter_4_description TEXT,
  chapter_5_description TEXT,
  lesson_1_1_description TEXT,
  lesson_1_2_description TEXT,
  lesson_1_3_description TEXT,
  lesson_1_4_description TEXT,
  lesson_2_1_description TEXT,
  lesson_2_2_description TEXT,
  lesson_2_3_description TEXT,
  lesson_2_4_description TEXT,
  lesson_3_1_description TEXT,
  lesson_3_2_description TEXT,
  lesson_3_3_description TEXT,
  lesson_3_4_description TEXT,
  lesson_4_1_description TEXT,
  lesson_4_2_description TEXT,
  lesson_4_3_description TEXT,
  lesson_4_4_description TEXT,
  lesson_5_1_description TEXT,
  lesson_5_2_description TEXT,
  lesson_5_3_description TEXT,
  lesson_5_4_description TEXT
);

COMMENT ON TABLE public.course_description IS 'Denormalized chapter and lesson descriptions per course. Optional; missing row returns empty descriptions.';

-- Allow read for authenticated users (Supabase RLS)
ALTER TABLE public.course_description ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for authenticated"
  ON public.course_description
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: allow service role / anon if your app uses anon for public catalog
CREATE POLICY "Allow read for anon"
  ON public.course_description
  FOR SELECT
  TO anon
  USING (true);
