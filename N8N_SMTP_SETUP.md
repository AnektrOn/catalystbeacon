# 📧 Configuration SMTP dans N8N Cloud

## 🔧 Étape 1 : Configurer les Credentials SMTP dans N8N

### 1.1 Ajouter les Credentials SMTP

1. Dans N8N Cloud, allez dans **Settings** → **Credentials**
2. Cliquez sur **"Add Credential"**
3. Recherchez **"SMTP"** ou **"Email Send (SMTP)"**
4. Configurez avec vos paramètres SMTP :

**Configuration Standard (Gmail, Outlook, etc.)** :
- **Host**: `smtp.gmail.com` (ou votre serveur SMTP)
- **Port**: `587` (TLS) ou `465` (SSL)
- **Secure**: 
  - `true` pour port 465 (SSL)
  - `false` pour port 587 (TLS/STARTTLS)
- **User**: Votre adresse email professionnelle
- **Password**: Votre mot de passe (ou App Password pour Gmail)
- **From Email**: `noreply@humancatalystbeacon.com` (ou votre email)
- **From Name**: `The Human Catalyst University`

**Exemples de Configuration** :

#### Gmail/Google Workspace
```
Host: smtp.gmail.com
Port: 587
Secure: false (TLS)
User: votre-email@votre-domaine.com
Password: [App Password - voir ci-dessous]
```

**Note Gmail** : Vous devez créer une "App Password" :
1. Allez dans votre compte Google → Security
2. Activez "2-Step Verification" si pas déjà fait
3. Créez une "App Password" pour "Mail"
4. Utilisez cette App Password (16 caractères) au lieu de votre mot de passe normal

#### Outlook/Office 365
```
Host: smtp.office365.com
Port: 587
Secure: false (TLS)
User: votre-email@votre-domaine.com
Password: votre-mot-de-passe
```

#### Serveur SMTP Personnalisé
```
Host: smtp.votre-domaine.com (ou IP)
Port: 587 ou 465
Secure: false (587) ou true (465)
User: votre-email@votre-domaine.com
Password: votre-mot-de-passe
```

### 1.2 Tester la Connexion

1. Cliquez sur **"Test"** dans N8N
2. Si ça fonctionne, vous verrez "Connection successful"
3. Si ça échoue, vérifiez :
   - Les paramètres (host, port, secure)
   - Le mot de passe (App Password pour Gmail)
   - Les restrictions de firewall
   - Les limitations de votre serveur SMTP

---

## 🔄 Étape 2 : Modifier le Workflow N8N

### 2.1 Remplacer SendGrid par SMTP Node

Au lieu d'utiliser le **SendGrid Node**, utilisez le **SMTP Node** :

1. **Supprimez** le SendGrid Node (si déjà ajouté)
2. **Ajoutez** un **"Email Send (SMTP)"** Node
3. Configurez :
   - **Credential**: Sélectionnez votre credential SMTP créé à l'étape 1
   - **From Email**: `{{ $env.FROM_EMAIL || 'noreply@humancatalystbeacon.com' }}`
   - **From Name**: `{{ $env.FROM_NAME || 'The Human Catalyst University' }}`
   - **To Email**: `{{ $json.to }}`
   - **Subject**: `{{ $json.subject }}`
   - **Email Type**: `HTML`
   - **Message**: `{{ $json.html }}`

### 2.2 Configuration Alternative avec HTTP Request

Si le node SMTP natif ne fonctionne pas bien, vous pouvez utiliser un **HTTP Request Node** avec votre API SMTP (si disponible) ou utiliser Nodemailer via un webhook.

---

## 📝 Étape 3 : Variables d'Environnement (Optionnel)

Dans N8N Cloud, vous pouvez ajouter des variables d'environnement :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez :
   - `FROM_EMAIL`: `noreply@humancatalystbeacon.com`
   - `FROM_NAME`: `The Human Catalyst University`
   - `SITE_URL`: `https://humancatalystbeacon.com`
   - `SITE_NAME`: `The Human Catalyst University`

