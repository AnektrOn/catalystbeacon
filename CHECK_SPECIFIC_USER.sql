-- ============================================
-- Diagnostic Spécifique pour conesaleo@gmail.com
-- ============================================

-- 1. Vérifier si l'utilisateur existe dans profiles
SELECT * FROM profiles WHERE email = 'conesaleo@gmail.com';

-- 2. Vérifier s'il y a un abonnement dans Stripe pour ce client
-- Note: On utilise le customer_id trouvé dans le message de l'utilisateur
SELECT 
  id as subscription_id,
  customer,
  attrs->>'status' as status,
  current_period_start,
  current_period_end
FROM stripe.subscriptions
WHERE customer = 'cus_TlV0cAbUKIctRK';

-- 3. Vérifier s'il y a un checkout session pour ce client
SELECT 
  id,
  customer,
  payment_intent,
  subscription,
  attrs->>'payment_status' as payment_status
FROM stripe.checkout_sessions
WHERE customer = 'cus_TlV0cAbUKIctRK'
ORDER BY created DESC
LIMIT 5;

-- 4. Tenter une synchronisation manuelle forcée pour voir l'erreur
-- (On essaie de trouver un abonnement ID d'abord)
DO $$
DECLARE
  v_sub_id TEXT;
BEGIN
  SELECT id INTO v_sub_id FROM stripe.subscriptions WHERE customer = 'cus_TlV0cAbUKIctRK' LIMIT 1;
  
  IF v_sub_id IS NOT NULL THEN
    RAISE NOTICE 'Tentative de sync pour %', v_sub_id;
    PERFORM sync_single_subscription_from_stripe(v_sub_id);
  ELSE
    RAISE NOTICE 'Aucun abonnement trouvé pour ce client';
  END IF;
END $$;
