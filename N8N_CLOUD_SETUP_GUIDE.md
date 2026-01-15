# 🚀 Guide d'Intégration N8N Cloud

## 📋 Prérequis

- ✅ N8N Cloud (version payante) - Déjà configuré
- ✅ Compte SendGrid (ou autre service SMTP)
- ✅ Accès à votre instance N8N Cloud

---

## 🔧 Étape 1 : Créer le Webhook dans N8N Cloud

### 1.1 Créer un Nouveau Workflow

1. Connectez-vous à votre instance N8N Cloud
2. Cliquez sur **"Workflows"** → **"Add Workflow"**
3. Nommez-le : **"Email Notification System"**

### 1.2 Ajouter le Webhook Trigger

1. Cliquez sur **"Add Node"**
2. Recherchez **"Webhook"**
3. Sélectionnez **"Webhook"** (pas "Wait for Webhook")
4. Configurez :
   - **HTTP Method**: `POST`
   - **Path**: `send-email`
   - **Response Mode**: `Respond to Webhook`
   - **Response Code**: `200`

5. **Activez le workflow** (toggle en haut à droite)
6. **Copiez l'URL du webhook** (ex: `https://your-instance.n8n.cloud/webhook/send-email`)

### 1.3 Ajouter l'URL dans les Variables d'Environnement

Dans votre fichier `.env` ou `server.env`, ajoutez :

```bash
N8N_WEBHOOK_URL=https://your-instance.n8n.cloud/webhook/send-email
```

---

## 📧 Étape 2 : Configurer SMTP dans N8N

### 2.1 Ajouter les Credentials SMTP

1. Dans N8N, allez dans **Settings** → **Credentials**
2. Cliquez sur **"Add Credential"**
3. Recherchez **"SMTP"** ou **"Email Send (SMTP)"**
4. Configurez avec vos paramètres SMTP :

**Configuration Standard** :
- **Host**: `smtp.gmail.com` (ou votre serveur SMTP)
- **Port**: `587` (TLS) ou `465` (SSL)
- **Secure**: 
  - `true` pour port 465 (SSL)
  - `false` pour port 587 (TLS/STARTTLS)
- **User**: Votre adresse email professionnelle
- **Password**: Votre mot de passe (ou App Password pour Gmail)
- **From Email**: `noreply@humancatalystbeacon.com`
- **From Name**: `The Human Catalyst Beacon`

**Note Gmail** : Vous devez créer une "App Password" :
1. Allez dans votre compte Google → Security
2. Activez "2-Step Verification" si pas déjà fait
3. Créez une "App Password" pour "Mail"
4. Utilisez cette App Password (16 caractères) au lieu de votre mot de passe normal

### 2.2 Tester la Connexion

1. Cliquez sur **"Test"** dans N8N
2. Si ça fonctionne, vous verrez "Connection successful"
3. Nommez-la : **"SMTP Email"**

**Voir le guide complet** : `N8N_SMTP_SETUP.md` pour plus de détails

---

## 🎨 Étape 3 : Créer le Workflow Complet

### 3.1 Structure du Workflow

```
Webhook → Switch (emailType) → Templates → SendGrid → Log → Response
```

### 3.2 Ajouter le Switch Node

1. Après le Webhook, ajoutez un **Switch Node**
2. Configurez-le pour router selon `emailType` :
   - **Mode**: Rules
   - **Value**: `{{ $json.emailType }}`
   - **Rules**:
     - `equals` → `sign-up` → Output 1
     - `equals` → `subscription-purchased` → Output 2
     - `equals` → `subscription-cancelled` → Output 3
     - `equals` → `level-up` → Output 4
     - `equals` → `lesson-completed` → Output 5
     - `equals` → `course-completed` → Output 6
     - `equals` → `achievement-unlocked` → Output 7
     - `equals` → `role-change` → Output 8
     - `equals` → `renewal-reminder` → Output 9
     - `equals` → `payment-failed` → Output 10
     - Default → Output 11 (generic template)

### 3.3 Créer les Templates (Function Nodes)

Pour chaque type d'email, créez un **Function Node** qui génère le HTML.

**Exemple pour "Sign Up"** :

```javascript
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst Beacon';

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${siteName}!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to ${siteName}!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${emailData.userName || 'there'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for joining ${siteName}! We're thrilled to have you on board.</p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="${siteUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
    </div>
  </div>
</body>
</html>
`;

