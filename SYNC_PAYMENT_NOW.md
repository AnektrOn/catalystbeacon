# ⚡ Synchroniser Votre Paiement Maintenant

## 🎯 Votre Situation

- ✅ Paiement réussi dans Stripe
- ✅ Serveur démarré
- ❌ Abonnement pas mis à jour dans la DB

## 🚀 Solution en 3 Commandes SQL

### 1️⃣ Trouver votre abonnement

Dans **Supabase SQL Editor**, exécutez :

```sql
SELECT 
  cs.id as checkout_session_id,
  cs.subscription as subscription_id,
  s.attrs->>'status' as subscription_status
FROM stripe.checkout_sessions cs
LEFT JOIN stripe.subscriptions s ON s.id = cs.subscription
WHERE cs.id = 'cs_test_a1oJcT6xubBDgBx4APlwxCTksGUzRaQlZvuwcDQvyMOQVckDV3ldHkkUbx';
```

**Notez le `subscription_id`** (commence par `sub_`)

### 2️⃣ Synchroniser

```sql
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

Remplacez `sub_xxx` par le vrai ID trouvé à l'étape 1.

### 3️⃣ Vérifier

```sql
SELECT 
  s.stripe_subscription_id,
  s.status,
  p.email,
  p.role,
  p.subscription_status
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE p.email = 'conesaleo@gmail.com';
```

Vous devriez voir votre abonnement avec `status = 'active'` et `role = 'Student'` ✅

---

## 🔄 Alternative : Synchroniser TOUS les Abonnements

Si vous voulez synchroniser tous vos abonnements d'un coup :

```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

---

## ✅ Après Synchronisation

1. **Rafraîchissez votre page** dans le navigateur
2. Votre rôle devrait maintenant être **"Student"** au lieu de "Free"
3. Votre `subscription_status` devrait être **"active"**

---

**C'est tout !** 🎉
