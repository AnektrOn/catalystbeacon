# Stripe FDW - Référence Rapide

## 🚀 Configuration Rapide (5 minutes)

### 1. Obtenir votre clé Stripe
```
Stripe Dashboard → Developers → API keys → Secret key
```

### 2. Exécuter dans Supabase SQL Editor

```sql
-- Étape 1 : Activer Wrappers
CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;

-- Étape 2 : Stocker la clé (EXÉCUTEZ SEUL - copiez le key_id retourné)
SELECT vault.create_secret(
  'sk_live_VOTRE_CLE',  -- ⚠️ Remplacez
  'stripe',
  'Stripe API key'
);

-- Étape 3 : Créer le wrapper
CREATE FOREIGN DATA WRAPPER stripe_wrapper
  HANDLER stripe_fdw_handler
  VALIDATOR stripe_fdw_validator;

-- Étape 4 : Créer la connexion (remplacez <key_ID>)
CREATE SERVER stripe_server
  FOREIGN DATA WRAPPER stripe_wrapper
  OPTIONS (
    api_key_id '<key_ID>',  -- ⚠️ Remplacez
    api_url 'https://api.stripe.com/v1/',
    api_version '2024-06-20'
  );

-- Étape 5 : Créer le schéma
CREATE SCHEMA IF NOT EXISTS stripe;

-- Étape 6 : Importer les tables
IMPORT FOREIGN SCHEMA stripe
  FROM SERVER stripe_server
  INTO stripe;
```

## 📊 Requêtes Utiles

### Voir les clients Stripe
```sql
SELECT id, email, name, created
FROM stripe.customers
LIMIT 10;
```

### Voir les abonnements actifs
```sql
-- ⚠️ IMPORTANT : Le statut est dans attrs->>'status'
SELECT 
  id,
  customer,
  attrs->>'status' as status,
  current_period_start,
  current_period_end
FROM stripe.subscriptions
WHERE attrs->>'status' = 'active';
```

### Voir les sessions de checkout
```sql
SELECT id, customer, subscription, payment_intent
FROM stripe.checkout_sessions
ORDER BY created DESC
LIMIT 10;
```

### Voir les événements récents
```sql
SELECT id, type, created
FROM stripe.events
WHERE type LIKE 'customer.subscription%'
ORDER BY created DESC
LIMIT 20;
```

### Voir les factures
```sql
SELECT 
  id,
  customer,
  subscription,
  status,
  total,
  currency
FROM stripe.invoices
WHERE status = 'paid'
ORDER BY created DESC
LIMIT 10;
```

## 🔄 Synchroniser un abonnement vers votre DB

```sql
-- Synchroniser un abonnement spécifique
-- ⚠️ IMPORTANT : Utilisez attrs->>'status' pour le statut
WITH stripe_sub AS (
  SELECT 
    id,
    customer,
    attrs->>'status' as status,
    current_period_start,
    current_period_end
  FROM stripe.subscriptions
  WHERE id = 'sub_xxx'  -- ⚠️ Remplacez par votre subscription_id
)
INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  current_period_start,
  current_period_end
)
SELECT 
  p.id,
  stripe_sub.customer,
  stripe_sub.id,
  stripe_sub.status,
  TO_TIMESTAMP(stripe_sub.current_period_start),
  TO_TIMESTAMP(stripe_sub.current_period_end)
FROM stripe_sub
JOIN profiles p ON p.stripe_customer_id = stripe_sub.customer
ON CONFLICT (stripe_subscription_id) DO UPDATE SET
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  updated_at = NOW();
```
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file

## 🔍 Trouver les différences entre Stripe et votre DB

```sql
-- Abonnements dans Stripe mais pas dans votre DB
SELECT 
  s.id as stripe_subscription_id,
  s.customer,
  s.attrs->>'status' as status
FROM stripe.subscriptions s
LEFT JOIN subscriptions sub ON sub.stripe_subscription_id = s.id
WHERE sub.id IS NULL;

-- Abonnements avec statut différent
SELECT 
  s.id as stripe_subscription_id,
  s.attrs->>'status' as stripe_status,
  sub.status as db_status,
  s.customer
FROM stripe.subscriptions s
JOIN subscriptions sub ON sub.stripe_subscription_id = s.id
WHERE s.attrs->>'status' != sub.status;
```
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file

