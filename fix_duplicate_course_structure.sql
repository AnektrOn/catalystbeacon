-- Fix duplicate course_structure rows
-- This will keep only the most recent row for each course_id

-- Step 1: Check duplicates
SELECT 
  course_id,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id ORDER BY updated_at DESC, created_at DESC) as all_ids,
  ARRAY_AGG(updated_at ORDER BY updated_at DESC) as all_updated_at
FROM course_structure
GROUP BY course_id
HAVING COUNT(*) > 1;

-- Step 2: Delete duplicates, keeping only the most recent one
-- WARNING: Run Step 1 first to see what will be deleted!

DELETE FROM course_structure
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY course_id 
        ORDER BY updated_at DESC, created_at DESC, id DESC
      ) as rn
    FROM course_structure
  ) ranked
  WHERE rn > 1
);

-- Step 3: Add unique constraint to prevent future duplicates
-- This will prevent N8N from inserting duplicates
ALTER TABLE course_structure
DROP CONSTRAINT IF EXISTS course_structure_course_id_unique;

ALTER TABLE course_structure
ADD CONSTRAINT course_structure_course_id_unique UNIQUE (course_id);

-- Step 4: Verify no duplicates remain
SELECT 
  course_id,
  COUNT(*) as count
FROM course_structure
GROUP BY course_id
HAVING COUNT(*) > 1;
-- Should return 0 rows
