-- ============================================
-- VÉRIFIER LES LOGS WEBHOOK - VERSION SIMPLE
-- ============================================

-- 1. Voir la structure de la table
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'net'
  AND table_name = 'http_request_queue'
ORDER BY ordinal_position;

-- 2. Voir toutes les dernières requêtes (toutes les colonnes)
SELECT * 
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 5;

-- ============================================
-- NOTES
-- ============================================
-- Les colonnes peuvent varier selon la version de pg_net.
-- Regardez le résultat pour identifier :
-- - La colonne de statut (peut être "status", "status_code", "response_status")
-- - La colonne d'erreur (peut être "error", "error_msg", "error_message")
-- - La colonne de date (peut être "created_at", "timestamp", "created")
