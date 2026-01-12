-- ============================================
-- TEST WEBHOOK COMPLET - VERSION CORRIGÉE
-- ============================================
-- Cette version récupère la réponse HTTP

-- 1. Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Test du webhook et récupération de la réponse
DO $$
DECLARE
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
  request_id BIGINT;
  response RECORD;
BEGIN
  -- Envoyer la requête
  SELECT net.http_post(
    url := n8n_webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'test', true,
      'emailType', 'test',
      'message', 'Test depuis Supabase SQL',
      'timestamp', NOW()::text
    )
  ) INTO request_id;
  
  RAISE NOTICE '✅ Webhook envoyé ! Request ID: %', request_id;
  RAISE NOTICE '⏳ Attente de la réponse (5 secondes)...';
  
  -- Attendre que la requête soit traitée
  PERFORM pg_sleep(5);
  
  -- Récupérer la réponse
  SELECT * INTO response
  FROM net.http_get_response(request_id);
  
  -- Afficher le résultat
  IF response.status_code = 200 THEN
    RAISE NOTICE '✅ SUCCÈS ! Status: %, Body: %', response.status_code, response.content;
  ELSE
    RAISE NOTICE '❌ ERREUR ! Status: %, Error: %', response.status_code, response.content;
  END IF;
END $$;

-- 3. Voir toutes les requêtes récentes
SELECT 
  id,
  method,
  url,
  timeout_milliseconds,
  created_at
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 5;

-- 4. Voir les réponses des dernières requêtes
SELECT 
  q.id as request_id,
  q.url,
  q.method,
  r.status_code,
  r.content as response_body,
  r.created_at as response_time
FROM net.http_request_queue q
LEFT JOIN LATERAL net.http_get_response(q.id) r ON true
WHERE q.url LIKE '%n8n%'
ORDER BY q.id DESC
LIMIT 5;
