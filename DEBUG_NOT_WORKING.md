# 🔍 Diagnostic : Rien Ne Fonctionne

## 🚨 Vérifications Urgentes

### 1️⃣ La Fonction de Synchronisation Existe-t-elle ?

Dans **Supabase SQL Editor**, exécutez :

```sql
SELECT routine_name 
FROM information_schema.routines
WHERE routine_name = 'sync_single_subscription_from_stripe';
```

**Si rien ne s'affiche :**
→ La fonction n'existe pas. Exécutez `supabase/migrations/sync_stripe_subscriptions.sql`

### 2️⃣ Le Webhook Stripe Est-il Configuré ?

1. Allez dans **Stripe Dashboard** → **Developers** → **Webhooks**
2. Vérifiez qu'il y a un webhook actif
3. Vérifiez que l'URL est : `https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/stripe-webhook`
4. Vérifiez que ces événements sont activés :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

**Si le webhook n'existe pas :**
→ Créez-le dans Stripe Dashboard

### 3️⃣ Les Secrets de l'Edge Function Sont-ils Configurés ?

Dans **Supabase Dashboard** → **Edge Functions** → **stripe-webhook** → **Settings** → **Secrets**

Vérifiez que ces secrets existent :
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Si un secret manque :**
→ Ajoutez-le dans les Settings de l'Edge Function

### 4️⃣ Le Webhook Est-il Appelé ?

Dans **Supabase Dashboard** → **Edge Functions** → **stripe-webhook** → **Logs**

**Cherchez :**
- `📥 Webhook event received`
- `🔄 Processing checkout.session.completed`
- `❌` (erreurs)

**Si vous ne voyez RIEN dans les logs :**
→ Le webhook n'est pas appelé. Vérifiez la configuration dans Stripe.

**Si vous voyez des erreurs :**
→ Notez l'erreur exacte et partagez-la

### 5️⃣ Testez la Fonction Manuellement

```sql
-- Testez avec un vrai subscription_id
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

**Si ça retourne une erreur :**
→ Notez l'erreur exacte

---

## 🆘 Solutions Rapides

### Solution 1 : Créer la Fonction (Si Elle N'Existe Pas)

```sql
-- Dans Supabase SQL Editor, copiez-collez TOUT le contenu de :
supabase/migrations/sync_stripe_subscriptions.sql
```

### Solution 2 : Synchroniser Manuellement (Temporaire)

```sql
-- Synchroniser tous les abonnements
SELECT * FROM sync_all_subscriptions_from_stripe();
```

### Solution 3 : Vérifier les Logs du Webhook

1. Allez dans **Supabase Dashboard** → **Edge Functions** → **stripe-webhook** → **Logs**
2. Faites un paiement test
3. Regardez les logs en temps réel
4. Partagez-moi les erreurs que vous voyez

---

## 📋 Checklist Complète

- [ ] Fonction `sync_single_subscription_from_stripe` existe
- [ ] Webhook Stripe configuré et actif
- [ ] URL du webhook correcte
- [ ] Événements activés dans Stripe
- [ ] Secrets de l'Edge Function configurés
- [ ] Logs du webhook vérifiés
- [ ] Test manuel de la fonction effectué

---

## 🔍 Partagez-Moi

Pour que je puisse vous aider, j'ai besoin de :

1. **Les logs du webhook** (les 20 dernières lignes après un paiement)
2. **Le résultat de** : `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'sync_single_subscription_from_stripe';`
3. **Une capture d'écran** de la configuration du webhook dans Stripe (si possible)
4. **L'erreur exacte** si vous testez la fonction manuellement

---

**Dites-moi ce que vous voyez et je vous aiderai à corriger !** 🚀
