# Proposition d'Architecture Email avec N8N

## 📊 Analyse de la Situation Actuelle

### Problèmes Identifiés

1. **Architecture fragmentée** :
   - Edge Function génère les templates
   - Emails mis en queue dans `email_queue`
   - Pas de processus clair qui envoie réellement les emails
   - Code Nodemailer existant mais non utilisé

2. **Complexité inutile** :
   - Multiples couches (server.js → Edge Function → Queue → ???)
   - Difficile à déboguer
   - Pas de visibilité sur les emails envoyés/échoués

3. **Maintenance difficile** :
   - Templates dans le code TypeScript
   - Pas de moyen facile de modifier les emails sans déployer
   - Pas de logs centralisés

## 🎯 Pourquoi N8N est une Excellente Solution

### Avantages de N8N

1. **Workflow Visuel** :
   - Interface graphique pour créer/modifier les workflows
   - Pas besoin de coder pour changer les templates
   - Facile à comprendre pour toute l'équipe

2. **Intégrations Native** :
   - Supabase (écoute les changements dans `email_queue`)
   - SMTP (Gmail, SendGrid, Mailgun, etc.)
   - Webhooks (pour déclencher depuis server.js)
   - Retry automatique en cas d'échec

3. **Monitoring & Logs** :
   - Historique de tous les emails envoyés
   - Logs détaillés de chaque exécution
   - Alertes en cas d'échec

4. **Flexibilité** :
   - Facile d'ajouter de nouveaux types d'emails
   - Templates modifiables sans redéploiement
   - Conditions et logique métier visuelles

5. **Open Source & Auto-hébergé** :
   - Pas de coût par email
   - Contrôle total sur les données
   - Peut tourner sur votre infrastructure

## 🏗️ Architecture Proposée avec N8N

### Option 1 : Architecture Simple (Recommandée)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Webhook Stripe → server.js                               │
│    → handleSubscriptionUpdate()                              │
│    → Met à jour le profil                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. server.js → N8N Webhook                                   │
│    → POST http://n8n.yourdomain.com/webhook/send-email       │
│    → Body: { emailType, email, userName, oldRole, newRole }│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. N8N Workflow                                              │
│    ┌──────────────────────────────────────────────┐          │
│    │ Webhook Trigger                               │          │
│    └──────────────┬───────────────────────────────┘          │
│                   │                                           │
│                   ▼                                           │
│    ┌──────────────────────────────────────────────┐          │
│    │ Switch Node (emailType)                       │          │
│    │ → role-change                                  │          │
│    │ → subscription-cancelled                       │          │
│    │ → payment-confirmation                        │          │
│    └──────────────┬───────────────────────────────┘          │
│                   │                                           │
│                   ▼                                           │
│    ┌──────────────────────────────────────────────┐          │
│    │ Function Node (Template HTML)                 │          │
│    │ → Génère le HTML selon le type                │          │
│    └──────────────┬───────────────────────────────┘          │
│                   │                                           │
│                   ▼                                           │
│    ┌──────────────────────────────────────────────┐          │
│    │ SMTP Node (SendGrid/Gmail/etc.)               │          │
│    │ → Envoie l'email                              │          │
│    └──────────────┬───────────────────────────────┘          │
│                   │                                           │
│                   ▼                                           │
│    ┌──────────────────────────────────────────────┐          │
│    │ Supabase Node (Log)                           │          │
│    │ → INSERT INTO email_logs                      │          │
│    └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Option 2 : Architecture avec Queue (Plus Robuste)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. server.js → INSERT INTO email_queue                      │
│    → status: 'pending'                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. N8N Workflow (Polling ou Webhook)                        │
│    ┌──────────────────────────────────────────────┐          │
│    │ Supabase Trigger (Cron every 30s)             │          │
│    │ → SELECT * FROM email_queue                    │          │
│    │   WHERE status = 'pending'                     │          │
│    └──────────────┬───────────────────────────────┘          │
│                   │                                           │
│                   ▼                                           │
│    ┌──────────────────────────────────────────────┐          │
│    │ Switch Node (email_type)                      │          │
│    └──────────────┬───────────────────────────────┘          │
│                   │                                           │
│                   ▼                                           │
│    ┌──────────────────────────────────────────────┐          │
│    │ Function Node (Template)                      │          │
│    └──────────────┬───────────────────────────────┘          │
│                   │                                           │
│                   ▼                                           │
│    ┌──────────────────────────────────────────────┐          │
│    │ SMTP Node (Send Email)                        │          │
│    └──────────────┬───────────────────────────────┘          │
│                   │                                           │
│                   ▼                                           │
│    ┌──────────────────────────────────────────────┐          │
│    │ Supabase Node (Update Status)                 │          │
│    │ → UPDATE email_queue SET status = 'sent'      │          │
│    └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Implémentation Recommandée

