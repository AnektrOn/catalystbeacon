-- =====================================================
-- POPULATE STELLAR MAP NODES FROM JSON DATA
-- =====================================================
-- This script converts JSON node data to SQL INSERT statements
-- 
-- JSON Format:
-- {
--   "classification": {
--     "core_node": "TRANSFORMATION",
--     "family_name": "Energy-Body Engineering",
--     "constellation_name": "Chakra Calibration",
--     "difficulty_level": 8,
--     "difficulty_name": "3D",
--     "selected_skills": ["self_awareness", "ritual_creation", ...]
--   },
--   "analysis_details": {
--     "title": "Node Title",
--     "link": "https://..."
--   }
-- }

-- =====================================================
-- NAME MAPPING
-- =====================================================
-- If your JSON uses different names than the database,
-- update the mappings below or create new families/constellations

-- Example: Insert node with name mapping
-- Note: "Energy-Body Engineering" maps to "Energy Architects"
-- Note: "Chakra Calibration" maps to "Wheel Harmonizers" (or create new constellation)

-- =====================================================
-- OPTION 1: Map to existing constellation
-- =====================================================

INSERT INTO stellar_map_nodes (title, link, constellation_id, difficulty, difficulty_label, xp_threshold, metadata)
SELECT 
  'Activating Your Spiritual Potential Through Angels, Crystals, Colors and Metals | Dr. Robert Gilbert',
  'https://www.youtube.com/watch?v=iaAvH7wc9CE',
  c.id,
  8,
  '3D',
  68000, -- Beam threshold for Transformation (difficulty 8)
  '{"selected_skills": ["self_awareness", "ritual_creation", "quantum_understanding_habit"], "difficulty_name": "3D"}'::jsonb
FROM constellations c
JOIN constellation_families cf ON c.family_id = cf.id
WHERE c.name = 'Wheel Harmonizers'  -- Mapping "Chakra Calibration" to "Wheel Harmonizers"
  AND cf.name = 'Energy Architects'  -- Mapping "Energy-Body Engineering" to "Energy Architects"
  AND c.level = 'Transformation'
ON CONFLICT DO NOTHING;

-- =====================================================
-- OPTION 2: Create new constellation if it doesn't exist
-- =====================================================

-- First, create the constellation if needed
INSERT INTO constellations (name, family_id, level, color_hex, display_order)
SELECT 
  'Chakra Calibration',
  cf.id,
  'Transformation',
  '200070', -- Similar color to other Energy Architects constellations
  4 -- After Prana Weaver
FROM constellation_families cf
WHERE cf.name = 'Energy Architects'
  AND NOT EXISTS (
    SELECT 1 FROM constellations WHERE name = 'Chakra Calibration'
  )
ON CONFLICT (name) DO NOTHING;

-- Then insert the node
INSERT INTO stellar_map_nodes (title, link, constellation_id, difficulty, difficulty_label, xp_threshold, metadata)
SELECT 
  'Activating Your Spiritual Potential Through Angels, Crystals, Colors and Metals | Dr. Robert Gilbert',
  'https://www.youtube.com/watch?v=iaAvH7wc9CE',
  c.id,
  8,
  '3D',
  68000, -- Beam threshold for Transformation (difficulty 8)
  '{"selected_skills": ["self_awareness", "ritual_creation", "quantum_understanding_habit"], "difficulty_name": "3D"}'::jsonb
FROM constellations c
JOIN constellation_families cf ON c.family_id = cf.id
WHERE c.name = 'Chakra Calibration'
  AND cf.name = 'Energy Architects'
  AND c.level = 'Transformation'
ON CONFLICT DO NOTHING;

-- =====================================================
-- HELPER FUNCTION: Calculate XP threshold from difficulty
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_xp_threshold(
  p_level TEXT,
  p_difficulty INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_threshold INTEGER;
BEGIN
  -- Transformation thresholds
  IF p_level = 'Transformation' THEN
    IF p_difficulty >= 9 THEN
      v_threshold := 84000; -- Beam
    ELSIF p_difficulty >= 6 THEN
      v_threshold := 68000; -- Prism
    ELSIF p_difficulty >= 3 THEN
      v_threshold := 52000; -- Lens
    ELSE
      v_threshold := 36000; -- Fog
    END IF;
  -- Insight thresholds
  ELSIF p_level = 'Insight' THEN
    IF p_difficulty >= 9 THEN
      v_threshold := 30750; -- Beam
    ELSIF p_difficulty >= 6 THEN
      v_threshold := 25500; -- Prism
    ELSIF p_difficulty >= 3 THEN
      v_threshold := 20250; -- Lens
    ELSE
      v_threshold := 15000; -- Fog
    END IF;
  -- Ignition thresholds
  ELSIF p_level = 'Ignition' THEN
    IF p_difficulty >= 9 THEN
      v_threshold := 11250; -- Beam
    ELSIF p_difficulty >= 6 THEN
      v_threshold := 7500; -- Prism
    ELSIF p_difficulty >= 3 THEN
      v_threshold := 3750; -- Lens
    ELSE
      v_threshold := 0; -- Fog
    END IF;
  ELSE
    v_threshold := 0;
  END IF;
  
  RETURN v_threshold;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- EXAMPLE: Using the helper function
-- =====================================================

INSERT INTO stellar_map_nodes (title, link, constellation_id, difficulty, difficulty_label, xp_threshold, metadata)
SELECT 
  'Activating Your Spiritual Potential Through Angels, Crystals, Colors and Metals | Dr. Robert Gilbert',
  'https://www.youtube.com/watch?v=iaAvH7wc9CE',
  c.id,
  8,
  '3D',
  calculate_xp_threshold('Transformation', 8),
  '{"selected_skills": ["self_awareness", "ritual_creation", "quantum_understanding_habit"], "difficulty_name": "3D"}'::jsonb
FROM constellations c
JOIN constellation_families cf ON c.family_id = cf.id
WHERE c.name = 'Wheel Harmonizers'
  AND cf.name = 'Energy Architects'
  AND c.level = 'Transformation'
ON CONFLICT DO NOTHING;
