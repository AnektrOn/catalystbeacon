-- =====================================================
-- ROLLBACK NORMALIZATION MIGRATION
-- =====================================================
-- This migration rolls back all changes from the 
-- 20251214181940_normalize_course_structure.sql migration
-- and restores the original denormalized structure
-- =====================================================

-- =====================================================
-- STEP 1: DROP NEW NORMALIZED TABLES
-- =====================================================
DROP TABLE IF EXISTS course_chapters CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP VIEW IF EXISTS course_structure_view CASCADE;

-- =====================================================
-- STEP 2: DROP HELPER FUNCTIONS
-- =====================================================
DROP FUNCTION IF EXISTS upsert_course_metadata(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS insert_course_chapter(INTEGER, SMALLINT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS insert_course_lesson(INTEGER, UUID, SMALLINT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS insert_chapter_overview(INTEGER, UUID, TEXT);
DROP FUNCTION IF EXISTS insert_lesson_content(INTEGER, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- =====================================================
-- STEP 3: RECREATE ORIGINAL course_structure TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_structure (
    id INTEGER PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES course_metadata(course_id) ON DELETE CASCADE,
    chapter_count SMALLINT DEFAULT 0,
    -- Chapter 1
    chapter_title_1 TEXT,
    lesson_1_1 TEXT,
    lesson_1_2 TEXT,
    lesson_1_3 TEXT,
    lesson_1_4 TEXT,
    chapter_id_1 TEXT,
    -- Chapter 2
    chapter_title_2 TEXT,
    lesson_2_1 TEXT,
    lesson_2_2 TEXT,
    lesson_2_3 TEXT,
    lesson_2_4 TEXT,
    chapter_id_2 TEXT,
    -- Chapter 3
    chapter_title_3 TEXT,
    lesson_3_1 TEXT,
    lesson_3_2 TEXT,
    lesson_3_3 TEXT,
    lesson_3_4 TEXT,
    chapter_id_3 TEXT,
    -- Chapter 4
    chapter_title_4 TEXT,
    lesson_4_1 TEXT,
    lesson_4_2 TEXT,
    lesson_4_3 TEXT,
    lesson_4_4 TEXT,
    chapter_id_4 TEXT,
    -- Chapter 5
    chapter_title_5 TEXT,
    lesson_5_1 TEXT,
    lesson_5_2 TEXT,
    lesson_5_3 TEXT,
    lesson_5_4 TEXT,
    chapter_id_5 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for course_structure
CREATE INDEX IF NOT EXISTS idx_course_structure_course_id ON course_structure(course_id);

-- Enable RLS for course_structure
ALTER TABLE course_structure ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_structure
DROP POLICY IF EXISTS "Enable read access for all users" ON course_structure;
CREATE POLICY "Enable read access for all users" ON course_structure FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON course_structure;
CREATE POLICY "Enable insert for authenticated users" ON course_structure FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON course_structure;
CREATE POLICY "Enable update for authenticated users" ON course_structure FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON course_structure;
CREATE POLICY "Enable delete for authenticated users" ON course_structure FOR DELETE USING (auth.role() = 'authenticated');

-- Add trigger for course_structure
DROP TRIGGER IF EXISTS update_course_structure_updated_at ON course_structure;
CREATE TRIGGER update_course_structure_updated_at
    BEFORE UPDATE ON course_structure
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: RECREATE ORIGINAL course_description TABLE
-- =====================================================
DROP TABLE IF EXISTS course_description CASCADE;

CREATE TABLE course_description (
    id INTEGER PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES course_metadata(course_id) ON DELETE CASCADE,
    -- Chapter 1 descriptions
    chapter_1_description TEXT,
    lesson_1_1_description TEXT,
    lesson_1_2_description TEXT,
    lesson_1_3_description TEXT,
    lesson_1_4_description TEXT,
    chapter_id_1 TEXT,
    -- Chapter 2 descriptions
    chapter_2_description TEXT,
    lesson_2_1_description TEXT,
    lesson_2_2_description TEXT,
    lesson_2_3_description TEXT,
    lesson_2_4_description TEXT,
    chapter_id_2 TEXT,
    -- Chapter 3 descriptions
    chapter_3_description TEXT,
    lesson_3_1_description TEXT,
    lesson_3_2_description TEXT,
    lesson_3_3_description TEXT,
    lesson_3_4_description TEXT,
    chapter_id_3 TEXT,
    -- Chapter 4 descriptions
    chapter_4_description TEXT,
    lesson_4_1_description TEXT,
    lesson_4_2_description TEXT,
    lesson_4_3_description TEXT,
    lesson_4_4_description TEXT,
    chapter_id_4 TEXT,
    -- Chapter 5 descriptions
    chapter_5_description TEXT,
    lesson_5_1_description TEXT,
    lesson_5_2_description TEXT,
    lesson_5_3_description TEXT,
    lesson_5_4_description TEXT,
    chapter_id_5 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for course_description
CREATE INDEX IF NOT EXISTS idx_course_description_course_id ON course_description(course_id);

-- Enable RLS for course_description
ALTER TABLE course_description ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_description
DROP POLICY IF EXISTS "Enable read access for all users" ON course_description;
CREATE POLICY "Enable read access for all users" ON course_description FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON course_description;
CREATE POLICY "Enable insert for authenticated users" ON course_description FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON course_description;
CREATE POLICY "Enable update for authenticated users" ON course_description FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON course_description;
CREATE POLICY "Enable delete for authenticated users" ON course_description FOR DELETE USING (auth.role() = 'authenticated');

-- Add trigger for course_description
DROP TRIGGER IF EXISTS update_course_description_updated_at ON course_description;
CREATE TRIGGER update_course_description_updated_at
    BEFORE UPDATE ON course_description
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: REMOVE ADDED COLUMNS FROM course_content
-- =====================================================
ALTER TABLE course_content
    DROP COLUMN IF EXISTS lesson_uuid,
    DROP COLUMN IF EXISTS chapter_uuid,
    DROP COLUMN IF EXISTS key_terms_3,
    DROP COLUMN IF EXISTS key_terms_3_def,
    DROP COLUMN IF EXISTS key_terms_4,
    DROP COLUMN IF EXISTS key_terms_4_def,
    DROP COLUMN IF EXISTS key_terms_5,
    DROP COLUMN IF EXISTS key_terms_5_def,
    DROP COLUMN IF EXISTS key_terms_6,
    DROP COLUMN IF EXISTS key_terms_6_def,
    DROP COLUMN IF EXISTS key_terms_7,
    DROP COLUMN IF EXISTS key_terms_7_def,
    DROP COLUMN IF EXISTS key_terms_8,
    DROP COLUMN IF EXISTS key_terms_8_def,
    DROP COLUMN IF EXISTS key_terms_9,
    DROP COLUMN IF EXISTS key_terms_9_def,
    DROP COLUMN IF EXISTS key_terms_10,
    DROP COLUMN IF EXISTS key_terms_10_def,
    DROP COLUMN IF EXISTS core_concepts_3,
    DROP COLUMN IF EXISTS core_concepts_3_def,
    DROP COLUMN IF EXISTS core_concepts_4,
    DROP COLUMN IF EXISTS core_concepts_4_def,
    DROP COLUMN IF EXISTS core_concepts_5,
    DROP COLUMN IF EXISTS core_concepts_5_def,
    DROP COLUMN IF EXISTS core_concepts_6,
    DROP COLUMN IF EXISTS core_concepts_6_def,
    DROP COLUMN IF EXISTS core_concepts_7,
    DROP COLUMN IF EXISTS core_concepts_7_def,
    DROP COLUMN IF EXISTS core_concepts_8,
    DROP COLUMN IF EXISTS core_concepts_8_def,
    DROP COLUMN IF EXISTS core_concepts_9,
    DROP COLUMN IF EXISTS core_concepts_9_def,
    DROP COLUMN IF EXISTS core_concepts_10,
    DROP COLUMN IF EXISTS core_concepts_10_def,
    DROP COLUMN IF EXISTS key_takeaways_3,
    DROP COLUMN IF EXISTS key_takeaways_4,
    DROP COLUMN IF EXISTS key_takeaways_5,
    DROP COLUMN IF EXISTS key_takeaways_6,
    DROP COLUMN IF EXISTS key_takeaways_7,
    DROP COLUMN IF EXISTS key_takeaways_8,
    DROP COLUMN IF EXISTS key_takeaways_9,
    DROP COLUMN IF EXISTS key_takeaways_10;

-- Drop indexes that were added for the UUID columns
DROP INDEX IF EXISTS idx_course_content_lesson_uuid;
DROP INDEX IF EXISTS idx_course_content_chapter_uuid;

-- =====================================================
-- STEP 6: REMOVE ADDED COLUMNS FROM user_lesson_progress
-- =====================================================
ALTER TABLE user_lesson_progress
    DROP COLUMN IF EXISTS lesson_uuid,
    DROP COLUMN IF EXISTS chapter_uuid;

-- Drop indexes that were added for the UUID columns
DROP INDEX IF EXISTS idx_user_lesson_progress_lesson_uuid;
DROP INDEX IF EXISTS idx_user_lesson_progress_chapter_uuid;

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================
-- The database structure has been restored to its original
-- denormalized state. Your N8N workflow should work again.
-- =====================================================
