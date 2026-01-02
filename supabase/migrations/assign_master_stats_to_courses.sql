-- =====================================================
-- AUTO-ASSIGN MASTER STATS TO COURSES
-- =====================================================
-- This function looks up the master_stat based on stats_linked array
-- Uses skills table to find the master_stat_id, then gets master_stat name

-- =====================================================
-- 1. FIRST, GET MASTER STAT NAMES TO SEE WHAT WE HAVE
-- =====================================================
SELECT id, name, display_name 
FROM master_stats 
ORDER BY display_name;

-- =====================================================
-- 2. CREATE FUNCTION TO AUTO-ASSIGN MASTER STAT
-- =====================================================
CREATE OR REPLACE FUNCTION auto_assign_master_stat_to_course()
RETURNS TABLE(
  course_id INTEGER,
  course_title TEXT,
  first_skill TEXT,
  master_stat_name TEXT,
  updated BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH course_updates AS (
    SELECT 
      cm.course_id,
      cm.course_title,
      cm.stats_linked[1] as first_skill_name,
      ms.name as master_stat_name,
      ms.display_name as master_stat_display
    FROM course_metadata cm
    LEFT JOIN skills s ON s.name = cm.stats_linked[1] OR s.display_name = cm.stats_linked[1]
    LEFT JOIN master_stats ms ON ms.id = s.master_stat_id
    WHERE cm.masterschool IN ('Ignition', 'Insight', 'Transformation')
      AND cm.stats_linked IS NOT NULL
      AND array_length(cm.stats_linked, 1) > 0
      AND (cm.master_skill_linked IS NULL OR cm.master_skill_linked = '')
  )
  UPDATE course_metadata cm
  SET master_skill_linked = cu.master_stat_display
  FROM course_updates cu
  WHERE cm.course_id = cu.course_id
  RETURNING 
    cm.course_id,
    cm.course_title,
    cu.first_skill_name,
    cu.master_stat_display,
    true as updated;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. RUN THE FUNCTION
-- =====================================================
SELECT * FROM auto_assign_master_stat_to_course();

-- =====================================================
-- 4. VERIFY IT WORKED
-- =====================================================
SELECT 
  course_id,
  course_title,
  stats_linked,
  master_skill_linked,
  masterschool
FROM course_metadata
WHERE masterschool = 'Ignition'
  AND master_skill_linked IS NOT NULL
LIMIT 10;

-- =====================================================
-- 5. COUNT BY MASTER STAT
-- =====================================================
SELECT 
  master_skill_linked,
  COUNT(*) as course_count,
  SUM((SELECT COUNT(*) FROM course_content cc WHERE cc.course_id = cm.course_id)) as lesson_count
FROM course_metadata cm
WHERE masterschool = 'Ignition'
  AND master_skill_linked IS NOT NULL
GROUP BY master_skill_linked
ORDER BY lesson_count DESC;

-- =====================================================
-- 6. IF MASTER_SKILL_LINKED IS STILL NULL (SKILLS NOT FOUND)
--    FALLBACK: Use first item from stats_linked directly
-- =====================================================
UPDATE course_metadata
SET master_skill_linked = stats_linked[1]
WHERE masterschool IN ('Ignition', 'Insight', 'Transformation')
  AND stats_linked IS NOT NULL
  AND array_length(stats_linked, 1) > 0
  AND (master_skill_linked IS NULL OR master_skill_linked = '');

-- =====================================================
-- 7. FINAL VERIFICATION
-- =====================================================
SELECT 
  masterschool,
  COUNT(*) as total_courses,
  COUNT(master_skill_linked) as with_master_stat,
  COUNT(DISTINCT master_skill_linked) as unique_master_stats
FROM course_metadata
WHERE masterschool IN ('Ignition', 'Insight', 'Transformation')
GROUP BY masterschool;

-- =====================================================
-- 8. PREVIEW ROADMAP GROUPING
-- =====================================================
SELECT 
  cm.master_skill_linked,
  COUNT(DISTINCT cm.course_id) as courses,
  COUNT(cc.id) as lessons
FROM course_metadata cm
LEFT JOIN course_content cc ON cm.course_id = cc.course_id
WHERE cm.masterschool = 'Ignition'
  AND cm.master_skill_linked IS NOT NULL
GROUP BY cm.master_skill_linked
ORDER BY lessons DESC;

-- All done! Refresh your roadmap page and lessons will be grouped by master stat!

