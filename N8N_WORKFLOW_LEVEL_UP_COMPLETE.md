# 🎯 Configuration Workflow N8N - Level Up (Complet)

## ✅ Étape 1 : Webhook Reçoit les Données (DÉJÀ FAIT)

Votre webhook reçoit maintenant les données Supabase au format :
```json
{
  "type": "UPDATE",
  "table": "profiles",
  "record": {
    "level": 2,
    "email": "acmaera@gmail.com",
    "full_name": "EVO",
    "current_xp": 0
  },
  "old_record": {
    "level": 1
  }
}
```

---

## 🔧 Étape 2 : Function Node - Transformer les Données

Ajoutez un **Function Node** après le Webhook node :

### Code du Function Node

```javascript
// Récupérer les données du webhook Supabase
const supabaseData = $input.item.json.body;

// Vérifier que c'est un UPDATE sur profiles avec level-up
if (supabaseData.type === 'UPDATE' && supabaseData.table === 'profiles') {
  const newRecord = supabaseData.record;
  const oldRecord = supabaseData.old_record || {};
  
  // Vérifier que le level a augmenté
  if (newRecord.level > (oldRecord.level || 0)) {
    // Construire les données pour l'email
    return {
      json: {
        emailType: 'level-up',
        email: newRecord.email || 'unknown@example.com',
        userName: newRecord.full_name || 'there',
        oldLevel: oldRecord.level || 0,
        newLevel: newRecord.level,
        totalXP: newRecord.current_xp || 0,
        // Données supplémentaires
        userId: newRecord.id,
        rank: newRecord.rank || 'New Catalyst'
      }
    };
  }
}

// Si ce n'est pas un level-up, retourner null (sera filtré)
return null;
```

---

## 🔀 Étape 3 : Switch Node - Router selon emailType

Ajoutez un **Switch Node** après le Function Node :

### Configuration Switch Node

1. **Mode** : `Rules`
2. **Value** : `{{ $json.emailType }}`
3. **Rules** :
   - **Rule 1** :
     - **Condition** : `String`
     - **Value 1** : `{{ $json.emailType }}`
     - **Operation** : `Equal`
     - **Value 2** : `level-up`
   - **Rule 2** (pour plus tard) :
     - **Condition** : `String`
     - **Value 1** : `{{ $json.emailType }}`
     - **Operation** : `Equal`
     - **Value 2** : `achievement-unlocked`

---

## 📧 Étape 4 : SMTP Node - Envoyer l'Email

Ajoutez un **SMTP Node** après la branche "level-up" du Switch :

### Configuration SMTP Node

1. **Operation** : `Send Email`
2. **From Email** : Votre email (ex: `noreply@votredomaine.com`)
3. **To Email** : `{{ $json.email }}`
4. **Subject** : `🎉 Félicitations ! Vous avez atteint le niveau {{ $json.newLevel }} !`
5. **Email Type** : `HTML`
6. **Message** : 

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .level-badge { font-size: 48px; font-weight: bold; margin: 20px 0; }
    .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .stat-item:last-child { border-bottom: none; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Félicitations {{ $json.userName }} !</h1>
      <div class="level-badge">Niveau {{ $json.newLevel }}</div>
    </div>
    <div class="content">
      <p>Vous avez atteint le <strong>niveau {{ $json.newLevel }}</strong> !</p>
      
      <div class="stats">
        <div class="stat-item">
          <span>Niveau précédent :</span>
          <strong>{{ $json.oldLevel }}</strong>
        </div>
        <div class="stat-item">
          <span>Nouveau niveau :</span>
          <strong>{{ $json.newLevel }}</strong>
        </div>
        <div class="stat-item">
          <span>XP total :</span>
          <strong>{{ $json.totalXP }}</strong>
        </div>
      </div>
      
      <p>Continuez comme ça ! Chaque leçon complétée vous rapproche du niveau suivant.</p>
      
      <a href="https://votredomaine.com/dashboard" class="button">Voir mon profil</a>
    </div>
  </div>
</body>
</html>
```

---

## 🔔 Étape 5 : Telegram Node (Optionnel)

Si vous voulez aussi envoyer une notification Telegram :

1. Ajoutez un **Telegram Node** après le SMTP node
2. **Operation** : `Send Message`
3. **Chat ID** : `{{ $json.telegramChatId }}` (à récupérer depuis votre DB)
4. **Text** :

```
🎉 Félicitations {{ $json.userName }} !

Vous avez atteint le niveau {{ $json.newLevel }} !
Niveau précédent : {{ $json.oldLevel }}
XP total : {{ $json.totalXP }}

Continuez comme ça ! 💪
```

**Note** : Vous devrez stocker `telegram_chat_id` dans votre table `profiles` et le récupérer avec un Supabase Node avant le Telegram Node.

---

## 📊 Structure du Workflow Final

```
┌─────────────┐
│   Webhook   │ ← Reçoit les données Supabase
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Function   │ ← Transforme Supabase → emailType
│   Node      │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Switch    │ ← Route selon emailType
│    Node     │
└──────┬──────┘
       │
       ├─→ level-up ──→ SMTP Node ──→ Telegram Node (optionnel)
       ├─→ achievement-unlocked ──→ SMTP Node
       └─→ lesson-completed ──→ SMTP Node
```

---

## 🧪 Tester le Workflow

### Test 1 : Déclencher un Level Up

Dans Supabase SQL Editor :

```sql
-- Récupérer un user_id
SELECT id, email, level FROM profiles LIMIT 1;

-- Augmenter le level (remplacez USER_ID)
UPDATE profiles 
SET level = level + 1 
WHERE id = 'USER_ID';
```

### Test 2 : Vérifier dans N8N

1. Allez dans **Executions**
2. Ouvrez la dernière exécution
3. Vérifiez que :
   - ✅ Webhook node reçoit les données
   - ✅ Function Node transforme correctement
   - ✅ Switch Node route vers "level-up"
   - ✅ SMTP Node envoie l'email
   - ✅ Tous les nodes sont verts

### Test 3 : Vérifier l'Email

Vérifiez la boîte mail de l'utilisateur (`acmaera@gmail.com` dans votre test) :
- L'email devrait être reçu
- Le contenu devrait être correct

---

## ✅ Checklist Finale

- [ ] Webhook node reçoit les données Supabase ✅ (DÉJÀ FAIT)
- [ ] Function Node transforme les données
- [ ] Switch Node route selon emailType
- [ ] SMTP Node configuré avec template email
- [ ] Workflow activé (toggle ON)
- [ ] Test avec UPDATE profiles réussi
- [ ] Email reçu par l'utilisateur

---

## 🚀 Prochaines Étapes

1. **Configurez le Function Node** avec le code ci-dessus
2. **Ajoutez le Switch Node** pour router
3. **Configurez le SMTP Node** avec votre serveur SMTP
4. **Testez** avec un UPDATE réel
5. **Vérifiez** que l'email est envoyé

---

## 📚 Ressources

- `N8N_FUNCTION_TRANSFORM_SUPABASE.md` - Code Function Node détaillé
- `N8N_SMTP_SETUP.md` - Configuration SMTP
- `N8N_TELEGRAM_SETUP.md` - Configuration Telegram

---

## 🎉 Félicitations !

Votre intégration Supabase → N8N fonctionne ! Il ne reste plus qu'à configurer les nodes pour envoyer les emails/notifications.
