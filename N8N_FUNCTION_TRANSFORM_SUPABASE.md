# 🔄 Transformer le Format Supabase dans N8N

## 🎯 Le Problème

Supabase envoie automatiquement ce format :
```json
{
  "type": "UPDATE",
  "table": "profiles",
  "record": { "level": 5, "current_xp": 5000, ... },
  "old_record": { "level": 4, ... }
}
```

Mais vous avez besoin de ce format pour vos templates :
```json
{
  "emailType": "level-up",
  "email": "user@example.com",
  "userName": "John",
  "oldLevel": 4,
  "newLevel": 5,
  "totalXP": 5000
}
```

## ✅ Solution : Function Node dans N8N

### Workflow

```
Webhook → Function (transform) → Supabase Node (get user) → Function (combine) → Switch → Templates
```

---

## 📝 Code Function Node Complet

### 1. Level Up Transformer

```javascript
const data = $input.item.json;

// Vérifier le type d'événement
if (data.type !== 'UPDATE' || data.table !== 'profiles') {
  return null; // Skip
}

const newLevel = data.record?.level;
const oldLevel = data.old_record?.level;

// Vérifier que level a augmenté
if (!newLevel || !oldLevel || newLevel <= oldLevel) {
  return null; // Skip
}

// Transformer en format personnalisé
return {
  json: {
    emailType: 'level-up',
    userId: data.record.id,
    oldLevel: oldLevel,
    newLevel: newLevel,
    totalXP: data.record.current_xp || 0,
    levelTitle: data.record.level_title || '',
    // Email et userName seront récupérés par Supabase Node suivant
    email: data.record.email || '', // Si email est dans profiles
    userName: data.record.full_name || 'there'
  }
};
```

### 2. Achievement Unlocked Transformer

```javascript
const data = $input.item.json;

if (data.type !== 'INSERT' || data.table !== 'user_badges') {
  return null;
}

return {
  json: {
    emailType: 'achievement-unlocked',
    userId: data.record.user_id,
    badgeId: data.record.badge_id,
    awardedAt: data.record.awarded_at
  }
};
```

### 3. Lesson Completed Transformer

```javascript
const data = $input.item.json;

if (data.type !== 'UPDATE' || data.table !== 'user_lesson_progress') {
  return null;
}

const isCompleted = data.record?.is_completed;
const wasCompleted = data.old_record?.is_completed;

// Vérifier que la leçon vient d'être complétée
if (!isCompleted || wasCompleted) {
  return null;
}

return {
  json: {
    emailType: 'lesson-completed',
    userId: data.record.user_id,
    courseId: data.record.course_id,
    chapterNumber: data.record.chapter_number,
    lessonNumber: data.record.lesson_number
  }
};
```

---

## 🔗 Combiner avec Supabase Node

### Après le Transformer, ajoutez Supabase Node

**Pour récupérer email/userName** :
- **Operation** : `Get`
- **Table** : `profiles`
- **Where** : `id = {{ $json.userId }}`
- **Select** : `email, full_name`

**Pour récupérer badge details** :
- **Operation** : `Get`
- **Table** : `badges`
- **Where** : `id = {{ $json.badgeId }}`
- **Select** : `title, description, badge_image_url, xp_reward, category`

### Function Node pour Combiner

```javascript
const transformedData = $('Function').item.json; // Données transformées
const supabaseData = $input.item.json; // Données depuis Supabase

// Combiner les données
const result = {
  ...transformedData,
  email: supabaseData.email || transformedData.email || '',
  userName: supabaseData.full_name || transformedData.userName || 'there'
};

// Pour achievement, ajouter badge details
if (transformedData.emailType === 'achievement-unlocked') {
  result.badgeTitle = supabaseData.title;
  result.badgeDescription = supabaseData.description;
  result.badgeImageUrl = supabaseData.badge_image_url;
  result.xpReward = supabaseData.xp_reward;
  result.category = supabaseData.category;
}

return { json: result };
```

---

## 🎯 Workflow Final Complet

```
1. Webhook Node
   ↓ (reçoit format Supabase)
   
2. Function Node - "Transform Supabase Format"
   ↓ (transforme en format personnalisé)
   
3. Supabase Node - "Get User Profile"
   ↓ (récupère email, full_name)
   
4. Function Node - "Combine Data"
   ↓ (combine tout)
   
5. Switch Node - "Route by emailType"
   ├─→ level-up → Template → SMTP/Telegram
   ├─→ achievement-unlocked → Template → SMTP/Telegram
   └─→ lesson-completed → Template → SMTP/Telegram
```

---

## ✅ Checklist

- [ ] Webhook Supabase créé (URL seulement, pas de body)
- [ ] Function Node "Transform" ajouté
- [ ] Supabase Node "Get User" ajouté (si email pas dans profiles)
- [ ] Function Node "Combine" ajouté
- [ ] Testé avec données réelles
- [ ] Vérifié que le format final est correct

---

C'est la solution ! Le Function Node transforme le format Supabase automatique en votre format personnalisé. 🚀
