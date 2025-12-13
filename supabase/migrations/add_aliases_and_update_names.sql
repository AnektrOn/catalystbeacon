-- =====================================================
-- ADD ALIASES AND UPDATE NAMES TO MATCH USER STRUCTURE
-- =====================================================
-- This migration adds alias columns and updates existing records
-- to use full names with aliases stored separately

-- Step 1: Add alias columns
ALTER TABLE constellation_families 
  ADD COLUMN IF NOT EXISTS alias TEXT;

ALTER TABLE constellations 
  ADD COLUMN IF NOT EXISTS alias TEXT;

-- Step 2: Create indexes for aliases
CREATE INDEX IF NOT EXISTS idx_constellation_families_alias ON constellation_families(alias);
CREATE INDEX IF NOT EXISTS idx_constellations_alias ON constellations(alias);

-- Step 3: Update Ignition families (current alias → new name, store old name as alias)
UPDATE constellation_families 
SET 
  name = 'Systemic Exposé',
  alias = 'Veil Piercers'
WHERE name = 'Veil Piercers' AND level = 'Ignition';

UPDATE constellation_families 
SET 
  name = 'Psychological Control',
  alias = 'Mind Hackers'
WHERE name = 'Mind Hackers' AND level = 'Ignition';

UPDATE constellation_families 
SET 
  name = 'Identity Deconstruction',
  alias = 'Persona Shifters'
WHERE name = 'Persona Shifters' AND level = 'Ignition';

UPDATE constellation_families 
SET 
  name = 'Irrefutable Doubt',
  alias = 'Reality Shatters'
WHERE name = 'Reality Shatters' AND level = 'Ignition';

-- Step 4: Update Insight families
UPDATE constellation_families 
SET 
  name = 'Mental Awakening',
  alias = 'Thought Catchers'
WHERE name = 'Thought Catchers' AND level = 'Insight';

UPDATE constellation_families 
SET 
  name = 'Emotional Grounding',
  alias = 'Heart Whisperers'
WHERE name = 'Heart Whisperers' AND level = 'Insight';

UPDATE constellation_families 
SET 
  name = 'Habitual Fortification',
  alias = 'Routine Architects'
WHERE name = 'Routine Architects' AND level = 'Insight';

UPDATE constellation_families 
SET 
  name = 'Foundational Safety',
  alias = 'Safe Havens'
WHERE name = 'Safe Havens' AND level = 'Insight';

-- Step 5: Update Transformation families
UPDATE constellation_families 
SET 
  name = 'Neuroplasticity Mastery',
  alias = 'Path Makers'
WHERE name = 'Path Makers' AND level = 'Transformation';

UPDATE constellation_families 
SET 
  name = 'Quantum Perception Practices',
  alias = 'Reality Tuners'
WHERE name = 'Reality Tuners' AND level = 'Transformation';

UPDATE constellation_families 
SET 
  name = 'Energy-Body Engineering',
  alias = 'Energy Architects'
WHERE name = 'Energy Architects' AND level = 'Transformation';

UPDATE constellation_families 
SET 
  name = 'Shadow Integration Architecture',
  alias = 'Inner Illuminators'
WHERE name = 'Inner Illuminators' AND level = 'Transformation';

UPDATE constellation_families 
SET 
  name = 'Ritual Reinforcement System',
  alias = 'Ritual Grid'
WHERE name = 'Ritual Grid' AND level = 'Transformation';

-- Step 6: Update Ignition constellations under "Systemic Exposé" (Veil Piercers)
UPDATE constellations 
SET 
  name = 'Institutional Rigging',
  alias = 'Puppet Masters'
WHERE name = 'Puppet Masters' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Systemic Exposé' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Media & Narrative Control',
  alias = 'Smoke & Mirrors'
WHERE name = 'Smoke & Mirrors' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Systemic Exposé' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Economic Exploitation',
  alias = 'Golden Shackles'
WHERE name = 'Golden Shackles' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Systemic Exposé' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Digital Surveillance State',
  alias = 'Panopticon'
WHERE name = 'Panopticon' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Systemic Exposé' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Educational Industrial Complex',
  alias = 'Lesson Leashes'
WHERE name = 'Lesson Leashes' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Systemic Exposé' AND level = 'Ignition');

-- Step 7: Update Ignition constellations under "Psychological Control" (Mind Hackers)
UPDATE constellations 
SET 
  name = 'Advertising & Persuasion Mechanics',
  alias = 'Hidden Commands'
