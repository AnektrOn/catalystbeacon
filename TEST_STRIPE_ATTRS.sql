-- ============================================
-- Test : Vérifier le Type de attrs
-- ============================================

-- Test 1 : Voir le type de attrs
SELECT 
  id,
  pg_typeof(attrs) as attrs_type,
  attrs IS NOT NULL as has_attrs
FROM stripe.subscriptions
LIMIT 1;

-- Test 2 : Essayer d'accéder à attrs directement
SELECT 
  id,
  attrs
FROM stripe.subscriptions
LIMIT 1;

-- Test 3 : Essayer avec CAST JSONB
SELECT 
  id,
  (attrs::JSONB)->>'status' as status
FROM stripe.subscriptions
LIMIT 1;

-- Test 4 : Voir toutes les colonnes disponibles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'stripe'
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;
