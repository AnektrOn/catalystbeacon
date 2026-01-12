# 🚀 N8N Cloud - Quick Start Guide

## ⚡ Setup Rapide (15 minutes)

### 1. Créer le Webhook dans N8N Cloud

1. **Connectez-vous** à votre instance N8N Cloud
2. **Créez un nouveau workflow** : "Email Notification System"
3. **Ajoutez un Webhook Node** :
   - HTTP Method: `POST`
   - Path: `send-email`
   - Response Mode: `Respond to Webhook`
4. **Activez le workflow** (toggle en haut)
5. **Copiez l'URL du webhook** (ex: `https://your-instance.n8n.cloud/webhook/send-email`)

### 2. Configurer SMTP

1. Dans N8N : Settings → Credentials → Add → SMTP
2. Configurez avec vos paramètres SMTP :
   - **Host**: `smtp.gmail.com` (ou votre serveur SMTP)
   - **Port**: `587` (TLS) ou `465` (SSL)
   - **Secure**: `false` (587) ou `true` (465)
   - **User**: Votre email professionnel
   - **Password**: Votre mot de passe (ou App Password pour Gmail)
3. Testez la connexion

**Note Gmail** : Utilisez une "App Password" (pas votre mot de passe normal)
- Google Account → Security → 2-Step Verification → App Passwords

### 3. Ajouter l'URL dans votre .env

```bash
N8N_WEBHOOK_URL=https://your-instance.n8n.cloud/webhook/send-email
```

### 4. Créer le Workflow de Base

**Structure minimale** :
```
Webhook → Switch (emailType) → Template → SendGrid → Response
```

**Switch Node Configuration** :
- Mode: Rules
- Value: `{{ $json.emailType }}`
- Rules:
  - `equals` → `sign-up`
  - `equals` → `subscription-purchased`
  - `equals` → `level-up`
  - `equals` → `lesson-completed`
  - `equals` → `achievement-unlocked`
  - `equals` → `subscription-cancelled`
  - `equals` → `role-change`

**Pour chaque route, ajoutez** :
1. **Function Node** (template) - Copiez depuis `n8n-email-templates.js`
2. **SMTP Node** (Email Send (SMTP)) :
   - Credential: Votre credential SMTP
   - From: `noreply@humancatalystbeacon.com`
   - To: `{{ $json.to }}`
   - Subject: `{{ $json.subject }}`
   - Email Type: HTML
   - Message: `{{ $json.html }}`

### 5. Tester

Dans N8N, cliquez sur "Execute Workflow" et testez avec :

```json
{
  "emailType": "sign-up",
  "email": "test@example.com",
  "userName": "Test User"
}
```

---

## 📋 Checklist

- [ ] Webhook créé et activé
- [ ] URL ajoutée dans `.env` comme `N8N_WEBHOOK_URL`
- [ ] SMTP configuré dans N8N
- [ ] Switch Node configuré avec toutes les routes
- [ ] Templates ajoutés (au moins sign-up et level-up)
- [ ] SMTP node configuré
- [ ] Workflow testé manuellement
- [ ] `server.js` utilise `sendEmailViaN8N()` (déjà fait ✅)

---

## 🎯 Prochaines Étapes

1. **Ajouter tous les templates** depuis `n8n-email-templates.js`
2. **Tester chaque type d'email**
3. **Configurer les Database Triggers** (optionnel, pour automatisation)
4. **Monitorer** les exécutions dans N8N

---

## 🐛 Problèmes Courants

**Le webhook ne répond pas** :
- Vérifiez que le workflow est **activé**
- Vérifiez l'URL dans `.env`

**Les emails ne partent pas** :
- Vérifiez les credentials SMTP (host, port, user, password)
- Pour Gmail, utilisez une App Password (pas le mot de passe normal)
- Vérifiez les logs dans N8N (Executions) pour les erreurs détaillées
- Vérifiez les limites de votre serveur SMTP

**Erreur 404** :
- Vérifiez le path du webhook (`/webhook/send-email`)

---

## 📚 Ressources

- **Templates complets** : `n8n-email-templates.js`
- **Guide détaillé** : `N8N_CLOUD_SETUP_GUIDE.md`
- **Liste des triggers** : `N8N_EMAIL_TRIGGERS_LIST.md`
