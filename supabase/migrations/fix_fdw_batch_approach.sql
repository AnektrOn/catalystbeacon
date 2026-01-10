-- ============================================
-- Fix Alternative : Approche par batch pour éviter les erreurs FDW
-- Récupère toutes les données d'abord, puis les traite
-- ============================================

CREATE OR REPLACE FUNCTION sync_all_subscriptions_from_stripe()
RETURNS TABLE(
  synced_count INTEGER,
  error_count INTEGER,
  details JSONB
) AS $$
DECLARE
  v_synced INTEGER := 0;
  v_errors INTEGER := 0;
  v_error_details JSONB := '[]'::JSONB;
  v_stripe_sub RECORD;
  v_result_success BOOLEAN;
  v_result_message TEXT;
  v_result_subscription_id UUID;
BEGIN
  -- Récupérer TOUTES les données Stripe d'abord dans une boucle simple
  -- Éviter les appels répétés au FDW avec paramètres
  FOR v_stripe_sub IN
    SELECT 
      s.id as stripe_subscription_id,
      s.customer as stripe_customer_id
    FROM stripe.subscriptions s
    WHERE (s.attrs::JSONB)->>'status' IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')
  LOOP
    BEGIN
      -- Synchroniser chaque abonnement
      -- Utiliser la fonction qui gère les erreurs FDW
      SELECT 
        success,
        message,
        subscription_id
      INTO 
        v_result_success,
        v_result_message,
        v_result_subscription_id
      FROM sync_single_subscription_from_stripe(v_stripe_sub.stripe_subscription_id::TEXT)
      LIMIT 1;
      
      IF v_result_success THEN
        v_synced := v_synced + 1;
      ELSE
        v_errors := v_errors + 1;
        v_error_details := v_error_details || jsonb_build_object(
          'subscription_id', v_stripe_sub.stripe_subscription_id,
          'error', v_result_message
        );
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
      v_error_details := v_error_details || jsonb_build_object(
        'subscription_id', v_stripe_sub.stripe_subscription_id,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  RETURN QUERY SELECT v_synced, v_errors, v_error_details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
