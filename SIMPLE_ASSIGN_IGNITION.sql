-- SUPER SIMPLE: Just assign courses to Ignition masterschool
-- This is all you need to make the roadmap work!

-- Assign first 15 courses to Ignition
UPDATE course_metadata
SET masterschool = 'Ignition'
WHERE course_id IN (
  SELECT course_id 
  FROM course_metadata 
  ORDER BY course_id
  LIMIT 15
);

-- Check what got assigned
SELECT 
  course_id,
  course_title,
  masterschool,
  (SELECT COUNT(*) FROM course_content cc WHERE cc.course_id = course_metadata.course_id) as lesson_count
FROM course_metadata
WHERE masterschool = 'Ignition';

-- That's it! Now refresh your roadmap page and you'll see lessons!

