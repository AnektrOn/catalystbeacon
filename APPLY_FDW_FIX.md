# 🔧 Appliquer le Fix pour l'Erreur FDW

## ✅ Progrès Actuel

**6 abonnements synchronisés avec succès !** 🎉

Il reste 11 erreurs avec le message "assertion failed" - c'est un bug connu du wrapper Stripe FDW.

## 🔧 Solution

J'ai créé un fix qui utilise `EXECUTE` avec des requêtes construites dynamiquement pour éviter les paramètres dans le WHERE, ce qui contourne le bug du wrapper FDW.

### Fichier à Appliquer

**`supabase/migrations/fix_fdw_assertion_error.sql`**

Ce fichier corrige la fonction `sync_single_subscription_from_stripe()` pour éviter l'erreur "assertion failed".

### Étapes

1. **Ouvrez Supabase SQL Editor**
2. **Copiez-collez le contenu de** `supabase/migrations/fix_fdw_assertion_error.sql`
3. **Exécutez-le**

### Tester

Après avoir appliqué le fix, testez avec :

```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

## 📊 Résultats Attendus

- Les 6 abonnements déjà synchronisés devraient rester OK
- Les 11 abonnements en erreur devraient maintenant se synchroniser correctement
- Total attendu : **17 abonnements synchronisés**

## 🆘 Si Ça Ne Fonctionne Pas

Si certaines erreurs persistent, c'est probablement parce que :
- L'abonnement n'a pas d'utilisateur correspondant dans `profiles` (pas de `stripe_customer_id` correspondant)
- L'abonnement a des données manquantes dans Stripe

Dans ce cas, vous pouvez synchroniser manuellement les abonnements restants avec :

```sql
SELECT * FROM sync_single_subscription_from_stripe('sub_xxx');
```

---

**Appliquez le fix et dites-moi les résultats !** 🚀
