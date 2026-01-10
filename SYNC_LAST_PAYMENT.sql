-- ============================================
-- SYNC IMMÉDIAT : Dernier paiement
-- Session ID: cs_test_a1jOb6kp2KVgpzBkVkl60rk8u3EUVDY3bRR6UgGqnnkZUe1CfLO7guNwTI
-- ============================================

-- ÉTAPE 1: Récupérer le subscription_id depuis Stripe
SELECT 
  id,
  subscription::TEXT as subscription_id,
  customer::TEXT as customer_id,
  payment_status
FROM stripe.checkout_sessions
WHERE id = 'cs_test_a1jOb6kp2KVgpzBkVkl60rk8u3EUVDY3bRR6UgGqnnkZUe1CfLO7guNwTI'
LIMIT 1;

-- ÉTAPE 2: Utilisez le subscription_id trouvé ci-dessus pour synchroniser
-- (Remplacez 'sub_XXXXX' par le subscription_id trouvé à l'étape 1)
-- SELECT * FROM sync_single_subscription_from_stripe('sub_XXXXX');

-- ÉTAPE 3: Vérifier le résultat
-- SELECT 
--   id,
--   user_id,
--   stripe_subscription_id,
--   status
-- FROM subscriptions
-- WHERE stripe_subscription_id = 'sub_XXXXX';

-- SELECT 
--   id,
--   email,
--   role,
--   subscription_status,
--   subscription_id
-- FROM profiles
-- WHERE email = 'conesaleo1@gmail.com';
