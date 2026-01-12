-- ============================================
-- TRIGGER LEVEL UP - VERSION SIMPLE
-- ============================================
-- Version qui fonctionne sans http_get_response

-- 1. Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Supprimer l'ancien trigger si existe
DROP TRIGGER IF EXISTS trigger_level_up ON profiles;
DROP FUNCTION IF EXISTS notify_level_up();

-- 3. Créer la fonction
CREATE OR REPLACE FUNCTION notify_level_up()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
  request_id BIGINT;
BEGIN
  -- Vérifier que le level a augmenté
  IF NEW.level > COALESCE(OLD.level, 0) THEN
    -- Récupérer l'email et le nom depuis auth.users
    SELECT email, raw_user_meta_data->>'full_name' 
    INTO user_email, user_name
    FROM auth.users
    WHERE id = NEW.id;
    
    -- Envoyer le webhook (asynchrone, pas de réponse immédiate)
    SELECT net.http_post(
      url := n8n_webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'emailType', 'level-up',
        'email', COALESCE(user_email, 'unknown@example.com'),
        'userName', COALESCE(user_name, 'there'),
        'oldLevel', COALESCE(OLD.level, 0),
        'newLevel', NEW.level,
        'totalXP', COALESCE(NEW.current_xp, 0)
      )
    ) INTO request_id;
    
    -- Log pour debug (visible dans les logs Supabase)
    RAISE NOTICE '📧 Level up webhook envoyé (Request ID: %)', request_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer le trigger
CREATE TRIGGER trigger_level_up
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.level > COALESCE(OLD.level, 0))
  EXECUTE FUNCTION notify_level_up();

-- 5. Vérifier que le trigger est créé
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_level_up';

-- ============================================
-- COMMENT VÉRIFIER QUE ÇA MARCHE
-- ============================================
-- 
-- 1. TESTER LE TRIGGER :
--    UPDATE profiles SET level = level + 1 WHERE id = 'USER_ID';
--
-- 2. VÉRIFIER LA REQUÊTE (immédiatement après) :
--    SELECT 
--      id,
--      url,
--      method,
--      convert_from(body, 'UTF8') as body_text
--    FROM net.http_request_queue 
--    WHERE url LIKE '%n8n%' 
--    ORDER BY id DESC 
--    LIMIT 1;
--
-- 3. VÉRIFIER DANS N8N :
--    - Allez dans N8N → Executions
--    - Vous devriez voir une nouvelle exécution
--
-- 4. VÉRIFIER LE BODY :
--    Le body_text devrait contenir :
--    {"emailType":"level-up","email":"...","userName":"...","oldLevel":X,"newLevel":Y,"totalXP":Z}
