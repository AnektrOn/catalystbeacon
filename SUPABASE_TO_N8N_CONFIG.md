# 🔗 Configuration Supabase → N8N Webhook

## 📋 Votre Webhook N8N

**URL de test** : `https://noteautomation.app.n8n.cloud/webhook-test/48997b66-68a2-49a3-ac02-3bd42b9bba5b`

**URL de production** : `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`
*(Enlevez `/webhook-test/` pour la production)*

---

## 🚀 Configuration dans Supabase Dashboard

### Étape 1 : Accéder aux Database Webhooks

1. Allez dans votre **Supabase Dashboard**
2. Cliquez sur **Database** dans le menu de gauche
3. Cliquez sur **Webhooks** (dans le sous-menu)
4. Cliquez sur **"Create a new webhook"**

---

## 📧 Exemple 1 : Level Up Notification

### Configuration du Webhook

**Name** : `level-up-to-n8n`

**Table** : `profiles`

**Events** : 
- ✅ `UPDATE` (cocher)

**HTTP Request** :
- **URL** : `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`
- **Method** : `POST`
- **Headers** :
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

**Body (JSON)** : 
⚠️ **IMPORTANT** : Supabase envoie automatiquement un format JSON standardisé. Vous **ne pouvez pas** personnaliser le body dans le Dashboard.

Supabase enverra automatiquement :
```json
{
  "type": "UPDATE",
  "table": "profiles",
  "schema": "public",
  "record": { /* nouvelles valeurs */ },
  "old_record": { /* anciennes valeurs */ }
}
```

**Solution** : Transformer ce format dans N8N avec un Function Node (voir guide ci-dessous).

**Filter (Optionnel)** :
Si vous voulez seulement déclencher quand le level augmente :
```sql
new.level > old.level
```

---

## 🏆 Exemple 2 : Achievement Unlocked

### Configuration du Webhook

**Name** : `achievement-unlocked-to-n8n`

**Table** : `user_badges`

**Events** : 
- ✅ `INSERT` (cocher)

**HTTP Request** :
- **URL** : `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`
- **Method** : `POST`
- **Headers** :
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

**Body (JSON)** :
```json
{
  "emailType": "achievement-unlocked",
  "userId": "{{new.user_id}}",
  "badgeId": "{{new.badge_id}}"
}
```

**Note** : Vous devrez récupérer les détails du badge dans N8N avec un Supabase Node.

---

## ✅ Exemple 3 : Lesson Completed

### Configuration du Webhook

**Name** : `lesson-completed-to-n8n`

**Table** : `user_lesson_progress`

**Events** : 
- ✅ `UPDATE` (cocher)

**HTTP Request** :
- **URL** : `https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b`
- **Method** : `POST`
- **Headers** :
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

**Body (JSON)** :
```json
{
  "emailType": "lesson-completed",
  "userId": "{{new.user_id}}",
  "courseId": "{{new.course_id}}",
  "chapterNumber": "{{new.chapter_number}}",
  "lessonNumber": "{{new.lesson_number}}",
  "isCompleted": "{{new.is_completed}}"
}
```

**Filter** :
```sql
new.is_completed = true AND (old.is_completed IS NULL OR old.is_completed = false)
```

---

## 🔄 Dans N8N : Récupérer les Données Utilisateur

### Problème

Supabase envoie `userId`, mais pas `email` ni `userName` directement.

### Solution : Ajouter un Supabase Node dans N8N

Après avoir reçu le webhook, ajoutez :

1. **Supabase Node** :
   - **Operation** : `Get`
   - **Table** : `profiles`
   - **Where** : `id = {{ $json.userId }}`
   - **Select** : `email, full_name, current_xp, level`

2. **Function Node** pour combiner les données :

```javascript
const webhookData = $('Webhook').item.json;
const profileData = $input.item.json;

return {
  json: {
    emailType: webhookData.emailType,
    email: profileData.email,
    userName: profileData.full_name || 'there',
    oldLevel: webhookData.oldLevel,
    newLevel: webhookData.newLevel,
    totalXP: profileData.current_xp || webhookData.totalXP
  }
};
```

3. Continuez avec votre **Switch Node** → **Templates** → **SMTP/Telegram**

---

## 🧪 Tester le Webhook

### Test Manuel dans Supabase

1. Dans Supabase Dashboard, allez dans **Database** → **Webhooks**
2. Cliquez sur votre webhook
3. Cliquez sur **"Test webhook"**
4. Vérifiez dans N8N (Executions) que la requête est reçue

### Test avec Données Réelles

1. Dans votre app, déclenchez un événement (ex: compléter une leçon)
2. Vérifiez dans N8N (Executions) que le webhook a été appelé
3. Vérifiez que l'email/Telegram a été envoyé

---

## 📊 Structure du Workflow N8N Final

```
Webhook (reçoit de Supabase)
  ↓
Supabase Node (get user profile)
  ↓
Function Node (combine data)
  ↓
Switch Node (emailType)
  ├─→ level-up → Template → SMTP/Telegram
  ├─→ achievement-unlocked → Template → SMTP/Telegram
  └─→ lesson-completed → Template → SMTP/Telegram
```

---

## 🔍 Variables Disponibles dans Supabase Webhooks

### Pour UPDATE Events

- `{{new.field}}` - Nouvelle valeur
- `{{old.field}}` - Ancienne valeur
- `{{new.id}}` - ID de la ligne

### Pour INSERT Events

- `{{new.field}}` - Nouvelle valeur
- `{{new.id}}` - ID de la ligne

### Pour DELETE Events

- `{{old.field}}` - Valeur supprimée
- `{{old.id}}` - ID de la ligne

---

## ⚠️ Points Importants

### 1. Email dans Profiles

**Problème** : Supabase Webhooks n'ont pas accès direct à `auth.users.email`.

**Solutions** :

**Option A** : Stocker l'email dans `profiles.email` (recommandé)
- Lors de l'inscription, copiez l'email dans `profiles`
- Le webhook peut alors utiliser `{{new.email}}`

**Option B** : Récupérer dans N8N
- Le webhook envoie `userId`
- N8N fait un GET sur `profiles` pour récupérer l'email

### 2. Relations (Badges, Lessons, etc.)

Si vous avez besoin de données de tables liées (ex: badge title), vous avez deux options :

**Option A** : Inclure dans le webhook body (si possible)
```json
{
  "badgeTitle": "{{badge.title}}"
}
```

**Option B** : Récupérer dans N8N avec Supabase Node
- Après avoir reçu le webhook
- Faire un GET sur la table `badges` avec `badge_id`

### 3. URL du Webhook

- **Test** : Utilisez `/webhook-test/` pour tester
- **Production** : Utilisez `/webhook/` (sans `-test`)

---

## ✅ Checklist

- [ ] Webhook N8N créé et activé
- [ ] URL du webhook copiée (sans `/webhook-test/` pour production)
- [ ] Webhooks Supabase créés pour chaque événement
- [ ] Body configuré avec les bonnes variables `{{new.field}}`
- [ ] Headers configurés (`Content-Type: application/json`)
- [ ] Filters ajoutés si nécessaire
- [ ] Testé manuellement depuis Supabase
- [ ] Testé avec données réelles
- [ ] N8N workflow configuré pour récupérer user data
- [ ] Emails/Telegram fonctionnent

---

## 🎯 Prochaines Étapes

1. **Créer les webhooks Supabase** pour chaque événement
2. **Tester** avec un événement réel
3. **Vérifier** dans N8N que les données arrivent correctement
4. **Ajuster** les templates si nécessaire

---

Besoin d'aide pour configurer un webhook spécifique ? Dites-moi lequel !
