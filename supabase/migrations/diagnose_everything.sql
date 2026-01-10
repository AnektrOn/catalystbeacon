-- ============================================
-- Diagnostic Complet - Vérifier Tout
-- ============================================
-- Exécutez ce script pour voir ce qui ne fonctionne pas

-- TEST 1 : Vérifier que Stripe FDW est configuré
-- ============================================
SELECT 
  'TEST 1: Stripe FDW' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'stripe' 
      AND table_name = 'subscriptions'
    ) THEN '✅ Stripe FDW configuré'
    ELSE '❌ Stripe FDW NON configuré - Suivez STRIPE_FDW_SETUP_BEGINNER.md'
  END as result;

-- TEST 2 : Vérifier que les tables Stripe existent
-- ============================================
SELECT 
  'TEST 2: Tables Stripe' as test_name,
  COUNT(*) as table_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Tables Stripe trouvées'
    ELSE '❌ Aucune table Stripe - Configurez le FDW'
  END as result
FROM information_schema.tables
WHERE table_schema = 'stripe';

-- TEST 3 : Vérifier que la fonction de sync existe
-- ============================================
SELECT 
  'TEST 3: Fonction de Sync' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'sync_single_subscription_from_stripe'
    ) THEN '✅ Fonction existe'
    ELSE '❌ Fonction MANQUANTE - Exécutez sync_stripe_subscriptions.sql'
  END as result;

-- TEST 4 : Vérifier les abonnements dans Stripe
-- ============================================
SELECT 
  'TEST 4: Abonnements Stripe' as test_name,
  COUNT(*) as subscription_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Abonnements trouvés dans Stripe'
    ELSE '⚠️ Aucun abonnement dans Stripe (normal si vous n''avez pas encore payé)'
  END as result
FROM stripe.subscriptions
WHERE attrs->>'status' IN ('active', 'trialing', 'past_due');

-- TEST 5 : Vérifier les abonnements dans votre DB
-- ============================================
SELECT 
  'TEST 5: Abonnements DB Locale' as test_name,
  COUNT(*) as subscription_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Abonnements dans votre DB'
    ELSE '⚠️ Aucun abonnement dans votre DB'
  END as result
FROM subscriptions;

-- TEST 6 : Vérifier les profiles avec stripe_customer_id
-- ============================================
SELECT 
  'TEST 6: Profiles avec Stripe Customer ID' as test_name,
  COUNT(*) as profile_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Profiles avec stripe_customer_id trouvés'
    ELSE '⚠️ Aucun profile avec stripe_customer_id'
  END as result
FROM profiles
WHERE stripe_customer_id IS NOT NULL;

-- TEST 7 : Tester la fonction de sync (si elle existe)
-- ============================================
-- Décommentez et remplacez 'sub_xxx' par un vrai subscription_id pour tester
-- SELECT 
--   'TEST 7: Test Fonction Sync' as test_name,
--   * 
-- FROM sync_single_subscription_from_stripe('sub_xxx');

-- TEST 8 : Vérifier les différences
-- ============================================
SELECT 
  'TEST 8: Différences Stripe vs DB' as test_name,
  discrepancy_type,
  COUNT(*) as count
FROM check_subscription_discrepancies()
GROUP BY discrepancy_type;

-- TEST 9 : Voir un exemple d'abonnement Stripe
-- ============================================
SELECT 
  'TEST 9: Exemple Abonnement Stripe' as test_name,
  id as subscription_id,
  customer as customer_id,
  attrs->>'status' as status,
  current_period_end
FROM stripe.subscriptions
WHERE attrs->>'status' IN ('active', 'trialing', 'past_due')
LIMIT 1;

-- ============================================
-- RÉSUMÉ
-- ============================================
SELECT 
  '📊 RÉSUMÉ' as summary,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'stripe') as stripe_tables,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'sync_single_subscription_from_stripe') as sync_function_exists,
  (SELECT COUNT(*) FROM stripe.subscriptions WHERE attrs->>'status' IN ('active', 'trialing', 'past_due')) as stripe_subscriptions,
  (SELECT COUNT(*) FROM subscriptions) as db_subscriptions,
  (SELECT COUNT(*) FROM profiles WHERE stripe_customer_id IS NOT NULL) as profiles_with_stripe_id;
