-- ============================================
-- Vérifier la Structure de la Table Stripe FDW
-- ============================================

-- TEST 1 : Voir les colonnes de stripe.subscriptions
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'stripe'
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- TEST 2 : Voir un exemple d'enregistrement
SELECT 
  id,
  customer,
  currency,
  current_period_start,
  current_period_end
FROM stripe.subscriptions
LIMIT 1;

-- TEST 3 : Voir si attrs existe et son type
SELECT 
  id,
  pg_typeof(attrs) as attrs_type,
  attrs IS NOT NULL as has_attrs
FROM stripe.subscriptions
LIMIT 1;

-- TEST 4 : Essayer d'accéder à attrs
SELECT 
  id,
  attrs
FROM stripe.subscriptions
LIMIT 1;

-- TEST 5 : Voir toutes les colonnes disponibles
SELECT *
FROM stripe.subscriptions
LIMIT 1;
