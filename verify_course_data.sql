-- =====================================================
-- VERIFY COURSE DATA FROM N8N FLOW
-- =====================================================
-- Run this in Supabase SQL Editor to check your course data
-- =====================================================

-- 1. Check most recent course_metadata entries
SELECT 
  '=== RECENT COURSE METADATA ===' AS section;
  
SELECT 
  course_id,
  course_title,
  school_name,
  masterschool,
  difficulty_level,
  xp_threshold,
  status,
  created_at
FROM course_metadata
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check course_structure entries
SELECT 
  '=== RECENT COURSE STRUCTURE ===' AS section;
  
SELECT 
  id,
  course_id,
  chapter_count,
  chapter_title_1,
  chapter_title_2,
  chapter_title_3,
  lesson_1_1,
  lesson_1_2,
  lesson_1_3,
  lesson_2_1,
  lesson_2_2,
  created_at
FROM course_structure
ORDER BY created_at DESC
LIMIT 3;

-- 3. Check course_description entries
SELECT 
  '=== RECENT COURSE DESCRIPTIONS ===' AS section;
  
SELECT 
  id,
  course_id,
  chapter_1_description,
  chapter_2_description,
  chapter_id_1,
  created_at
FROM course_description
ORDER BY created_at DESC
LIMIT 3;

-- 4. Check course_content entries (with new 4-item columns)
SELECT 
  '=== RECENT COURSE CONTENT (LESSONS) ===' AS section;
  
SELECT 
  id,
  course_id,
  chapter_number,
  lesson_number,
  lesson_title,
  LENGTH(the_hook) AS hook_length,
  key_terms_1,
  key_terms_2,
  key_terms_3,
  key_terms_4,
  core_concepts_1,
  core_concepts_2,
  core_concepts_3,
  core_concepts_4,
  key_takeaways_1,
  key_takeaways_2,
  key_takeaways_3,
  key_takeaways_4,
  created_at
FROM course_content
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check for data integrity issues
SELECT 
  '=== DATA INTEGRITY CHECKS ===' AS section;

-- Check if course_structure exists for all courses
SELECT 
  'Courses without structure' AS check_type,
  COUNT(*) AS count
FROM course_metadata cm
LEFT JOIN course_structure cs ON cm.course_id = cs.course_id
WHERE cs.course_id IS NULL;

-- Check if course_description exists for all courses
SELECT 
  'Courses without descriptions' AS check_type,
  COUNT(*) AS count
FROM course_metadata cm
LEFT JOIN course_description cd ON cm.course_id = cd.course_id
WHERE cd.course_id IS NULL;

-- Check lesson count per course
SELECT 
  'Lessons per course' AS check_type,
  course_id,
  COUNT(*) AS lesson_count
FROM course_content
GROUP BY course_id
ORDER BY lesson_count DESC
LIMIT 5;

-- 6. Check if new columns are being populated
SELECT 
  '=== NEW COLUMNS USAGE (4-item support) ===' AS section;
  
SELECT 
  COUNT(*) AS total_lessons,
  COUNT(key_terms_3) AS has_key_terms_3,
  COUNT(key_terms_4) AS has_key_terms_4,
  COUNT(core_concepts_3) AS has_core_concepts_3,
  COUNT(core_concepts_4) AS has_core_concepts_4,
  COUNT(key_takeaways_3) AS has_takeaways_3,
  COUNT(key_takeaways_4) AS has_takeaways_4
FROM course_content
WHERE created_at > NOW() - INTERVAL '1 hour'; -- Recent entries only

-- 7. Sample complete course data
SELECT 
  '=== SAMPLE COMPLETE COURSE ===' AS section;
  
-- Get the most recent course with all data
WITH recent_course AS (
  SELECT course_id 
  FROM course_metadata 
  ORDER BY created_at DESC 
  LIMIT 1
)
SELECT 
  cm.course_title,
  cm.masterschool,
  cs.chapter_count,
  cs.chapter_title_1,
  cs.lesson_1_1,
  cd.chapter_1_description,
  COUNT(cc.id) AS total_lessons
FROM recent_course rc
JOIN course_metadata cm ON rc.course_id = cm.course_id
LEFT JOIN course_structure cs ON rc.course_id = cs.course_id
LEFT JOIN course_description cd ON rc.course_id = cd.course_id
LEFT JOIN course_content cc ON rc.course_id = cc.course_id
GROUP BY cm.course_title, cm.masterschool, cs.chapter_count, cs.chapter_title_1, cs.lesson_1_1, cd.chapter_1_description;
