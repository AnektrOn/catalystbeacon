-- ============================================
-- WEBHOOK POUR NOUVEAUX UTILISATEURS (INSERT)
-- ============================================
-- Se déclenche quand un nouvel utilisateur s'inscrit
-- (INSERT sur la table profiles)

-- 1. Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Supprimer l'ancien trigger si existe
DROP TRIGGER IF EXISTS "new-user-webhook" ON profiles;
DROP TRIGGER IF EXISTS "user-signup-webhook" ON profiles;

-- 3. Créer le trigger pour INSERT (nouvelle inscription)
CREATE TRIGGER "new-user-webhook"
AFTER INSERT ON "public"."profiles"
FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',  -- Body vide, Supabase envoie automatiquement le payload
  '10000'  -- Timeout 10 secondes
);

-- ============================================
-- NOTES
-- ============================================
-- Ce trigger se déclenche quand un nouveau profil est créé
-- Format Supabase automatique :
-- {
--   "type": "INSERT",
--   "table": "profiles",
--   "record": { ... toutes les colonnes du nouveau profil ... },
--   "old_record": null
-- }
--
-- N8N détectera ensuite "new-user" dans le Function Node

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Voir le trigger créé
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'new-user-webhook';

-- ============================================
-- TEST
-- ============================================
-- Pour tester (ATTENTION : crée un vrai utilisateur) :
-- INSERT INTO profiles (id, email, full_name)
-- VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   'Test User'
-- );
--
-- Vérifiez ensuite dans N8N Executions qu'une exécution apparaît
