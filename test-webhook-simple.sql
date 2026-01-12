-- ============================================
-- TEST SIMPLE DU WEBHOOK - VERSION ULTRA SIMPLIFIÉE
-- ============================================
-- Ce script teste le webhook sans condition complexe

-- 1. Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Créer une fonction de test simple
CREATE OR REPLACE FUNCTION test_n8n_webhook()
RETURNS void AS $$
DECLARE
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
BEGIN
  -- Appel direct sans condition
  PERFORM net.http_post(
    url := n8n_webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'test', true,
      'emailType', 'test',
      'message', 'Test depuis Supabase SQL',
      'timestamp', NOW()::text
    )
  );
  
  RAISE NOTICE 'Webhook envoyé ! Vérifiez net.http_request_queue';
END;
$$ LANGUAGE plpgsql;

-- 3. Exécuter le test
SELECT test_n8n_webhook();

-- 4. Vérifier immédiatement les logs (version adaptative)
-- D'abord, voir toutes les colonnes disponibles
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'net' 
  AND table_name = 'http_request_queue'
ORDER BY ordinal_position;

-- Ensuite, voir les dernières requêtes (toutes les colonnes)
SELECT * 
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY id DESC
LIMIT 1;

-- ============================================
-- INTERPRÉTATION DES RÉSULTATS
-- ============================================
-- ✅ status_code = 200 → Webhook envoyé avec succès
-- ❌ status_code = 4xx/5xx → Erreur HTTP (vérifiez l'URL)
-- ❌ error_msg IS NOT NULL → Erreur réseau
-- ⚠️  Aucune ligne → pg_net ne fonctionne pas ou erreur silencieuse
