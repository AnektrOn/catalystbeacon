-- =====================================================
-- UPDATE STELLAR MAP SCHEMA TO MATCH JSON STRUCTURE
-- =====================================================
-- This migration updates the schema to better accommodate
-- the JSON format provided by the user

-- Step 1: Add columns to store JSON structure fields directly
ALTER TABLE stellar_map_nodes 
  ADD COLUMN IF NOT EXISTS core_node TEXT,
  ADD COLUMN IF NOT EXISTS family_name TEXT,
  ADD COLUMN IF NOT EXISTS constellation_name TEXT,
  ADD COLUMN IF NOT EXISTS selected_skills JSONB DEFAULT '[]'::jsonb;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stellar_map_nodes_family_name ON stellar_map_nodes(family_name);
CREATE INDEX IF NOT EXISTS idx_stellar_map_nodes_constellation_name ON stellar_map_nodes(constellation_name);
CREATE INDEX IF NOT EXISTS idx_stellar_map_nodes_core_node ON stellar_map_nodes(core_node);

-- Step 2: Update metadata structure to match JSON
-- The metadata column already exists, but we'll ensure it can store the full JSON structure

-- Step 3: Create function to insert node from JSON format
CREATE OR REPLACE FUNCTION insert_stellar_map_node_from_json(
  p_json JSONB
) RETURNS UUID AS $$
DECLARE
  v_constellation_id UUID;
  v_node_id UUID;
  v_core_node TEXT;
  v_family_name TEXT;
  v_constellation_name TEXT;
  v_difficulty INTEGER;
  v_difficulty_name TEXT;
  v_title TEXT;
  v_link TEXT;
  v_selected_skills JSONB;
  v_xp_threshold INTEGER;
BEGIN
  -- Extract values from JSON
  v_core_node := UPPER(p_json->'classification'->>'core_node');
  v_family_name := p_json->'classification'->>'family_name';
  v_constellation_name := p_json->'classification'->>'constellation_name';
  v_difficulty := (p_json->'classification'->>'difficulty_level')::INTEGER;
  v_difficulty_name := p_json->'classification'->>'difficulty_name';
  v_title := p_json->'analysis_details'->>'title';
  v_link := p_json->'analysis_details'->>'link';
  v_selected_skills := COALESCE(p_json->'classification'->'selected_skills', '[]'::jsonb);
  
    -- Map core_node to level
    DECLARE
      v_level TEXT;
    BEGIN
      CASE UPPER(v_core_node)
        WHEN 'TRANSFORMATION' THEN v_level := 'Transformation';
        WHEN 'IGNITION' THEN v_level := 'Ignition';
        WHEN 'INSIGHT' THEN v_level := 'Insight';
        WHEN 'GOD_MODE' THEN v_level := 'God Mode';
        ELSE v_level := 'Transformation';
      END CASE;
    
    -- Find or create constellation
    -- First, try to find existing constellation
    SELECT c.id INTO v_constellation_id
    FROM constellations c
    JOIN constellation_families cf ON c.family_id = cf.id
    WHERE c.name = v_constellation_name
      AND cf.name = v_family_name
      AND c.level = v_level
    LIMIT 1;
    
    -- If not found, create it
    IF v_constellation_id IS NULL THEN
      -- First ensure family exists (auto-create if doesn't exist)
      INSERT INTO constellation_families (name, level, color_hex, display_order)
      SELECT v_family_name, v_level, '333333', 
        (SELECT COALESCE(MAX(display_order), 0) + 1 FROM constellation_families WHERE level = v_level)
      WHERE NOT EXISTS (
        SELECT 1 FROM constellation_families WHERE name = v_family_name AND level = v_level
      )
      ON CONFLICT (name) DO NOTHING;
      
      -- Then create constellation (auto-create if doesn't exist)
      INSERT INTO constellations (name, family_id, level, color_hex, display_order)
      SELECT 
        v_constellation_name,
        cf.id,
        v_level,
        '666666',
        (SELECT COALESCE(MAX(display_order), 0) + 1 FROM constellations WHERE family_id = cf.id)
      FROM constellation_families cf
      WHERE cf.name = v_family_name AND cf.level = v_level
      ON CONFLICT (name) DO UPDATE SET
        family_id = EXCLUDED.family_id,
        level = EXCLUDED.level
      RETURNING id INTO v_constellation_id;
    END IF;
    
    -- Calculate XP threshold based on difficulty
    CASE v_level
      WHEN 'Transformation' THEN
        IF v_difficulty >= 9 THEN v_xp_threshold := 84000;
        ELSIF v_difficulty >= 6 THEN v_xp_threshold := 68000;
        ELSIF v_difficulty >= 3 THEN v_xp_threshold := 52000;
        ELSE v_xp_threshold := 36000;
        END IF;
      WHEN 'Insight' THEN
        IF v_difficulty >= 9 THEN v_xp_threshold := 30750;
        ELSIF v_difficulty >= 6 THEN v_xp_threshold := 25500;
        ELSIF v_difficulty >= 3 THEN v_xp_threshold := 20250;
        ELSE v_xp_threshold := 15000;
        END IF;
      WHEN 'Ignition' THEN
        IF v_difficulty >= 9 THEN v_xp_threshold := 11250;
        ELSIF v_difficulty >= 6 THEN v_xp_threshold := 7500;
        ELSIF v_difficulty >= 3 THEN v_xp_threshold := 3750;
        ELSE v_xp_threshold := 0;
        END IF;
      ELSE v_xp_threshold := 0;
    END CASE;
    
    -- Insert the node
    INSERT INTO stellar_map_nodes (
      title,
      link,
      constellation_id,
      difficulty,
      difficulty_label,
      xp_threshold,
      core_node,
      family_name,
      constellation_name,
      selected_skills,
      metadata
    ) VALUES (
      v_title,
      v_link,
      v_constellation_id,
      v_difficulty,
      v_difficulty_name,
      v_xp_threshold,
      v_core_node,
      v_family_name,
      v_constellation_name,
      v_selected_skills,
      p_json -- Store full JSON in metadata
    )
    RETURNING id INTO v_node_id;
    
    RETURN v_node_id;
  END;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a simpler function that accepts the JSON directly
CREATE OR REPLACE FUNCTION insert_stellar_node(
  p_classification JSONB,
  p_analysis_details JSONB
) RETURNS UUID AS $$
DECLARE
  v_json JSONB;
BEGIN
  -- Combine into single JSON object
  v_json := jsonb_build_object(
    'classification', p_classification,
    'analysis_details', p_analysis_details
  );
  
  RETURN insert_stellar_map_node_from_json(v_json);
END;
$$ LANGUAGE plpgsql;

-- Step 5: Example usage
/*
SELECT insert_stellar_map_node_from_json('{
  "classification": {
    "core_node": "TRANSFORMATION",
    "family_name": "Energy-Body Engineering",
    "constellation_name": "Chakra Calibration",
    "difficulty_level": 8,
    "difficulty_name": "3D",
    "selected_skills": ["self_awareness", "ritual_creation", "quantum_understanding_habit"]
  },
  "analysis_details": {
    "title": "Activating Your Spiritual Potential Through Angels, Crystals, Colors and Metals | Dr. Robert Gilbert",
    "link": "https://www.youtube.com/watch?v=iaAvH7wc9CE"
  }
}'::jsonb);
*/
