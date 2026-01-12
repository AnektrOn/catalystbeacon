-- ============================================
-- VÉRIFIER LES COLONNES DE LA TABLE PROFILES
-- ============================================
-- Exécutez ceci pour voir toutes les colonnes disponibles

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- COLONNES PROBABLEMENT DISPONIBLES
-- ============================================
-- Basé sur le code, voici les colonnes qui existent probablement :
-- - id (UUID)
-- - email (TEXT)
-- - full_name (TEXT)
-- - level (INTEGER)
-- - current_xp (INTEGER ou NUMERIC)
-- - completion_streak (INTEGER)
-- - role (TEXT)
-- - subscription_status (TEXT)
-- - subscription_id (TEXT)
-- - stripe_customer_id (TEXT)
-- - created_at (TIMESTAMP)
-- - updated_at (TIMESTAMP)

-- ============================================
-- COLONNES QUI N'EXISTENT PROBABLEMENT PAS
-- ============================================
-- - level_title (n'existe pas - erreur)
-- - xp_to_next_level (n'existe pas - erreur)

-- ============================================
-- SOLUTION
-- ============================================
-- Utilisez seulement les colonnes qui existent :
-- - OLD.level / NEW.level ✅
-- - NEW.current_xp ✅
-- - NEW.email (si stocké dans profiles) ✅
-- - NEW.full_name ✅
