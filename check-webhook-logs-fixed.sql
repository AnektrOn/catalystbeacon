-- ============================================
-- VÉRIFIER LES LOGS WEBHOOK - VERSION CORRIGÉE
-- ============================================
-- Version qui fonctionne avec toutes les versions de pg_net
-- Ne suppose pas que certaines colonnes existent

-- Étape 1: Voir la structure de la table (optionnel mais utile)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'net'
  AND table_name = 'http_request_queue'
ORDER BY ordinal_position;

-- Étape 2: Voir toutes les requêtes récentes (toutes les colonnes)
-- Cette requête fonctionne toujours, peu importe les colonnes
SELECT * 
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 10;

-- ============================================
-- INTERPRÉTATION
-- ============================================
-- Regardez le résultat de l'Étape 1 pour voir quelles colonnes existent.
-- Regardez le résultat de l'Étape 2 pour voir les données.
--
-- Colonnes possibles (selon version pg_net):
-- - id: ID de la requête
-- - url: URL du webhook
-- - method: Méthode HTTP (POST, GET, etc.)
-- - headers: Headers de la requête
-- - body: Body de la requête (peut être bytea)
-- - timeout_milliseconds: Timeout configuré
-- - created_at / timestamp: Date de création
-- - status / status_code / response_status: Statut HTTP (peut ne pas exister)
-- - error / error_msg / error_message: Message d'erreur (peut ne pas exister)
--
-- NOTE IMPORTANTE:
-- La table net.http_request_queue stocke les REQUÊTES EN ATTENTE/EN COURS.
-- Pour voir le statut final, vérifiez dans N8N Executions (plus fiable).

-- ============================================
-- ALTERNATIVE: Vérifier dans N8N
-- ============================================
-- La meilleure façon de vérifier si les webhooks fonctionnent:
-- 1. Allez dans votre workflow N8N
-- 2. Cliquez sur "Executions"
-- 3. Vérifiez que les exécutions apparaissent quand les événements se produisent
-- 4. Vérifiez le statut (Success, Error, etc.)
