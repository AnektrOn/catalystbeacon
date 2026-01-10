# Diagnostic: Subscription Sync Not Working

## Problème
Les abonnements ne se synchronisent pas après le paiement.

## Vérifications à faire

### 1. Vérifier que les fonctions SQL existent

Dans Supabase SQL Editor, exécutez :

```sql
-- Vérifier si les fonctions existent
SELECT proname 
FROM pg_proc 
WHERE proname IN (
  'sync_subscription_from_session_id',
  'sync_single_subscription_from_stripe'
)
ORDER BY proname;
```

**Si elles n'existent pas**, appliquez les migrations :
- `supabase/migrations/sync_from_session_id.sql`
- `supabase/migrations/fix_sync_robust.sql` (ou la dernière version)

### 2. Vérifier les subscriptions dans Stripe FDW

```sql
-- Voir les dernières subscriptions dans Stripe
SELECT 
  id,
  attrs->>'status' as status,
  attrs->>'customer' as customer,
  attrs->>'current_period_start' as period_start
FROM stripe.subscriptions
ORDER BY (attrs->>'created')::bigint DESC
LIMIT 5;
```

### 3. Vérifier les subscriptions dans la DB locale

```sql
-- Voir les subscriptions dans la table locale
SELECT 
  id,
  user_id,
  stripe_subscription_id,
  status,
  created_at,
  updated_at
FROM subscriptions
ORDER BY created_at DESC
LIMIT 5;
```

### 4. Vérifier les profils

```sql
-- Voir les profils avec stripe_customer_id
SELECT 
  id,
  email,
  role,
  stripe_customer_id,
  subscription_status,
  subscription_id
FROM profiles
WHERE stripe_customer_id IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;
```

### 5. Tester manuellement la synchronisation

Pour un `session_id` spécifique :

```sql
-- Option 1: Si la fonction sync_subscription_from_session_id existe
SELECT * FROM sync_subscription_from_session_id('cs_test_XXXXX');
```

Pour un `subscription_id` spécifique :

```sql
-- Option 2: Appeler directement sync_single_subscription_from_stripe
SELECT * FROM sync_single_subscription_from_stripe('sub_XXXXX');
```

### 6. Vérifier les logs du webhook

Dans Supabase Dashboard :
- Edge Functions → `stripe-webhook` → Logs
- Vérifiez si les événements `checkout.session.completed` sont reçus
- Vérifiez s'il y a des erreurs

### 7. Vérifier que l'Edge Function get-subscription-from-session existe

Dans Supabase Dashboard :
- Edge Functions → Vérifiez si `get-subscription-from-session` existe
- Si elle n'existe pas, déployez-la depuis `supabase/functions/get-subscription-from-session/index.ts`

## Solutions

### Solution 1: Appliquer les migrations manquantes

Si les fonctions n'existent pas, exécutez dans Supabase SQL Editor :

1. `supabase/migrations/sync_from_session_id.sql`
2. `supabase/migrations/fix_sync_robust.sql` (ou la dernière version que vous avez)

### Solution 2: Vérifier les permissions

Les fonctions doivent avoir `SECURITY DEFINER` pour accéder aux tables Stripe FDW.

### Solution 3: Tester le webhook manuellement

Dans Stripe Dashboard :
- Webhooks → Test webhook
- Envoyez un événement `checkout.session.completed`
- Vérifiez les logs dans Supabase

### Solution 4: Forcer la synchronisation pour un utilisateur

Si vous avez un `stripe_customer_id` :

```sql
-- Trouver le subscription_id depuis Stripe
SELECT 
  s.id as subscription_id,
  s.attrs->>'status' as status,
  s.attrs->>'customer' as customer
FROM stripe.subscriptions s
WHERE s.attrs->>'customer' = 'cus_XXXXX'
ORDER BY (s.attrs->>'created')::bigint DESC
LIMIT 1;

-- Puis synchroniser
SELECT * FROM sync_single_subscription_from_stripe('sub_XXXXX');
```

## Logs à vérifier dans le navigateur

Ouvrez la console du navigateur et cherchez :
- `🔄 Processing payment success via Supabase...`
- `📞 Attempting sync_subscription_from_session_id...`
- `📥 RPC Response:`
- `✅ Subscription synced successfully`
- `❌` (erreurs)

Ces logs vous diront exactement où ça bloque.
