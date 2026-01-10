-- ============================================
-- Fix Robuste : Utiliser jsonb_extract_path_text
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
  v_attrs JSONB;
BEGIN
  -- Copier le paramètre
  v_sub_id := p_stripe_subscription_id;
  
  -- Récupérer les données de manière sécurisée
  -- 1. Récupérer attrs et les dates d'abord
  BEGIN
    EXECUTE format('
      SELECT 
        customer,
        attrs::jsonb,
        current_period_start,
        current_period_end
      FROM stripe.subscriptions
      WHERE id = %L
      LIMIT 1
    ', v_sub_id)
    INTO 
      v_stripe_customer_id,
      v_attrs,
      v_current_period_start,
      v_current_period_end;
      
    -- 2. Extraire les champs du JSONB en mémoire (pas en SQL dynamique)
    IF v_attrs IS NOT NULL THEN
      v_status := v_attrs->>'status';
      v_plan_type := v_attrs->'items'->'data'->0->'price'->>'recurring'->>'interval';
    ELSE
      v_status := 'active'; -- Fallback
      v_plan_type := 'monthly'; -- Fallback
    END IF;

    -- 3. Récupérer l'email du customer
    IF v_stripe_customer_id IS NOT NULL THEN
      BEGIN
        EXECUTE format('
          SELECT email, name 
          FROM stripe.customers 
          WHERE id = %L 
          LIMIT 1
        ', v_stripe_customer_id)
        INTO v_customer_email, v_customer_name;
      EXCEPTION WHEN OTHERS THEN
        v_customer_email := NULL;
      END;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, 'Error reading Stripe FDW: ' || SQLERRM, NULL::UUID;
    RETURN;
  END;
  
  -- Vérifier que l'abonnement existe
  IF v_stripe_customer_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Subscription not found: ' || v_sub_id, NULL::UUID;
    RETURN;
  END IF;
  
  -- Trouver l'utilisateur par stripe_customer_id
  SELECT id INTO v_user_id
  FROM profiles
  WHERE stripe_customer_id = v_stripe_customer_id
  LIMIT 1;
  
  -- Si pas trouvé, essayer par email
  IF v_user_id IS NULL AND v_customer_email IS NOT NULL THEN
    SELECT id INTO v_user_id
    FROM profiles
    WHERE email = v_customer_email
    LIMIT 1;
    
    -- Mettre à jour stripe_customer_id si trouvé
    IF v_user_id IS NOT NULL THEN
      UPDATE profiles
      SET stripe_customer_id = v_stripe_customer_id
      WHERE id = v_user_id;
    END IF;
  END IF;
  
  -- Si toujours pas trouvé, créer un nouveau profil
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO profiles (
      id, email, full_name, role, stripe_customer_id, 
      subscription_status, subscription_id, 
      level, current_xp, total_xp_earned, rank, xp_to_next_level, 
      is_premium, created_at, updated_at
    ) VALUES (
      v_user_id,
      COALESCE(v_customer_email, 'unknown@stripe.com'),
      COALESCE(v_customer_name, 'Stripe Member'),
      'Student',
      v_stripe_customer_id,
      COALESCE(v_status, 'active'),
      v_sub_id,
      1, 0, 0, 'New Catalyst', 1, 
      false, NOW(), NOW()
    );
  END IF;
  
  -- Insérer/Mettre à jour l'abonnement
  INSERT INTO subscriptions (
    user_id, stripe_customer_id, stripe_subscription_id, 
    plan_type, status, current_period_start, current_period_end, updated_at
  ) VALUES (
    v_user_id, v_stripe_customer_id, v_sub_id,
    COALESCE(v_plan_type, 'monthly'), COALESCE(v_status, 'active'),
    v_current_period_start, v_current_period_end, NOW()
  )
  ON CONFLICT (stripe_subscription_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    status = EXCLUDED.status,
    plan_type = EXCLUDED.plan_type,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = NOW()
  RETURNING id INTO v_subscription_record;
  
  -- Mettre à jour le profil
  UPDATE profiles SET
    subscription_status = COALESCE(v_status, 'active'),
    subscription_id = v_sub_id,
    role = CASE WHEN v_plan_type = 'year' THEN 'Teacher' ELSE 'Student' END,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN QUERY SELECT TRUE, 'Synced successfully', v_subscription_record;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, 'Critical Error: ' || SQLERRM, NULL::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
