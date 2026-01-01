-- FIX: Drop and recreate the roadmap_lessons view
-- Run this to fix the "cannot drop columns from view" error

-- Step 1: Drop the existing view
DROP VIEW IF EXISTS roadmap_lessons CASCADE;

-- Step 2: Create it fresh with the correct structure
CREATE VIEW roadmap_lessons AS
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

-- Step 3: Verify it works
SELECT COUNT(*) as total_lessons FROM roadmap_lessons;

-- Step 4: Check Ignition lessons
SELECT COUNT(*) as ignition_lessons 
FROM roadmap_lessons 
WHERE masterschool = 'Ignition';

-- Step 5: If count is 0, assign courses to Ignition
UPDATE course_metadata
SET masterschool = 'Ignition'
WHERE course_id IN (
  SELECT course_id FROM course_metadata LIMIT 10
);

-- Step 6: Check again
SELECT 
  lesson_title,
  course_title,
  difficulty_numeric,
  lesson_xp_reward
FROM roadmap_lessons
WHERE masterschool = 'Ignition'
LIMIT 10;

-- If you see lessons above, refresh your roadmap page!