WHERE name = 'Hidden Commands' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Psychological Control' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Social-Media Algorithm Engineering',
  alias = 'Feed Puppets'
WHERE name = 'Feed Puppets' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Psychological Control' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Cognitive Bias & Mindware',
  alias = 'Mind Traps'
WHERE name = 'Mind Traps' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Psychological Control' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Propaganda Techniques',
  alias = 'Voice of Deception'
WHERE name = 'Voice of Deception' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Psychological Control' AND level = 'Ignition');

-- Step 8: Update Ignition constellations under "Identity Deconstruction" (Persona Shifters)
UPDATE constellations 
SET 
  name = 'Social Role Unmasking',
  alias = 'Mask Breakers'
WHERE name = 'Mask Breakers' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Identity Deconstruction' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Digital Persona Exposure',
  alias = 'Avatar Illusions'
WHERE name = 'Avatar Illusions' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Identity Deconstruction' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Existential Shock',
  alias = 'I-Dissolvers'
WHERE name = 'I-Dissolvers' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Identity Deconstruction' AND level = 'Ignition');

-- Step 9: Update Ignition constellations under "Irrefutable Doubt" (Reality Shatters)
UPDATE constellations 
SET 
  name = 'Data-Driven Shock Therapy',
  alias = 'Numbers Don''t Lie'
WHERE name = 'Numbers Don''t Lie' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Irrefutable Doubt' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'First-Hand Insider Accounts',
  alias = 'Whistleblowers'
WHERE name = 'Whistleblowers' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Irrefutable Doubt' AND level = 'Ignition');

UPDATE constellations 
SET 
  name = 'Contradiction Demonstrations',
  alias = 'Double-Speak'
WHERE name = 'Double-Speak' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Irrefutable Doubt' AND level = 'Ignition');

-- Step 10: Update Insight constellations under "Mental Awakening" (Thought Catchers)
UPDATE constellations 
SET 
  name = 'Pause & Observe',
  alias = 'Pause Buttons'
WHERE name = 'Pause Buttons' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Mental Awakening' AND level = 'Insight');

UPDATE constellations 
SET 
  name = 'Micro-Journaling Prompts',
  alias = 'Mirror Moments'
WHERE name = 'Mirror Moments' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Mental Awakening' AND level = 'Insight');

UPDATE constellations 
SET 
  name = 'Sensory Anchoring',
  alias = 'Grounding Gems'
WHERE name = 'Grounding Gems' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Mental Awakening' AND level = 'Insight');

-- Step 11: Update Insight constellations under "Emotional Grounding" (Heart Whisperers)
UPDATE constellations 
SET 
  name = 'Label & Release',
  alias = 'Feeling Detectors'
WHERE name = 'Feeling Detectors' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Emotional Grounding' AND level = 'Insight');

UPDATE constellations 
SET 
  name = 'Brief Self-Soothing Rituals',
  alias = 'Calm Cradles'
WHERE name = 'Calm Cradles' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Emotional Grounding' AND level = 'Insight');

UPDATE constellations 
SET 
  name = 'Emotional Checkpoints',
  alias = 'Mood Markers'
WHERE name = 'Mood Markers' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Emotional Grounding' AND level = 'Insight');

-- Step 12: Update Insight constellations under "Habitual Fortification" (Routine Architects)
UPDATE constellations 
SET 
  name = 'Morning Micro-Ritual',
  alias = 'Tiny Dawns'
WHERE name = 'Tiny Dawns' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Habitual Fortification' AND level = 'Insight');

UPDATE constellations 
SET 
  name = 'Screen-Time Boundaries',
  alias = 'Signal Guards'
WHERE name = 'Signal Guards' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Habitual Fortification' AND level = 'Insight');

UPDATE constellations 
SET 
  name = 'Micro-Break Protocols',
  alias = 'Reset Pulses'
WHERE name = 'Reset Pulses' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Habitual Fortification' AND level = 'Insight');

-- Step 13: Update Insight constellations under "Foundational Safety" (Safe Havens)
UPDATE constellations 
SET 
  name = 'Safe-Space Visualization',
  alias = 'Mind Sanctum'
WHERE name = 'Mind Sanctum' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Foundational Safety' AND level = 'Insight');

UPDATE constellations 
SET 
  name = '3-Point Breath Anchor',
  alias = 'Breath Portals'
WHERE name = 'Breath Portals' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Foundational Safety' AND level = 'Insight');

UPDATE constellations 
SET 
  name = 'Quick Coherence Tap',
  alias = 'Rhythm Reset'
