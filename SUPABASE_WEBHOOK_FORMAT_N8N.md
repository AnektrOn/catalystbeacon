# 🔄 Format Supabase Webhook → Transformation dans N8N

## 📋 Format Automatique de Supabase

Supabase envoie **automatiquement** un payload JSON standardisé. Vous **ne pouvez pas** personnaliser le body dans le Dashboard.

### Format pour UPDATE (ex: Level Up)

Quand `profiles.level` change, Supabase envoie :

```json
{
  "type": "UPDATE",
  "table": "profiles",
  "schema": "public",
  "record": {
    "id": "uuid-de-l-utilisateur",
    "level": 5,
    "current_xp": 5000,
    "full_name": "John Doe",
    "email": "john@example.com",
    // ... autres champs
  },
  "old_record": {
    "id": "uuid-de-l-utilisateur",
    "level": 4,
    "current_xp": 4500,
    // ... anciennes valeurs
  }
}
```

### Format pour INSERT (ex: Achievement Unlocked)

Quand `user_badges` reçoit un INSERT :

```json
{
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
```

---

## 🔧 Solution : Transformer dans N8N

### Étape 1 : Configurer le Webhook Supabase

Dans Supabase Dashboard → Database → Webhooks :

1. **Name** : `level-up-to-n8n`
2. **Table** : `profiles`
3. **Events** : `UPDATE`
4. **URL** : `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`
5. **Method** : `POST`
6. **Headers** : (optionnel, Supabase envoie déjà `Content-Type: application/json`)

**C'est tout !** Pas de body à configurer, Supabase l'envoie automatiquement.

---

## 🎯 Étape 2 : Transformer dans N8N

### Ajouter un Function Node après le Webhook

Dans votre workflow N8N, **après le Webhook Node**, ajoutez un **Function Node** pour transformer le format :

#### Pour "Level Up" :

```javascript
const data = $input.item.json;

// Vérifier que c'est bien un UPDATE et que level a augmenté
if (data.type !== 'UPDATE' || data.table !== 'profiles') {
  return null; // Skip si pas le bon événement
}

const newLevel = data.record?.level;
const oldLevel = data.old_record?.level;

// Vérifier que level a vraiment augmenté
if (!newLevel || !oldLevel || newLevel <= oldLevel) {
  return null; // Skip si pas de level up
}

// Transformer en format personnalisé
return {
  json: {
    emailType: 'level-up',
    email: data.record.email || '', // Si email est dans profiles
    userName: data.record.full_name || 'there',
    oldLevel: oldLevel,
    newLevel: newLevel,
    totalXP: data.record.current_xp || 0,
    levelTitle: data.record.level_title || '',
    userId: data.record.id
  }
};
```

#### Pour "Achievement Unlocked" :

```javascript
const data = $input.item.json;

// Vérifier que c'est bien un INSERT sur user_badges
if (data.type !== 'INSERT' || data.table !== 'user_badges') {
  return null;
}

// Transformer en format personnalisé
return {
  json: {
    emailType: 'achievement-unlocked',
    userId: data.record.user_id,
    badgeId: data.record.badge_id,
    awardedAt: data.record.awarded_at
    // Note: badge details seront récupérés avec Supabase Node
  }
};
```

#### Pour "Lesson Completed" :

```javascript
const data = $input.item.json;

// Vérifier que c'est bien un UPDATE et que is_completed est maintenant true
if (data.type !== 'UPDATE' || data.table !== 'user_lesson_progress') {
  return null;
}

const isCompleted = data.record?.is_completed;
const wasCompleted = data.old_record?.is_completed;

// Vérifier que la leçon vient d'être complétée
if (!isCompleted || wasCompleted) {
  return null; // Skip si déjà complétée avant
}

// Transformer en format personnalisé
return {
  json: {
    emailType: 'lesson-completed',
    userId: data.record.user_id,
    courseId: data.record.course_id,
    chapterNumber: data.record.chapter_number,
    lessonNumber: data.record.lesson_number
    // Note: lesson title et XP seront récupérés avec Supabase Node
  }
};
```

