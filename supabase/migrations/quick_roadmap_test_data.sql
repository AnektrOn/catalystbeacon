-- Quick Test Data Setup for Roadmap
-- Run this AFTER applying the main migration
-- This will create test data so you can see the roadmap working

-- Step 1: Ensure at least one course is assigned to Ignition
UPDATE course_metadata
SET 
  masterschool = 'Ignition',
  difficulty_numeric = CASE 
    WHEN course_id % 3 = 0 THEN 1  -- Easy
    WHEN course_id % 3 = 1 THEN 3  -- Medium
    ELSE 5                          -- Hard
  END,
  stats_linked = ARRAY['Mental Fitness', 'Focus', 'Emotional Intelligence'],
  status = 'published'
WHERE course_id IN (
  SELECT course_id 
  FROM course_metadata 
  WHERE status = 'published' OR status IS NULL
  LIMIT 10
);

-- Step 2: Verify courses were updated
SELECT 
  course_id,
  course_title,
  masterschool,
  difficulty_numeric,
  stats_linked,
  status
FROM course_metadata
WHERE masterschool = 'Ignition'
ORDER BY difficulty_numeric, course_id;

-- Step 3: Check how many lessons we have
SELECT 
  COUNT(*) as total_lessons,
  MIN(difficulty_numeric) as min_difficulty,
  MAX(difficulty_numeric) as max_difficulty
FROM roadmap_lessons
WHERE masterschool = 'Ignition';

-- Step 4: Preview the roadmap (first 5 lessons)
SELECT 
  lesson_title,
  course_title,
  difficulty_numeric,
  lesson_xp_reward,
  stats_linked
FROM roadmap_lessons
WHERE masterschool = 'Ignition'
ORDER BY difficulty_numeric, course_id, chapter_number, lesson_number
LIMIT 5;

