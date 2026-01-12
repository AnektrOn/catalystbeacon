-- ============================================
-- SUPABASE DATABASE WEBHOOKS VIA SQL
-- ============================================
-- Création directe des webhooks via SQL (plus fiable que Dashboard)
-- Basé sur: https://supabase.com/docs/guides/database/webhooks

-- IMPORTANT: Remplacez l'URL N8N par la vôtre
-- URL: https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b

-- ============================================
-- 1. ACTIVER L'EXTENSION pg_net
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- 2. WEBHOOK LEVEL UP
-- ============================================
-- Se déclenche quand profiles.level augmente

DROP TRIGGER IF EXISTS "level-up-webhook" ON "public"."profiles";

CREATE TRIGGER "level-up-webhook"
AFTER UPDATE OF level ON "public"."profiles"
FOR EACH ROW
WHEN (NEW.level > OLD.level)
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',  -- Body vide, Supabase envoie automatiquement le payload
  '10000'  -- Timeout 10 secondes
);

-- ============================================
-- 3. WEBHOOK ACHIEVEMENT UNLOCKED
-- ============================================
-- Se déclenche quand un badge est débloqué

DROP TRIGGER IF EXISTS "achievement-webhook" ON "public"."user_badges";

CREATE TRIGGER "achievement-webhook"
AFTER INSERT ON "public"."user_badges"
FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '10000'
);

-- ============================================
-- 4. WEBHOOK LESSON COMPLETED
-- ============================================
-- Se déclenche quand une leçon est complétée

DROP TRIGGER IF EXISTS "lesson-completed-webhook" ON "public"."user_lesson_progress";

CREATE TRIGGER "lesson-completed-webhook"
AFTER UPDATE OF is_completed ON "public"."user_lesson_progress"
FOR EACH ROW
WHEN (NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false))
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '10000'
);

-- ============================================
-- 5. WEBHOOK XP MILESTONE
-- ============================================
-- Se déclenche quand XP atteint un milestone (1000, 5000, 10000, etc.)

DROP TRIGGER IF EXISTS "xp-milestone-webhook" ON "public"."profiles";

CREATE TRIGGER "xp-milestone-webhook"
AFTER UPDATE OF current_xp ON "public"."profiles"
FOR EACH ROW
WHEN (
  -- Vérifier si on a franchi un milestone
  (OLD.current_xp < 1000 AND NEW.current_xp >= 1000) OR
  (OLD.current_xp < 5000 AND NEW.current_xp >= 5000) OR
  (OLD.current_xp < 10000 AND NEW.current_xp >= 10000) OR
  (OLD.current_xp < 25000 AND NEW.current_xp >= 25000) OR
  (OLD.current_xp < 50000 AND NEW.current_xp >= 50000) OR
  (OLD.current_xp < 100000 AND NEW.current_xp >= 100000)
)
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '10000'
);

-- ============================================
-- 6. WEBHOOK STREAK MILESTONE
-- ============================================
-- Se déclenche quand streak atteint 7, 30, 100, 365 jours

DROP TRIGGER IF EXISTS "streak-milestone-webhook" ON "public"."profiles";

CREATE TRIGGER "streak-milestone-webhook"
AFTER UPDATE OF completion_streak ON "public"."profiles"
FOR EACH ROW
WHEN (
  NEW.completion_streak IN (7, 30, 100, 365) AND
  NEW.completion_streak > OLD.completion_streak
)
EXECUTE FUNCTION supabase_functions.http_request(
  'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '10000'
);

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Voir tous les triggers créés
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%webhook%'
ORDER BY event_object_table, trigger_name;

-- Voir les logs des webhooks (dernières tentatives)
SELECT 
  id,
  url,
  method,
  status_code,
  error_msg,
  created_at
FROM net.http_request_queue
WHERE url LIKE '%n8n%'
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- NOTES
-- ============================================
-- 1. Les webhooks envoient automatiquement le format Supabase standard
-- 2. Vous devez transformer ce format dans N8N avec un Function Node
-- 3. Vérifiez les logs avec: SELECT * FROM net.http_request_queue
-- 4. Pour tester: UPDATE profiles SET level = level + 1 WHERE id = 'user-id'
-- 5. L'URL doit être exactement celle de votre webhook N8N (sans /webhook-test/)
