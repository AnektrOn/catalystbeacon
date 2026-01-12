# Guide d'Installation et Configuration N8N

## 🚀 Installation Rapide avec Docker

### 1. Créer docker-compose.yml

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Europe/Paris
      - N8N_ENCRYPTION_KEY=your_encryption_key_here
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n_network

volumes:
  n8n_data:

networks:
  n8n_network:
    driver: bridge
```

### 2. Lancer N8N

```bash
docker-compose up -d
```

### 3. Accéder à N8N

Ouvrir http://localhost:5678 et se connecter avec :
- Username: `admin`
- Password: `your_secure_password`

## 📧 Configuration du Workflow Email

### Workflow : "Send Role Change Email"

#### 1. Webhook Trigger

- **Node Type**: Webhook
- **HTTP Method**: POST
- **Path**: `send-email`
- **Response Mode**: Respond to Webhook

**Configuration** :
```json
{
  "httpMethod": "POST",
  "path": "send-email",
  "responseMode": "responseNode"
}
```

#### 2. Switch Node (Router par emailType)

- **Node Type**: Switch
- **Mode**: Rules
- **Rules**:
  - `emailType = "role-change"` → Route vers "Role Change Template"
  - `emailType = "subscription-cancelled"` → Route vers "Cancellation Template"
  - `emailType = "payment"` → Route vers "Payment Template"
  - Default → Route vers "Generic Template"

#### 3. Function Node (Template HTML)

**Pour "role-change"** :

```javascript
const emailData = $input.item.json;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Role Updated</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔄 Role Updated</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${emailData.userName || 'there'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Your account role has been updated.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Previous Role:</strong> ${emailData.oldRole}</p>
      <p style="margin: 10px 0;"><strong>New Role:</strong> <span style="color: #667eea; font-weight: bold;">${emailData.newRole}</span></p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">You now have access to all ${emailData.newRole} features. Enjoy your enhanced experience!</p>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.SITE_URL || 'https://humancatalystbeacon.com'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
    </div>
  </div>
</body>
</html>
`;

return {
  json: {
    to: emailData.email,
    subject: '🔄 Your Account Role Has Been Updated',
    html: html,
    emailType: emailData.emailType
  }
};
```

#### 4. SMTP Node (SendGrid)

- **Node Type**: SendGrid (ou SMTP générique)
- **From Email**: `noreply@humancatalystbeacon.com`
- **From Name**: `The Human Catalyst University`
- **To**: `{{ $json.to }}`
- **Subject**: `{{ $json.subject }}`
- **HTML**: `{{ $json.html }}`

**Configuration SendGrid** :
1. Créer un compte sur sendgrid.com (free tier = 100 emails/jour)
2. Générer une API Key
3. Configurer dans N8N : Settings → Credentials → Add SendGrid

#### 5. Error Handler (Retry)

- **Node Type**: Error Trigger
- **On Error**: Retry 3 fois avec délai exponentiel
- **On Final Failure**: Log dans Supabase

## 🔧 Configuration SMTP Alternative (Sans SendGrid)

Si vous préférez utiliser votre propre SMTP :

### SMTP Node Configuration

- **Host**: `smtp.gmail.com` (ou votre serveur SMTP)
- **Port**: `587`
- **Secure**: `false` (TLS)
- **User**: `your-email@gmail.com`
- **Password**: `your-app-password` (Gmail nécessite App Password)

## 🔐 Variables d'Environnement N8N

Ajouter dans docker-compose.yml :

```yaml
environment:
  - SITE_URL=https://humancatalystbeacon.com
  - SITE_NAME=The Human Catalyst University
  - FROM_EMAIL=noreply@humancatalystbeacon.com
  - FROM_NAME=The Human Catalyst University
  - SENDGRID_API_KEY=your_sendgrid_api_key
  - SMTP_HOST=smtp.sendgrid.net
  - SMTP_USER=apikey
  - SMTP_PASS=your_sendgrid_api_key
```

## 📝 Exemple de Workflow Complet (JSON)

Le workflow peut être exporté depuis N8N et importé. Voici la structure :

```json
{
  "name": "Send Email Workflow",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "send-email",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "value": "role-change"
            },
            {
              "value": "subscription-cancelled"
            }
          ]
        },
        "mode": "rules"
      },
      "name": "Route by Type",
      "type": "n8n-nodes-base.switch",
      "position": [450, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Route by Type", "type": "main", "index": 0}]]
    }
  }
}
```

## 🧪 Tester le Workflow

### 1. Activer le Workflow dans N8N

### 2. Tester depuis server.js

```javascript
// Test
const testEmail = await sendEmailViaN8N('role-change', {
  email: 'test@example.com',
  userName: 'Test User',
  oldRole: 'Free',
  newRole: 'Teacher'
});

console.log('Email sent:', testEmail);
```

### 3. Vérifier les Logs N8N

Dans N8N, aller dans "Executions" pour voir :
- ✅ Succès
- ❌ Erreurs avec détails
- ⏱️ Temps d'exécution

## 🚀 Déploiement en Production

### Option 1 : N8N sur votre serveur

```bash
# Sur votre serveur
git clone https://github.com/n8n-io/n8n
cd n8n
docker-compose up -d
```

### Option 2 : N8N Cloud (Payant)

- https://n8n.io/cloud
- $20/mois pour usage personnel
- Géré par l'équipe N8N

### Option 3 : Railway / Render (Gratuit avec limitations)

- Déployer le container N8N
- Configurer les variables d'environnement
- Exposer le port 5678

## 📊 Monitoring

N8N inclut :
- ✅ Historique de toutes les exécutions
- ✅ Logs détaillés
- ✅ Métriques de performance
- ✅ Alertes en cas d'échec

## 🔄 Migration depuis l'Ancien Système

1. **Créer les workflows N8N** pour chaque type d'email
2. **Tester** avec quelques emails réels
3. **Modifier server.js** pour utiliser N8N
4. **Déployer** progressivement
5. **Surveiller** les logs pendant 1 semaine
6. **Supprimer** l'ancien code une fois validé

## 💡 Conseils

- ✅ Utiliser SendGrid (free tier suffisant pour commencer)
- ✅ Activer les retries automatiques
- ✅ Logger tous les emails dans Supabase pour audit
- ✅ Tester chaque workflow avant production
- ✅ Configurer des alertes pour les échecs
