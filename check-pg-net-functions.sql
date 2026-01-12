-- ============================================
-- VÉRIFIER LES FONCTIONS DISPONIBLES DANS pg_net
-- ============================================

-- 1. Voir toutes les fonctions dans le schéma net
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'net'
ORDER BY routine_name;

-- 2. Voir les tables dans le schéma net
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'net'
ORDER BY table_name;

-- 3. Vérifier s'il y a une table de réponses
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'net'
  AND table_name LIKE '%response%'
ORDER BY ordinal_position;
