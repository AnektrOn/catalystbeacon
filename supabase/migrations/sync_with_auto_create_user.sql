-- ============================================
-- Fonction de Synchronisation Automatique avec Création d'Utilisateur
-- Cette fonction crée automatiquement les utilisateurs manquants depuis Stripe
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
  v_customer_email TEXT;
  v_customer_name TEXT;
  v_status TEXT;
  v_plan_type TEXT;
  v_current_period_start TIMESTAMPTZ;
  v_current_period_end TIMESTAMPTZ;
  v_subscription_record UUID;
  v_sub_id TEXT;
BEGIN
  -- Copier le paramètre dans une variable locale pour éviter les problèmes FDW
  v_sub_id := p_stripe_subscription_id;
  
  -- Récupérer les données depuis Stripe FDW (subscription + customer)
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
      
    -- Récupérer l'email du customer depuis Stripe
    IF v_stripe_customer_id IS NOT NULL THEN
      BEGIN
        EXECUTE format('
          SELECT 
            c.email,
            COALESCE(c.name, c.email)
          FROM stripe.customers c
          WHERE c.id = %L
          LIMIT 1
        ', v_stripe_customer_id)
        INTO 
          v_customer_email,
          v_customer_name;
      EXCEPTION WHEN OTHERS THEN
        -- Si on ne peut pas récupérer l'email, continuer quand même
        v_customer_email := NULL;
        v_customer_name := NULL;
      END;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, 'Error accessing Stripe FDW: ' || SQLERRM, NULL::UUID;
    RETURN;
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
  
  -- Si l'utilisateur n'existe pas, essayer de le trouver par email
  IF v_user_id IS NULL AND v_customer_email IS NOT NULL THEN
    SELECT id INTO v_user_id
    FROM profiles
    WHERE email = v_customer_email
    LIMIT 1;
    
    -- Si trouvé par email, mettre à jour le stripe_customer_id
    IF v_user_id IS NOT NULL THEN
      UPDATE profiles
      SET stripe_customer_id = v_stripe_customer_id
      WHERE id = v_user_id;
    END IF;
  END IF;
  
  -- Si toujours pas d'utilisateur, créer un profil minimal
  -- (sans auth.users, juste pour garder la trace de l'abonnement)
  IF v_user_id IS NULL THEN
    -- Générer un UUID pour le profil
    v_user_id := gen_random_uuid();
    
    -- Créer un profil minimal
    INSERT INTO profiles (
      id,
      email,
      full_name,
      role,
      stripe_customer_id,
      subscription_status,
      subscription_id,
      level,
      current_xp,
      total_xp_earned,
      daily_streak,
      rank,
      xp_to_next_level,
      level_progress_percentage,
      is_premium,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      COALESCE(v_customer_email, 'unknown@stripe.com'),
      COALESCE(v_customer_name, 'Stripe Customer'),
      'Student', -- Par défaut, sera mis à jour selon le plan
      v_stripe_customer_id,
      CASE 
        WHEN COALESCE(v_status, 'active') = 'active' THEN 'active'
        WHEN COALESCE(v_status, 'active') = 'trialing' THEN 'active'
        WHEN COALESCE(v_status, 'active') = 'past_due' THEN 'past_due'
        WHEN COALESCE(v_status, 'active') = 'canceled' THEN 'cancelled'
        WHEN COALESCE(v_status, 'active') = 'unpaid' THEN 'past_due'
        ELSE 'inactive'
      END,
      p_stripe_subscription_id,
      1,
      0,
      0,
      0,
      'New Catalyst',
      1,
      0.00,
      false,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      subscription_status = EXCLUDED.subscription_status,
      subscription_id = EXCLUDED.subscription_id,
      updated_at = NOW();
      
    -- Si le conflit était sur email, récupérer l'ID existant
    IF v_user_id IS NULL THEN
      SELECT id INTO v_user_id
      FROM profiles
      WHERE email = COALESCE(v_customer_email, 'unknown@stripe.com')
      LIMIT 1;
    END IF;
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
    user_id = EXCLUDED.user_id,
    status = EXCLUDED.status,
    plan_type = EXCLUDED.plan_type,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = NOW()
  RETURNING id INTO v_subscription_record;
  
  -- Mettre à jour le profile avec le statut d'abonnement
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
    stripe_customer_id = v_stripe_customer_id,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN QUERY SELECT TRUE, 'Subscription synced successfully', v_subscription_record;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, 'Error: ' || SQLERRM, NULL::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
