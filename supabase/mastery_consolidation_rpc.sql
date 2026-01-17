-- RPC to consolidate all data needed for the Mastery page
-- This reduces multiple round-trips and parallelizes data fetching on the server side

CREATE OR REPLACE FUNCTION get_mastery_data_v1(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS JSONB AS $$
DECLARE
    v_user_habits JSONB;
    v_habits_library JSONB;
    v_completions JSONB;
    v_user_toolbox JSONB;
    v_toolbox_library JSONB;
    v_calendar_events JSONB;
BEGIN
    -- 1. Get user habits joined with library data
    SELECT jsonb_agg(h) INTO v_user_habits
    FROM (
        SELECT 
            uh.*,
            hl.title as library_title,
            hl.description as library_description,
            hl.category as library_category,
            hl.skill_tags as library_skill_tags,
            hl.xp_reward as library_xp_reward
        FROM user_habits uh
        LEFT JOIN habits_library hl ON uh.habit_id = hl.id
        WHERE uh.user_id = p_user_id AND uh.is_active = true
    ) h;

    -- 2. Get all global habits from library
    SELECT jsonb_agg(hl) INTO v_habits_library
    FROM (
        SELECT * FROM habits_library WHERE is_global = true ORDER BY title
    ) hl;

    -- 3. Get completions for the date range
    SELECT jsonb_agg(c) INTO v_completions
    FROM (
        SELECT * FROM user_habit_completions
        WHERE user_id = p_user_id
        AND completed_at >= (p_start_date::text || ' 00:00:00')::timestamp
        AND completed_at <= (p_end_date::text || ' 23:59:59')::timestamp
    ) c;

    -- 4. Get user toolbox items joined with library data
    SELECT jsonb_agg(t) INTO v_user_toolbox
    FROM (
        SELECT 
            ut.*,
            tl.title as library_title,
            tl.description as library_description,
            tl.category as library_category,
            tl.skill_tags as library_skill_tags,
            tl.xp_reward as library_xp_reward,
            tl.can_convert_to_habit as library_can_convert
        FROM user_toolbox_items ut
        LEFT JOIN toolbox_library tl ON ut.toolbox_id = tl.id
        WHERE ut.user_id = p_user_id AND ut.is_active = true
    ) t;

    -- 5. Get all global toolbox items
    SELECT jsonb_agg(tl) INTO v_toolbox_library
    FROM (
        SELECT * FROM toolbox_library WHERE is_global = true ORDER BY title
    ) tl;

    -- 6. Get calendar events for the date range
    SELECT jsonb_agg(ce) INTO v_calendar_events
    FROM (
        SELECT 
            uce.*,
            uh.title as habit_title,
            uh.description as habit_description,
            uh.xp_reward as habit_xp_reward,
            tl.title as tool_title,
            tl.description as tool_description,
            tl.xp_reward as tool_xp_reward
        FROM user_calendar_events uce
        LEFT JOIN user_habits uh ON uce.habit_id = uh.id
        LEFT JOIN toolbox_library tl ON uce.toolbox_id = tl.id
        WHERE uce.user_id = p_user_id
        AND uce.event_date >= p_start_date
        AND uce.event_date <= p_end_date
    ) ce;

    -- Return consolidated object
    RETURN jsonb_build_object(
        'user_habits', COALESCE(v_user_habits, '[]'::jsonb),
        'habits_library', COALESCE(v_habits_library, '[]'::jsonb),
        'completions', COALESCE(v_completions, '[]'::jsonb),
        'user_toolbox', COALESCE(v_user_toolbox, '[]'::jsonb),
        'toolbox_library', COALESCE(v_toolbox_library, '[]'::jsonb),
        'calendar_events', COALESCE(v_calendar_events, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql;
