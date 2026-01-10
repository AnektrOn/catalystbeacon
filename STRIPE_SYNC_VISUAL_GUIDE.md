# 🎯 Guide Visuel : Synchroniser Stripe

## 🎬 Ce que vous allez faire

Vous allez créer une "machine" qui copie automatiquement vos abonnements Stripe dans votre base de données.

```
Stripe (vos abonnements)  →  [Machine de Sync]  →  Votre Base de Données
```

---

## 📝 ÉTAPE PAR ÉTAPE (avec images)

### ÉTAPE 1 : Ouvrir Supabase

```
1. Allez sur : https://supabase.com/dashboard
2. Cliquez sur votre projet
3. Dans le menu de gauche, cliquez sur "SQL Editor"
```

Vous devriez voir quelque chose comme ça :
```
┌─────────────────────────────────────┐
│  Supabase Dashboard                │
├─────────────────────────────────────┤
│  [Table Editor] [SQL Editor] ← ICI │
│  [Authentication] [Storage]        │
└─────────────────────────────────────┘
```

---

### ÉTAPE 2 : Ouvrir le Fichier

1. Dans votre ordinateur, ouvrez le fichier :
   ```
   supabase/migrations/sync_stripe_subscriptions.sql
   ```

2. Vous verrez beaucoup de code SQL (c'est normal !)

---

### ÉTAPE 3 : Copier TOUT le Code

1. **Sélectionnez TOUT** le texte dans le fichier
   - Windows/Linux : `Ctrl + A`
   - Mac : `Cmd + A`

2. **Copiez** le texte
   - Windows/Linux : `Ctrl + C`
   - Mac : `Cmd + C`

---

### ÉTAPE 4 : Coller dans Supabase

1. Retournez dans Supabase SQL Editor
2. **Collez** le code dans la zone de texte
   - Windows/Linux : `Ctrl + V`
   - Mac : `Cmd + V`

Vous devriez voir :
```
┌─────────────────────────────────────┐
│  SQL Editor                         │
├─────────────────────────────────────┤
│  CREATE OR REPLACE FUNCTION...      │
│  ... (beaucoup de code) ...         │
│                                     │
│  [Run]  [Save]  [New Query]        │
└─────────────────────────────────────┘
```

---

### ÉTAPE 5 : Exécuter

1. Cliquez sur le bouton **"Run"** (ou appuyez sur `F5`)
2. Attendez quelques secondes
3. Vous devriez voir : ✅ **"Success"**

---

## 🎉 C'EST FAIT !

Maintenant vous avez créé la "machine". Vous pouvez l'utiliser !

---

## 🚀 Comment Utiliser la Machine

### Pour synchroniser TOUS vos abonnements :

1. Dans Supabase SQL Editor, **effacez** tout le code précédent

2. **Tapez** exactement ça :
```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

3. Cliquez **Run**

4. **Résultat :**
```
┌──────────────┬──────────────┬──────────┐
│ synced_count │ error_count  │ details  │
├──────────────┼──────────────┼──────────┤
│      5       │      0       │   []     │
└──────────────┴──────────────┴──────────┘
```

Ça veut dire : **5 abonnements synchronisés, 0 erreur** ✅

---

## 🔍 Vérifier que ça marche

Tapez cette commande pour voir vos abonnements :

```sql
SELECT * FROM subscriptions ORDER BY updated_at DESC LIMIT 10;
```

Si vous voyez une liste avec vos abonnements, **ça marche !** 🎉

---

## 📋 Résumé en 1 Minute

```
1. Ouvrir Supabase SQL Editor
2. Copier le contenu de sync_stripe_subscriptions.sql
3. Coller et exécuter
4. Utiliser : SELECT * FROM sync_all_subscriptions_from_stripe();
5. C'est tout ! ✅
```

---

## 🆘 Aide Rapide

### Erreur : "schema 'stripe' does not exist"
→ Vous devez d'abord configurer Stripe FDW. Suivez `STRIPE_FDW_SETUP_BEGINNER.md`

### Erreur : "function does not exist"
→ Vous n'avez pas exécuté l'ÉTAPE 5. Faites-le !

### Rien ne se passe
→ Vérifiez que vous avez des abonnements dans Stripe

---

## 💡 Astuce

Vous pouvez créer un raccourci : sauvegardez cette requête dans Supabase :

```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

Comme ça, vous pouvez la relancer facilement ! 

---

**C'est vraiment aussi simple que ça !** 🎉

Si vous bloquez sur une étape, dites-moi laquelle et je vous aiderai !
