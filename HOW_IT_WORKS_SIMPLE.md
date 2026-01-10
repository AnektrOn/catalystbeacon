# 🎯 Comment Ça Marche - Version Simple

## 💡 L'Idée en 1 Phrase

**Quand vous payez dans Stripe, Stripe envoie un message à Supabase, et Supabase met à jour automatiquement votre profil et votre abonnement.**

---

## 🔄 Le Flux Complet (Étape par Étape)

### Étape 1 : Vous Cliquez sur "Subscribe"
```
Vous → Page Pricing → Cliquez "Subscribe"
```

### Étape 2 : Création de la Session de Paiement
```
Frontend → Supabase Edge Function (create-checkout-session)
→ Crée une session Stripe
→ Vous redirige vers Stripe pour payer
```

### Étape 3 : Vous Payez dans Stripe
```
Vous → Stripe → Entrez votre carte → Payez
```

### Étape 4 : Stripe Envoie un Webhook
```
Stripe → "Hey Supabase, le paiement a réussi !"
→ Envoie vers : https://votre-projet.supabase.co/functions/v1/stripe-webhook
```

### Étape 5 : Supabase Reçoit le Webhook
```
Supabase Edge Function (stripe-webhook) reçoit le message
→ Appelle la fonction PostgreSQL : sync_single_subscription_from_stripe()
```

### Étape 6 : La Fonction Met à Jour Tout
```
La fonction :
1. Lit depuis stripe.subscriptions (via FDW) ✅
2. Met à jour la table subscriptions ✅
3. Met à jour la table profiles (role + subscription_status) ✅
```

### Étape 7 : C'est Fait !
```
Votre profil est maintenant :
- role = "Student" ✅
- subscription_status = "active" ✅
- subscription_id = "sub_xxx" ✅
```

---

## 🎯 Pourquoi C'est Mieux Comme Ça ?

### ❌ Avant (Compliqué)
```
Stripe → Webhook → Serveur Externe → API → Supabase
```
**Problèmes :**
- Besoin d'un serveur qui tourne tout le temps
- Si le serveur crash, ça ne marche plus
- Plus de choses à gérer

### ✅ Maintenant (Simple)
```
Stripe → Webhook → Supabase Edge Function → Fonction PostgreSQL → Tables mises à jour
```
**Avantages :**
- Tout dans Supabase
- Pas besoin de serveur externe
- Automatique et fiable
- Utilise le FDW Stripe qu'on a configuré

---

## 🔍 Où Voir les Logs ?

### Dans Supabase Dashboard :

1. Allez dans **Edge Functions** → **stripe-webhook**
2. Cliquez sur **Logs**
3. Vous verrez :
   ```
   📥 Webhook event received: checkout.session.completed
   🔄 Processing checkout.session.completed...
   ✅ Subscription synced successfully via FDW function
   ```

---

## 🧪 Comment Tester ?

### Test 1 : Faire un Paiement Test

1. Allez sur `/pricing`
2. Cliquez "Subscribe"
3. Utilisez la carte test : `4242 4242 4242 4242`
4. Complétez le paiement

### Test 2 : Vérifier les Logs

Dans **Supabase Dashboard** → **Edge Functions** → **stripe-webhook** → **Logs**

Vous devriez voir :
- `📥 Webhook event received`
- `✅ Subscription synced successfully`

### Test 3 : Vérifier la Base de Données

```sql
-- Vérifier votre profil
SELECT email, role, subscription_status, subscription_id
FROM profiles
WHERE email = 'votre-email@example.com';

-- Vérifier l'abonnement
SELECT * FROM subscriptions
WHERE user_id = 'votre-user-id';
```

---

## 🆘 Si Ça Ne Marche Pas

### Problème : "function sync_single_subscription_from_stripe does not exist"

**Solution :** La fonction n'existe pas encore. Exécutez :
```sql
-- Dans Supabase SQL Editor, copiez-collez :
supabase/migrations/sync_stripe_subscriptions.sql
```

### Problème : Le webhook ne reçoit rien

**Vérifiez :**
1. Dans Stripe Dashboard → Webhooks → Votre webhook est actif ?
2. L'URL est correcte : `https://votre-projet.supabase.co/functions/v1/stripe-webhook`
3. Les événements sont activés : `checkout.session.completed`, `customer.subscription.updated`

### Problème : Les logs montrent une erreur

**Regardez les logs** dans Supabase et partagez-moi l'erreur exacte.

---

## ✅ Checklist

- [ ] Stripe FDW configuré (voir `STRIPE_FDW_SETUP_BEGINNER.md`)
- [ ] Fonction `sync_single_subscription_from_stripe` créée
- [ ] Webhook Stripe configuré et pointant vers Supabase
- [ ] Secrets de l'Edge Function configurés
- [ ] Test de paiement effectué
- [ ] Logs vérifiés dans Supabase
- [ ] Base de données vérifiée

---

## 🎉 Résumé Ultra-Simple

1. **Vous payez** → Stripe
2. **Stripe envoie un message** → Supabase
3. **Supabase met à jour** → Votre profil et abonnement
4. **C'est automatique !** ✨

**Tout se passe dans Supabase, rien en dehors !** 🚀

---

**Besoin d'aide ?** Dites-moi ce que vous voyez dans les logs du webhook !
