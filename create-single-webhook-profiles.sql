-- ============================================
-- WEBHOOK UNIQUE POUR TOUS LES ÉVÉNEMENTS PROFILES
-- ============================================
-- Au lieu de créer plusieurs webhooks, on en crée UN SEUL
-- qui écoute tous les UPDATE sur profiles
-- N8N détectera ensuite le type d'événement

-- 1. Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Supprimer tous les anciens webhooks/triggers
DROP TRIGGER IF EXISTS "level-up-webhook" ON profiles;
DROP TRIGGER IF EXISTS "xp-milestone-webhook" ON profiles;
DROP TRIGGER IF EXISTS "streak-milestone-webhook" ON profiles;
DROP TRIGGER IF EXISTS trigger_level_up ON profiles;
DROP TRIGGER IF EXISTS trigger_xp_milestone ON profiles;
DROP TRIGGER IF EXISTS trigger_streak_milestone ON profiles;
DROP TRIGGER IF EXISTS trigger_role_change_email ON profiles;
DROP TRIGGER IF EXISTS trigger_payment_confirmation_email ON profiles;

-- 3. Créer UN SEUL webhook pour tous les UPDATE sur profiles
CREATE TRIGGER "profiles-update-webhook"
AFTER UPDATE ON "public"."profiles"
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
-- Ce trigger se déclenche pour TOUS les UPDATE sur profiles
-- N8N détectera ensuite le type d'événement :
-- - Level up (level augmenté)
-- - XP milestone (current_xp franchit un seuil)
-- - Streak milestone (completion_streak atteint 7, 30, 100, 365)
-- - Role change (role changé)
-- - Subscription activated (subscription_status = 'active')
-- - Etc.

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
WHERE trigger_name = 'profiles-update-webhook';
