-- ============================================
-- TEST WEBHOOK SIMPLE - VERSION 2
-- ============================================
-- Version qui fonctionne sans http_get_response

-- 1. Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Test direct du webhook
DO $$
DECLARE
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
  request_id BIGINT;
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
  RAISE NOTICE '📋 Vérifiez dans N8N (Executions) si la requête est arrivée';
  RAISE NOTICE '📋 Vérifiez la requête avec: SELECT * FROM net.http_request_queue WHERE id = %', request_id;
END $$;

-- 3. Voir la requête envoyée
SELECT 
  id,
  method,
  url,
  headers,
  -- Convertir le body bytea en texte pour le lire
  convert_from(body, 'UTF8') as body_text,
  timeout_milliseconds
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 1;
