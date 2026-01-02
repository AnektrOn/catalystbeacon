-- SIMPLE: Auto-assign master stats to courses
-- This looks up the master stat from skills table

-- Step 1: Update courses with master stat based on first skill in stats_linked
UPDATE course_metadata cm
SET master_skill_linked = ms.display_name
FROM (
  SELECT DISTINCT ON (cm2.course_id)
    cm2.course_id,
    ms2.display_name
  FROM course_metadata cm2
  CROSS JOIN LATERAL unnest(cm2.stats_linked) AS skill_name
  LEFT JOIN skills s ON s.name = skill_name OR s.display_name = skill_name
  LEFT JOIN master_stats ms2 ON ms2.id = s.master_stat_id
  WHERE cm2.masterschool IN ('Ignition', 'Insight', 'Transformation')
    AND cm2.stats_linked IS NOT NULL
    AND array_length(cm2.stats_linked, 1) > 0
    AND ms2.display_name IS NOT NULL
  ORDER BY cm2.course_id, array_position(cm2.stats_linked, skill_name)
) ms
WHERE cm.course_id = ms.course_id;

-- Step 2: Check results
SELECT 
  course_id,
  course_title,
  stats_linked,
  master_skill_linked
FROM course_metadata
WHERE masterschool = 'Ignition'
  AND master_skill_linked IS NOT NULL
LIMIT 10;

-- Step 3: Count by master stat
SELECT 
  master_skill_linked,
  COUNT(*) as courses,
  SUM((SELECT COUNT(*) FROM course_content cc WHERE cc.course_id = cm.course_id)) as lessons
FROM course_metadata cm
WHERE masterschool = 'Ignition'
  AND master_skill_linked IS NOT NULL
GROUP BY master_skill_linked
ORDER BY lessons DESC;

-- You should see 6 groups:
-- - Cognitive & Theoretical
-- - Inner Awareness
-- - Discipline & Ritual
-- - Physical Mastery
-- - Creative & Reflective
-- - Social & Influence

