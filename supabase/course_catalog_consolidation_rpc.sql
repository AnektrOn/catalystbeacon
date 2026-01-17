-- RPC to consolidate all data needed for the Course Catalog page
-- This reduces multiple round-trips and parallelizes data fetching on the server side

CREATE OR REPLACE FUNCTION get_course_catalog_data_v1(
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_user_xp INTEGER;
    v_schools JSONB;
    v_courses JSONB;
    v_user_progress JSONB;
BEGIN
    -- 1. Get user XP
    SELECT current_xp INTO v_user_xp FROM profiles WHERE id = p_user_id;
    IF v_user_xp IS NULL THEN v_user_xp := 0; END IF;

    -- 2. Get all schools
    SELECT jsonb_agg(s) INTO v_schools
    FROM (
        SELECT *, (v_user_xp >= COALESCE(unlock_xp, 0)) as is_unlocked
        FROM schools
        ORDER BY order_index ASC
    ) s;

    -- 3. Get all published courses that have a structure
    SELECT jsonb_agg(c) INTO v_courses
    FROM (
        SELECT cm.*
        FROM course_metadata cm
        INNER JOIN (
            SELECT DISTINCT course_id FROM course_structure
        ) cs ON cm.course_id = cs.course_id
        WHERE cm.status = 'published'
        ORDER BY cm.masterschool ASC, cm.xp_threshold ASC
    ) c;

    -- 4. Get user's course progress
    SELECT jsonb_agg(p) INTO v_user_progress
    FROM (
        SELECT course_id, status, progress_percentage, last_accessed_at
        FROM user_course_progress
        WHERE user_id = p_user_id
    ) p;

    -- Return consolidated object
    RETURN jsonb_build_object(
        'user_xp', v_user_xp,
        'schools', COALESCE(v_schools, '[]'::jsonb),
        'courses', COALESCE(v_courses, '[]'::jsonb),
        'user_progress', COALESCE(v_user_progress, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql;
