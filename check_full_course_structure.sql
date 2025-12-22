-- Check full structure for courses that have data
-- This will show ALL chapters and lessons for courses with structure

SELECT 
  cs.course_id,
  cm.course_title,
  cs.chapter_count,
  -- Chapter 1
  cs.chapter_title_1,
  cs.lesson_1_1,
  cs.lesson_1_2,
  cs.lesson_1_3,
  cs.lesson_1_4,
  -- Chapter 2
  cs.chapter_title_2,
  cs.lesson_2_1,
  cs.lesson_2_2,
  cs.lesson_2_3,
  cs.lesson_2_4,
  -- Chapter 3
  cs.chapter_title_3,
  cs.lesson_3_1,
  cs.lesson_3_2,
  cs.lesson_3_3,
  cs.lesson_3_4,
  -- Chapter 4
  cs.chapter_title_4,
  cs.lesson_4_1,
  cs.lesson_4_2,
  cs.lesson_4_3,
  cs.lesson_4_4,
  -- Chapter 5
  cs.chapter_title_5,
  cs.lesson_5_1,
  cs.lesson_5_2,
  cs.lesson_5_3,
  cs.lesson_5_4
FROM course_structure cs
JOIN course_metadata cm ON cs.course_id = cm.course_id
WHERE cs.chapter_count IS NOT NULL
  AND cs.chapter_count > 0
ORDER BY cs.course_id;

-- Count duplicates
SELECT 
  course_id,
  COUNT(*) as duplicate_count
FROM course_structure
GROUP BY course_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Check if lessons beyond lesson_1_1 exist
SELECT 
  course_id,
  chapter_count,
  CASE WHEN lesson_1_1 IS NOT NULL THEN 1 ELSE 0 END as has_lesson_1_1,
  CASE WHEN lesson_1_2 IS NOT NULL THEN 1 ELSE 0 END as has_lesson_1_2,
  CASE WHEN lesson_1_3 IS NOT NULL THEN 1 ELSE 0 END as has_lesson_1_3,
  CASE WHEN lesson_1_4 IS NOT NULL THEN 1 ELSE 0 END as has_lesson_1_4,
  CASE WHEN lesson_2_1 IS NOT NULL THEN 1 ELSE 0 END as has_lesson_2_1,
  CASE WHEN lesson_2_2 IS NOT NULL THEN 1 ELSE 0 END as has_lesson_2_2,
  CASE WHEN chapter_title_2 IS NOT NULL THEN 1 ELSE 0 END as has_chapter_2
FROM course_structure
WHERE chapter_count IS NOT NULL
  AND chapter_count > 0;
