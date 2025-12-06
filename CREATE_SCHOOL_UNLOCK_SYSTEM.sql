-- =====================================================
-- SCHOOL UNLOCK SYSTEM - MASTERSCHOOL THRESHOLDS
-- =====================================================
-- This creates/updates the schools table with unlock thresholds
-- Entire schools unlock at specific XP thresholds:
--   Ignition: 0 XP (always unlocked)
--   Insight: 10,000 XP
--   Transformation: 50,000 XP
--   God Mode: 100,000 XP

-- Step 1: Add display_name column if it doesn't exist (for existing tables)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Step 2: Make display_name NOT NULL if it's not already (handle existing nulls first)
-- First, set display_name to name for any existing rows with null display_name
UPDATE schools SET display_name = name WHERE display_name IS NULL;

-- Then add NOT NULL constraint if column exists and we can alter it
-- Note: This might fail if there are still nulls, but we just updated them above
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'schools' AND column_name = 'display_name' AND is_nullable = 'YES') THEN
        ALTER TABLE schools ALTER COLUMN display_name SET NOT NULL;
    END IF;
END $$;

-- Step 3: SAFE cleanup of duplicate schools
-- WARNING: This will delete lowercase/variant entries. Review before executing.

-- Step 3a: Create backup table before any deletions
CREATE TABLE IF NOT EXISTS schools_backup AS 
SELECT * FROM schools WHERE 1=0; -- Empty structure

INSERT INTO schools_backup 
SELECT * FROM schools;

-- Step 3b: Show what will be deleted (VERIFICATION QUERY - RUN THIS FIRST)
-- Uncomment to preview deletions:
-- SELECT * FROM schools 
-- WHERE LOWER(name) IN ('ignition', 'insight', 'transformation', 'god_mode', 'godmode')
--    AND name NOT IN ('Ignition', 'Insight', 'Transformation', 'God Mode');

-- Step 3c: Delete only known lowercase/variant duplicates
-- This ONLY deletes specific known variants, not all non-matching schools
DELETE FROM schools 
WHERE LOWER(name) IN ('ignition', 'insight', 'transformation', 'god_mode', 'godmode')
   AND name NOT IN ('Ignition', 'Insight', 'Transformation', 'God Mode');

-- Step 3d: Verify remaining schools (should show only the 4 expected schools)
-- SELECT name, COUNT(*) FROM schools GROUP BY name;

-- Step 4: Ensure name column has unique constraint
DO $$
BEGIN
    -- Drop existing constraint if it exists (in case it's not working)
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'schools_name_key' 
        AND conrelid = 'schools'::regclass
    ) THEN
        ALTER TABLE schools DROP CONSTRAINT schools_name_key;
    END IF;
    
    -- Add unique constraint
    ALTER TABLE schools ADD CONSTRAINT schools_name_key UNIQUE (name);
EXCEPTION
    WHEN others THEN
        -- If constraint already exists or other error, continue
        NULL;
END $$;

-- Step 5: Normalize existing course_metadata masterschool values first
-- This ensures all courses use the capitalized version
UPDATE course_metadata
SET masterschool = INITCAP(masterschool)
WHERE masterschool != INITCAP(masterschool) AND masterschool != 'God Mode';

-- Handle special case "God Mode" (two words)
UPDATE course_metadata
SET masterschool = 'God Mode'
WHERE LOWER(masterschool) IN ('god mode', 'godmode', 'god_mode');

-- Step 6: Insert or update schools with unlock thresholds (capitalized names)
INSERT INTO schools (name, display_name, description, unlock_xp, order_index) VALUES
('Ignition', 'Ignition', 'The beginning of your journey. Foundation courses to spark your learning.', 0, 1),
('Insight', 'Insight', 'Deepen your understanding. Unlock advanced knowledge and perspectives.', 10000, 2),
('Transformation', 'Transformation', 'Transform your practice. Master-level courses for profound change.', 50000, 3),
('God Mode', 'God Mode', 'Transcend limits. The highest level of mastery and understanding.', 100000, 4)
ON CONFLICT (name) 
DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    unlock_xp = EXCLUDED.unlock_xp,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index,
    updated_at = NOW();

-- Step 7: Create index for performance
CREATE INDEX IF NOT EXISTS idx_schools_unlock_xp ON schools(unlock_xp);
CREATE INDEX IF NOT EXISTS idx_schools_order_index ON schools(order_index);

-- Step 8: Create function to check if a school is unlocked for a user
CREATE OR REPLACE FUNCTION is_school_unlocked(user_xp INTEGER, school_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT unlock_xp <= user_xp
        FROM schools
        WHERE name = school_name
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 9: Create function to get all unlocked schools for a user
CREATE OR REPLACE FUNCTION get_unlocked_schools(user_xp INTEGER)
RETURNS TABLE (
    name TEXT,
    description TEXT,
    unlock_xp INTEGER,
    order_index INTEGER,
    is_unlocked BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.name,
        s.description,
        s.unlock_xp,
        s.order_index,
        (s.unlock_xp <= user_xp) AS is_unlocked
    FROM schools s
    ORDER BY s.order_index;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 10: Create view for user's school unlock status (requires user context)
-- This will be used in queries that join with profiles
CREATE OR REPLACE VIEW user_school_status AS
SELECT 
    s.id,
    s.name,
    s.display_name,
    s.description,
    s.unlock_xp,
    s.order_index
FROM schools s
ORDER BY s.order_index;

-- Step 11: Add comment for documentation
COMMENT ON TABLE schools IS 'Masterschools unlock at specific XP thresholds. Entire schools unlock, not individual courses.';
COMMENT ON COLUMN schools.unlock_xp IS 'XP threshold required to unlock this school. 0 means always unlocked.';
COMMENT ON FUNCTION is_school_unlocked IS 'Check if a school is unlocked for a user based on their XP';
COMMENT ON FUNCTION get_unlocked_schools IS 'Get all schools with unlock status for a given XP amount';

-- Step 12: Verify the data and check for duplicate masterschools
SELECT 
    name,
    unlock_xp,
    order_index,
    CASE 
        WHEN unlock_xp = 0 THEN 'Always Unlocked'
        ELSE unlock_xp::TEXT || ' XP Required'
    END AS unlock_requirement
FROM schools
ORDER BY order_index;

-- Check for any remaining duplicate masterschools in course_metadata (case-insensitive)
SELECT 
    LOWER(masterschool) as normalized_name,
    COUNT(DISTINCT masterschool) as variant_count,
    array_agg(DISTINCT masterschool) as variants,
    COUNT(*) as total_courses
FROM course_metadata
GROUP BY LOWER(masterschool)
HAVING COUNT(DISTINCT masterschool) > 1
ORDER BY normalized_name;

