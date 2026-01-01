-- DEBUG: Find out why lessons aren't showing on roadmap
-- Run these queries one by one to diagnose the issue

-- ============================================
-- 1. Check total lessons in database
-- ============================================
SELECT COUNT(*) as total_lessons FROM course_content;
-- Expected: 300+ (you said you have this)

-- ============================================
-- 2. Check if courses have masterschool field
-- ============================================
SELECT 
  course_id, 
  course_title, 
  masterschool,
  status
FROM course_metadata 
LIMIT 10;
-- Look at the 'masterschool' column - is it NULL or empty?

-- ============================================
-- 3. Count courses by masterschool
-- ============================================
SELECT 
  masterschool,
  COUNT(*) as course_count
FROM course_metadata
GROUP BY masterschool;
-- Do you see 'Ignition' with a count > 0?

-- ============================================
-- 4. Check if roadmap_lessons VIEW exists
-- ============================================
SELECT EXISTS(
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'roadmap_lessons'
  AND table_type = 'VIEW'
) as view_exists;
-- Should return: true

-- ============================================
-- 5. If view doesn't exist, create it NOW
-- ============================================
CREATE OR REPLACE VIEW roadmap_lessons AS
SELECT 
  cm.course_id,
  cm.course_title,
  cm.masterschool,
  COALESCE(cm.difficulty_numeric, 
    CASE 
      WHEN LOWER(cm.difficulty_level) LIKE '%easy%' OR LOWER(cm.difficulty_level) LIKE '%beginner%' THEN 2
      WHEN LOWER(cm.difficulty_level) LIKE '%medium%' OR LOWER(cm.difficulty_level) LIKE '%intermediate%' THEN 5
      WHEN LOWER(cm.difficulty_level) LIKE '%hard%' OR LOWER(cm.difficulty_level) LIKE '%advanced%' THEN 8
      ELSE 5
    END
  ) as difficulty_numeric,
  cm.stats_linked,
  cc.lesson_id,
  cc.lesson_title,
  cc.chapter_number,
  cc.lesson_number,
  cc.chapter_id,
  (COALESCE(cm.difficulty_numeric, 5) * 10) as lesson_xp_reward
FROM course_metadata cm
JOIN course_content cc ON cm.course_id = cc.course_id
WHERE (cm.status = 'published' OR cm.status IS NULL)
  AND cm.masterschool IN ('Ignition', 'Insight', 'Transformation')
ORDER BY cm.masterschool, difficulty_numeric, cm.course_id, cc.chapter_number, cc.lesson_number;

-- ============================================
-- 6. Try querying the view
-- ============================================
SELECT COUNT(*) as ignition_lessons
FROM roadmap_lessons 
WHERE masterschool = 'Ignition';
-- Expected: > 0 if courses are assigned to Ignition

-- ============================================
-- 7. If count is 0, assign courses to Ignition
-- ============================================
-- Assign first 10 courses to Ignition
UPDATE course_metadata
SET 
  masterschool = 'Ignition',
  stats_linked = ARRAY['Mental Fitness', 'Focus', 'Clarity'],
  status = COALESCE(status, 'published')
WHERE course_id IN (
  SELECT course_id 
  FROM course_metadata 
  LIMIT 10
);

-- ============================================
-- 8. Check again
-- ============================================
SELECT 
  cm.course_id,
  cm.course_title,
  cm.masterschool,
  COUNT(cc.id) as lesson_count
FROM course_metadata cm
LEFT JOIN course_content cc ON cm.course_id = cc.course_id
WHERE cm.masterschool = 'Ignition'
GROUP BY cm.course_id, cm.course_title, cm.masterschool;

-- ============================================
-- 9. Preview roadmap lessons
-- ============================================
SELECT 
  lesson_title,
  course_title,
  difficulty_numeric,
  lesson_xp_reward,
  course_id,
  chapter_number,
  lesson_number
FROM roadmap_lessons
WHERE masterschool = 'Ignition'
ORDER BY difficulty_numeric, course_id, chapter_number, lesson_number
LIMIT 20;

-- If you see lessons here, the roadmap should work!
-- Just refresh the page: http://localhost:3000/roadmap/ignition

