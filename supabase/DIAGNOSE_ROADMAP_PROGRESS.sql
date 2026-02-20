-- ============================================================
-- DIAGNOSTIC : Redirection roadmap après complétion
-- Exécuter dans le SQL Editor Supabase
-- ============================================================

-- 1. RPCs existants (tous les 3 requis pour le flux complet)
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('upsert_lesson_completed', 'complete_lesson_transaction', 'generate_roadmap_nodes');
-- Doit retourner 3 lignes

-- 2. Signature de complete_lesson_transaction (doit retourner next_lesson_id)
SELECT proname, pg_get_function_result(oid) AS return_type 
FROM pg_proc 
WHERE proname = 'complete_lesson_transaction';
-- return_type doit contenir next_lesson_id TEXT

-- 3. Table lesson_completion_events (requise par complete_lesson_transaction)
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'lesson_completion_events'
) AS lesson_completion_events_exists;
-- Doit retourner true

-- 4. Contraintes sur user_lesson_progress (pour upsert_lesson_completed INSERT)
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.user_lesson_progress'::regclass;
-- Vérifier UNIQUE ou PRIMARY KEY sur (user_id, course_id, chapter_number, lesson_number)

-- 5. Colonnes de user_lesson_progress
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_lesson_progress'
ORDER BY ordinal_position;

-- 6. institute_priority pour un utilisateur test (remplacer USER_ID par un vrai UUID)
-- SELECT id, institute_priority, current_xp 
-- FROM profiles 
-- WHERE id = 'USER_ID';
-- Si institute_priority est NULL ou [], la roadmap affichera le modal InstituteSorter

-- 7. Dernières complétions (remplacer YOUR_USER_ID par un vrai UUID si besoin)
-- SELECT user_id, course_id, chapter_number, lesson_number, is_completed, can_complete, completed_at
-- FROM user_lesson_progress
-- WHERE user_id = 'YOUR_USER_ID'
-- ORDER BY completed_at DESC NULLS LAST
-- LIMIT 20;
