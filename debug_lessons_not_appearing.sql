-- Debug script to check why lessons are not appearing
-- Run this in Supabase SQL Editor

-- 1. Check if course_structure data exists
SELECT 
  id,
  course_id,
  chapter_count,
  chapter_title_1,
  lesson_1_1,
  lesson_1_2,
  lesson_1_3,
  lesson_1_4,
  chapter_title_2,
  lesson_2_1,
  lesson_2_2,
  chapter_title_3,
  lesson_3_1
FROM course_structure
ORDER BY course_id
LIMIT 5;

-- 2. Check a specific course structure
-- Replace COURSE_ID_HERE with an actual course_id from your database
SELECT 
  cs.*,
  cm.course_title
FROM course_structure cs
JOIN course_metadata cm ON cs.course_id = cm.course_id
WHERE cs.course_id = 1  -- Change this to a real course_id
LIMIT 1;

-- 3. Check if chapter_count is set correctly
SELECT 
  course_id,
  chapter_count,
  CASE 
    WHEN chapter_title_1 IS NOT NULL THEN 1 ELSE 0 END +
  CASE 
    WHEN chapter_title_2 IS NOT NULL THEN 1 ELSE 0 END +
  CASE 
    WHEN chapter_title_3 IS NOT NULL THEN 1 ELSE 0 END +
  CASE 
    WHEN chapter_title_4 IS NOT NULL THEN 1 ELSE 0 END +
  CASE 
    WHEN chapter_title_5 IS NOT NULL THEN 1 ELSE 0 END as actual_chapter_count
FROM course_structure
ORDER BY course_id;

-- 4. Check if lessons are populated
SELECT 
  course_id,
  chapter_title_1,
  lesson_1_1,
  lesson_1_2,
  lesson_1_3,
  lesson_1_4,
  chapter_title_2,
  lesson_2_1,
  lesson_2_2,
  lesson_2_3,
  lesson_2_4
FROM course_structure
WHERE course_id IN (
  SELECT course_id FROM course_metadata LIMIT 3
);

-- 5. Count lessons per chapter for a course
SELECT 
  course_id,
  chapter_count,
  -- Chapter 1 lessons
  CASE WHEN lesson_1_1 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN lesson_1_2 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN lesson_1_3 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN lesson_1_4 IS NOT NULL THEN 1 ELSE 0 END as chapter_1_lessons,
  -- Chapter 2 lessons
  CASE WHEN lesson_2_1 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN lesson_2_2 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN lesson_2_3 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN lesson_2_4 IS NOT NULL THEN 1 ELSE 0 END as chapter_2_lessons,
  -- Chapter 3 lessons
  CASE WHEN lesson_3_1 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN lesson_3_2 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN lesson_3_3 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN lesson_3_4 IS NOT NULL THEN 1 ELSE 0 END as chapter_3_lessons
FROM course_structure
ORDER BY course_id;

-- 6. Find courses with structure but no lessons
SELECT 
  cm.course_id,
  cm.course_title,
  cs.chapter_count,
  cs.chapter_title_1,
  cs.lesson_1_1
FROM course_metadata cm
LEFT JOIN course_structure cs ON cm.course_id = cs.course_id
WHERE cm.status = 'published'
ORDER BY cm.course_id;
