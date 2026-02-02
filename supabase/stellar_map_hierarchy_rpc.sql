-- RPC to fetch stellar map hierarchy (families + constellations + nodes) in one round-trip.
-- Reduces two sequential client queries to a single server call.

CREATE OR REPLACE FUNCTION get_stellar_map_hierarchy_v1(p_level TEXT)
RETURNS JSONB AS $$
DECLARE
    v_families JSONB;
    v_nodes JSONB;
BEGIN
    -- 1. Families with nested constellations (same shape as getFamiliesWithConstellations)
    SELECT jsonb_agg(f ORDER BY f.display_order)
    INTO v_families
    FROM (
        SELECT
            cf.id,
            cf.name,
            cf.level,
            cf.color_hex,
            cf.display_order,
            (
                SELECT jsonb_agg(c ORDER BY c.display_order)
                FROM constellations c
                WHERE c.family_id = cf.id
                  AND c.level = p_level
            ) AS constellations
        FROM constellation_families cf
        WHERE cf.level = p_level
    ) f;

    -- 2. Nodes with constellation join (same shape as stellar_map_nodes select with constellations)
    SELECT jsonb_agg(n ORDER BY n.difficulty)
    INTO v_nodes
    FROM (
        SELECT
            smn.id,
            smn.title,
            smn.link,
            smn.difficulty,
            smn.difficulty_label,
            smn.constellation_id,
            smn.created_at,
            smn.updated_at,
            jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'level', c.level,
                'color_hex', c.color_hex,
                'family_id', c.family_id
            ) AS constellations
        FROM stellar_map_nodes smn
        INNER JOIN constellations c ON c.id = smn.constellation_id
        WHERE c.level = p_level
    ) n;

    RETURN jsonb_build_object(
        'families', COALESCE(v_families, '[]'::jsonb),
        'nodes', COALESCE(v_nodes, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql STABLE;
