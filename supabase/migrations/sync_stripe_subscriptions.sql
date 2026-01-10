-- ============================================
-- Synchronisation Stripe FDW avec Base de Données Locale
-- ============================================
-- Ce fichier crée les fonctions pour synchroniser les abonnements Stripe
-- avec votre table subscriptions locale et mettre à jour les profiles

-- ============================================
-- 1. Fonction de Synchronisation d'un Abonnement Spécifique
-- ============================================

CREATE OR REPLACE FUNCTION sync_single_subscription_from_stripe(
  p_stripe_subscription_id TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  subscription_id UUID
) AS $$
DECLARE
  v_user_id UUID;
  v_stripe_customer_id TEXT;
  v_status TEXT;
  v_plan_type TEXT;
  v_current_period_start TIMESTAMPTZ;
  v_current_period_end TIMESTAMPTZ;
  v_subscription_record UUID;
BEGIN
  -- Récupérer les données depuis Stripe FDW
  SELECT 
    s.customer,
    s.attrs->>'status',
    s.current_period_start,
    s.current_period_end,
    s.attrs->'items'->'data'->0->'price'->>'recurring'->>'interval'
  INTO 
    v_stripe_customer_id,
    v_status,
    v_current_period_start,
    v_current_period_end,
    v_plan_type
  FROM stripe.subscriptions s
  WHERE s.id = p_stripe_subscription_id;
  
  -- Vérifier que l'abonnement existe dans Stripe
  IF v_stripe_customer_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Subscription not found in Stripe', NULL::UUID;
    RETURN;
  END IF;
  
  -- Trouver l'utilisateur par stripe_customer_id
  SELECT id INTO v_user_id
  FROM profiles
  WHERE stripe_customer_id = v_stripe_customer_id
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not found for customer: ' || v_stripe_customer_id, NULL::UUID;
    RETURN;
  END IF;
  
  -- Insérer ou mettre à jour l'abonnement
  INSERT INTO subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    updated_at
  )
  VALUES (
    v_user_id,
    v_stripe_customer_id,
    p_stripe_subscription_id,
    COALESCE(v_plan_type, 'monthly'),
    v_status,
    v_current_period_start,
    v_current_period_end,
    NOW()
  )
  ON CONFLICT (stripe_subscription_id) DO UPDATE SET
    status = EXCLUDED.status,
    plan_type = EXCLUDED.plan_type,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = NOW()
  RETURNING id INTO v_subscription_record;
  
  -- Mettre à jour le profile si nécessaire
  UPDATE profiles
  SET 
    subscription_status = CASE 
      WHEN v_status = 'active' THEN 'active'
      WHEN v_status = 'trialing' THEN 'active'
      WHEN v_status = 'past_due' THEN 'past_due'
      WHEN v_status = 'canceled' THEN 'cancelled'
      WHEN v_status = 'unpaid' THEN 'past_due'
      ELSE 'inactive'
    END,
    subscription_id = p_stripe_subscription_id,
    updated_at = NOW()
  WHERE id = v_user_id
    AND stripe_customer_id = v_stripe_customer_id;
  
  RETURN QUERY SELECT TRUE, 'Subscription synced successfully', v_subscription_record;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, 'Error: ' || SQLERRM, NULL::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Fonction de Synchronisation de Tous les Abonnements Actifs
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
  -- Parcourir tous les abonnements actifs/trialing/past_due dans Stripe
  FOR v_stripe_sub IN
    SELECT 
      s.id as stripe_subscription_id,
      s.customer as stripe_customer_id,
      s.attrs->>'status' as status
    FROM stripe.subscriptions s
    WHERE s.attrs->>'status' IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')
  LOOP
    BEGIN
      -- Synchroniser chaque abonnement
      -- Récupérer les colonnes individuellement
      SELECT 
        success,
        message,
        subscription_id
      INTO 
        v_result_success,
        v_result_message,
        v_result_subscription_id
      FROM sync_single_subscription_from_stripe(v_stripe_sub.stripe_subscription_id)
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

