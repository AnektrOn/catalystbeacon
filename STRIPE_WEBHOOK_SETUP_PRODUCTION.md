# Configuration Webhook Stripe en Production

## 📋 Vue d'ensemble

Votre application utilise un serveur Node.js (`server.js`) qui écoute les webhooks Stripe. Le webhook doit pointer vers votre serveur de production.

## 🔗 URL du Webhook

Votre endpoint webhook sera :
```
https://app.humancatalystbeacon.com/api/webhook
```

## 📝 Étapes de Configuration

### Étape 1 : Créer le Webhook dans Stripe Dashboard

1. **Connectez-vous à Stripe Dashboard**
   - Allez sur https://dashboard.stripe.com
   - Assurez-vous d'être en mode **Production** (pas Test mode)

2. **Accédez aux Webhooks**
   - Menu de gauche → **Developers** → **Webhooks**
   - Cliquez sur **"Add endpoint"**

3. **Configurez l'endpoint**
   - **Endpoint URL** : `https://app.humancatalystbeacon.com/api/webhook`
   - **Description** : `HC University Production Webhook`
   - Cliquez sur **"Add endpoint"**

4. **Sélectionnez les événements à écouter**
   
   Votre serveur écoute ces événements (voir `server.js` ligne 890-920) :
   
   ✅ **checkout.session.completed**
   ✅ **customer.subscription.created**
   ✅ **customer.subscription.updated**
   ✅ **customer.subscription.deleted**
   ✅ **invoice.payment_succeeded**
   ✅ **invoice.payment_failed**
   ✅ **invoice.upcoming**
   
   Sélectionnez ces événements et cliquez sur **"Add events"**

5. **Récupérez le Signing Secret**
   - Une fois le webhook créé, cliquez dessus
   - Dans la section **"Signing secret"**, cliquez sur **"Reveal"**
   - **Copiez le secret** (commence par `whsec_...`)
   - ⚠️ **IMPORTANT** : Gardez ce secret précieusement, vous en aurez besoin pour `server.env`

### Étape 2 : Configurer le Secret dans server.env

Ajoutez le secret webhook dans votre fichier `server.env` :

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
nano server.env
```

Ajoutez ou modifiez cette ligne :
```
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
```

Sauvegardez (Ctrl+X, puis Y, puis Entrée)

### Étape 3 : Redémarrer le serveur PM2

```bash
pm2 restart hcuniversity-app --update-env
pm2 save
```

### Étape 4 : Tester le Webhook

1. **Dans Stripe Dashboard**
   - Allez sur votre webhook
   - Cliquez sur **"Send test webhook"**
   - Sélectionnez un événement (ex: `checkout.session.completed`)
   - Cliquez sur **"Send test webhook"**

2. **Vérifier les logs**
   ```bash
   pm2 logs hcuniversity-app --lines 50
   ```
   
   Vous devriez voir des logs comme :
   ```
   === WEBHOOK: checkout.session.completed ===
   Session ID: cs_test_...
   ```

## 🔍 Vérification

### Vérifier que le webhook fonctionne

1. **Testez un paiement réel** (ou utilisez un test card)
2. **Vérifiez les logs PM2** :
   ```bash
   pm2 logs hcuniversity-app
   ```
3. **Vérifiez dans Stripe Dashboard** :
   - Webhooks → Votre endpoint
   - Section "Recent deliveries"
   - Vous devriez voir les requêtes avec statut **200 OK**

## ⚠️ Problèmes Courants

### Le webhook retourne 401 ou 400

**Cause** : Le `STRIPE_WEBHOOK_SECRET` n'est pas correct ou n'est pas chargé.

**Solution** :
1. Vérifiez que `STRIPE_WEBHOOK_SECRET` est bien dans `server.env`
2. Redémarrez PM2 : `pm2 restart hcuniversity-app --update-env`
3. Vérifiez les logs : `pm2 logs hcuniversity-app`

### Le webhook ne reçoit pas les événements

**Cause** : L'URL du webhook n'est pas accessible ou le serveur n'écoute pas.

**Solution** :
1. Vérifiez que votre serveur est en cours d'exécution : `pm2 list`
2. Testez l'endpoint manuellement :
   ```bash
   curl https://app.humancatalystbeacon.com/api/webhook
   ```
   (Devrait retourner une erreur 400, ce qui est normal - cela signifie que l'endpoint existe)

### Les événements ne sont pas traités

**Cause** : Les événements ne sont pas sélectionnés dans Stripe Dashboard.

**Solution** :
1. Allez dans Stripe Dashboard → Webhooks → Votre endpoint
2. Cliquez sur **"..."** → **"Update details"**
3. Vérifiez que tous les événements nécessaires sont sélectionnés

## 📊 Événements Gérés par Votre Serveur

Votre `server.js` gère ces événements :

| Événement | Fonction | Action |
|-----------|----------|--------|
| `checkout.session.completed` | `handleCheckoutSessionCompleted` | Met à jour le profil utilisateur, crée l'abonnement |
| `customer.subscription.created` | `handleSubscriptionCreated` | Active l'abonnement |
| `customer.subscription.updated` | `handleSubscriptionUpdate` | Met à jour le statut de l'abonnement |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | Rétrograde l'utilisateur à "Free" |
| `invoice.payment_succeeded` | `handleInvoicePaymentSucceeded` | Confirme le paiement |
| `invoice.payment_failed` | `handleInvoicePaymentFailed` | Marque l'abonnement comme "past_due" |
| `invoice.upcoming` | `handleInvoiceUpcoming` | Envoie un rappel de renouvellement |

## 🔐 Sécurité

- ✅ Le webhook vérifie la signature Stripe (ligne 883 dans `server.js`)
- ✅ Utilise `STRIPE_WEBHOOK_SECRET` pour valider les requêtes
- ✅ Rejette les requêtes non signées (retourne 400)

## 📝 Checklist de Déploiement

- [ ] Webhook créé dans Stripe Dashboard (mode Production)
- [ ] URL configurée : `https://app.humancatalystbeacon.com/api/webhook`
- [ ] Tous les événements nécessaires sélectionnés
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans `server.env`
- [ ] PM2 redémarré avec `--update-env`
- [ ] Webhook testé avec "Send test webhook"
- [ ] Logs vérifiés : `pm2 logs hcuniversity-app`
- [ ] Test de paiement réel effectué

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs PM2 : `pm2 logs hcuniversity-app --lines 100`
2. Vérifiez les logs Stripe Dashboard → Webhooks → Votre endpoint → "Recent deliveries"
3. Vérifiez que `server.env` contient bien `STRIPE_WEBHOOK_SECRET`
