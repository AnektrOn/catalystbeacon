# 🔄 Synchronisation Stripe FDW - Guide Complet

## ✅ Ce qui a été créé

Une migration complète (`sync_stripe_subscriptions.sql`) qui crée 4 fonctions pour synchroniser Stripe avec votre base de données :

### 1. `sync_single_subscription_from_stripe(subscription_id)`
Synchronise un abonnement spécifique depuis Stripe.

**Utilisation :**
```sql
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

**Retourne :**
- `success` : true/false
- `message` : message de succès ou d'erreur
- `subscription_id` : ID de l'abonnement dans votre DB

### 2. `sync_all_subscriptions_from_stripe()`
Synchronise TOUS les abonnements actifs depuis Stripe.

**Utilisation :**
```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

**Retourne :**
- `synced_count` : nombre d'abonnements synchronisés
- `error_count` : nombre d'erreurs
- `details` : détails des erreurs (JSONB)

### 3. `check_subscription_discrepancies()`
Vérifie les différences entre Stripe et votre DB.

**Utilisation :**
```sql
SELECT * FROM check_subscription_discrepancies();
```

**Retourne :**
- `discrepancy_type` : 'missing_in_db', 'status_mismatch', 'missing_in_stripe'
- `stripe_subscription_id` : ID Stripe
- `stripe_status` : statut dans Stripe
- `db_status` : statut dans votre DB
- `stripe_customer_id` : ID client Stripe
- `user_id` : ID utilisateur dans votre DB

### 4. `auto_sync_stripe_subscriptions()`
Fonction automatique pour pg_cron (synchronisation planifiée).

## 🚀 Comment Utiliser

### Étape 1 : Appliquer la Migration

Dans Supabase SQL Editor, exécutez :
```sql
-- Copiez-collez le contenu de supabase/migrations/sync_stripe_subscriptions.sql
```

### Étape 2 : Tester la Synchronisation

#### Test 1 : Vérifier les différences
```sql
SELECT * FROM check_subscription_discrepancies();
```

#### Test 2 : Synchroniser un abonnement spécifique
```sql
-- Remplacez 'sub_xxx' par un vrai subscription_id
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

#### Test 3 : Synchroniser tous les abonnements
```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

### Étape 3 : Configurer la Synchronisation Automatique (Optionnel)

> ⚠️ **Important :** `pg_cron` n'est pas disponible sur tous les projets Supabase. Si vous obtenez l'erreur `schema "cron" does not exist`, consultez `STRIPE_SYNC_WITHOUT_CRON.md` pour des alternatives.

#### Option A : Avec pg_cron (si disponible)

```sql
-- Vérifier que pg_cron est disponible
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Planifier la synchronisation toutes les heures
SELECT cron.schedule(
  'sync-stripe-subscriptions-hourly',
  '0 * * * *',  -- Toutes les heures à :00
  $$SELECT auto_sync_stripe_subscriptions()$$
);
```

#### Option B : Sans pg_cron (Recommandé)

Créez un endpoint API dans `server.js` et appelez-le depuis les webhooks ou un service externe. Voir `STRIPE_SYNC_WITHOUT_CRON.md` pour les détails complets.

## 📊 Vérification

### Voir les abonnements synchronisés
```sql
SELECT 
  s.id,
  s.user_id,
  s.stripe_subscription_id,
  s.status,
  s.plan_type,
  s.current_period_end,
  p.email,
  p.role
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
ORDER BY s.updated_at DESC
LIMIT 20;
```

### Comparer avec Stripe
```sql
-- Voir les abonnements dans Stripe
SELECT 
  id,
  customer,
  attrs->>'status' as status,
  current_period_end
FROM stripe.subscriptions
WHERE attrs->>'status' IN ('active', 'trialing', 'past_due')
LIMIT 20;
```

## 🔍 Dépannage

### Erreur : "schema 'stripe' does not exist"
**Solution :** Le FDW Stripe n'est pas configuré. Suivez `STRIPE_FDW_SETUP_BEGINNER.md`

### Erreur : "column 'status' does not exist"
**Solution :** Utilisez `attrs->>'status'` au lieu de `status`. Voir `STRIPE_FDW_CORRECT_SYNTAX.md`

### Aucun abonnement synchronisé
**Vérifiez :**
1. Que les tables Stripe FDW existent : `SELECT * FROM stripe.subscriptions LIMIT 1;`
2. Que vous avez des abonnements dans Stripe
3. Que les `stripe_customer_id` dans `profiles` correspondent aux clients Stripe

### Les profiles ne sont pas mis à jour
**Vérifiez :**
1. Que la colonne `subscription_status` existe dans `profiles`
2. Que les `stripe_customer_id` sont correctement liés

## 🎯 Workflow Recommandé

### 1. Synchronisation Initiale
```sql
-- Synchroniser tous les abonnements existants
SELECT * FROM sync_all_subscriptions_from_stripe();
```

### 2. Vérification
```sql
-- Vérifier les différences
SELECT * FROM check_subscription_discrepancies();
```

### 3. Synchronisation Continue
- **Option A :** Planifier avec pg_cron (recommandé)
- **Option B :** Appeler manuellement après chaque webhook
- **Option C :** Créer un endpoint API qui appelle la fonction

## 🔗 Intégration avec Webhooks

Vous pouvez appeler la fonction de sync depuis votre webhook si nécessaire :

```javascript
// Dans server.js ou votre webhook handler
const { data, error } = await supabase.rpc('sync_single_subscription_from_stripe', {
  p_stripe_subscription_id: subscription.id
});
```

## 📝 Notes Importantes

1. **Performance :** La fonction `sync_all_subscriptions_from_stripe()` peut prendre du temps si vous avez beaucoup d'abonnements. Utilisez-la avec parcimonie.

2. **Sécurité :** Les fonctions utilisent `SECURITY DEFINER` pour avoir les permissions nécessaires. Elles sont sécurisées.

3. **Idempotence :** Les fonctions sont idempotentes - vous pouvez les appeler plusieurs fois sans problème.

4. **Logs :** Pour un suivi détaillé, créez une table de logs :
```sql
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT,
  subscription_id TEXT,
  success BOOLEAN,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## ✅ Checklist de Vérification

- [ ] Migration appliquée avec succès
- [ ] Fonctions créées (vérifier avec `\df sync_*` dans psql)
- [ ] Test de `check_subscription_discrepancies()` fonctionne
- [ ] Test de `sync_single_subscription_from_stripe()` fonctionne
- [ ] Test de `sync_all_subscriptions_from_stripe()` fonctionne
- [ ] pg_cron configuré (si souhaité)
- [ ] Vérification que les profiles sont mis à jour

## 🎉 Prochaines Étapes

1. Appliquer la migration
2. Tester avec un abonnement réel
3. Configurer la synchronisation automatique
4. Monitorer les logs pour détecter les problèmes

---

**Besoin d'aide ?** Consultez les guides :
- `STRIPE_FDW_SETUP_BEGINNER.md` - Configuration FDW
- `STRIPE_FDW_CORRECT_SYNTAX.md` - Syntaxe correcte
- `STRIPE_FDW_INTEGRATION.md` - Guide d'intégration complet
