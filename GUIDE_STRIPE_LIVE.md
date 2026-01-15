# Guide Complet : Passer Stripe en Mode Live (Production)

## 📋 Checklist avant de commencer

- [ ] Compte Stripe vérifié et activé
- [ ] Informations bancaires complétées dans Stripe Dashboard
- [ ] Mode test fonctionne correctement
- [ ] Accès au serveur de production

---

## 🚀 Étapes détaillées

### Étape 1 : Activer le mode Live dans Stripe Dashboard

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com)
2. **Basculez en mode Live** (toggle en haut à droite)
3. Vérifiez que votre compte est activé (vérification d'identité, informations bancaires, etc.)

### Étape 2 : Créer les produits et prix en mode Live

⚠️ **IMPORTANT** : Les Price IDs de test ne fonctionnent PAS en mode live. Vous devez créer de nouveaux produits.

1. Dans Stripe Dashboard (mode Live) → **Products**
2. Créez 4 produits avec leurs prix :

   **Produit 1 : Student Monthly**
   - Nom : `Student Monthly`
   - Prix : `€55.00`
   - Période : `Monthly (recurring)`
   - **Copiez le Price ID** (commence par `price_`)

   **Produit 2 : Student Yearly**
   - Nom : `Student Yearly`
   - Prix : `€550.00`
   - Période : `Yearly (recurring)`
   - **Copiez le Price ID**

   **Produit 3 : Teacher Monthly**
   - Nom : `Teacher Monthly`
   - Prix : `€55.00` (ou le prix que vous souhaitez)
   - Période : `Monthly (recurring)`
   - **Copiez le Price ID**

   **Produit 4 : Teacher Yearly**
   - Nom : `Teacher Yearly`
   - Prix : `€550.00` (ou le prix que vous souhaitez)
   - Période : `Yearly (recurring)`
   - **Copiez le Price ID**

### Étape 3 : Récupérer les clés API Live

1. Dans Stripe Dashboard (mode Live) → **Developers** → **API keys**
2. **Publishable key** (commence par `pk_live_`)
   - Cliquez sur "Reveal test key" si nécessaire
   - **Copiez cette clé** → vous en aurez besoin pour `.env`
3. **Secret key** (commence par `sk_live_`)
   - Cliquez sur "Reveal live key"
   - **Copiez cette clé** → vous en aurez besoin pour `server.env`

### Étape 4 : Configurer le Webhook en mode Live

1. Dans Stripe Dashboard (mode Live) → **Developers** → **Webhooks**
2. Cliquez sur **"Add endpoint"**
3. **Endpoint URL** : 
   ```
   https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/stripe-webhook
   ```
   OU si vous utilisez votre serveur Node.js :
   ```
   https://humancatalystbeacon.com/api/stripe-webhook
   ```
4. **Événements à écouter** (sélectionnez ces événements) :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Cliquez sur **"Add endpoint"**
6. **Copiez le "Signing secret"** (commence par `whsec_`)
   - Vous en aurez besoin pour `server.env`

### Étape 5 : Mettre à jour `server.env`

Éditez le fichier `server.env` à la racine du projet :

```env
# Stripe Configuration (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE_ICI
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET_ICI

# Stripe Price IDs (LIVE MODE - remplacez par vos vrais Price IDs)
STRIPE_STUDENT_MONTHLY_PRICE_ID=price_VOTRE_PRICE_ID_STUDENT_MONTHLY
STRIPE_STUDENT_YEARLY_PRICE_ID=price_VOTRE_PRICE_ID_STUDENT_YEARLY
STRIPE_TEACHER_MONTHLY_PRICE_ID=price_VOTRE_PRICE_ID_TEACHER_MONTHLY
STRIPE_TEACHER_YEARLY_PRICE_ID=price_VOTRE_PRICE_ID_TEACHER_YEARLY

# Supabase Configuration
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

# Email Configuration
FROM_EMAIL=noreply@humancatalystbeacon.com
FROM_NAME=The Human Catalyst Beacon
SITE_NAME=The Human Catalyst Beacon
SITE_URL=https://humancatalystbeacon.com

# Server Configuration
PORT=3001
```

### Étape 6 : Mettre à jour `.env` (frontend)

Créez ou éditez le fichier `.env` à la racine du projet :

```env
# Stripe Configuration (LIVE MODE)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_PUBLISHABLE_KEY_ICI

# Stripe Price IDs (LIVE MODE - mêmes que dans server.env)
REACT_APP_STRIPE_STUDENT_MONTHLY_PRICE_ID=price_VOTRE_PRICE_ID_STUDENT_MONTHLY
REACT_APP_STRIPE_STUDENT_YEARLY_PRICE_ID=price_VOTRE_PRICE_ID_STUDENT_YEARLY
REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID=price_VOTRE_PRICE_ID_TEACHER_MONTHLY
REACT_APP_STRIPE_TEACHER_YEARLY_PRICE_ID=price_VOTRE_PRICE_ID_TEACHER_YEARLY

# API URL (production)
REACT_APP_API_URL=https://humancatalystbeacon.com
```

### Étape 7 : Mettre à jour les secrets Supabase Edge Functions (si utilisé)

Si vous utilisez les Edge Functions Supabase pour Stripe :

1. Allez dans [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Edge Functions** → **Secrets**
4. Mettez à jour ces secrets :
   - `STRIPE_SECRET_KEY` → votre clé live (`sk_live_...`)
   - `STRIPE_WEBHOOK_SECRET` → votre webhook secret live (`whsec_...`)

### Étape 8 : Redémarrer le serveur

```bash
# Si vous utilisez PM2
pm2 restart all

# OU si vous utilisez un script de démarrage
./START_SERVER.sh

# OU manuellement
node server.js
```

### Étape 9 : Rebuild le frontend

```bash
npm run build
```

Puis redéployez le build sur votre serveur de production.

---

## ✅ Vérification

### Test 1 : Vérifier que les clés sont chargées

Regardez les logs du serveur au démarrage. Vous devriez voir :
```
✅ Stripe initialized successfully
🔑 STRIPE_SECRET_KEY loaded: YES (sk_live_...)
```

### Test 2 : Tester un paiement (avec une carte de test Stripe)

Stripe fournit des cartes de test même en mode live pour tester :
- Carte de test : `4242 4242 4242 4242`
- Date : n'importe quelle date future
- CVC : n'importe quel 3 chiffres
- Code postal : n'importe quel code postal

⚠️ **ATTENTION** : En mode live, les paiements sont RÉELS. Utilisez uniquement les cartes de test Stripe pour tester.

### Test 3 : Vérifier le webhook

1. Effectuez un paiement test
2. Allez dans Stripe Dashboard → **Developers** → **Webhooks**
3. Cliquez sur votre endpoint
4. Vérifiez que les événements sont reçus (onglet "Events")

---

## 🔒 Sécurité

- ⚠️ **NE JAMAIS** commiter `server.env` ou `.env` dans Git
- ⚠️ **NE JAMAIS** partager vos clés secrètes
- ✅ Vérifiez que `.env` et `server.env` sont dans `.gitignore`
- ✅ Utilisez des variables d'environnement sur votre serveur de production

---

## 🐛 Dépannage

### Problème : "STRIPE_SECRET_KEY is not set correctly"

**Solution** :
1. Vérifiez que `server.env` existe à la racine du projet
2. Vérifiez que la clé commence par `sk_live_` (pas `sk_test_`)
3. Redémarrez le serveur après modification

### Problème : Les paiements ne fonctionnent pas

**Solution** :
1. Vérifiez que vous êtes en mode Live dans Stripe Dashboard
2. Vérifiez que les Price IDs correspondent aux produits créés en mode Live
3. Vérifiez les logs du serveur pour les erreurs

### Problème : Le webhook ne fonctionne pas

**Solution** :
1. Vérifiez que l'URL du webhook est correcte
2. Vérifiez que le `STRIPE_WEBHOOK_SECRET` correspond au secret du webhook live
3. Testez le webhook depuis Stripe Dashboard → "Send test webhook"

---

## 📝 Résumé des fichiers à modifier

1. ✅ `server.env` → Clés Stripe live + Price IDs live
2. ✅ `.env` → Publishable key live + Price IDs live
3. ✅ Supabase Edge Functions Secrets (si utilisé)
4. ✅ Webhook Stripe Dashboard (mode Live)

---

## 🎯 Checklist finale

- [ ] Produits et prix créés en mode Live dans Stripe
- [ ] Clés API Live récupérées
- [ ] Webhook configuré en mode Live
- [ ] `server.env` mis à jour avec les clés live
- [ ] `.env` mis à jour avec la publishable key live
- [ ] Price IDs mis à jour dans les deux fichiers
- [ ] Secrets Supabase mis à jour (si utilisé)
- [ ] Serveur redémarré
- [ ] Frontend rebuild et redéployé
- [ ] Test de paiement effectué avec succès

---

**Besoin d'aide ?** Vérifiez les logs du serveur et les événements dans Stripe Dashboard.
