# 🎯 Guide Simple : Synchroniser Stripe avec votre Base de Données

## 📋 Ce que vous voulez faire

Vous voulez que les abonnements Stripe soient automatiquement copiés dans votre base de données Supabase.

## ✅ Solution Simple en 2 Étapes

### ÉTAPE 1 : Créer les fonctions (UNE FOIS)

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Ouvrez le fichier : `supabase/migrations/sync_stripe_subscriptions.sql`
3. **Copiez TOUT le contenu**
4. **Collez-le dans SQL Editor**
5. Cliquez sur **Run** (ou F5)

✅ **Résultat attendu :** "Success" pour chaque fonction créée

### ÉTAPE 2 : Utiliser les fonctions (QUAND VOUS VOULEZ)

Maintenant vous avez 2 commandes simples :

#### Commande 1 : Synchroniser TOUS les abonnements
```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

**Quand l'utiliser :**
- Quand vous voulez mettre à jour tous les abonnements
- Après avoir fait des changements dans Stripe
- Une fois par jour (manuellement)

#### Commande 2 : Vérifier s'il y a des différences
```sql
SELECT * FROM check_subscription_discrepancies();
```

**Quand l'utiliser :**
- Pour voir ce qui ne correspond pas entre Stripe et votre DB

---

## 🎯 Exemple Concret

### Scénario : Vous venez de créer un nouvel abonnement dans Stripe

1. **Allez dans Supabase SQL Editor**
2. **Tapez :**
```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```
3. **Cliquez Run**
4. **Résultat :** Tous les abonnements Stripe sont maintenant dans votre table `subscriptions`

C'est tout ! 🎉

---

## ❓ Questions Fréquentes

### Q: Je dois faire ça à chaque fois manuellement ?
**R:** Oui, pour l'instant. Mais vous pouvez aussi l'automatiser (voir plus bas).

### Q: Ça prend combien de temps ?
**R:** Quelques secondes, même avec beaucoup d'abonnements.

### Q: Est-ce que ça va écraser mes données ?
**R:** Non, ça met juste à jour ce qui existe et ajoute ce qui manque.

### Q: Ça coûte quelque chose ?
**R:** Non, c'est gratuit.

---

## 🔄 Automatiser (Optionnel - Plus Avancé)

Si vous voulez que ça se fasse automatiquement, vous avez 2 options :

### Option A : Depuis votre code (Recommandé)

Dans votre fichier `server.js`, ajoutez ceci :

```javascript
// Après avoir traité un paiement Stripe
app.get('/api/payment-success', async (req, res) => {
  // ... votre code existant ...
  
  // À la fin, ajoutez ça :
  try {
    await supabase.rpc('sync_single_subscription_from_stripe', {
      p_stripe_subscription_id: subscription.id
    });
  } catch (error) {
    console.log('Sync optionnel échoué (pas grave)');
  }
  
  res.json({ success: true });
});
```

### Option B : Service externe (Plus compliqué)

Utilisez un service comme [cron-job.org](https://cron-job.org) pour appeler votre site toutes les heures.

---

## 🧪 Tester que ça marche

1. **Exécutez cette commande :**
```sql
SELECT * FROM sync_all_subscriptions_from_stripe();
```

2. **Vérifiez le résultat :**
```
synced_count | error_count
-------------+-------------
     5       |     0
```

3. **Vérifiez dans votre table :**
```sql
SELECT * FROM subscriptions ORDER BY updated_at DESC LIMIT 5;
```

Si vous voyez vos abonnements, **ça marche !** ✅

---

## 🆘 Problèmes ?

### Erreur : "schema 'stripe' does not exist"
→ Vous n'avez pas configuré le FDW Stripe. Suivez `STRIPE_FDW_SETUP_BEGINNER.md` d'abord.

### Erreur : "function sync_all_subscriptions_from_stripe does not exist"
→ Vous n'avez pas exécuté l'ÉTAPE 1. Faites-la d'abord.

### Aucun abonnement synchronisé
→ Vérifiez que :
1. Vous avez des abonnements dans Stripe
2. Les `stripe_customer_id` dans votre table `profiles` correspondent aux clients Stripe

---

## 📝 Résumé Ultra-Simple

1. **Copiez** `sync_stripe_subscriptions.sql` dans Supabase SQL Editor
2. **Exécutez** `SELECT * FROM sync_all_subscriptions_from_stripe();` quand vous voulez synchroniser
3. **C'est tout !** 🎉

---

**Besoin d'aide ?** Dites-moi quelle étape vous bloque et je vous aiderai !