### Étape 1 : Simplifier server.js

**Avant** :
```javascript
await sendEmailViaSupabase('role-change', {
  email: profile.email,
  userName: profile.full_name || 'there',
  oldRole: oldRole,
  newRole: updatedRole
})
```

**Après** :
```javascript
await sendEmailViaN8N('role-change', {
  email: profile.email,
  userName: profile.full_name || 'there',
  oldRole: oldRole,
  newRole: updatedRole
})
```

### Étape 2 : Créer le Workflow N8N

1. **Webhook Trigger** : Reçoit les requêtes de server.js
2. **Switch Node** : Route selon `emailType`
3. **Function Node** : Génère le template HTML
4. **SMTP Node** : Envoie l'email (SendGrid recommandé)
5. **Error Handler** : Retry automatique + logs

### Étape 3 : Configuration

**Variables d'environnement N8N** :
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- `SITE_URL`, `SITE_NAME`
- `SUPABASE_URL`, `SUPABASE_KEY` (pour logs)

## 📋 Comparaison des Options

| Critère | Code Actuel | N8N (Webhook) | N8N (Queue) |
|---------|-------------|---------------|-------------|
| **Simplicité** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Maintenance** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Visibilité** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Fiabilité** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Coût** | Gratuit | Gratuit | Gratuit |
| **Temps de dev** | Élevé | Faible | Moyen |

## ✅ Recommandation Finale

**Utiliser N8N avec Webhook (Option 1)** car :

1. ✅ **Plus simple** : Pas besoin de queue, envoi direct
2. ✅ **Plus rapide** : Pas de polling, réponse immédiate
3. ✅ **Plus maintenable** : Workflow visuel, templates modifiables
4. ✅ **Moins de code** : Supprime Edge Functions et queue processing
5. ✅ **Meilleure visibilité** : Logs et monitoring intégrés

### Ce qu'il faut faire :

1. **Installer N8N** (Docker recommandé)
2. **Créer le workflow** pour chaque type d'email
3. **Configurer SMTP** (SendGrid ou Mailgun recommandé)
4. **Modifier server.js** pour appeler N8N au lieu de Supabase
5. **Supprimer** les Edge Functions email (optionnel)

## 🔧 Code d'Exemple

### Nouvelle fonction dans server.js

```javascript
async function sendEmailViaN8N(emailType, emailData) {
  try {
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/send-email'
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailType,
        ...emailData
      }),
      signal: AbortSignal.timeout(10000) // 10s timeout
    })

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending email via N8N:', error)
    return { success: false, error: error.message }
  }
}
```

## 🎯 Prochaines Étapes

1. ✅ Installer N8N (Docker Compose recommandé)
2. ✅ Créer un workflow de test
3. ✅ Configurer SMTP (SendGrid free tier = 100 emails/jour)
4. ✅ Tester avec un email réel
5. ✅ Migrer progressivement les emails existants
6. ✅ Supprimer l'ancien code une fois validé

## 💡 Avantages Additionnels

- **A/B Testing** : Facile de tester différents templates
- **Analytics** : Tracking des taux d'ouverture (avec SendGrid)
- **Scheduling** : Emails programmés (ex: rappels de renouvellement)
- **Multi-canaux** : SMS, Slack, etc. en plus des emails
- **Workflows complexes** : Conditions, boucles, transformations