-- ============================================
-- 3. Fonction de Vérification des Différences
-- ============================================

CREATE OR REPLACE FUNCTION check_subscription_discrepancies()
RETURNS TABLE(
  discrepancy_type TEXT,
  stripe_subscription_id TEXT,
  stripe_status TEXT,
  db_status TEXT,
  stripe_customer_id TEXT,
  user_id UUID
) AS $$
BEGIN
  -- Abonnements dans Stripe mais pas dans la DB
  RETURN QUERY
  SELECT 
    'missing_in_db'::TEXT,
    s.id::TEXT,
    s.attrs->>'status',
    NULL::TEXT,
    s.customer::TEXT,
    p.id
  FROM stripe.subscriptions s
  LEFT JOIN subscriptions sub ON sub.stripe_subscription_id = s.id
  LEFT JOIN profiles p ON p.stripe_customer_id = s.customer
  WHERE sub.id IS NULL
    AND s.attrs->>'status' IN ('active', 'trialing', 'past_due');
  
  -- Abonnements avec statut différent
  RETURN QUERY
  SELECT 
    'status_mismatch'::TEXT,
    s.id::TEXT,
    s.attrs->>'status',
    sub.status,
    s.customer::TEXT,
    sub.user_id
  FROM stripe.subscriptions s
  JOIN subscriptions sub ON sub.stripe_subscription_id = s.id
  WHERE s.attrs->>'status' != sub.status
    AND s.attrs->>'status' IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid');
  
  -- Abonnements dans la DB mais pas dans Stripe (peut-être supprimés)
  RETURN QUERY
  SELECT 
    'missing_in_stripe'::TEXT,
    sub.stripe_subscription_id::TEXT,
    NULL::TEXT,
    sub.status,
    sub.stripe_customer_id::TEXT,
    sub.user_id
  FROM subscriptions sub
  LEFT JOIN stripe.subscriptions s ON s.id = sub.stripe_subscription_id
  WHERE s.id IS NULL
    AND sub.status IN ('active', 'trialing', 'past_due');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Fonction de Synchronisation Automatique (pour Cron)
-- ============================================

CREATE OR REPLACE FUNCTION auto_sync_stripe_subscriptions()
RETURNS void AS $$
DECLARE
  v_result RECORD;
BEGIN
  -- Synchroniser tous les abonnements
  SELECT * INTO v_result
  FROM sync_all_subscriptions_from_stripe();
  
  -- Log le résultat (vous pouvez créer une table de logs si nécessaire)
  RAISE NOTICE 'Sync completed: % synced, % errors', 
    (v_result).synced_count, 
    (v_result).error_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Créer un Index pour les Performances
-- ============================================

-- Index sur stripe_subscription_id (devrait déjà exister, mais on s'assure)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON profiles(stripe_customer_id);

-- ============================================
-- 6. Permissions
-- ============================================

-- Permettre aux utilisateurs authentifiés d'appeler ces fonctions
GRANT EXECUTE ON FUNCTION sync_single_subscription_from_stripe(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_all_subscriptions_from_stripe() TO authenticated;
GRANT EXECUTE ON FUNCTION check_subscription_discrepancies() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_sync_stripe_subscriptions() TO authenticated;

-- ============================================
-- 7. Commentaires pour Documentation
-- ============================================

COMMENT ON FUNCTION sync_single_subscription_from_stripe IS 
'Synchronise un abonnement spécifique depuis Stripe vers la base de données locale';

COMMENT ON FUNCTION sync_all_subscriptions_from_stripe IS 
'Synchronise tous les abonnements actifs depuis Stripe vers la base de données locale';

COMMENT ON FUNCTION check_subscription_discrepancies IS 
'Vérifie les différences entre Stripe et la base de données locale';

COMMENT ON FUNCTION auto_sync_stripe_subscriptions IS 
'Fonction automatique pour synchroniser les abonnements (à utiliser avec pg_cron)';
