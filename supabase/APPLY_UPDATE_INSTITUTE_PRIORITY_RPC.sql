-- ============================================
-- Create update_institute_priority RPC (fix 404 PGRST202)
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- ============================================

CREATE OR REPLACE FUNCTION public.update_institute_priority(
  p_user_id UUID,
  p_institute_priority TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  UPDATE public.profiles
  SET institute_priority = p_institute_priority,
      updated_at = NOW()
  WHERE id = p_user_id;

  v_result := jsonb_build_object(
    'success', true,
    'message', 'Institute priority updated successfully'
  );
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION public.update_institute_priority(UUID, TEXT[]) IS
  'Updates institute_priority for a user. Bypasses UPDATE triggers.';

GRANT EXECUTE ON FUNCTION public.update_institute_priority(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_institute_priority(UUID, TEXT[]) TO anon;
