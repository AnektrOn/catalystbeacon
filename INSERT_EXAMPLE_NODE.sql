-- =====================================================
-- INSERT EXAMPLE NODE FROM JSON DATA
-- =====================================================
-- This inserts the example node you provided
-- 
-- Option 1: Map to existing constellation "Wheel Harmonizers"
-- Option 2: Create new constellation "Chakra Calibration" (commented out)

-- =====================================================
-- OPTION 1: Insert into existing constellation
-- =====================================================

INSERT INTO stellar_map_nodes (title, link, constellation_id, difficulty, difficulty_label, xp_threshold, metadata)
SELECT 
  'Activating Your Spiritual Potential Through Angels, Crystals, Colors and Metals | Dr. Robert Gilbert',
  'https://www.youtube.com/watch?v=iaAvH7wc9CE',
  c.id,
  8,
  '3D',
  68000, -- Beam threshold for Transformation level, difficulty 8
  '{"selected_skills": ["self_awareness", "ritual_creation", "quantum_understanding_habit"], "difficulty_name": "3D"}'::jsonb
FROM constellations c
JOIN constellation_families cf ON c.family_id = cf.id
WHERE c.name = 'Wheel Harmonizers'  -- Mapping "Chakra Calibration" → "Wheel Harmonizers"
  AND cf.name = 'Energy Architects'  -- Mapping "Energy-Body Engineering" → "Energy Architects"
  AND c.level = 'Transformation'
ON CONFLICT DO NOTHING;

-- =====================================================
-- OPTION 2: Create new constellation first, then insert
-- =====================================================

-- Uncomment below if you want to create "Chakra Calibration" as a new constellation:

/*
-- Step 1: Create the new constellation
INSERT INTO constellations (name, family_id, level, color_hex, display_order)
SELECT 
  'Chakra Calibration',
  cf.id,
  'Transformation',
  '200070', -- Similar color to other Energy Architects constellations
  4 -- Display order (after Prana Weaver)
FROM constellation_families cf
WHERE cf.name = 'Energy Architects'
  AND NOT EXISTS (
    SELECT 1 FROM constellations WHERE name = 'Chakra Calibration'
  )
ON CONFLICT (name) DO NOTHING;

-- Step 2: Insert the node
INSERT INTO stellar_map_nodes (title, link, constellation_id, difficulty, difficulty_label, xp_threshold, metadata)
SELECT 
  'Activating Your Spiritual Potential Through Angels, Crystals, Colors and Metals | Dr. Robert Gilbert',
  'https://www.youtube.com/watch?v=iaAvH7wc9CE',
  c.id,
  8,
  '3D',
  68000,
  '{"selected_skills": ["self_awareness", "ritual_creation", "quantum_understanding_habit"], "difficulty_name": "3D"}'::jsonb
FROM constellations c
JOIN constellation_families cf ON c.family_id = cf.id
WHERE c.name = 'Chakra Calibration'
  AND cf.name = 'Energy Architects'
  AND c.level = 'Transformation'
ON CONFLICT DO NOTHING;
*/
