-- ============================================
-- WEBHOOK LEVEL UP - VERSION CORRIGÉE
-- ============================================
-- Version corrigée sans les champs qui n'existent pas (level_title, xp_to_next_level)

-- Activer pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS notify_level_up();

-- Créer la fonction corrigée
CREATE OR REPLACE FUNCTION notify_level_up()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  n8n_webhook_url TEXT := 'https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b';
BEGIN
  -- Only trigger if level actually increased
  IF NEW.level > OLD.level THEN
    -- Get user email and name from auth.users
    SELECT email, raw_user_meta_data->>'full_name' INTO user_email, user_name
    FROM auth.users
    WHERE id = NEW.id;
    
    -- Call N8N webhook avec seulement les champs qui existent
    PERFORM net.http_post(
      url := n8n_webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'emailType', 'level-up',
        'email', user_email,
        'userName', COALESCE(user_name, 'there'),
        'oldLevel', OLD.level,
        'newLevel', NEW.level,
        'totalXP', NEW.current_xp
        -- Note: level_title et xp_to_next_level n'existent pas dans profiles
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger si existe
DROP TRIGGER IF EXISTS trigger_level_up ON profiles;

-- Créer le trigger
CREATE TRIGGER trigger_level_up
  AFTER UPDATE OF level ON profiles
  FOR EACH ROW
  WHEN (NEW.level > OLD.level)
  EXECUTE FUNCTION notify_level_up();

-- ============================================
-- TEST
-- ============================================
-- Pour tester, exécutez :
-- UPDATE profiles SET level = level + 1 WHERE id = 'votre-user-id';

-- Vérifier les logs :
-- SELECT status_code, error_msg, created_at 
-- FROM net.http_request_queue 
-- ORDER BY created_at DESC 
-- LIMIT 5;
