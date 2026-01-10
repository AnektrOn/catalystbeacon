-- ============================================
-- Script de Test pour la Synchronisation Stripe
-- ============================================
-- Exécutez ce script après avoir appliqué sync_stripe_subscriptions.sql

-- ============================================
-- TEST 1 : Vérifier que les tables Stripe FDW existent
-- ============================================
SELECT 
  '✅ Tables Stripe FDW' as test_name,
  COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'stripe';

-- ============================================
-- TEST 2 : Voir les abonnements dans Stripe
-- ============================================
SELECT 
  '✅ Abonnements Stripe' as test_name,
  COUNT(*) as subscription_count
FROM stripe.subscriptions
WHERE attrs->>'status' IN ('active', 'trialing', 'past_due');

-- ============================================
-- TEST 3 : Voir les abonnements dans votre DB
-- ============================================
SELECT 
  '✅ Abonnements DB Locale' as test_name,
  COUNT(*) as subscription_count
FROM subscriptions;

-- ============================================
-- TEST 4 : Vérifier les différences
-- ============================================
SELECT 
  '🔍 Différences détectées' as test_name,
  discrepancy_type,
  COUNT(*) as count
FROM check_subscription_discrepancies()
GROUP BY discrepancy_type;

-- ============================================
-- TEST 5 : Tester la synchronisation d'un abonnement
-- ============================================
-- Remplacez 'sub_xxx' par un vrai subscription_id de Stripe
-- SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');

-- ============================================
-- TEST 6 : Vérifier que les fonctions existent
-- ============================================
SELECT 
  '✅ Fonctions créées' as test_name,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'sync%'
  OR routine_name LIKE 'check%'
  OR routine_name LIKE 'auto%'
ORDER BY routine_name;

-- ============================================
-- TEST 7 : Voir un exemple d'abonnement Stripe
-- ============================================
SELECT 
  '📋 Exemple Abonnement Stripe' as test_name,
  id as stripe_subscription_id,
  customer as stripe_customer_id,
  attrs->>'status' as status,
  current_period_start,
  current_period_end
FROM stripe.subscriptions
WHERE attrs->>'status' IN ('active', 'trialing', 'past_due')
LIMIT 1;

-- ============================================
-- TEST 8 : Vérifier les liens profiles <-> customers
-- ============================================
SELECT 
  '🔗 Liens Profiles-Customers' as test_name,
  COUNT(DISTINCT p.id) as profiles_with_stripe_customer,
  COUNT(DISTINCT s.customer) as unique_stripe_customers
FROM profiles p
FULL OUTER JOIN stripe.subscriptions s ON s.customer = p.stripe_customer_id
WHERE p.stripe_customer_id IS NOT NULL OR s.customer IS NOT NULL;
