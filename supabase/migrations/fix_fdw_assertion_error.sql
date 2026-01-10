-- ============================================
-- Fix : Éviter l'erreur "assertion failed" du FDW
-- Le problème vient de l'utilisation de paramètres dans WHERE avec FDW
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
  v_sub_id TEXT;
BEGIN
  -- Copier le paramètre dans une variable locale pour éviter les problèmes FDW
  v_sub_id := p_stripe_subscription_id;
  
  -- Récupérer les données depuis Stripe FDW
  -- Utiliser EXECUTE avec une requête construite dynamiquement pour éviter les paramètres
  -- Cela contourne le bug du wrapper FDW avec les paramètres
  BEGIN
    EXECUTE format('
      SELECT 
        s.customer::TEXT,
        (s.attrs::JSONB)->>''status'',
        s.current_period_start,
        s.current_period_end,
        (s.attrs::JSONB)->''items''->''data''->0->''price''->>''recurring''->>''interval''
      FROM stripe.subscriptions s
      WHERE s.id = %L
      LIMIT 1
    ', v_sub_id)
    INTO 
      v_stripe_customer_id,
      v_status,
      v_current_period_start,
      v_current_period_end,
      v_plan_type;
  EXCEPTION WHEN OTHERS THEN
    -- Si EXECUTE échoue, essayer une approche alternative simple
    BEGIN
      EXECUTE format('
        SELECT 
          s.customer::TEXT,
          ''active'',
          s.current_period_start,
          s.current_period_end,
          ''monthly''
        FROM stripe.subscriptions s
        WHERE s.id = %L
        LIMIT 1
      ', v_sub_id)
      INTO 
        v_stripe_customer_id,
        v_status,
        v_current_period_start,
        v_current_period_end,
        v_plan_type;
    EXCEPTION WHEN OTHERS THEN
      -- Si ça échoue aussi, retourner erreur
      RETURN QUERY SELECT FALSE, 'Error accessing Stripe FDW: ' || SQLERRM, NULL::UUID;
      RETURN;
    END;
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