return {
  json: {
    to: emailData.email,
    subject: `🎉 Welcome to ${siteName}!`,
    html: html
  }
};
```

### 3.4 Ajouter le Node SMTP

1. Après chaque template, ajoutez un **"Email Send (SMTP)"** Node
2. Configurez :
   - **Credential**: "SMTP Email" (créé à l'étape 2.2)
   - **From Email**: `{{ $env.FROM_EMAIL || 'noreply@humancatalystbeacon.com' }}`
   - **From Name**: `{{ $env.FROM_NAME || 'The Human Catalyst Beacon' }}`
   - **To Email**: `{{ $json.to }}`
   - **Subject**: `{{ $json.subject }}`
   - **Email Type**: HTML
   - **Message**: `{{ $json.html }}`

### 3.5 Ajouter le Log (Optionnel mais Recommandé)

1. Après SendGrid, ajoutez un **Supabase Node** (ou HTTP Request)
2. Pour logger dans Supabase :
   - **Operation**: Insert
   - **Table**: `email_logs`
   - **Data**:
     ```json
     {
       "email_type": "{{ $('Webhook').item.json.emailType }}",
       "recipient_email": "{{ $('Webhook').item.json.email }}",
       "subject": "{{ $json.subject }}",
       "status": "sent",
       "sent_at": "{{ $now }}"
     }
     ```

### 3.6 Ajouter la Réponse

1. À la fin, ajoutez un **Respond to Webhook Node**
2. Configurez :
   - **Respond With**: JSON
   - **Response Body**:
     ```json
     {
       "success": true,
       "messageId": "{{ $json.message_id || 'sent' }}"
     }
     ```

---

## 🔄 Étape 4 : Modifier server.js

Le code a déjà été modifié pour utiliser `sendEmailViaN8N()` au lieu de `sendEmailViaSupabase()`.

Assurez-vous d'avoir dans votre `.env` :

```bash
N8N_WEBHOOK_URL=https://your-instance.n8n.cloud/webhook/send-email
```

---

## 🧪 Étape 5 : Tester le Workflow

### 5.1 Test Manuel dans N8N

1. Dans N8N, cliquez sur **"Execute Workflow"**
2. Entrez des données de test :
   ```json
   {
     "emailType": "sign-up",
     "email": "test@example.com",
     "userName": "Test User"
   }
   ```
3. Vérifiez que l'email est envoyé

### 5.2 Test depuis server.js

Créez un endpoint de test :

```javascript
app.post('/api/test-email', async (req, res) => {
  const result = await sendEmailViaN8N('sign-up', {
    email: 'test@example.com',
    userName: 'Test User'
  });
  res.json(result);
});
```

### 5.3 Vérifier les Emails

- Vérifiez votre boîte de réception
- Vérifiez les spams si l'email n'arrive pas
- Vérifiez les logs dans N8N (Executions) pour voir les erreurs

---

## 📝 Étape 6 : Templates Complets

Tous les templates sont disponibles dans le fichier séparé `n8n-email-templates.js` que je vais créer.

---

## ✅ Checklist de Déploiement

- [ ] Webhook N8N créé et activé
- [ ] URL du webhook ajoutée dans `.env`
- [ ] SendGrid configuré dans N8N
- [ ] Workflow créé avec tous les routes
- [ ] Templates ajoutés pour chaque type d'email
- [ ] SendGrid node configuré
- [ ] Logging configuré (optionnel)
- [ ] Workflow testé manuellement
- [ ] `server.js` modifié pour utiliser N8N
- [ ] Test depuis l'application
- [ ] Monitoring activé dans N8N

---

## 🐛 Dépannage

### Le webhook ne répond pas
- Vérifiez que le workflow est **activé**
- Vérifiez l'URL du webhook
- Vérifiez les logs dans N8N (Executions)

### Les emails ne sont pas envoyés
- Vérifiez les credentials SMTP (host, port, user, password)
- Vérifiez que vous utilisez une App Password pour Gmail
- Vérifiez les logs dans N8N (Executions) pour voir les erreurs détaillées
- Vérifiez les limites de votre serveur SMTP (nombre d'emails/jour)
- Vérifiez que le format HTML est correct

### Erreur 404 sur le webhook
- Vérifiez que le path est correct (`/webhook/send-email`)
- Vérifiez que le workflow est activé

---

## 📊 Monitoring

Dans N8N Cloud, vous pouvez :
- Voir toutes les exécutions dans **"Executions"**
- Voir les logs détaillés de chaque workflow
- Configurer des alertes en cas d'échec

---

## 🎯 Prochaines Étapes

1. Créer tous les templates d'email
2. Configurer les Database Triggers Supabase
3. Tester chaque type d'email
4. Monitorer pendant quelques jours
5. Supprimer l'ancien code Supabase une fois validé
