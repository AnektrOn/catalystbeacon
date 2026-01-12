# 🎯 Configuration N8N Workflow - Guide Complet

## 📋 Structure de Workflow Recommandée

### Workflow Simple (Recommandé)

```
┌─────────────────┐
│  Webhook Node   │ ← Trigger
│                 │
│ Respond:        │
│ "When Last      │
│  Node Finishes" │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Function Node   │ ← Transformer données Supabase
│                  │
│ Code:            │
│ const data =     │
│   $input.item.json│
│ return {         │
│   json: {        │
│     emailType:   │
│       data.type, │
│     ...          │
│   }              │
│ }                │
└────────┬─────────┘
         │
         ↓
┌─────────────────┐
│  Switch Node     │ ← Router selon emailType
│                  │
│ Rules:           │
│ - level-up       │
│ - achievement    │
│ - lesson-completed│
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
┌─────────┐ ┌─────────┐
│  SMTP   │ │Telegram │
│  Node   │ │  Node   │
└─────────┘ └─────────┘
```

**Important** : Pas de node "Respond to Webhook" séparé !

---

## ⚙️ Configuration du Webhook Node

### Paramètres Essentiels

1. **HTTP Method** : `POST`
2. **Path** : (laissé vide, N8N génère automatiquement)
3. **Response Mode** : `When Last Node Finishes` ← **IMPORTANT**
4. **Response Data** : `All Entries` (ou `First Entry`)

### ⚠️ Erreur à Éviter

**Ne pas** :
- ❌ Mettre "Using 'Respond to Webhook' Node" si vous n'avez pas de node séparé
- ❌ Laisser un node "Respond to Webhook" non connecté

**Faire** :
- ✅ Utiliser "When Last Node Finishes"
- ✅ Supprimer tout node "Respond to Webhook" séparé

---

## 🔧 Function Node : Transformer Supabase → N8N

### Code pour Transformer les Données Supabase

```javascript
// Récupérer les données du webhook Supabase
const supabaseData = $input.item.json;

// Format Supabase standard :
// {
//   type: "UPDATE",
//   table: "profiles",
//   record: { ... },
//   old_record: { ... }
// }

// Transformer selon le type d'événement
let emailType = 'unknown';
let emailData = {};

if (supabaseData.type === 'UPDATE' && supabaseData.table === 'profiles') {
  const newRecord = supabaseData.record;
  const oldRecord = supabaseData.old_record || {};
  
  // Level Up
  if (newRecord.level > (oldRecord.level || 0)) {
    emailType = 'level-up';
    emailData = {
      email: newRecord.email || 'unknown@example.com',
      userName: newRecord.full_name || 'there',
      oldLevel: oldRecord.level || 0,
      newLevel: newRecord.level,
      totalXP: newRecord.current_xp || 0
    };
  }
}

if (supabaseData.type === 'INSERT' && supabaseData.table === 'user_badges') {
  emailType = 'achievement-unlocked';
  emailData = {
    userId: supabaseData.record.user_id,
    badgeId: supabaseData.record.badge_id
    // Note: Vous devrez récupérer email et badge details avec Supabase Node
  };
}

// Retourner les données transformées
return {
  json: {
    emailType: emailType,
    ...emailData
  }
};
```

---

## 📧 Configuration SMTP Node

### Paramètres SMTP

1. **Host** : Votre serveur SMTP (ex: `smtp.gmail.com`, `smtp.office365.com`)
2. **Port** : `587` (TLS) ou `465` (SSL)
3. **Secure** : `TLS` ou `SSL` selon le port
4. **User** : Votre email
5. **Password** : Votre mot de passe SMTP
6. **From Email** : Votre email
7. **To Email** : `{{ $json.email }}`
8. **Subject** : `{{ $json.emailType }}`
9. **Text/HTML** : Votre template email

---

## 🔔 Configuration Telegram Node

### Paramètres Telegram

1. **Operation** : `Send Message`
2. **Chat ID** : `{{ $json.telegramChatId }}` (à récupérer depuis votre DB)
3. **Text** : Votre message

**Note** : Vous devrez stocker `telegram_chat_id` dans votre table `profiles` et le récupérer avec un Supabase Node.

---

## 🧪 Tester le Workflow

### Test 1 : Test Direct

1. Cliquez sur **"Test workflow"** dans N8N
2. Ou utilisez curl :
   ```bash
   curl -X POST https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b \
     -H "Content-Type: application/json" \
     -d '{
       "type": "UPDATE",
       "table": "profiles",
       "record": {
         "id": "test-id",
         "email": "test@example.com",
         "full_name": "Test User",
         "level": 5,
         "current_xp": 5000
       },
       "old_record": {
         "level": 4
       }
     }'
   ```

### Test 2 : Vérifier l'Exécution

1. Allez dans **Executions**
2. Ouvrez la dernière exécution
3. Vérifiez que tous les nodes sont **verts**
4. Vérifiez les données à chaque étape

---

## ✅ Checklist Finale

- [ ] Webhook node configuré avec "When Last Node Finishes"
- [ ] Pas de node "Respond to Webhook" séparé
- [ ] Function Node transforme correctement les données Supabase
- [ ] Switch Node route selon emailType
- [ ] SMTP/Telegram nodes configurés
- [ ] Workflow activé (toggle ON)
- [ ] Test réussi avec curl
- [ ] Trigger Supabase créé et testé

---

## 🆘 Dépannage

### Erreur : "Unused Respond to Webhook node"

→ Voir `FIX_N8N_WEBHOOK_ERROR.md`

### Le webhook ne reçoit rien

1. Vérifiez que le workflow est **ACTIVÉ**
2. Vérifiez l'URL exacte du webhook
3. Testez avec curl

### Les données ne sont pas transformées

1. Vérifiez le Function Node
2. Regardez les données dans chaque node (cliquez sur le node)
3. Vérifiez le format Supabase dans les logs

---

## 📚 Ressources

- `FIX_N8N_WEBHOOK_ERROR.md` - Fix erreur "Respond to Webhook"
- `create-trigger-level-up-simple.sql` - Créer le trigger Supabase
- `N8N_FUNCTION_TRANSFORM_SUPABASE.md` - Code Function Node détaillé
