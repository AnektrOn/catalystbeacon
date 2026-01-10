-- ============================================
-- Fonction : Synchroniser depuis session_id
-- Prend un checkout session_id et synchronise automatiquement
-- ============================================

CREATE OR REPLACE FUNCTION sync_subscription_from_session_id(
  p_session_id TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  subscription_id UUID
) AS $$
DECLARE
  v_subscription_id TEXT;
BEGIN
  -- Récupérer le subscription_id depuis le checkout session
  BEGIN
    EXECUTE format('
      SELECT subscription::TEXT
      FROM stripe.checkout_sessions
      WHERE id = %L
      LIMIT 1
    ', p_session_id)
    INTO v_subscription_id;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, 'Error reading checkout session: ' || SQLERRM, NULL::UUID;
    RETURN;
  END;
  
  -- Vérifier qu'on a trouvé un subscription_id
  IF v_subscription_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'No subscription found for session: ' || p_session_id, NULL::UUID;
    RETURN;
  END IF;
  
  -- Appeler la fonction de sync
  RETURN QUERY
  SELECT * FROM sync_single_subscription_from_stripe(v_subscription_id);
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
