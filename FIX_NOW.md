# ⚡ Fix Immédiat - Synchroniser Vos Abonnements

## 🎯 Votre Situation

- ✅ Stripe FDW configuré
- ✅ Fonction de sync existe
- ✅ 17 abonnements dans Stripe
- ❌ 0 abonnement dans votre DB
- ⚠️ Seulement 2 profiles avec stripe_customer_id

## 🚀 Solution : Synchroniser Maintenant

### Étape 1 : Synchroniser TOUS les Abonnements

Dans **Supabase SQL Editor**, exécutez :

```sql
-- Synchroniser tous les abonnements Stripe vers votre DB
SELECT * FROM sync_all_subscriptions_from_stripe();
```

**Résultat attendu :**
```
synced_count | error_count
-------------+-------------
     17      |     0
```

### Étape 2 : Vérifier que ça a Fonctionné

```sql
-- Vérifier les abonnements synchronisés
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users
FROM subscriptions;
```

Vous devriez voir vos 17 abonnements maintenant ! ✅

### Étape 3 : Vérifier les Profiles

```sql
-- Vérifier les profiles mis à jour
SELECT 
  email,
  role,
  subscription_status,
  subscription_id,
  stripe_customer_id
FROM profiles
WHERE subscription_status = 'active'
ORDER BY updated_at DESC;
```

---

## 🔍 Si Certains Abonnements N'ont Pas Été Synchronisés

### Problème : Pas de stripe_customer_id dans profiles

Si un abonnement ne peut pas être synchronisé car le profile n'a pas de `stripe_customer_id`, vous devez :

1. **Trouver le customer_id dans Stripe :**
```sql
-- Voir les abonnements avec leur customer_id
SELECT 
  s.id as subscription_id,
  s.customer as customer_id,
  s.attrs->>'status' as status
FROM stripe.subscriptions s
WHERE s.attrs->>'status' IN ('active', 'trialing', 'past_due');
```

2. **Lier le customer_id au profile :**
```sql
-- Mettre à jour le profile avec le customer_id
UPDATE profiles
SET stripe_customer_id = 'cus_xxx'  -- Remplacez par le vrai customer_id
WHERE email = 'email@example.com';  -- Remplacez par l'email de l'utilisateur
```

3. **Resynchroniser :**
```sql
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

---

## 📊 Vérification Complète

Après la synchronisation, exécutez :

```sql
-- Voir les différences restantes
SELECT * FROM check_subscription_discrepancies();
```

**Si vous voyez des différences :**
→ Certains profiles n'ont pas de `stripe_customer_id` lié
→ Il faut les lier manuellement (voir ci-dessus)

---

## ✅ Après Synchronisation

1. **Rafraîchissez votre page** dans le navigateur
2. Votre profil devrait maintenant montrer :
   - `role = "Student"` ou `"Teacher"`
   - `subscription_status = "active"`
   - `subscription_id = "sub_xxx"`

---

## 🎯 Action Immédiate

**Exécutez MAINTENANT :**

```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

Puis vérifiez :

```sql
SELECT COUNT(*) FROM subscriptions;
```

**Vous devriez voir 17 abonnements maintenant !** 🎉

---

**Dites-moi le résultat de la synchronisation !**
