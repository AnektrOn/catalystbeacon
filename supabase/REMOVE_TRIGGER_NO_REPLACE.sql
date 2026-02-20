-- ============================================
-- SUPPRIMER LE TRIGGER CASSÉ (sans le remplacer)
-- ============================================
-- L’erreur "record new has no field user_id" vient d’un trigger sur auth.users.
-- Ce script supprime TOUS les triggers sur auth.users.
-- Tu ne recrées AUCUN trigger : c’est ton app (AuthContext createDefaultProfile)
-- qui créera le profil au premier chargement après connexion.
--
-- À exécuter dans Supabase → SQL Editor → coller → Run.
-- Projet : celui de ton app (mbffycgrqfeesfnhhcdm).
-- ============================================

-- Supprimer TOUS les triggers sur auth.users (y compris si Supabase les marque "internal")
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT t.tgname AS name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth' AND c.relname = 'users'
  LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', r.name);
      RAISE NOTICE 'Dropped: %', r.name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop % (maybe system): %', r.name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Vérifier qu’il ne reste aucun trigger (sauf système)
SELECT tgname FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users' AND NOT t.tgisinternal;
-- Résultat attendu : 0 rows (aucun trigger user).

SELECT 'Triggers removed. App will create profile on first load.' AS status;
