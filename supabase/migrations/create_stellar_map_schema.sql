-- =====================================================
-- STELLAR MAP DATABASE SCHEMA
-- =====================================================
-- Creates tables for constellation families, constellations, and stellar map nodes
-- Execute this in Supabase SQL Editor

-- Step 1: Create constellation_families table
CREATE TABLE IF NOT EXISTS constellation_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    level TEXT NOT NULL CHECK (level IN ('Ignition', 'Insight', 'Transformation', 'God Mode')),
    color_hex TEXT NOT NULL, -- Hex color code for family halo
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create constellations table
CREATE TABLE IF NOT EXISTS constellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    family_id UUID NOT NULL REFERENCES constellation_families(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('Ignition', 'Insight', 'Transformation', 'God Mode')),
    color_hex TEXT NOT NULL, -- Hex color code for constellation halo
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create stellar_map_nodes table
CREATE TABLE IF NOT EXISTS stellar_map_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    link TEXT NOT NULL, -- URL or route to the content
    constellation_id UUID NOT NULL REFERENCES constellations(id) ON DELETE CASCADE,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 0 AND difficulty <= 10), -- 0-10 difficulty scale
    difficulty_label TEXT NOT NULL, -- Human-readable label (Blind, Blurred, etc.)
    xp_threshold INTEGER DEFAULT 0, -- Minimum XP to see this node
    metadata JSONB DEFAULT '{}', -- Additional metadata (course_id, post_id, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_constellation_families_level ON constellation_families(level);
CREATE INDEX IF NOT EXISTS idx_constellation_families_order ON constellation_families(display_order);

CREATE INDEX IF NOT EXISTS idx_constellations_family_id ON constellations(family_id);
CREATE INDEX IF NOT EXISTS idx_constellations_level ON constellations(level);
CREATE INDEX IF NOT EXISTS idx_constellations_order ON constellations(display_order);

CREATE INDEX IF NOT EXISTS idx_stellar_map_nodes_constellation_id ON stellar_map_nodes(constellation_id);
CREATE INDEX IF NOT EXISTS idx_stellar_map_nodes_difficulty ON stellar_map_nodes(difficulty);
CREATE INDEX IF NOT EXISTS idx_stellar_map_nodes_xp_threshold ON stellar_map_nodes(xp_threshold);
CREATE INDEX IF NOT EXISTS idx_stellar_map_nodes_metadata ON stellar_map_nodes USING GIN(metadata);

-- Step 5: Enable Row Level Security
ALTER TABLE constellation_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE constellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stellar_map_nodes ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies (read access for all authenticated users)
CREATE POLICY "Enable read access for authenticated users" ON constellation_families
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON constellations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON stellar_map_nodes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Step 7: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create triggers for updated_at
CREATE TRIGGER update_constellation_families_updated_at
    BEFORE UPDATE ON constellation_families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_constellations_updated_at
    BEFORE UPDATE ON constellations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stellar_map_nodes_updated_at
    BEFORE UPDATE ON stellar_map_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Insert default constellation families and constellations based on original code
-- Ignition Families
INSERT INTO constellation_families (name, level, color_hex, display_order) VALUES
    ('Veil Piercers', 'Ignition', '301934', 1),
    ('Mind Hackers', 'Ignition', '203020', 2),
    ('Persona Shifters', 'Ignition', '102030', 3),
    ('Reality Shatters', 'Ignition', '303010', 4)
ON CONFLICT (name) DO NOTHING;

-- Insight Families
INSERT INTO constellation_families (name, level, color_hex, display_order) VALUES
    ('Thought Catchers', 'Insight', '301030', 1),
    ('Heart Whisperers', 'Insight', '103030', 2),
    ('Routine Architects', 'Insight', '302010', 3),
    ('Safe Havens', 'Insight', '201020', 4)
ON CONFLICT (name) DO NOTHING;

-- Transformation Families
INSERT INTO constellation_families (name, level, color_hex, display_order) VALUES
    ('Path Makers', 'Transformation', '301820', 1),
    ('Reality Tuners', 'Transformation', '182030', 2),
    ('Energy Architects', 'Transformation', '203018', 3),
    ('Inner Illuminators', 'Transformation', '302810', 4),
    ('Ritual Grid', 'Transformation', '281830', 5)
ON CONFLICT (name) DO NOTHING;

-- Ignition Constellations
INSERT INTO constellations (name, family_id, level, color_hex, display_order)
SELECT 
    c.name,
    cf.id,
    c.level,
    c.color_hex,
    c.display_order
FROM (VALUES
    ('Puppet Masters', 'Veil Piercers', 'Ignition', '600000', 1),
    ('Smoke & Mirrors', 'Veil Piercers', 'Ignition', '800000', 2),
    ('Golden Shackles', 'Veil Piercers', 'Ignition', 'A00000', 3),
    ('Panopticon', 'Veil Piercers', 'Ignition', 'C00000', 4),
    ('Lesson Leashes', 'Veil Piercers', 'Ignition', 'E00000', 5),
    ('Hidden Commands', 'Mind Hackers', 'Ignition', '006000', 1),
    ('Feed Puppets', 'Mind Hackers', 'Ignition', '008000', 2),
    ('Mind Traps', 'Mind Hackers', 'Ignition', '00A000', 3),
    ('Voice of Deception', 'Mind Hackers', 'Ignition', '00C000', 4),
    ('Mask Breakers', 'Persona Shifters', 'Ignition', '000060', 1),
    ('Avatar Illusions', 'Persona Shifters', 'Ignition', '000080', 2),
    ('I-Dissolvers', 'Persona Shifters', 'Ignition', '0000A0', 3),
    ('Numbers Don''t Lie', 'Reality Shatters', 'Ignition', '606000', 1),
    ('Whistleblowers', 'Reality Shatters', 'Ignition', '808000', 2),
    ('Double-Speak', 'Reality Shatters', 'Ignition', 'A0A000', 3)
) AS c(name, family_name, level, color_hex, display_order)
JOIN constellation_families cf ON cf.name = c.family_name
ON CONFLICT (name) DO NOTHING;

-- Insight Constellations
INSERT INTO constellations (name, family_id, level, color_hex, display_order)
SELECT 
    c.name,
    cf.id,
    c.level,
    c.color_hex,
    c.display_order
FROM (VALUES
    ('Pause Buttons', 'Thought Catchers', 'Insight', '301030', 1),
    ('Mirror Moments', 'Thought Catchers', 'Insight', '501050', 2),
    ('Grounding Gems', 'Thought Catchers', 'Insight', '701070', 3),
    ('Feeling Detectors', 'Heart Whisperers', 'Insight', '106010', 1),
    ('Calm Cradles', 'Heart Whisperers', 'Insight', '108010', 2),
    ('Mood Markers', 'Heart Whisperers', 'Insight', '10A010', 3),
    ('Tiny Dawns', 'Routine Architects', 'Insight', '606010', 1),
    ('Signal Guards', 'Routine Architects', 'Insight', '808010', 2),
    ('Reset Pulses', 'Routine Architects', 'Insight', 'A0A010', 3),
    ('Mind Sanctum', 'Safe Havens', 'Insight', '101060', 1),
    ('Breath Portals', 'Safe Havens', 'Insight', '101080', 2),
    ('Rhythm Reset', 'Safe Havens', 'Insight', '1010A0', 3)
) AS c(name, family_name, level, color_hex, display_order)
JOIN constellation_families cf ON cf.name = c.family_name
ON CONFLICT (name) DO NOTHING;

-- Transformation Constellations
INSERT INTO constellations (name, family_id, level, color_hex, display_order)
SELECT 
    c.name,
    cf.id,
    c.level,
    c.color_hex,
    c.display_order
FROM (VALUES
    ('Thought Sculptors', 'Path Makers', 'Transformation', '602000', 1),
    ('Mind Cartographers', 'Path Makers', 'Transformation', '802000', 2),
    ('Body-Bridge', 'Path Makers', 'Transformation', 'A02000', 3),
    ('Witness Protocols', 'Reality Tuners', 'Transformation', '006020', 1),
    ('Chance Benders', 'Reality Tuners', 'Transformation', '008020', 2),
    ('Aura Sync', 'Reality Tuners', 'Transformation', '00A020', 3),
    ('Wheel Harmonizers', 'Energy Architects', 'Transformation', '200060', 1),
    ('Energy Highways', 'Energy Architects', 'Transformation', '200080', 2),
    ('Prana Weaver', 'Energy Architects', 'Transformation', '2000A0', 3),
    ('Core Miners', 'Inner Illuminators', 'Transformation', '600060', 1),
    ('Voice Bridgers', 'Inner Illuminators', 'Transformation', '800080', 2),
    ('Shadow Ledger', 'Inner Illuminators', 'Transformation', 'A000A0', 3),
    ('Dawn Circuit', 'Ritual Grid', 'Transformation', '002060', 1),
    ('Unity Pulse', 'Ritual Grid', 'Transformation', '002080', 2),
    ('Meta Map', 'Ritual Grid', 'Transformation', '0020A0', 3)
) AS c(name, family_name, level, color_hex, display_order)
JOIN constellation_families cf ON cf.name = c.family_name
ON CONFLICT (name) DO NOTHING;
