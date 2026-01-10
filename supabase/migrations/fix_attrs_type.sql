-- ============================================
-- Fix : Gérer le cas où attrs peut être TEXT ou NULL
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
  v_attrs JSONB;
BEGIN
  -- Récupérer les données depuis Stripe FDW
  -- D'abord récupérer attrs séparément pour gérer le type
  SELECT 
    s.customer::TEXT,
    s.current_period_start,
    s.current_period_end,
    CASE 
      WHEN s.attrs IS NULL THEN NULL::JSONB
      WHEN pg_typeof(s.attrs) = 'jsonb'::regtype THEN s.attrs
      WHEN pg_typeof(s.attrs) = 'text'::regtype THEN s.attrs::JSONB
      ELSE NULL::JSONB
    END as attrs_jsonb
  INTO 
    v_stripe_customer_id,
    v_current_period_start,
    v_current_period_end,
    v_attrs
  FROM stripe.subscriptions s
  WHERE s.id = p_stripe_subscription_id;
  
  -- Extraire status et plan_type depuis attrs JSONB
  IF v_attrs IS NOT NULL THEN
    v_status := v_attrs->>'status';
    v_plan_type := v_attrs->'items'->'data'->0->'price'->>'recurring'->>'interval';
  ELSE
    v_status := NULL;
    v_plan_type := NULL;
  END IF;
  
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
  
  -- Mettre à jour le profile si nécessaire
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

-- ============================================
-- Fix : sync_all_subscriptions_from_stripe
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
  v_attrs JSONB;
BEGIN
  -- Parcourir tous les abonnements actifs/trialing/past_due dans Stripe
  FOR v_stripe_sub IN
    SELECT 
      s.id as stripe_subscription_id,
      s.customer as stripe_customer_id,
      CASE 
        WHEN s.attrs IS NULL THEN NULL
        WHEN pg_typeof(s.attrs) = 'jsonb'::regtype THEN s.attrs->>'status'
        WHEN pg_typeof(s.attrs) = 'text'::regtype THEN (s.attrs::JSONB)->>'status'
        ELSE NULL
      END as status
    FROM stripe.subscriptions s
    WHERE (
      CASE 
        WHEN s.attrs IS NULL THEN FALSE
        WHEN pg_typeof(s.attrs) = 'jsonb'::regtype THEN (s.attrs->>'status') IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')
        WHEN pg_typeof(s.attrs) = 'text'::regtype THEN ((s.attrs::JSONB)->>'status') IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')
        ELSE FALSE
      END
    )
  LOOP
    BEGIN
      -- Synchroniser chaque abonnement
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
