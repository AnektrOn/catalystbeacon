-- ============================================
-- Configuration Stripe Foreign Data Wrapper
-- Guide pour débutants : STRIPE_FDW_SETUP_BEGINNER.md
-- ============================================

-- ÉTAPE 1 : Activer l'extension Wrappers
CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;

-- ÉTAPE 2 : Stocker votre clé Stripe dans Vault
-- ⚠️ IMPORTANT : Exécutez cette ligne SEULE d'abord pour obtenir le key_id
-- ⚠️ REMPLACEZ 'sk_live_VOTRE_CLE_ICI' par votre vraie clé API Stripe
-- 
-- SELECT vault.create_secret(
--   'sk_live_VOTRE_CLE_ICI',
--   'stripe',
--   'Stripe API key for Wrappers'
-- );
-- 
-- Copiez le key_id retourné et utilisez-le dans l'ÉTAPE 4 ci-dessous

-- ÉTAPE 3 : Créer le Foreign Data Wrapper Stripe
CREATE FOREIGN DATA WRAPPER IF NOT EXISTS stripe_wrapper
  HANDLER stripe_fdw_handler
  VALIDATOR stripe_fdw_validator;

-- ÉTAPE 4 : Créer la connexion au serveur Stripe
-- ⚠️ REMPLACEZ '<key_ID>' par le key_id obtenu à l'ÉTAPE 2
-- 
-- CREATE SERVER IF NOT EXISTS stripe_server
--   FOREIGN DATA WRAPPER stripe_wrapper
--   OPTIONS (
--     api_key_id '<key_ID>',
--     api_url 'https://api.stripe.com/v1/',
--     api_version '2024-06-20'
--   );

-- ÉTAPE 5 : Créer le schéma Stripe
CREATE SCHEMA IF NOT EXISTS stripe;

-- ÉTAPE 6 : Importer les tables Stripe
-- Option A : Toutes les tables (décommentez cette ligne)
-- IMPORT FOREIGN SCHEMA stripe
--   FROM SERVER stripe_server
--   INTO stripe;

-- Option B : Seulement les tables nécessaires (décommentez ces lignes)
-- IMPORT FOREIGN SCHEMA stripe
--   LIMIT TO ("subscriptions", "customers", "checkout_sessions", "events", "invoices")
--   FROM SERVER stripe_server
--   INTO stripe;

-- ============================================
-- VÉRIFICATION : Tester la connexion
-- ============================================
-- Décommentez ces lignes pour tester après avoir terminé la configuration :

-- SELECT id, email, name, created
-- FROM stripe.customers
-- LIMIT 5;

-- SELECT 
--   id as stripe_subscription_id,
--   customer as stripe_customer_id,
--   status,
--   current_period_start,
--   current_period_end
-- FROM stripe.subscriptions
-- WHERE status = 'active'
-- LIMIT 10;
