-- Get unique school_name values from course_metadata
-- Run this in Supabase SQL Editor to see all school_name values

SELECT 
    school_name,
    COUNT(*) as course_count
FROM course_metadata
WHERE status = 'published'
GROUP BY school_name
ORDER BY school_name;

