-- ============================================
-- Script de test pour synchroniser depuis un session_id
-- ============================================
-- Remplacez 'cs_test_XXXXX' par votre vrai session_id

-- Option 1: Si la fonction sync_subscription_from_session_id existe
SELECT * FROM sync_subscription_from_session_id('cs_test_XXXXX');

-- Option 2: Si la fonction n'existe pas, récupérer manuellement le subscription_id
-- Étape 1: Récupérer le subscription_id depuis le checkout session
SELECT 
  id,
  subscription::TEXT as subscription_id,
  customer::TEXT as customer_id,
  payment_status
FROM stripe.checkout_sessions
WHERE id = 'cs_test_XXXXX'
LIMIT 1;

-- Étape 2: Utiliser le subscription_id pour synchroniser
-- (Remplacez 'sub_XXXXX' par le subscription_id trouvé à l'étape 1)
SELECT * FROM sync_single_subscription_from_stripe('sub_XXXXX');

-- ============================================
-- Vérifier le résultat
-- ============================================

-- Vérifier dans la table subscriptions
SELECT 
  id,
  user_id,
  stripe_subscription_id,
  status,
  created_at,
  updated_at
FROM subscriptions
WHERE stripe_subscription_id = 'sub_XXXXX'
ORDER BY created_at DESC;

-- Vérifier dans la table profiles
SELECT 
  id,
  email,
  role,
  stripe_customer_id,
  subscription_status,
  subscription_id
FROM profiles
WHERE subscription_id = 'sub_XXXXX'::TEXT
   OR stripe_customer_id = 'cus_XXXXX';
