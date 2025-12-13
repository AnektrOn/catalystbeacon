-- =====================================================
-- N8N HELPER FUNCTIONS FOR STELLAR MAP NODES
-- =====================================================
-- These functions make it easy to insert/update nodes from n8N
-- using only names (no UUIDs required)

-- Function 1: Simple insert/update using names
-- This is the easiest for n8N - just pass your JSON
CREATE OR REPLACE FUNCTION upsert_stellar_node_from_json(
  p_json JSONB
) RETURNS JSONB AS $$
DECLARE
  v_node_id UUID;
  v_result JSONB;
BEGIN
  -- Use the existing function to insert
  v_node_id := insert_stellar_map_node_from_json(p_json);
  
  -- Return success with node ID
  v_result := jsonb_build_object(
    'success', true,
    'node_id', v_node_id,
    'message', 'Node inserted successfully'
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to insert node'
    );
END;
$$ LANGUAGE plpgsql;

-- Function 2: Direct insert with individual parameters (alternative for n8N)
-- Use this if you prefer to pass individual fields instead of JSON
CREATE OR REPLACE FUNCTION upsert_stellar_node(
  p_core_node TEXT,
  p_family_name TEXT,
  p_constellation_name TEXT,
  p_title TEXT,
  p_link TEXT,
  p_difficulty INTEGER,
  p_difficulty_name TEXT,
  p_selected_skills JSONB DEFAULT '[]'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_json JSONB;
  v_result JSONB;
BEGIN
  -- Build JSON from parameters
  v_json := jsonb_build_object(
    'classification', jsonb_build_object(
      'core_node', p_core_node,
      'family_name', p_family_name,
      'constellation_name', p_constellation_name,
      'difficulty_level', p_difficulty,
      'difficulty_name', p_difficulty_name,
      'selected_skills', COALESCE(p_selected_skills, '[]'::jsonb)
    ),
    'analysis_details', jsonb_build_object(
      'title', p_title,
      'link', p_link
    )
  );
  
  -- Call the main function
  v_result := upsert_stellar_node_from_json(v_json);
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to insert node'
    );
END;
$$ LANGUAGE plpgsql;

-- Function 3: Update existing node by title (for n8N updates)
CREATE OR REPLACE FUNCTION update_stellar_node_by_title(
  p_title TEXT,
  p_json JSONB
) RETURNS JSONB AS $$
DECLARE
  v_node_id UUID;
  v_constellation_id UUID;
  v_core_node TEXT;
  v_family_name TEXT;
  v_constellation_name TEXT;
  v_difficulty INTEGER;
  v_difficulty_name TEXT;
  v_link TEXT;
  v_selected_skills JSONB;
  v_xp_threshold INTEGER;
  v_level TEXT;
  v_result JSONB;
BEGIN
  -- Extract values from JSON
  v_core_node := UPPER(p_json->'classification'->>'core_node');
  v_family_name := p_json->'classification'->>'family_name';
  v_constellation_name := p_json->'classification'->>'constellation_name';
  v_difficulty := (p_json->'classification'->>'difficulty_level')::INTEGER;
  v_difficulty_name := p_json->'classification'->>'difficulty_name';
  v_link := p_json->'analysis_details'->>'link';
  v_selected_skills := COALESCE(p_json->'classification'->'selected_skills', '[]'::jsonb);
  
  -- Map core_node to level
  CASE UPPER(v_core_node)
    WHEN 'TRANSFORMATION' THEN v_level := 'Transformation';
    WHEN 'IGNITION' THEN v_level := 'Ignition';
    WHEN 'INSIGHT' THEN v_level := 'Insight';
    WHEN 'GOD_MODE' THEN v_level := 'God Mode';
    ELSE v_level := 'Transformation';
  END CASE;
  
  -- Find constellation
  SELECT c.id INTO v_constellation_id
  FROM constellations c
  JOIN constellation_families cf ON c.family_id = cf.id
  WHERE (
    c.name = v_constellation_name OR c.alias = v_constellation_name
  )
  AND (
    cf.name = v_family_name OR cf.alias = v_family_name
  )
  AND c.level = v_level
  LIMIT 1;
  
  IF v_constellation_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Constellation not found',
      'message', format('Could not find constellation "%s" in family "%s"', v_constellation_name, v_family_name)
    );
  END IF;
  
  -- Calculate XP threshold
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
  
  -- Update or insert node
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
    p_title,
    v_link,
    v_constellation_id,
    v_difficulty,
    v_difficulty_name,
    v_xp_threshold,
    v_core_node,
    v_family_name,
    v_constellation_name,
    v_selected_skills,
    p_json
  )
  ON CONFLICT (title) DO UPDATE SET
    link = EXCLUDED.link,
    constellation_id = EXCLUDED.constellation_id,
    difficulty = EXCLUDED.difficulty,
    difficulty_label = EXCLUDED.difficulty_label,
    xp_threshold = EXCLUDED.xp_threshold,
    core_node = EXCLUDED.core_node,
    family_name = EXCLUDED.family_name,
    constellation_name = EXCLUDED.constellation_name,
    selected_skills = EXCLUDED.selected_skills,
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
  RETURNING id INTO v_node_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'node_id', v_node_id,
    'message', 'Node updated successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to update node'
    );
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint on title if it doesn't exist (for upsert functionality)
-- This allows us to update by title
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stellar_map_nodes_title_unique'
  ) THEN
    ALTER TABLE stellar_map_nodes 
    ADD CONSTRAINT stellar_map_nodes_title_unique UNIQUE (title);
  END IF;
END $$;
