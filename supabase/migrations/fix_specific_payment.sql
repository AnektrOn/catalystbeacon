-- ============================================
-- Fix : Synchroniser un Paiement Spécifique
-- ============================================
-- Utilisez ce script pour synchroniser un abonnement après un paiement réussi
-- qui n'a pas été mis à jour dans la base de données

-- ÉTAPE 1 : Trouver l'abonnement lié à votre session de paiement
-- Remplacez 'cs_test_xxx' par votre vrai session_id
-- ============================================

-- Option A : Si vous avez le session_id (checkout session)
SELECT 
  cs.id as checkout_session_id,
  cs.customer as customer_id,
  cs.subscription as subscription_id,
  cs.attrs->>'payment_status' as payment_status,
  s.attrs->>'status' as subscription_status
FROM stripe.checkout_sessions cs
LEFT JOIN stripe.subscriptions s ON s.id = cs.subscription
WHERE cs.id = 'cs_test_a1oJcT6xubBDgBx4APlwxCTksGUzRaQlZvuwcDQvyMOQVckDV3ldHkkUbx';

-- Option B : Si vous avez le customer_id
-- SELECT 
--   s.id as subscription_id,
--   s.customer as customer_id,
--   s.attrs->>'status' as status,
--   s.current_period_start,
--   s.current_period_end
-- FROM stripe.subscriptions s
-- WHERE s.customer = 'cus_xxx'
-- ORDER BY s.current_period_start DESC
-- LIMIT 1;

-- ============================================
-- ÉTAPE 2 : Synchroniser l'abonnement
-- Remplacez 'sub_xxx' par le subscription_id trouvé à l'étape 1
-- ============================================

-- Synchroniser un abonnement spécifique
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');

-- ============================================
-- ÉTAPE 3 : Vérifier que ça a fonctionné
-- ============================================

-- Vérifier dans la table subscriptions
SELECT 
  s.id,
  s.user_id,
  s.stripe_subscription_id,
  s.status,
  s.plan_type,
  s.current_period_end,
  p.email,
  p.role,
  p.subscription_status
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE s.stripe_subscription_id = 'sub_xxx';

-- ============================================
-- ÉTAPE 4 : Si vous ne connaissez pas le subscription_id
-- Trouvez-le par email ou user_id
-- ============================================

-- Par email
-- SELECT 
--   s.id as subscription_id,
--   s.customer as customer_id,
--   s.attrs->>'status' as status
-- FROM stripe.customers c
-- JOIN stripe.subscriptions s ON s.customer = c.id
-- WHERE c.email = 'conesaleo@gmail.com'
-- ORDER BY s.current_period_start DESC
-- LIMIT 1;

-- Par user_id (si vous avez le stripe_customer_id dans profiles)
-- SELECT 
--   s.id as subscription_id,
--   s.customer as customer_id,
--   s.attrs->>'status' as status,
--   p.email
-- FROM profiles p
-- JOIN stripe.subscriptions s ON s.customer = p.stripe_customer_id
-- WHERE p.id = '6b8ebcff-9274-4bbf-8e7e-b9e0e6adeaf1'
-- ORDER BY s.current_period_start DESC
-- LIMIT 1;