WHERE name = 'Rhythm Reset' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Foundational Safety' AND level = 'Insight');

-- Step 14: Update Transformation constellations under "Neuroplasticity Mastery" (Path Makers)
UPDATE constellations 
SET 
  name = 'Groove Formation Workouts',
  alias = 'Thought Sculptors'
WHERE name = 'Thought Sculptors' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Neuroplasticity Mastery' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Computational Visualization',
  alias = 'Mind Cartographers'
WHERE name = 'Mind Cartographers' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Neuroplasticity Mastery' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Behavior-Brain Sync',
  alias = 'Body-Bridge'
WHERE name = 'Body-Bridge' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Neuroplasticity Mastery' AND level = 'Transformation');

-- Step 15: Update Transformation constellations under "Quantum Perception Practices" (Reality Tuners)
UPDATE constellations 
SET 
  name = 'Observer Effect Exercises',
  alias = 'Witness Protocols'
WHERE name = 'Witness Protocols' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Quantum Perception Practices' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Probability Alignment Drills',
  alias = 'Chance Benders'
WHERE name = 'Chance Benders' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Quantum Perception Practices' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Field Coherence Visualization',
  alias = 'Aura Sync'
WHERE name = 'Aura Sync' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Quantum Perception Practices' AND level = 'Transformation');

-- Step 16: Update Transformation constellations under "Energy-Body Engineering" (Energy Architects)
UPDATE constellations 
SET 
  name = 'Chakra Calibration',
  alias = 'Wheel Harmonizers'
WHERE name = 'Wheel Harmonizers' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Energy-Body Engineering' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Meridian Flow Sequencing',
  alias = 'Energy Highways'
WHERE name = 'Energy Highways' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Energy-Body Engineering' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Breath-Body Integration',
  alias = 'Prana Weaver'
WHERE name = 'Prana Weaver' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Energy-Body Engineering' AND level = 'Transformation');

-- Step 17: Update Transformation constellations under "Shadow Integration Architecture" (Inner Illuminators)
UPDATE constellations 
SET 
  name = 'Core Belief Excavation',
  alias = 'Core Miners'
WHERE name = 'Core Miners' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Shadow Integration Architecture' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Self-Dialogue Lab',
  alias = 'Voice Bridgers'
WHERE name = 'Voice Bridgers' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Shadow Integration Architecture' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Integrative Reflection Checklists',
  alias = 'Shadow Ledger'
WHERE name = 'Shadow Ledger' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Shadow Integration Architecture' AND level = 'Transformation');

-- Step 18: Update Transformation constellations under "Ritual Reinforcement System" (Ritual Grid)
UPDATE constellations 
SET 
  name = 'Daily NeuroGrid',
  alias = 'Dawn Circuit'
WHERE name = 'Dawn Circuit' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Ritual Reinforcement System' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Weekly Quantum Circle',
  alias = 'Unity Pulse'
WHERE name = 'Unity Pulse' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Ritual Reinforcement System' AND level = 'Transformation');

UPDATE constellations 
SET 
  name = 'Monthly Integration Audit',
  alias = 'Meta Map'
WHERE name = 'Meta Map' 
  AND family_id = (SELECT id FROM constellation_families WHERE name = 'Ritual Reinforcement System' AND level = 'Transformation');

-- Step 19: Update the JSON insertion function to handle both names and aliases
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
    
    -- Find constellation by name OR alias (try both)
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
    
    -- If not found, create it
    IF v_constellation_id IS NULL THEN
      -- First ensure family exists (try to find by name or alias)
      INSERT INTO constellation_families (name, level, color_hex, display_order, alias)
      SELECT 
        v_family_name, 
        v_level, 
        '333333', 
        (SELECT COALESCE(MAX(display_order), 0) + 1 FROM constellation_families WHERE level = v_level),
        NULL -- No alias provided in JSON, will be set later if needed
      WHERE NOT EXISTS (
        SELECT 1 FROM constellation_families 
        WHERE (name = v_family_name OR alias = v_family_name) AND level = v_level
      )
      ON CONFLICT (name) DO NOTHING;
      
      -- Then create constellation
      INSERT INTO constellations (name, family_id, level, color_hex, display_order, alias)
      SELECT 
        v_constellation_name,
        cf.id,
        v_level,
        '666666',
        (SELECT COALESCE(MAX(display_order), 0) + 1 FROM constellations WHERE family_id = cf.id),
        NULL
      FROM constellation_families cf
      WHERE (cf.name = v_family_name OR cf.alias = v_family_name) AND cf.level = v_level
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
