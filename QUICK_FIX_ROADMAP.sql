-- QUICK FIX: Run this in Supabase SQL Editor to see the roadmap working
-- This doesn't require the full migration, just creates test data

-- Step 1: Check what courses you have
SELECT course_id, course_title, masterschool, status
FROM course_metadata
LIMIT 5;

-- Step 2: Assign first course to Ignition for testing
-- (Replace the WHERE condition if you want a specific course)
UPDATE course_metadata
SET 
  masterschool = 'Ignition',
  difficulty_level = 'Easy',
  stats_linked = ARRAY['Mental Fitness', 'Focus'],
  status = 'published'
WHERE course_id = (
  SELECT course_id 
  FROM course_metadata 
  LIMIT 1
);

-- Step 3: Verify the update worked
SELECT 
  cm.course_id,
  cm.course_title,
  cm.masterschool,
  cm.difficulty_level,
  cm.stats_linked,
  COUNT(cc.id) as lesson_count
FROM course_metadata cm
LEFT JOIN course_content cc ON cm.course_id = cc.course_id
WHERE cm.masterschool = 'Ignition'
GROUP BY cm.course_id, cm.course_title, cm.masterschool, cm.difficulty_level, cm.stats_linked;

-- Step 4: Check if lessons exist for this course
SELECT 
  lesson_id,
  lesson_title,
  course_id,
  chapter_number,
  lesson_number
FROM course_content
WHERE course_id IN (
  SELECT course_id 
  FROM course_metadata 
  WHERE masterschool = 'Ignition'
)
ORDER BY course_id, chapter_number, lesson_number
LIMIT 10;

-- If you see lessons above, great! If not, check that your courses have content.
-- The roadmap will only show lessons that exist in the course_content table.

