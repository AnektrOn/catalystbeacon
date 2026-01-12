-- ============================================
-- VÉRIFIER LE STATUT DES WEBHOOKS
-- ============================================

-- 1. Voir les requêtes récentes
SELECT 
  id,
  method,
  url,
  timeout_milliseconds,
  created_at
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 10;

-- 2. Voir les réponses (pour chaque requête)
-- Remplacez 187 par l'ID de votre dernière requête
SELECT * 
FROM net.http_get_response(187);

-- 3. Voir toutes les réponses récentes (si la fonction le permet)
-- Note: Cette requête peut être lente si beaucoup de requêtes
SELECT 
  q.id,
  q.url,
  q.method,
  r.status_code,
  LEFT(r.content::text, 200) as response_preview,
  r.created_at
FROM net.http_request_queue q
CROSS JOIN LATERAL net.http_get_response(q.id) r
WHERE q.url LIKE '%n8n%'
  AND q.id >= (SELECT MAX(id) - 5 FROM net.http_request_queue WHERE url LIKE '%n8n%')
ORDER BY q.id DESC;