## 📋 Tables Disponibles

| Table | Description | Opérations |
|-------|-------------|------------|
| `stripe.customers` | Clients Stripe | ✅ Select, Insert, Update, Delete |
| `stripe.subscriptions` | Abonnements | ✅ Select, Insert, Update, Delete |
| `stripe.checkout_sessions` | Sessions de paiement | ✅ Select |
| `stripe.invoices` | Factures | ✅ Select |
| `stripe.events` | Événements Stripe | ✅ Select |
| `stripe.charges` | Charges | ✅ Select |
| `stripe.payment_intents` | Intentions de paiement | ✅ Select |

## ⚙️ Fonction de Sync Automatique

```sql
-- Créer une fonction pour synchroniser tous les abonnements
CREATE OR REPLACE FUNCTION sync_subscriptions_from_stripe()
RETURNS TABLE(synced_count INTEGER, error_count INTEGER) AS $$
DECLARE
  synced INTEGER := 0;
  errors INTEGER := 0;
  stripe_sub RECORD;
BEGIN
  FOR stripe_sub IN
    SELECT 
      s.id,
      s.customer,
      s.attrs->>'status' as status,
      s.current_period_start,
      s.current_period_end,
      s.attrs->'items'->'data'->0->'price'->>'recurring'->>'interval' as plan_type
    FROM stripe.subscriptions s
    WHERE s.attrs->>'status' IN ('active', 'trialing', 'past_due')
  LOOP
    BEGIN
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        plan_type,
        status,
        current_period_start,
        current_period_end
      )
      SELECT 
        p.id,
        stripe_sub.customer,
        stripe_sub.id,
        COALESCE(stripe_sub.plan_type, 'monthly'),
        stripe_sub.status,
        TO_TIMESTAMP(stripe_sub.current_period_start),
        TO_TIMESTAMP(stripe_sub.current_period_end)
      FROM profiles p
      WHERE p.stripe_customer_id = stripe_sub.customer
      ON CONFLICT (stripe_subscription_id) DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW();
      
      synced := synced + 1;
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      RAISE WARNING 'Failed to sync subscription %: %', stripe_sub.id, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT synced, errors;
END;
$$ LANGUAGE plpgsql;

-- Utiliser la fonction
SELECT * FROM sync_subscriptions_from_stripe();
```

## ⏰ Planifier une sync automatique (pg_cron)

```sql
-- Sync toutes les heures
SELECT cron.schedule(
  'sync-stripe-subscriptions',
  '0 * * * *',  -- Toutes les heures
  $$SELECT sync_subscriptions_from_stripe()$$
);

-- Voir les jobs planifiés
SELECT * FROM cron.job;

-- Supprimer un job
SELECT cron.unschedule('sync-stripe-subscriptions');
```

## 🚨 Dépannage Rapide

| Erreur | Solution |
|--------|----------|
| `extension 'wrappers' does not exist` | Vérifiez que vous êtes sur Supabase |
| `permission denied` | Connectez-vous en tant qu'admin |
| `invalid input syntax for type uuid` | Vérifiez le key_id (avec tirets) |
| `authentication failed` | Vérifiez votre clé API Stripe |
| Tables n'apparaissent pas | Réexécutez `IMPORT FOREIGN SCHEMA` |

## 📚 Guides Complets

- **Guide débutant :** `STRIPE_FDW_SETUP_BEGINNER.md`
- **Guide d'intégration :** `STRIPE_FDW_INTEGRATION.md`
- **Script SQL :** `supabase/migrations/setup_stripe_fdw.sql`

## 🔗 Liens Utiles

- [Documentation Supabase](https://supabase.com/docs/guides/database/extensions/wrappers/stripe)
- [Documentation Stripe API](https://stripe.com/docs/api)
