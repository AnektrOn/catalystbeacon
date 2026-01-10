-- ============================================
-- Configuration pg_cron pour Synchronisation Automatique
-- ============================================
-- ⚠️ IMPORTANT : pg_cron n'est pas disponible sur tous les projets Supabase
-- Vérifiez d'abord si l'extension est disponible

-- ÉTAPE 1 : Vérifier si pg_cron est disponible
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron'
    ) THEN '✅ pg_cron est disponible'
    ELSE '❌ pg_cron n''est pas disponible sur ce projet'
  END as status;

-- ÉTAPE 2 : Activer pg_cron (si disponible)
-- ⚠️ Cette commande nécessite des privilèges superuser
-- Si elle échoue, pg_cron n'est pas disponible sur votre instance
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ÉTAPE 3 : Vérifier que l'extension est activée
SELECT 
  extname,
  extversion,
  CASE 
    WHEN extname = 'pg_cron' THEN '✅ pg_cron est activé'
    ELSE '❌ pg_cron n''est pas activé'
  END as status
FROM pg_extension
WHERE extname = 'pg_cron';

-- ÉTAPE 4 : Voir les jobs cron existants
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
ORDER BY jobid;

-- ============================================
-- Planifier la Synchronisation Stripe
-- ============================================

-- Option A : Toutes les heures
SELECT cron.schedule(
  'sync-stripe-subscriptions-hourly',
  '0 * * * *',  -- Toutes les heures à :00
  $$SELECT auto_sync_stripe_subscriptions()$$
);

-- Option B : Tous les jours à minuit
-- SELECT cron.schedule(
--   'sync-stripe-subscriptions-daily',
--   '0 0 * * *',  -- Tous les jours à minuit
--   $$SELECT auto_sync_stripe_subscriptions()$$
-- );

-- Option C : Toutes les 6 heures
-- SELECT cron.schedule(
--   'sync-stripe-subscriptions-6h',
--   '0 */6 * * *',  -- Toutes les 6 heures
--   $$SELECT auto_sync_stripe_subscriptions()$$
-- );

-- ============================================
-- Gérer les Jobs Cron
-- ============================================

-- Voir tous les jobs
SELECT * FROM cron.job;

-- Voir l'historique d'exécution
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;

-- Supprimer un job
-- SELECT cron.unschedule('sync-stripe-subscriptions-hourly');

-- Activer/Désactiver un job
-- UPDATE cron.job SET active = false WHERE jobname = 'sync-stripe-subscriptions-hourly';
-- UPDATE cron.job SET active = true WHERE jobname = 'sync-stripe-subscriptions-hourly';
