# ✅ Checklist Rapide : Vérifier Pourquoi Ça Ne Marche Pas

## 🎯 En 5 Minutes

### Étape 1 : Vérifier la Fonction (30 secondes)

Dans **Supabase SQL Editor**, exécutez :

```sql
SELECT routine_name 
FROM information_schema.routines
WHERE routine_name = 'sync_single_subscription_from_stripe';
```

**Si rien ne s'affiche :**
→ ❌ La fonction n'existe pas
→ ✅ **Solution :** Exécutez `supabase/migrations/sync_stripe_subscriptions.sql`

### Étape 2 : Vérifier Stripe FDW (30 secondes)

```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'stripe';
```

**Si le résultat est 0 :**
→ ❌ Stripe FDW n'est pas configuré
→ ✅ **Solution :** Suivez `STRIPE_FDW_SETUP_BEGINNER.md`

### Étape 3 : Vérifier le Webhook (1 minute)

1. Allez dans **Stripe Dashboard** → **Developers** → **Webhooks**
2. Vérifiez qu'il y a un webhook
3. Vérifiez que l'URL est : `https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/stripe-webhook`

**Si le webhook n'existe pas :**
→ ❌ Créez-le dans Stripe Dashboard

### Étape 4 : Vérifier les Logs (1 minute)

1. Allez dans **Supabase Dashboard** → **Edge Functions** → **stripe-webhook** → **Logs**
2. Faites un paiement test
3. Regardez les logs

**Si vous ne voyez RIEN :**
→ ❌ Le webhook n'est pas appelé
→ ✅ **Vérifiez la configuration dans Stripe**

**Si vous voyez des erreurs :**
→ ❌ Notez l'erreur exacte
→ ✅ **Partagez-moi l'erreur**

### Étape 5 : Test Manuel (1 minute)

```sql
-- Trouvez un subscription_id dans Stripe
SELECT id FROM stripe.subscriptions LIMIT 1;

-- Testez la fonction (remplacez sub_xxx)
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

**Si ça retourne une erreur :**
→ ❌ Notez l'erreur exacte
→ ✅ **Partagez-moi l'erreur**

---

## 🆘 Script de Diagnostic Complet

Exécutez ce script pour tout vérifier d'un coup :

```sql
-- Copiez-collez le contenu de :
supabase/migrations/diagnose_everything.sql
```

---

## 📋 Partagez-Moi Ces Informations

Pour que je puisse vous aider rapidement, j'ai besoin de :

1. ✅ **Le résultat du TEST 1** (la fonction existe-t-elle ?)
2. ✅ **Le résultat du TEST 2** (Stripe FDW est-il configuré ?)
3. ✅ **Les logs du webhook** (les 10 dernières lignes)
4. ✅ **L'erreur exacte** si vous testez la fonction manuellement

---

## 🚀 Solutions Rapides

### Si la fonction n'existe pas :
```sql
-- Exécutez dans Supabase SQL Editor :
-- Copiez-collez supabase/migrations/sync_stripe_subscriptions.sql
```

### Si Stripe FDW n'est pas configuré :
→ Suivez `STRIPE_FDW_SETUP_BEGINNER.md`

### Si le webhook n'est pas appelé :
→ Vérifiez la configuration dans Stripe Dashboard

### Si vous voyez une erreur spécifique :
→ Partagez-moi l'erreur exacte et je vous aiderai à la corriger

---

**Exécutez le script de diagnostic et partagez-moi les résultats !** 🔍
