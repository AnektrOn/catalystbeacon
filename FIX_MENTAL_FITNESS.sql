-- FIX: Clean up "Mental Fitness" and other non-master-stat values
-- Map them to the correct master stats

-- Step 1: Find courses with wrong master_skill_linked
SELECT 
  course_id,
  course_title,
  master_skill_linked,
  stats_linked
FROM course_metadata
WHERE masterschool = 'Ignition'
  AND master_skill_linked NOT IN (
    SELECT display_name FROM master_stats
  );

-- Step 2: Map common skills to master stats
-- Mental Fitness, Focus, Clarity → "Cognitive & Theoretical"
-- Emotional Intelligence, Self-Awareness → "Inner Awareness"
-- Physical Fitness, Movement → "Physical Mastery"
UPDATE course_metadata
SET master_skill_linked = CASE
  WHEN master_skill_linked IN ('Mental Fitness', 'Focus', 'Clarity', 'Concentration', 'Learning') 
    THEN 'Cognitive & Theoretical'
  WHEN master_skill_linked IN ('Emotional Intelligence', 'Self-Awareness', 'Mindfulness', 'Meditation')
    THEN 'Inner Awareness'
  WHEN master_skill_linked IN ('Physical Fitness', 'Movement', 'Exercise', 'Vitality')
    THEN 'Physical Mastery'
  WHEN master_skill_linked IN ('Discipline', 'Consistency', 'Habits', 'Ritual')
    THEN 'Discipline & Ritual'
  WHEN master_skill_linked IN ('Creativity', 'Reflection', 'Journaling', 'Art')
    THEN 'Creative & Reflective'
  WHEN master_skill_linked IN ('Social', 'Communication', 'Leadership', 'Community')
    THEN 'Social & Influence'
  ELSE 'Cognitive & Theoretical' -- Default fallback
END
WHERE masterschool = 'Ignition'
  AND master_skill_linked NOT IN (
    SELECT display_name FROM master_stats
  );

-- Step 3: Verify all courses now have valid master stats
SELECT 
  master_skill_linked,
  COUNT(*) as courses,
  SUM((SELECT COUNT(*) FROM course_content cc WHERE cc.course_id = cm.course_id)) as lessons
FROM course_metadata cm
WHERE masterschool = 'Ignition'
GROUP BY master_skill_linked
ORDER BY lessons DESC;

-- Now you should only see the 6 master stats:
-- - Cognitive & Theoretical
-- - Inner Awareness
-- - Discipline & Ritual
-- - Physical Mastery
-- - Creative & Reflective
-- - Social & Influence