Ces variables seront accessibles dans les templates via `$env.FROM_EMAIL`

---

## 🧪 Étape 4 : Tester

### 4.1 Test Simple

1. Dans votre workflow N8N, ajoutez un **Function Node** de test :
```javascript
return {
  json: {
    to: 'votre-email@test.com',
    subject: 'Test SMTP',
    html: '<h1>Test Email</h1><p>Si vous recevez ceci, SMTP fonctionne!</p>'
  }
};
```

2. Connectez-le au **SMTP Node**
3. Exécutez le workflow
4. Vérifiez votre boîte de réception

### 4.2 Test avec Données Réelles

Testez avec le webhook depuis votre application :

```bash
curl -X POST https://your-instance.n8n.cloud/webhook/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "sign-up",
    "email": "votre-email@test.com",
    "userName": "Test User"
  }'
```

---

## 🔒 Sécurité et Bonnes Pratiques

### 1. Utiliser App Password (Gmail)
- Ne jamais utiliser votre mot de passe principal
- Créer une App Password spécifique pour N8N
- Stocker de manière sécurisée

### 2. Limiter les Permissions
- Si possible, créer un compte email dédié pour les notifications
- Ex: `notifications@votre-domaine.com`

### 3. Rate Limiting
- Vérifiez les limites de votre serveur SMTP
- Gmail : 500 emails/jour (gratuit) ou 2000/jour (Workspace)
- Outlook : 300 emails/jour (gratuit) ou illimité (Office 365)

### 4. SPF/DKIM Records
- Configurez les enregistrements SPF et DKIM pour votre domaine
- Améliore la délivrabilité des emails
- Évite que vos emails soient marqués comme spam

---

## 🐛 Dépannage

### Erreur "Authentication failed"
- Vérifiez le username/password
- Pour Gmail, utilisez une App Password
- Vérifiez que "Less secure app access" est activé (si nécessaire)

### Erreur "Connection timeout"
- Vérifiez le host et le port
- Vérifiez les restrictions de firewall
- Essayez un autre port (587 vs 465)

### Emails marqués comme spam
- Configurez SPF/DKIM
- Utilisez un domaine vérifié
- Évitez les mots déclencheurs de spam
- Ajoutez un lien de désinscription

### Erreur "Too many emails"
- Vous avez atteint la limite de votre serveur SMTP
- Attendez ou upgradez votre plan
- Implémentez un rate limiter dans N8N

---

## 📊 Comparaison SMTP vs SendGrid

| Critère | SMTP Personnel | SendGrid |
|---------|----------------|----------|
| **Coût** | Gratuit (avec limites) | Gratuit (100/jour) ou Payant |
| **Configuration** | Plus complexe | Plus simple |
| **Limites** | Variables (Gmail: 500/jour) | 100/jour gratuit |
| **Délivrabilité** | Dépend de votre config | Excellente |
| **Analytics** | Limité | Complet |
| **Contrôle** | Total | Partiel |

---

## ✅ Checklist

- [ ] Credentials SMTP créés dans N8N
- [ ] Connexion testée avec succès
- [ ] SMTP Node ajouté au workflow
- [ ] Configuration testée (from, to, subject, html)
- [ ] Email de test reçu
- [ ] Variables d'environnement configurées (optionnel)
- [ ] SPF/DKIM configurés (recommandé)
- [ ] Workflow testé avec données réelles

---

## 🎯 Prochaines Étapes

1. ✅ Configurer SMTP dans N8N
2. ✅ Remplacer SendGrid par SMTP Node
3. ✅ Tester avec un email réel
4. ✅ Configurer les templates
5. ✅ Monitorer les envois

Une fois que tout fonctionne, vous pouvez supprimer la configuration SendGrid si elle existe.
