# 🔍 Diagnostic : Paiement Non Enregistré

## 🚨 Problèmes Identifiés

1. ❌ Paiement non enregistré dans la table `subscriptions`
2. ❌ Profil non mis à jour (`role` reste "Free", `subscription_status` reste null)

## 🔍 Diagnostic Étape par Étape

### Étape 1 : Vérifier si l'endpoint est appelé

**Dans les logs du serveur**, cherchez :

```
=== PAYMENT SUCCESS ENDPOINT CALLED ===
Session ID: cs_test_xxx
```

**Si vous ne voyez PAS ce message :**
→ L'endpoint n'est pas appelé. Vérifiez le frontend (Dashboard.jsx)

**Si vous voyez ce message :**
→ L'endpoint est appelé, continuez à l'étape 2.

### Étape 2 : Vérifier les erreurs dans les logs

Cherchez ces messages d'erreur dans les logs :

```
❌ Supabase update error
❌ CRITICAL: Failed to create/update subscription record
❌ All update attempts failed
```

**Si vous voyez des erreurs :**
→ Notez l'erreur exacte et le code d'erreur (ex: `23505` = violation de contrainte unique)

### Étape 3 : Vérifier la connexion Supabase

Dans les logs, cherchez :

```
✅ Profile updated successfully
✅ Subscription record inserted successfully
```

**Si vous ne voyez PAS ces messages :**
→ Il y a une erreur lors de la mise à jour de la DB

### Étape 4 : Vérifier le webhook Stripe

Le webhook Stripe devrait aussi mettre à jour la DB. Vérifiez :

1. **Dans Stripe Dashboard** → **Developers** → **Webhooks**
2. Vérifiez que le webhook est configuré et actif
3. Vérifiez les logs du webhook pour voir s'il y a des erreurs

## 🛠️ Solutions Rapides

### Solution 1 : Vérifier les Logs du Serveur

Exécutez cette commande pour voir les logs en temps réel :

```bash
# Si vous utilisez PM2
pm2 logs hcuniversity-app --lines 100

# Ou si vous lancez directement
# Les logs apparaissent dans la console où vous avez lancé node server.js
```

**Cherchez spécifiquement :**
- `=== PAYMENT SUCCESS ENDPOINT CALLED ===`
- `✅ Profile updated successfully`
- `✅ Subscription record inserted successfully`
- `❌` (toutes les erreurs)

### Solution 2 : Tester l'Endpoint Manuellement

Testez l'endpoint avec votre session_id :

```bash
curl "https://app.humancatalystbeacon.com/api/payment-success?session_id=cs_test_a1oJcT6xubBDgBx4APlwxCTksGUzRaQlZvuwcDQvyMOQVckDV3ldHkkUbx"
```

**Résultat attendu :**
```json
{
  "success": true,
  "role": "Student",
  "subscriptionId": "sub_xxx",
  "subscriptionStatus": "active",
  "userId": "xxx"
}
```

**Si vous obtenez une erreur :**
→ Notez l'erreur exacte

### Solution 3 : Vérifier la Structure de la Table

Vérifiez que la table `subscriptions` existe et a les bonnes colonnes :

```sql
-- Vérifier la structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;
```

**Colonnes requises :**
- `id` (UUID)
- `user_id` (UUID)
- `stripe_customer_id` (TEXT)
- `stripe_subscription_id` (TEXT)
- `plan_type` (TEXT)
- `status` (TEXT)
- `current_period_start` (TIMESTAMPTZ)
- `current_period_end` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Solution 4 : Vérifier les Contraintes

Vérifiez s'il y a des contraintes qui empêchent l'insertion :

```sql
-- Vérifier les contraintes
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'subscriptions'::regclass;
```

**Problème courant :** Contrainte unique sur `stripe_subscription_id` qui empêche l'insertion si l'ID existe déjà.

### Solution 5 : Synchroniser Manuellement (Solution Rapide)

Utilisez la fonction de synchronisation FDW que nous avons créée :

```sql
-- 1. Trouver l'abonnement
SELECT 
  cs.subscription as subscription_id
FROM stripe.checkout_sessions cs
WHERE cs.id = 'cs_test_a1oJcT6xubBDgBx4APlwxCTksGUzRaQlZvuwcDQvyMOQVckDV3ldHkkUbx';

-- 2. Synchroniser (remplacez sub_xxx par le vrai ID)
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

## 🔧 Problèmes Courants et Solutions

### Problème 1 : Erreur "duplicate key value violates unique constraint"

**Cause :** L'abonnement existe déjà dans la table.

**Solution :** Le code devrait faire un UPDATE au lieu d'un INSERT. Vérifiez les logs pour voir si l'UPDATE est tenté.

### Problème 2 : Erreur "column does not exist"

**Cause :** La structure de la table ne correspond pas au code.

**Solution :** Vérifiez la structure de la table (Solution 3 ci-dessus).

### Problème 3 : Erreur "permission denied"

**Cause :** Le client Supabase n'a pas les permissions nécessaires.

**Solution :** Vérifiez que vous utilisez `SUPABASE_SERVICE_ROLE_KEY` et non `SUPABASE_ANON_KEY` dans `server.js`.

### Problème 4 : L'endpoint n'est jamais appelé

**Cause :** Le frontend ne détecte pas le paiement ou l'URL est incorrecte.

**Solution :** Vérifiez `Dashboard.jsx` et cherchez `payment=success` dans l'URL.

## 📋 Checklist de Diagnostic

- [ ] Vérifier les logs du serveur pour `=== PAYMENT SUCCESS ENDPOINT CALLED ===`
- [ ] Vérifier les logs pour les erreurs Supabase
- [ ] Tester l'endpoint manuellement avec curl
- [ ] Vérifier la structure de la table `subscriptions`
- [ ] Vérifier les contraintes de la table
- [ ] Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est utilisé dans server.js
- [ ] Vérifier le webhook Stripe
- [ ] Synchroniser manuellement avec la fonction FDW

## 🆘 Prochaines Étapes

1. **Partagez les logs du serveur** (les 50 dernières lignes après un paiement)
2. **Testez l'endpoint manuellement** avec curl
3. **Vérifiez la structure de la table** `subscriptions`

Avec ces informations, je pourrai identifier exactement où ça bloque !
