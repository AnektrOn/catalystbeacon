# 🔗 Configuration Complète du Webhook Stripe

## ✅ **Ce qui est déjà en place**

Vous avez déjà une Edge Function `stripe-webhook` dans Supabase qui :
- ✅ Écoute les événements Stripe (checkout.session.completed, customer.subscription.*, etc.)
- ✅ Met à jour automatiquement le rôle dans la table `profiles`
- ✅ Met à jour le statut de souscription
- ✅ Gère les annulations et les échecs de paiement

## 🚀 **Étapes de Configuration**

### **Étape 1 : Déployer la Edge Function**

Si la fonction n'est pas encore déployée, exécutez :

```bash
cd /Users/conesaleo/hcuniversity/hcuniversity
supabase functions deploy stripe-webhook
```

### **Étape 2 : Configurer les Secrets dans Supabase**

1. Allez dans **Supabase Dashboard** → **Edge Functions** → **stripe-webhook** → **Settings** → **Secrets**

2. Ajoutez ces secrets (si pas déjà présents) :
   - `STRIPE_SECRET_KEY` = Votre clé secrète Stripe (commence par `sk_`)
   - `STRIPE_WEBHOOK_SECRET` = Le secret du webhook (vous l'obtiendrez à l'étape 3)
   - `SUPABASE_URL` = Votre URL Supabase (ex: `https://mbffycgrqfeesfnhhcdm.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` = Votre clé service role (commence par `eyJ...`)

### **Étape 3 : Configurer le Webhook dans Stripe Dashboard**

1. **Allez sur** : https://dashboard.stripe.com/webhooks

2. **Cliquez sur "Add endpoint"** (ou "Add webhook endpoint")

3. **Endpoint URL** : 
   ```
   https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/stripe-webhook
   ```
   ⚠️ **Remplacez `mbffycgrqfeesfnhhcdm` par votre project ID Supabase si différent**

4. **Sélectionnez les événements à écouter** :
   - ✅ `checkout.session.completed` (CRITIQUE - se déclenche après paiement réussi)
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded` (optionnel mais recommandé)
   - ✅ `invoice.payment_failed` (optionnel mais recommandé)

5. **Cliquez sur "Add endpoint"**

6. **Copiez le "Signing secret"** (commence par `whsec_`)
   - C'est votre `STRIPE_WEBHOOK_SECRET`
   - Ajoutez-le dans Supabase Edge Function secrets (étape 2)

### **Étape 4 : Tester le Webhook**

#### **Option A : Test avec Stripe CLI (Recommandé)**

```bash
# Installer Stripe CLI (si pas déjà installé)
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les événements et les forwarder vers votre webhook
stripe listen --forward-to https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/stripe-webhook

# Dans un autre terminal, déclencher un événement de test
stripe trigger checkout.session.completed
```

#### **Option B : Test avec un Paiement Réel**

1. Allez sur votre site : `https://app.humancatalystbeacon.com/pricing`
2. Cliquez sur "Subscribe" pour un plan
3. Utilisez la carte de test Stripe : `4242 4242 4242 4242`
4. Complétez le paiement
5. Vérifiez les logs dans Supabase Dashboard

### **Étape 5 : Vérifier les Logs**

1. **Dans Supabase Dashboard** :
   - Allez dans **Edge Functions** → **stripe-webhook** → **Logs**
   - Vous devriez voir des logs comme :
     ```
     📥 Webhook event received: checkout.session.completed
     🔄 Processing checkout.session.completed: {...}
     ✅ Profile updated successfully
     ```

2. **Dans Stripe Dashboard** :
   - Allez dans **Developers** → **Webhooks** → Votre webhook
   - Cliquez sur "Recent deliveries"
   - Vérifiez que les événements sont envoyés avec succès (statut 200)

## 🔍 **Dépannage**

### **Problème : Le webhook ne reçoit pas d'événements**

1. ✅ Vérifiez que l'URL du webhook dans Stripe est correcte
2. ✅ Vérifiez que les événements sont bien sélectionnés dans Stripe
3. ✅ Vérifiez les logs dans Stripe Dashboard → Webhooks → Recent deliveries

### **Problème : Erreur 400 "Missing signature or webhook secret"**

1. ✅ Vérifiez que `STRIPE_WEBHOOK_SECRET` est bien configuré dans Supabase Edge Function secrets
2. ✅ Vérifiez que le secret correspond bien à celui du webhook dans Stripe Dashboard

### **Problème : Erreur 500 dans les logs**

1. ✅ Vérifiez que tous les secrets sont configurés :
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. ✅ Vérifiez les logs détaillés dans Supabase Dashboard

### **Problème : Le rôle n'est pas mis à jour**

1. ✅ Vérifiez les logs de la Edge Function pour voir si elle reçoit l'événement
2. ✅ Vérifiez que `session.metadata.userId` est bien présent dans le checkout session
3. ✅ Vérifiez que la fonction `sync_single_subscription_from_stripe` existe dans votre base de données

## 📋 **Checklist de Configuration**

- [ ] Edge Function `stripe-webhook` déployée
- [ ] Secret `STRIPE_SECRET_KEY` configuré dans Supabase
- [ ] Secret `STRIPE_WEBHOOK_SECRET` configuré dans Supabase
- [ ] Secret `SUPABASE_URL` configuré dans Supabase
- [ ] Secret `SUPABASE_SERVICE_ROLE_KEY` configuré dans Supabase
- [ ] Webhook créé dans Stripe Dashboard
- [ ] URL du webhook correcte (pointant vers Supabase Edge Function)
- [ ] Événements sélectionnés dans Stripe (au minimum `checkout.session.completed`)
- [ ] Webhook testé avec un paiement de test
- [ ] Logs vérifiés dans Supabase Dashboard

## 🎯 **Comment ça fonctionne**

1. **Utilisateur complète un paiement** → Stripe envoie un webhook
2. **Webhook arrive dans Supabase Edge Function** (`stripe-webhook`)
3. **La fonction vérifie la signature** (sécurité)
4. **La fonction met à jour automatiquement** :
   - Le rôle dans `profiles.role` (Student ou Teacher)
   - Le statut dans `profiles.subscription_status` (active)
   - L'ID de souscription dans `profiles.subscription_id`
   - La table `subscriptions` avec les détails complets

**Résultat** : L'utilisateur voit immédiatement son nouveau rôle après le paiement ! 🎉
