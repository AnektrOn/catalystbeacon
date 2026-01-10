# 🎯 Comment Synchroniser Stripe - Guide Ultra Simple

## 🎬 En 3 Étapes Simples

### ÉTAPE 1 : Ouvrir Supabase
1. Allez sur https://supabase.com/dashboard
2. Cliquez sur votre projet
3. Cliquez sur **"SQL Editor"** dans le menu de gauche

### ÉTAPE 2 : Copier le Code
1. Ouvrez le fichier : `supabase/migrations/sync_stripe_subscriptions.sql`
2. **Sélectionnez TOUT** (Ctrl+A ou Cmd+A)
3. **Copiez** (Ctrl+C ou Cmd+C)

### ÉTAPE 3 : Coller et Exécuter
1. Dans Supabase SQL Editor, **collez** le code (Ctrl+V ou Cmd+V)
2. Cliquez sur le bouton **"Run"** (ou appuyez sur F5)
3. Attendez quelques secondes
4. Vous devriez voir "Success" ✅

---

## 🎉 Maintenant, Utilisez-le !

### Pour synchroniser tous vos abonnements Stripe :

1. Dans Supabase SQL Editor, tapez :
```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

2. Cliquez **Run**

3. **C'est fait !** Tous vos abonnements Stripe sont maintenant dans votre base de données.

---

## 📊 Vérifier que ça marche

Tapez cette commande pour voir vos abonnements :

```sql
SELECT * FROM subscriptions ORDER BY updated_at DESC LIMIT 10;
```

Si vous voyez vos abonnements, **ça marche !** ✅

---

## ❓ Questions ?

**Q: Je dois faire ça à chaque fois ?**
→ Oui, quand vous voulez synchroniser. Ou vous pouvez l'automatiser (mais c'est plus compliqué).

**Q: Ça prend combien de temps ?**
→ Quelques secondes seulement.

**Q: Ça va casser quelque chose ?**
→ Non, c'est sûr. Ça met juste à jour vos données.

---

## 🆘 Problème ?

Si vous avez une erreur, dites-moi exactement quel message d'erreur vous voyez et je vous aiderai !

---

**C'est tout !** C'est vraiment aussi simple que ça. 🎉
