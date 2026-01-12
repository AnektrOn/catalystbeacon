-- ============================================
-- VÉRIFIER LA STRUCTURE DE net.http_request_queue
-- ============================================

-- Voir toutes les colonnes disponibles
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'net'
  AND table_name = 'http_request_queue'
ORDER BY ordinal_position;

-- ============================================
-- ALTERNATIVE : Voir les premières lignes
-- ============================================
SELECT * 
FROM net.http_request_queue
LIMIT 1;
