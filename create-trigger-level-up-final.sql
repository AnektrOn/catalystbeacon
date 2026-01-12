-- ============================================
-- TRIGGER LEVEL UP - VERSION FINALE
-- ============================================
-- Version qui fonctionne avec votre structure Supabase

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
    
    -- Envoyer le webhook
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
    
    -- Log (optionnel, pour debug)
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
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_level_up';

-- ============================================
-- TEST
-- ============================================
-- Pour tester :
-- 1. Récupérer un user_id :
--    SELECT id FROM profiles LIMIT 1;
--
-- 2. Augmenter le level :
--    UPDATE profiles SET level = level + 1 WHERE id = 'USER_ID';
--
-- 3. Vérifier la requête :
--    SELECT id, url, method FROM net.http_request_queue 
--    WHERE url LIKE '%n8n%' ORDER BY id DESC LIMIT 1;
--
-- 4. Vérifier la réponse (remplacez REQUEST_ID) :
--    SELECT * FROM net.http_get_response(REQUEST_ID);
