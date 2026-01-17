-- RPC for consolidating dashboard data queries into a single request
-- This significantly improves performance by reducing the number of roundtrips to Supabase

CREATE OR REPLACE FUNCTION get_dashboard_data_v3(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile RECORD;
    v_level_info JSONB;
    v_ritual_info JSONB;
    v_constellation_info JSONB;
    v_stats_info JSONB;
    v_teacher_feed JSONB;
    v_current_school TEXT;
    v_today_start TIMESTAMP;
    v_one_week_ago TIMESTAMP;
BEGIN
    -- Set reference timestamps
    v_today_start := date_trunc('day', now());
    v_one_week_ago := now() - interval '7 days';

    -- 1. Profile Data
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
    
    IF v_profile IS NULL THEN
        RETURN jsonb_build_object('error', 'Profile not found');
    END IF;

    -- 2. Level Info (Current and Next)
    WITH level_details AS (
        SELECT 
            level_number,
            title,
            xp_threshold,
            LEAD(xp_threshold) OVER (ORDER BY level_number) as next_threshold,
            LEAD(level_number) OVER (ORDER BY level_number) as next_level_number,
            LEAD(title) OVER (ORDER BY level_number) as next_title
        FROM public.levels
    )
    SELECT jsonb_build_object(
        'currentLevel', jsonb_build_object('level_number', level_number, 'title', title, 'xp_threshold', xp_threshold),
        'nextLevel', CASE WHEN next_level_number IS NOT NULL THEN 
            jsonb_build_object('level_number', next_level_number, 'title', next_title, 'xp_threshold', next_threshold)
            ELSE NULL END
    ) INTO v_level_info
    FROM level_details
    WHERE COALESCE(v_profile.current_xp, 0) >= xp_threshold
    ORDER BY level_number DESC
    LIMIT 1;

    -- 3. Ritual Info (Today's habit completion and streak)
    SELECT jsonb_build_object(
        'completed', EXISTS (
            SELECT 1 FROM public.user_habit_completions 
            WHERE user_id = p_user_id AND completed_at >= v_today_start
        ),
        'streak', COALESCE(v_profile.completion_streak, 0),
        'xpReward', 50
    ) INTO v_ritual_info;

    -- 4. Constellation Info (Schools and Courses)
    SELECT name INTO v_current_school
    FROM public.schools
    WHERE COALESCE(v_profile.current_xp, 0) >= unlock_xp
    ORDER BY unlock_xp DESC
    LIMIT 1;
    
    IF v_current_school IS NULL THEN v_current_school := 'Ignition'; END IF;

    WITH school_courses AS (
        SELECT 
            cm.course_id,
            cm.course_title,
            ucp.status as progress_status,
            row_number() OVER (ORDER BY cm.created_at) as rn
        FROM public.course_metadata cm
        LEFT JOIN public.user_course_progress ucp ON cm.course_id = ucp.course_id AND ucp.user_id = p_user_id
        WHERE cm.masterschool = v_current_school AND cm.status = 'published'
        LIMIT 5
    )
    SELECT jsonb_build_object(
        'currentSchool', v_current_school,
        'currentConstellation', jsonb_build_object(
            'name', v_current_school || ' Path',
            'nodes', COALESCE((
                SELECT jsonb_agg(jsonb_build_object(
                    'id', course_id,
                    'name', course_title,
                    'completed', (progress_status = 'completed'),
                    'isCurrent', (rn = 1 AND COALESCE(progress_status, '') = 'in_progress')
                ))
                FROM school_courses
            ), '[]'::jsonb)
        )
    ) INTO v_constellation_info;

    -- 5. Stats Info (Learning time, lessons, achievements, avg score)
    SELECT jsonb_build_object(
        'learningTime', COALESCE((SELECT floor(sum(xp_earned) / 50) FROM public.xp_logs WHERE user_id = p_user_id AND created_at >= v_one_week_ago), 0),
        'lessonsCompleted', COALESCE((SELECT count(*) FROM public.user_lesson_progress WHERE user_id = p_user_id AND is_completed = true), 0),
        'achievementsUnlocked', COALESCE((SELECT count(*) FROM public.user_badges WHERE user_id = p_user_id), 0),
        'averageScore', COALESCE((SELECT avg(score) FROM public.user_lesson_progress WHERE user_id = p_user_id AND is_completed = true AND score IS NOT NULL), 0)
    ) INTO v_stats_info;

    -- 6. Teacher Feed (Consolidated profile data)
    SELECT COALESCE(jsonb_agg(posts_data), '[]'::jsonb) INTO v_teacher_feed
    FROM (
        SELECT jsonb_build_object(
            'id', p.id,
            'content', p.content,
            'created_at', p.created_at,
            'profiles', jsonb_build_object('role', pr.role, 'full_name', pr.full_name, 'avatar_url', pr.avatar_url)
        ) as posts_data
        FROM public.posts p
        JOIN public.profiles pr ON p.user_id = pr.id
        WHERE lower(pr.role) IN ('teacher', 'admin') AND p.is_published = true AND p.is_public = true
        ORDER BY p.created_at DESC
        LIMIT 5
    ) sub;

    RETURN jsonb_build_object(
        'level_info', v_level_info,
        'ritual_info', v_ritual_info,
        'constellation_info', v_constellation_info,
        'stats_info', v_stats_info,
        'teacher_feed', v_teacher_feed
    );
END;
$$;