---

## 🔄 Étape 3 : Récupérer les Données Manquantes

### Si Email n'est pas dans `profiles`

Ajoutez un **Supabase Node** après le Function Node :

1. **Supabase Node** :
   - **Operation** : `Get`
   - **Table** : `profiles`
   - **Where** : `id = {{ $json.userId }}`
   - **Select** : `email, full_name`

2. **Function Node** pour combiner :

```javascript
const webhookData = $('Function').item.json; // Données transformées
const profileData = $input.item.json; // Données depuis Supabase

return {
  json: {
    ...webhookData,
    email: profileData.email || '',
    userName: profileData.full_name || webhookData.userName || 'there'
  }
};
```

### Si Badge Details sont nécessaires

Pour "Achievement Unlocked", ajoutez un **Supabase Node** :

1. **Supabase Node** :
   - **Operation** : `Get`
   - **Table** : `badges`
   - **Where** : `id = {{ $json.badgeId }}`
   - **Select** : `title, description, badge_image_url, xp_reward, category`

2. **Function Node** pour combiner :

```javascript
const webhookData = $('Function').item.json;
const badgeData = $input.item.json;

return {
  json: {
    ...webhookData,
    badgeTitle: badgeData.title,
    badgeDescription: badgeData.description,
    badgeImageUrl: badgeData.badge_image_url,
    xpReward: badgeData.xp_reward,
    category: badgeData.category
  }
};
```

---

## 📊 Structure du Workflow N8N

```
Webhook (reçoit format Supabase)
  ↓
Function Node (transforme en format personnalisé)
  ↓
Supabase Node (récupère email/user ou badge details)
  ↓
Function Node (combine les données)
  ↓
Switch Node (emailType)
  ├─→ level-up → Template → SMTP/Telegram
  ├─→ achievement-unlocked → Template → SMTP/Telegram
  └─→ lesson-completed → Template → SMTP/Telegram
```

---

## 🧪 Tester

### Test Manuel

1. Dans Supabase Dashboard → Database → Webhooks
2. Cliquez sur votre webhook
3. Cliquez sur **"Test webhook"**
4. Vérifiez dans N8N (Executions) que le format est bien reçu
5. Vérifiez que le Function Node transforme correctement

### Test avec Données Réelles

1. Déclenchez un événement (ex: compléter une leçon)
2. Vérifiez dans N8N que :
   - Le webhook reçoit le format Supabase
   - Le Function Node transforme correctement
   - Les données arrivent au Switch Node
   - L'email/Telegram est envoyé

---

## 💡 Alternative : SQL Triggers (Plus de Contrôle)

Si vous voulez **personnaliser le body** avant l'envoi, utilisez les **SQL Triggers** avec `pg_net` :

Voir le fichier `supabase-triggers-email.sql` pour les exemples complets.

**Avantages** :
- ✅ Contrôle total sur le format JSON
- ✅ Peut inclure email directement
- ✅ Peut joindre des données de tables liées

**Inconvénients** :
- ⚠️ Plus complexe (SQL)
- ⚠️ Maintenance plus difficile

---

## ✅ Checklist

- [ ] Webhook Supabase créé (sans body, Supabase l'envoie automatiquement)
- [ ] Function Node ajouté pour transformer le format
- [ ] Supabase Node ajouté pour récupérer données manquantes (si nécessaire)
- [ ] Function Node pour combiner les données
- [ ] Testé avec format Supabase réel
- [ ] Vérifié que la transformation fonctionne
- [ ] Email/Telegram envoyé correctement

---

## 🎯 Résumé

1. **Supabase envoie automatiquement** un format JSON standardisé
2. **Vous ne pouvez pas** personnaliser le body dans le Dashboard
3. **Solution** : Transformer dans N8N avec un Function Node
4. **Alternative** : Utiliser SQL Triggers si vous voulez plus de contrôle

Le Function Node est la clé pour transformer le format Supabase en votre format personnalisé ! 🔄
