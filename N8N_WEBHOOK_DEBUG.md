# 🐛 Debug Webhook N8N - Format Réel

## 📋 Ce que vous avez reçu (Test Navigateur)

```json
{
  "headers": { ... },
  "params": {},
  "query": {},
  "body": {},  // ⚠️ VIDE car c'est un GET depuis navigateur
  "webhookUrl": "...",
  "executionMode": "test"
}
```

**C'est normal** : C'est un test depuis le navigateur (GET request), pas un vrai webhook POST.

---

## ✅ Ce que vous recevrez quand Supabase enverra

Quand Supabase enverra un **vrai webhook POST**, le `body` contiendra :

### Pour UPDATE (Level Up)

```json
{
  "headers": { ... },
  "params": {},
  "query": {},
  "body": {
    "type": "UPDATE",
    "table": "profiles",
    "schema": "public",
    "record": {
      "id": "uuid-utilisateur",
      "level": 5,
      "current_xp": 5000,
      "full_name": "John Doe",
      "email": "john@example.com",
      // ... tous les autres champs de profiles
    },
    "old_record": {
      "id": "uuid-utilisateur",
      "level": 4,
      "current_xp": 4500,
      // ... anciennes valeurs
    }
  },
  "webhookUrl": "...",
  "executionMode": "production"
}
```

### Pour INSERT (Achievement)

```json
{
  "body": {
    "type": "INSERT",
    "table": "user_badges",
    "schema": "public",
    "record": {
      "id": "uuid",
      "user_id": "uuid-utilisateur",
      "badge_id": "uuid-badge",
      "awarded_at": "2024-01-15T10:00:00Z"
    },
    "old_record": null
  }
}
```

---

## 🔍 Comment Vérifier le Format Réel

### Option 1 : Tester avec Supabase

1. Dans Supabase Dashboard → Database → Webhooks
2. Créez un webhook de test
3. Cliquez sur **"Test webhook"**
4. Regardez dans N8N (Executions) le format exact

### Option 2 : Déclencher un Événement Réel

1. Dans votre app, déclenchez un événement (ex: compléter une leçon)
2. Dans N8N, allez dans **Executions**
3. Ouvrez l'exécution du webhook
4. Regardez le **body** exact

### Option 3 : Ajouter un Log dans N8N

Ajoutez un **Function Node** juste après le Webhook pour logger :

```javascript
const data = $input.item.json;

// Logger pour debug
console.log('Full webhook data:', JSON.stringify(data, null, 2));
console.log('Body:', data.body);
console.log('Body type:', typeof data.body);
console.log('Body keys:', Object.keys(data.body || {}));

// Retourner les données telles quelles pour voir
return data;
```

---

## 🎯 Accéder aux Données dans N8N

### Si body est un objet JSON

```javascript
const body = $input.item.json.body;

// Pour UPDATE
if (body.type === 'UPDATE' && body.table === 'profiles') {
  const newLevel = body.record.level;
  const oldLevel = body.old_record.level;
  // ...
}
```

### Si body est une string JSON

```javascript
const bodyString = $input.item.json.body;
const body = JSON.parse(bodyString);

// Puis utiliser comme ci-dessus
```

### Si body est directement les données

```javascript
// Si Supabase envoie directement les données (pas de wrapper)
const data = $input.item.json.body;

// Utiliser directement
const newLevel = data.record?.level;
```

---

## 🧪 Test Rapide

Pour tester rapidement, créez un webhook de test dans Supabase :

1. **Table** : `profiles`
2. **Event** : `UPDATE`
3. **URL** : Votre webhook N8N
4. Cliquez sur **"Test webhook"**
5. Regardez dans N8N ce qui arrive

---

## 📝 Partagez le Format Réel

Quand vous recevrez un **vrai webhook** de Supabase (pas un test navigateur), partagez-moi :

1. Le contenu du `body` exact
2. La structure complète de `$input.item.json`

Comme ça je pourrai vous donner le **Function Node exact** pour transformer ce format spécifique ! 🎯

---

En attendant, pouvez-vous :
1. Créer un webhook Supabase de test
2. Cliquer sur "Test webhook" dans Supabase
3. Me partager le body exact que N8N reçoit ?

Ou déclencher un événement réel (level up, achievement, etc.) et me montrer le body dans N8N Executions.
