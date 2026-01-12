-- ============================================
-- TEST WEBHOOK - VERSION CORRIGÉE
-- ============================================
-- Version qui fonctionne avec toutes les versions de pg_net

-- 1. Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Test direct du webhook (sans fonction)
DO $$
DECLARE
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
  request_id BIGINT;
BEGIN
  -- Appel direct
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
  
  RAISE NOTICE 'Webhook envoyé ! Request ID: %', request_id;
  RAISE NOTICE 'Vérifiez net.http_request_queue avec: SELECT * FROM net.http_request_queue WHERE id = %', request_id;
END $$;

-- 3. Attendre 2 secondes (les requêtes sont asynchrones)
SELECT pg_sleep(2);

-- 4. Vérifier les logs (version universelle - toutes les colonnes)
SELECT * 
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 3;

-- ============================================
-- INTERPRÉTATION
-- ============================================
-- Regardez les colonnes dans le résultat :
-- - Si vous voyez "status" ou "status_code" = 200 → ✅ Succès
-- - Si vous voyez "error" ou "error_msg" → ❌ Erreur
-- - Si vous voyez "response_status" = 200 → ✅ Succès
-- 
-- Les noms de colonnes varient selon la version de pg_net.
-- Regardez toutes les colonnes pour trouver le statut.
