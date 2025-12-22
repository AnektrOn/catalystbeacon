-- =====================================================
-- EXPAND course_content TO SUPPORT 4 ITEMS
-- =====================================================
-- This migration adds columns to support 4 key terms,
-- 4 core concepts, and 4 takeaways (previously limited to 2)
-- =====================================================

-- Add key_terms_3 and key_terms_4
ALTER TABLE course_content
    ADD COLUMN IF NOT EXISTS key_terms_3 TEXT,
    ADD COLUMN IF NOT EXISTS key_terms_3_def TEXT,
    ADD COLUMN IF NOT EXISTS key_terms_4 TEXT,
    ADD COLUMN IF NOT EXISTS key_terms_4_def TEXT;

-- Add core_concepts_3 and core_concepts_4
ALTER TABLE course_content
    ADD COLUMN IF NOT EXISTS core_concepts_3 TEXT,
    ADD COLUMN IF NOT EXISTS core_concepts_3_def TEXT,
    ADD COLUMN IF NOT EXISTS core_concepts_4 TEXT,
    ADD COLUMN IF NOT EXISTS core_concepts_4_def TEXT;

-- Add key_takeaways_3 and key_takeaways_4
ALTER TABLE course_content
    ADD COLUMN IF NOT EXISTS key_takeaways_3 TEXT,
    ADD COLUMN IF NOT EXISTS key_takeaways_4 TEXT;

-- Add comments for documentation
COMMENT ON COLUMN course_content.key_terms_3 IS 'Third key term (expanded from 2 to 4)';
COMMENT ON COLUMN course_content.key_terms_4 IS 'Fourth key term (expanded from 2 to 4)';
COMMENT ON COLUMN course_content.core_concepts_3 IS 'Third core concept (expanded from 2 to 4)';
COMMENT ON COLUMN course_content.core_concepts_4 IS 'Fourth core concept (expanded from 2 to 4)';
COMMENT ON COLUMN course_content.key_takeaways_3 IS 'Third key takeaway (expanded from 2 to 4)';
COMMENT ON COLUMN course_content.key_takeaways_4 IS 'Fourth key takeaway (expanded from 2 to 4)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- course_content now supports:
--   - 4 key terms (key_terms_1 through key_terms_4)
--   - 4 core concepts (core_concepts_1 through core_concepts_4)
--   - 4 takeaways (key_takeaways_1 through key_takeaways_4)
-- =====================================================
