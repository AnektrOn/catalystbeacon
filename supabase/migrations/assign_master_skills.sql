-- =====================================================
-- AUTO-ASSIGN MASTER SKILLS TO COURSES
-- =====================================================
-- This function assigns master_skill_linked based on stats_linked array
-- Uses the FIRST skill in the array as the primary/master skill

-- =====================================================
-- 1. CREATE FUNCTION TO AUTO-ASSIGN MASTER SKILL
-- =====================================================
CREATE OR REPLACE FUNCTION auto_assign_master_skill()
RETURNS void AS $$
BEGIN
  -- Update all courses that have stats_linked but no master_skill_linked
  UPDATE course_metadata
  SET master_skill_linked = stats_linked[1]
  WHERE stats_linked IS NOT NULL 
    AND array_length(stats_linked, 1) > 0
    AND (master_skill_linked IS NULL OR master_skill_linked = '');

  RAISE NOTICE 'Master skills assigned successfully';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. RUN THE FUNCTION NOW
-- =====================================================
SELECT auto_assign_master_skill();

-- =====================================================
-- 3. VERIFY IT WORKED
-- =====================================================
SELECT 
  course_id,
  course_title,
  masterschool,
  master_skill_linked,
  stats_linked
FROM course_metadata
WHERE masterschool = 'Ignition'
LIMIT 10;

-- =====================================================
-- 4. COUNT BY MASTER SKILL
-- =====================================================
SELECT 
  master_skill_linked,
  COUNT(*) as course_count,
  SUM((SELECT COUNT(*) FROM course_content cc WHERE cc.course_id = cm.course_id)) as lesson_count
FROM course_metadata cm
WHERE masterschool = 'Ignition'
GROUP BY master_skill_linked
ORDER BY lesson_count DESC;

-- =====================================================
-- 5. CREATE TRIGGER TO AUTO-ASSIGN ON INSERT/UPDATE
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_auto_assign_master_skill()
RETURNS TRIGGER AS $$
BEGIN
  -- If stats_linked is set but master_skill_linked is not, auto-assign
  IF NEW.stats_linked IS NOT NULL 
     AND array_length(NEW.stats_linked, 1) > 0
     AND (NEW.master_skill_linked IS NULL OR NEW.master_skill_linked = '') THEN
    NEW.master_skill_linked := NEW.stats_linked[1];
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS auto_assign_master_skill_trigger ON course_metadata;

-- Create trigger
CREATE TRIGGER auto_assign_master_skill_trigger
  BEFORE INSERT OR UPDATE ON course_metadata
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_assign_master_skill();

COMMENT ON FUNCTION auto_assign_master_skill IS 'Automatically assigns master_skill_linked from first stat in stats_linked array';
COMMENT ON FUNCTION trigger_auto_assign_master_skill IS 'Trigger function to auto-assign master skill on insert/update';

-- =====================================================
-- 6. FINAL CHECK
-- =====================================================
SELECT 
  'Total courses' as metric,
  COUNT(*) as count
FROM course_metadata
WHERE masterschool = 'Ignition'
UNION ALL
SELECT 
  'With master skill' as metric,
  COUNT(*) as count
FROM course_metadata
WHERE masterschool = 'Ignition'
  AND master_skill_linked IS NOT NULL;

-- If both numbers match, all courses now have master skills! ✅

