-- =====================================================
-- DROP DUPLICATE course_descriptions TABLE
-- =====================================================
-- This migration removes the duplicate course_descriptions (plural) table
-- The correct table is course_description (singular)
-- =====================================================

DROP TABLE IF EXISTS course_descriptions CASCADE;

-- Verify the correct table exists
-- course_description (singular) should remain with columns:
-- - chapter_1_description, lesson_1_1_description, etc.
