# ✅ Checklist de Déploiement Final - Production

## 📋 État Actuel
- ✅ Audit de production terminé
- ✅ CORS configuré pour app.humancatalystbeacon.com
- ✅ Scripts de configuration créés
- ✅ Guide webhook Stripe créé

## 🚀 Prochaines Étapes

### ÉTAPE 1 : Configurer les Variables d'Environnement

#### 1.1 Créer le fichier .env (Frontend)
```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
nano .env
```

Ajoutez ces lignes (remplacez par vos vraies valeurs) :
```
REACT_APP_SUPABASE_URL=https://votre-projet.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
REACT_APP_STRIPE_STUDENT_MONTHLY_PRICE_ID=price_...
REACT_APP_STRIPE_STUDENT_YEARLY_PRICE_ID=price_...
REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID=price_...
REACT_APP_STRIPE_TEACHER_YEARLY_PRICE_ID=price_...
REACT_APP_API_URL=https://app.humancatalystbeacon.com
```

**OU** utilisez le template :
```bash
# Créer le template
cat > .env << 'EOF'
REACT_APP_SUPABASE_URL=VOTRE_SUPABASE_URL_ICI
REACT_APP_SUPABASE_ANON_KEY=VOTRE_SUPABASE_ANON_KEY_ICI
REACT_APP_STRIPE_PUBLISHABLE_KEY=VOTRE_STRIPE_PUBLISHABLE_KEY_ICI
REACT_APP_STRIPE_STUDENT_MONTHLY_PRICE_ID=VOTRE_STUDENT_MONTHLY_PRICE_ID_ICI
REACT_APP_STRIPE_STUDENT_YEARLY_PRICE_ID=VOTRE_STUDENT_YEARLY_PRICE_ID_ICI
REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID=VOTRE_TEACHER_MONTHLY_PRICE_ID_ICI
REACT_APP_STRIPE_TEACHER_YEARLY_PRICE_ID=VOTRE_TEACHER_YEARLY_PRICE_ID_ICI
REACT_APP_API_URL=https://app.humancatalystbeacon.com
EOF

# Puis éditez avec nano
nano .env
```

#### 1.2 Créer le fichier server.env (Backend)
```bash
nano server.env
```

Ajoutez ces lignes :
```
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STUDENT_MONTHLY_PRICE_ID=price_...
STRIPE_STUDENT_YEARLY_PRICE_ID=price_...
STRIPE_TEACHER_MONTHLY_PRICE_ID=price_...
STRIPE_TEACHER_YEARLY_PRICE_ID=price_...
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://app.humancatalystbeacon.com,https://humancatalystbeacon.com
N8N_WEBHOOK_URL=https://votre-n8n.webhook.url (optionnel)
SITE_URL=https://app.humancatalystbeacon.com
FROM_EMAIL=noreply@humancatalystbeacon.com
```

### ÉTAPE 2 : Configurer le Webhook Stripe

1. **Allez dans Stripe Dashboard** : https://dashboard.stripe.com
2. **Developers → Webhooks → Add endpoint**
3. **URL** : `https://app.humancatalystbeacon.com/api/webhook`
4. **Sélectionnez les événements** :
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   - invoice.upcoming
5. **Copiez le Signing Secret** (whsec_...)
6. **Ajoutez-le dans server.env** :
   ```bash
   nano server.env
   # Ajoutez: STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### ÉTAPE 3 : Build de Production

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# Installer les dépendances
npm install --legacy-peer-deps

# Build
npm run build

# Vérifier que le build a réussi
ls -la build/index.html
```

### ÉTAPE 4 : Déployer le Build

```bash
# Copier les fichiers buildés vers le répertoire racine
cp -r build/* .

# Configurer les permissions
chmod -R 755 .
find . -type f -exec chmod 644 {} \;

# Créer/verifier .htaccess pour React Router
cat > .htaccess << 'EOF'
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF
```

### ÉTAPE 5 : Démarrer/Redémarrer le Serveur Backend

```bash
# Redémarrer PM2 avec les nouvelles variables d'environnement
pm2 restart hcuniversity-app --update-env

# OU si le processus n'existe pas encore
pm2 start server.js --name hcuniversity-app --update-env

# Sauvegarder la configuration PM2
pm2 save

# Vérifier que le serveur tourne
pm2 list
pm2 logs hcuniversity-app
```

### ÉTAPE 6 : Vérifications Finales

#### 6.1 Vérifier le serveur backend
```bash
# Test de santé
curl https://app.humancatalystbeacon.com/health

# Devrait retourner du JSON avec status: "ok"
```

#### 6.2 Vérifier le frontend
- Ouvrez https://app.humancatalystbeacon.com dans votre navigateur
- Vérifiez que la page se charge
- Testez la navigation (React Router)

#### 6.3 Vérifier le webhook Stripe
- Dans Stripe Dashboard → Votre webhook → "Send test webhook"
- Vérifiez les logs : `pm2 logs hcuniversity-app`
- Vous devriez voir des logs de traitement du webhook

#### 6.4 Test de paiement (optionnel)
- Testez un paiement avec une carte de test Stripe
- Vérifiez que l'utilisateur est bien mis à jour dans Supabase

## 🔍 Commandes de Vérification Rapide

```bash
# Vérifier les fichiers d'environnement
cat .env | grep REACT_APP_SUPABASE_URL
cat server.env | grep SUPABASE_URL

# Vérifier PM2
pm2 list
pm2 logs hcuniversity-app --lines 20

# Vérifier le build
ls -la build/static/js/*.js | head -5

# Tester l'API
curl https://app.humancatalystbeacon.com/health
```

## ⚠️ Problèmes Courants

### Le build échoue
```bash
# Nettoyer et réessayer
rm -rf build node_modules/.cache
npm install --legacy-peer-deps
npm run build
```

### Le serveur ne démarre pas
```bash
# Vérifier les logs
pm2 logs hcuniversity-app --err

# Vérifier que server.env existe et est correct
cat server.env

# Redémarrer avec logs détaillés
pm2 restart hcuniversity-app --update-env
pm2 logs hcuniversity-app
```

### Les variables d'environnement ne sont pas chargées
```bash
# Vérifier que les fichiers existent
ls -la .env server.env

# Redémarrer PM2 avec --update-env
pm2 restart hcuniversity-app --update-env

# Vérifier dans les logs que les variables sont chargées
pm2 logs hcuniversity-app | grep "STRIPE_SECRET_KEY"
```

## 📝 Checklist Finale

- [ ] Fichier `.env` créé avec toutes les variables frontend
- [ ] Fichier `server.env` créé avec toutes les variables backend
- [ ] Webhook Stripe configuré dans Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans `server.env`
- [ ] Build de production réussi (`npm run build`)
- [ ] Fichiers build copiés vers le répertoire racine
- [ ] `.htaccess` créé pour React Router
- [ ] PM2 redémarré avec `--update-env`
- [ ] Serveur backend accessible (`/health` retourne OK)
- [ ] Frontend accessible (https://app.humancatalystbeacon.com)
- [ ] Webhook Stripe testé et fonctionnel
- [ ] Test de paiement effectué (optionnel)

## 🎉 Une fois tout terminé

Votre application est en production ! Vous pouvez :
- Partager l'URL : https://app.humancatalystbeacon.com
- Monitorer les logs : `pm2 logs hcuniversity-app`
- Surveiller les webhooks dans Stripe Dashboard
