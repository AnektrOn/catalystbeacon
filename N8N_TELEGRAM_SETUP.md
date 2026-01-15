# 🤖 Guide d'Intégration Telegram Bot avec N8N

## 🚀 Setup Rapide (30 minutes)

### Étape 1 : Créer le Bot Telegram

1. **Ouvrez Telegram** sur votre téléphone ou ordinateur
2. **Cherchez** `@BotFather` dans Telegram
3. **Envoyez** `/newbot`
4. **Choisissez un nom** pour votre bot (ex: "Human Catalyst Notifications")
5. **Choisissez un username** (ex: "humancatalyst_bot")
6. **Copiez le token** que BotFather vous donne (ex: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

⚠️ **Important** : Gardez ce token secret !

### Étape 2 : Tester le Bot

1. **Cherchez votre bot** dans Telegram (par son username)
2. **Cliquez sur Start** ou envoyez `/start`
3. Le bot devrait répondre (même si c'est vide pour l'instant)

### Étape 3 : Configurer dans N8N

#### 3.1 Ajouter les Credentials Telegram

1. Dans N8N Cloud, allez dans **Settings** → **Credentials**
2. Cliquez sur **"Add Credential"**
3. Recherchez **"Telegram"**
4. Entrez votre **Bot Token** (celui de l'étape 1)
5. Testez la connexion
6. Nommez-la : **"Telegram Bot"**

#### 3.2 Ajouter le Telegram Node dans votre Workflow

1. Dans votre workflow "Email Notification System"
2. Après le **Switch Node**, ajoutez une **branche parallèle** pour Telegram
3. Ajoutez un **Telegram Node**
4. Configurez :
   - **Credential**: "Telegram Bot"
   - **Operation**: "Send Message"
   - **Chat ID**: `{{ $json.telegramChatId }}` (depuis votre DB)
   - **Text**: `{{ $json.message }}`
   - **Parse Mode**: `HTML` (pour le formatage)

### Étape 4 : Préparer les Messages Telegram

Avant le Telegram Node, ajoutez un **Function Node** pour préparer le message :

```javascript
const emailData = $input.item.json;

// Si pas de telegram_chat_id, skip Telegram
if (!emailData.telegramChatId) {
  return null; // Skip cette branche
}

let message = '';
let emoji = '';

switch(emailData.emailType) {
  case 'sign-up':
    message = `🎉 Bienvenue ${emailData.userName || 'there'}!\n\nMerci de rejoindre The Human Catalyst Beacon!`;
    break;
    
  case 'level-up':
    message = `🎉 Félicitations ${emailData.userName || 'there'}!\n\nVous avez atteint le <b>niveau ${emailData.newLevel}</b>!\n\nXP total: ${emailData.totalXP || 0}`;
    break;
    
  case 'lesson-completed':
    message = `✅ Leçon complétée!\n\n<b>${emailData.lessonTitle || 'Lesson'}</b>\n${emailData.courseName || 'Course'}\n\n+${emailData.xpEarned || 0} XP gagné!\nXP total: ${emailData.totalXP || 0}`;
    break;
    
  case 'achievement-unlocked':
    message = `🏆 Achievement débloqué!\n\n<b>${emailData.badgeTitle || 'Achievement'}</b>\n\n${emailData.badgeDescription || ''}\n\n+${emailData.xpReward || 0} XP`;
    break;
    
  case 'subscription-purchased':
    message = `💳 Abonnement activé!\n\nBienvenue au <b>${emailData.planName || 'Plan'}</b>!\n\nVotre paiement a été traité avec succès.`;
    break;
    
  case 'subscription-cancelled':
    message = `⚠️ Abonnement annulé\n\nVotre ${emailData.planName || 'abonnement'} a été annulé.\n\nVous gardez l'accès jusqu'au ${emailData.accessUntil || 'fin de la période'}.`;
    break;
    
  default:
    return null; // Skip si type inconnu
}

// Ajouter un bouton vers le dashboard
const replyMarkup = {
  inline_keyboard: [[
    {
      text: '📱 Ouvrir Dashboard',
      url: `${process.env.SITE_URL || 'https://humancatalystbeacon.com'}/dashboard`
    }
  ]]
};

return {
  json: {
    telegramChatId: emailData.telegramChatId,
    message: message,
    replyMarkup: JSON.stringify(replyMarkup)
  }
};
```

### Étape 5 : Modifier le Telegram Node

Dans le **Telegram Node**, configurez :
- **Chat ID**: `{{ $json.telegramChatId }}`
- **Text**: `{{ $json.message }}`
- **Reply Markup**: `{{ $json.replyMarkup }}` (pour les boutons)

---

## 📊 Stocker le Telegram Chat ID

### Option A : Via Webhook N8N (Recommandé)

1. **Créer un nouveau workflow** : "Telegram Bot Handler"
2. **Ajouter un Telegram Trigger** (Webhook)
3. **Configurer** :
   - **Updates**: "Message"
   - **Operation**: "Receive Update"
4. **Ajouter un Function Node** pour traiter `/start` :

```javascript
const update = $input.item.json;

// Vérifier si c'est la commande /start
if (update.message?.text === '/start' || update.message?.text?.startsWith('/start')) {
  const chatId = update.message.chat.id;
  const userId = update.message.text.split(' ')[1]; // Si vous passez userId dans /start <userId>
  
  return {
    json: {
      chatId: chatId,
      userId: userId,
      action: 'connect'
    }
  };
}

return null;
```

5. **Ajouter un Supabase Node** pour mettre à jour le profil :

```javascript
// Supabase Node
Operation: Update
Table: profiles
Where: id = {{ $json.userId }}
Data: {
  telegram_chat_id: {{ $json.chatId }}
}
```

### Option B : Via votre App React

Créer une page de settings pour connecter Telegram :

```jsx
// TelegramConnect.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TelegramConnect = () => {
  const [connected, setConnected] = useState(false);
  
  const handleConnect = async () => {
    // Générer un token unique pour l'utilisateur
    const { data: { user } } = await supabase.auth.getUser();
    const token = generateToken(user.id);
    
    // Afficher les instructions
    const botUsername = 'humancatalyst_bot'; // Votre bot username
    const connectUrl = `https://t.me/${botUsername}?start=${token}`;
    
    return (
      <div>
        <h2>Connecter Telegram</h2>
        <p>1. Cliquez sur le bouton ci-dessous</p>
        <p>2. Cliquez sur "Start" dans Telegram</p>
        <a href={connectUrl} target="_blank">
          <button>Ouvrir Telegram</button>
        </a>
      </div>
    );
  };
  
  return (
    <div>
      {connected ? (
        <p>✅ Telegram connecté!</p>
      ) : (
        <button onClick={handleConnect}>Connecter Telegram</button>
      )}
    </div>
  );
};
```

---

## 🔄 Modifier server.js pour Inclure Telegram

Dans `server.js`, modifiez `sendEmailViaN8N` pour aussi envoyer sur Telegram :

```javascript
async function sendEmailViaN8N(emailType, emailData) {
  // ... code existant pour email ...
  
  // Aussi envoyer sur Telegram si chatId existe
  if (emailData.telegramChatId) {
    // Le même webhook N8N peut gérer Telegram aussi
    // N8N enverra sur les deux canaux en parallèle
  }
  
  return result;
}
```

**Ou mieux** : N8N gère automatiquement les deux canaux en parallèle dans le workflow !

---

## 🧪 Tester

### Test Manuel dans N8N

1. Exécutez le workflow avec :
```json
{
  "emailType": "level-up",
  "email": "test@example.com",
  "userName": "Test User",
  "telegramChatId": "VOTRE_CHAT_ID",
  "newLevel": 5,
  "oldLevel": 4,
  "totalXP": 5000
}
```

2. Vérifiez que vous recevez le message sur Telegram

### Comment Obtenir votre Chat ID

1. Envoyez un message à votre bot
2. Ouvrez : `https://api.telegram.org/bot<VOTRE_TOKEN>/getUpdates`
3. Cherchez `"chat":{"id":123456789}` - c'est votre chatId

---

## 📋 Checklist

- [ ] Bot Telegram créé avec BotFather
- [ ] Token copié et sécurisé
- [ ] Credentials Telegram ajoutés dans N8N
- [ ] Telegram Node ajouté au workflow
- [ ] Function Node pour préparer messages
- [ ] Webhook pour recevoir /start (optionnel)
- [ ] Champ `telegram_chat_id` ajouté dans `profiles` table
- [ ] Testé avec votre propre Telegram
- [ ] Interface de connexion créée dans l'app (optionnel)

---

## 🎯 Workflow Final dans N8N

```
Webhook
  ↓
Switch (emailType)
  ├─→ Email Template → SMTP Node
  └─→ Telegram Template → Telegram Node (si chatId existe)
```

Les deux canaux fonctionnent en parallèle ! 🚀

---

## 💡 Améliorations Futures

1. **Boutons interactifs** : Réponses rapides directement dans Telegram
2. **Commandes** : `/stats`, `/progress`, etc.
3. **Notifications groupées** : Résumé quotidien/hebdomadaire
4. **Rich media** : Images, GIFs pour les achievements

---

Besoin d'aide pour une étape spécifique ? Dites-moi où vous en êtes !
