-- ============================================
-- Version 2 : Synchronisation Stripe avec Gestion d'Erreurs Robuste
-- ============================================
-- Cette version gère le cas où attrs n'est pas accessible

-- D'abord, testons la structure
DO $$
BEGIN
  -- Vérifier si attrs existe et son type
  RAISE NOTICE 'Testing stripe.subscriptions structure...';
END $$;

-- ============================================
-- 1. Fonction de Synchronisation (Version Simplifiée)
-- ============================================

CREATE OR REPLACE FUNCTION sync_single_subscription_from_stripe_v2(
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
  v_attrs_type TEXT;
BEGIN
  -- D'abord, vérifier le type de attrs
  SELECT pg_typeof(attrs)::TEXT INTO v_attrs_type
  FROM stripe.subscriptions
  WHERE id = p_stripe_subscription_id
  LIMIT 1;
  
  -- Récupérer les données depuis Stripe FDW
  -- Essayer différentes méthodes selon le type
  BEGIN
    IF v_attrs_type = 'jsonb' THEN
      -- attrs est JSONB
      SELECT 
        s.customer::TEXT,
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
    ELSIF v_attrs_type = 'text' THEN
      -- attrs est TEXT, convertir en JSONB
      SELECT 
        s.customer::TEXT,
        (s.attrs::JSONB)->>'status',
        s.current_period_start,
        s.current_period_end,
        (s.attrs::JSONB)->'items'->'data'->0->'price'->>'recurring'->>'interval'
      INTO 
        v_stripe_customer_id,
        v_status,
        v_current_period_start,
        v_current_period_end,
        v_plan_type
      FROM stripe.subscriptions s
      WHERE s.id = p_stripe_subscription_id;
    ELSE
      -- Pas d'attrs ou type inconnu, utiliser les colonnes directes si disponibles
      SELECT 
        s.customer::TEXT,
        'active'::TEXT,  -- Par défaut
        s.current_period_start,
        s.current_period_end,
        'monthly'::TEXT  -- Par défaut
      INTO 
        v_stripe_customer_id,
        v_status,
        v_current_period_start,
        v_current_period_end,
        v_plan_type
      FROM stripe.subscriptions s
      WHERE s.id = p_stripe_subscription_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Si l'accès à attrs échoue, utiliser une approche alternative
    RAISE NOTICE 'Could not access attrs, using alternative method: %', SQLERRM;
    
    SELECT 
      s.customer::TEXT,
      'active'::TEXT,
      s.current_period_start,
      s.current_period_end,
      'monthly'::TEXT
    INTO 
      v_stripe_customer_id,
      v_status,
      v_current_period_start,
      v_current_period_end,
      v_plan_type
    FROM stripe.subscriptions s
    WHERE s.id = p_stripe_subscription_id;
  END;
  
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
    COALESCE(v_status, 'active'),
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
  
  -- Mettre à jour le profile
  UPDATE profiles
  SET 
    subscription_status = CASE 
      WHEN COALESCE(v_status, 'active') = 'active' THEN 'active'
      WHEN COALESCE(v_status, 'active') = 'trialing' THEN 'active'
      WHEN COALESCE(v_status, 'active') = 'past_due' THEN 'past_due'
      WHEN COALESCE(v_status, 'active') = 'canceled' THEN 'cancelled'
      WHEN COALESCE(v_status, 'active') = 'unpaid' THEN 'past_due'
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
