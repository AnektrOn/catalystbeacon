# 🔧 Fix : Paiement Réussi mais Abonnement Non Mis à Jour

## 🚨 Problème Détecté

Vous avez payé (`session_id=cs_test_a1oJcT6xubBDgBx4APlwxCTksGUzRaQlZvuwcDQvyMOQVckDV3ldHkkUbx`) mais :
- ❌ L'utilisateur est toujours "Free"
- ❌ `subscriptionStatus: null`
- ❌ Le serveur API retourne 503 (Service Unavailable)
- ❌ L'Edge Function retourne 500

## ✅ Solution Rapide : Synchroniser Manuellement

### Étape 1 : Trouver votre session_id Stripe

Dans les logs, vous avez :
```
session_id=cs_test_a1oJcT6xubBDgBx4APlwxCTksGUzRaQlZvuwcDQvyMOQVckDV3ldHkkUbx
```

### Étape 2 : Récupérer l'abonnement depuis Stripe

Dans **Supabase SQL Editor**, exécutez :

```sql
-- Trouver l'abonnement lié à cette session
SELECT 
  s.id as subscription_id,
  s.customer as customer_id,
  s.attrs->>'status' as status,
  cs.id as checkout_session_id
FROM stripe.checkout_sessions cs
JOIN stripe.subscriptions s ON s.id = cs.subscription
WHERE cs.id = 'cs_test_a1oJcT6xubBDgBx4APlwxCTksGUzRaQlZvuwcDQvyMOQVckDV3ldHkkUbx';
```

**Notez le `subscription_id`** (commence par `sub_`)

### Étape 3 : Synchroniser l'abonnement

```sql
-- Synchroniser cet abonnement spécifique
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

Remplacez `sub_xxx` par le `subscription_id` trouvé à l'étape 2.

### Étape 4 : Vérifier

```sql
-- Vérifier que l'abonnement est maintenant dans votre DB
SELECT 
  s.*,
  p.email,
  p.role,
  p.subscription_status
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE s.stripe_subscription_id = 'sub_xxx';
```

---

## 🔍 Diagnostic des Problèmes

### Problème 1 : Serveur API 503

**Cause :** Le serveur Node.js n'est pas démarré ou inaccessible.

**Solution :**
1. Vérifiez que votre serveur tourne : `npm run server` ou `node server.js`
2. Vérifiez que le port 3001 (ou votre port) est accessible
3. Vérifiez les logs du serveur pour voir les erreurs

### Problème 2 : Edge Function 500

**Cause :** Variables d'environnement manquantes dans Supabase.

**Solution :**
1. Allez dans **Supabase Dashboard** → **Edge Functions** → **create-checkout-session**
2. Vérifiez que ces secrets sont configurés :
   - `STRIPE_SECRET_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `SITE_URL`

### Problème 3 : Payment Success Non Appelé

**Cause :** Le timeout de 5 secondes est trop court ou le serveur est down.

**Solution :**
1. Vérifiez les logs du navigateur (Console)
2. Vérifiez que `/api/payment-success` est appelé
3. Si le serveur est down, le webhook Stripe devrait quand même mettre à jour la DB

---

## 🎯 Solution Complète : Synchroniser Tous les Abonnements

Si plusieurs paiements n'ont pas été synchronisés :

```sql
-- Synchroniser TOUS les abonnements Stripe
SELECT * FROM sync_all_subscriptions_from_stripe();
```

Cela synchronisera tous vos abonnements Stripe vers votre base de données.

---

## 🔄 Prévention : Vérifier le Webhook Stripe

Le webhook Stripe devrait normalement mettre à jour la DB automatiquement. Vérifiez :

1. **Dans Stripe Dashboard** → **Developers** → **Webhooks**
2. Vérifiez que le webhook est configuré et actif
3. Vérifiez les logs du webhook pour voir s'il y a des erreurs

---

## 📋 Checklist de Vérification

- [ ] Serveur API démarré et accessible
- [ ] Edge Function configurée avec tous les secrets
- [ ] Webhook Stripe configuré et actif
- [ ] Abonnement synchronisé manuellement (solution rapide)
- [ ] Vérification que l'utilisateur a maintenant le bon rôle

---

## 🆘 Si Rien Ne Fonctionne

1. **Synchronisez manuellement** avec la fonction FDW (solution rapide ci-dessus)
2. **Vérifiez les logs Stripe** pour voir si le paiement a vraiment réussi
3. **Vérifiez votre table `subscriptions`** pour voir si des enregistrements existent
4. **Vérifiez votre table `profiles`** pour voir le `subscription_status`

---

**Besoin d'aide ?** Dites-moi quelle étape vous bloque !
