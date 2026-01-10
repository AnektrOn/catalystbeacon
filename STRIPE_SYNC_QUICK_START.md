# 🚀 Démarrage Rapide - Synchronisation Stripe

## ⚡ En 3 Étapes

### Étape 1 : Appliquer la Migration

Dans **Supabase SQL Editor**, ouvrez et exécutez :
```
supabase/migrations/sync_stripe_subscriptions.sql
```

✅ **Vérification :** Vous devriez voir "Success" pour chaque fonction créée.

### Étape 2 : Tester

Exécutez le script de test :
```
supabase/migrations/test_stripe_sync.sql
```

✅ **Vérification :** Tous les tests devraient passer.

### Étape 3 : Synchroniser

```sql
-- Synchroniser tous les abonnements
SELECT * FROM sync_all_subscriptions_from_stripe();
```

✅ **Résultat attendu :**
```
synced_count | error_count | details
-------------+-------------+---------
     5       |     0       | []
```

## 🎯 Commandes Essentielles

### Vérifier les différences
```sql
SELECT * FROM check_subscription_discrepancies();
```

### Synchroniser un abonnement spécifique
```sql
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

### Synchroniser tous les abonnements
```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

### Voir les abonnements synchronisés
```sql
SELECT 
  s.stripe_subscription_id,
  s.status,
  p.email,
  p.role
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
ORDER BY s.updated_at DESC;
```

## ⚙️ Configuration Automatique (Optionnel)

Pour synchroniser automatiquement toutes les heures :

```sql
-- ÉTAPE 1 : Activer pg_cron (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ÉTAPE 2 : Vérifier que l'extension est activée
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- ÉTAPE 3 : Planifier la synchronisation
SELECT cron.schedule(
  'sync-stripe-hourly',
  '0 * * * *',
  $$SELECT auto_sync_stripe_subscriptions()$$
);
```

> ⚠️ **Note :** Si vous obtenez l'erreur "schema 'cron' does not exist", l'extension pg_cron n'est pas disponible sur votre instance Supabase. Dans ce cas, utilisez la synchronisation manuelle ou créez un endpoint API qui appelle la fonction.

## ❌ Problèmes Courants

### "schema 'stripe' does not exist"
→ Configurez d'abord le FDW : `STRIPE_FDW_SETUP_BEGINNER.md`

### "column 'status' does not exist"
→ Utilisez `attrs->>'status'` : `STRIPE_FDW_CORRECT_SYNTAX.md`

### Aucun abonnement synchronisé
→ Vérifiez que les `stripe_customer_id` dans `profiles` correspondent à Stripe

## 📚 Documentation Complète

- **Guide complet :** `STRIPE_SYNC_COMPLETE.md`
- **Configuration FDW :** `STRIPE_FDW_SETUP_BEGINNER.md`
- **Syntaxe correcte :** `STRIPE_FDW_CORRECT_SYNTAX.md`
