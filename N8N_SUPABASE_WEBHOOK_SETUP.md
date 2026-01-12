# 🔗 N8N + Supabase Webhooks - Solution Plus Simple

## 🎯 Pourquoi c'est Plus Simple

Au lieu de créer des **Database Triggers SQL** qui appellent N8N, vous pouvez utiliser :

1. ✅ **Supabase Webhooks** → N8N (Realtime)
2. ✅ **Supabase Node dans N8N** → Écouter les changements
3. ✅ **Supabase Database Webhooks** → Déclencher N8N automatiquement

---

## 🚀 Option 1 : Supabase Database Webhooks (RECOMMANDÉ) ⭐

### Comment ça marche

Supabase peut envoyer un **webhook HTTP** à N8N quand un événement se produit dans la base de données.

**Avantages** :
- ✅ **Pas besoin de SQL triggers** - Configuration dans Supabase Dashboard
- ✅ **Interface visuelle** - Plus facile à gérer
- ✅ **Gestion des erreurs** - Supabase retry automatiquement
- ✅ **Logs intégrés** - Voir tous les webhooks envoyés

### Setup (5 minutes)

#### 1. Dans Supabase Dashboard

1. Allez dans **Database** → **Webhooks**
2. Cliquez sur **"Create a new webhook"**
3. Configurez :

**Pour "Level Up"** :
- **Name**: `level-up-notification`
- **Table**: `profiles`
- **Events**: `UPDATE`
- **HTTP Request**:
  - **URL**: `https://your-instance.n8n.cloud/webhook/email` (votre webhook N8N)
  - **Method**: `POST`
  - **Headers**: 
    ```json
    {
      "Content-Type": "application/json"
    }
    ```
  - **Body**:
    ```json
    {
      "emailType": "level-up",
      "email": "{{user.email}}",
      "userName": "{{user.full_name}}",
      "oldLevel": "{{old.level}}",
      "newLevel": "{{new.level}}",
      "totalXP": "{{new.current_xp}}"
    }
    ```

**Pour "Achievement Unlocked"** :
- **Name**: `achievement-unlocked-notification`
- **Table**: `user_badges`
- **Events**: `INSERT`
- **HTTP Request**:
  - **URL**: `https://your-instance.n8n.cloud/webhook/email`
  - **Method**: `POST`
  - **Body**:
    ```json
    {
      "emailType": "achievement-unlocked",
      "email": "{{user.email}}",
      "userName": "{{user.full_name}}",
      "badgeTitle": "{{badge.title}}",
      "badgeDescription": "{{badge.description}}",
      "xpReward": "{{badge.xp_reward}}"
    }
    ```

**Pour "Lesson Completed"** :
- **Name**: `lesson-completed-notification`
- **Table**: `user_lesson_progress`
- **Events**: `UPDATE`
- **Filter**: `is_completed = true`
- **HTTP Request**:
  - **URL**: `https://your-instance.n8n.cloud/webhook/email`
  - **Body**:
    ```json
    {
      "emailType": "lesson-completed",
      "email": "{{user.email}}",
      "userName": "{{user.full_name}}",
      "lessonTitle": "{{lesson.title}}",
      "courseName": "{{course.title}}",
      "xpEarned": "{{xp_log.xp_earned}}"
    }
    ```

#### 2. Dans N8N

Votre workflow existant fonctionne déjà ! Le webhook N8N recevra les données de Supabase.

---

## 🔄 Option 2 : Supabase Node dans N8N (Realtime)

### Comment ça marche

N8N peut **écouter en temps réel** les changements dans Supabase avec le **Supabase Node**.

**Avantages** :
- ✅ **Temps réel** - Pas de délai
- ✅ **Pas de webhooks Supabase** - Tout dans N8N
- ✅ **Filtres avancés** - Conditions complexes

### Setup

1. Dans N8N, ajoutez un **Supabase Node**
2. Configurez :
   - **Credential**: Créez une credential Supabase avec votre URL et Service Role Key
   - **Operation**: "Listen to Database Changes"
   - **Table**: `profiles`
   - **Event**: `UPDATE`
   - **Filter**: `level > old.level` (via Function Node après)

3. Ajoutez un **Function Node** pour filtrer :

```javascript
const data = $input.item.json;

// Vérifier si level a augmenté
if (data.new.level > data.old.level) {
  return {
    json: {
      emailType: 'level-up',
      email: data.new.email, // À récupérer depuis auth.users
      userName: data.new.full_name,
      oldLevel: data.old.level,
      newLevel: data.new.level,
      totalXP: data.new.current_xp
    }
  };
}

return null; // Skip si pas de level up
```

4. Connectez au reste de votre workflow (templates → SMTP)

**Limitation** : Le Supabase Node doit être **toujours actif** (workflow en mode "Active" en permanence).

---

## 🆚 Comparaison des Options

| Critère | Database Webhooks (Supabase) | Supabase Node (N8N) | SQL Triggers |
|---------|------------------------------|---------------------|--------------|
| **Simplicité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Setup** | 5 min (Dashboard) | 15 min | 30 min (SQL) |
| **Maintenance** | Facile (Dashboard) | Facile | Complexe (SQL) |
| **Temps réel** | ✅ Oui | ✅ Oui | ✅ Oui |
| **Filtres** | Basiques | Avancés | Très avancés |
| **Logs** | Supabase Dashboard | N8N Executions | Database logs |
| **Coût** | Gratuit | Gratuit | Gratuit |

---

## 🎯 Recommandation : Database Webhooks Supabase ⭐

**Pourquoi** :
- ✅ **Le plus simple** - Configuration visuelle
- ✅ **Pas de code SQL** - Tout dans le Dashboard
- ✅ **Gestion centralisée** - Voir tous les webhooks au même endroit
- ✅ **Retry automatique** - Supabase gère les erreurs
- ✅ **Logs intégrés** - Voir ce qui a été envoyé

---

## 📋 Setup Complet avec Database Webhooks

### Étape 1 : Créer les Webhooks dans Supabase

Pour chaque événement, créez un webhook :

1. **Level Up** (`profiles` UPDATE, `level` changed)
2. **Achievement Unlocked** (`user_badges` INSERT)
3. **Lesson Completed** (`user_lesson_progress` UPDATE, `is_completed = true`)
4. **Course Completed** (toutes les leçons complétées)
5. **XP Milestone** (`profiles` UPDATE, `current_xp` reached milestone)

### Étape 2 : Configurer le Body du Webhook

**Template Supabase** :
```json
{
  "emailType": "level-up",
  "userId": "{{new.id}}",
  "oldLevel": "{{old.level}}",
  "newLevel": "{{new.level}}",
  "totalXP": "{{new.current_xp}}"
}
```

**Note** : Supabase peut accéder à `{{new}}` et `{{old}}` pour les UPDATE.

### Étape 3 : Récupérer Email et Name dans N8N

Dans N8N, après avoir reçu le webhook, ajoutez un **Supabase Node** pour récupérer les infos utilisateur :

```javascript
// Function Node : Enrich with User Data
const webhookData = $input.item.json;

// Le webhook Supabase envoie userId, mais pas email
// On doit récupérer depuis Supabase

return {
  json: {
    ...webhookData,
    // email et userName seront récupérés par le Supabase Node suivant
  }
};
```

Puis ajoutez un **Supabase Node** :
- **Operation**: "Get"
- **Table**: `profiles`
- **Where**: `id = {{ $json.userId }}`
- **Select**: `email, full_name`

Puis un **Function Node** pour combiner :
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
    totalXP: webhookData.totalXP
  }
};
```

---

## 🔧 Alternative : Inclure Email dans le Webhook Supabase

**Problème** : Supabase Webhooks n'ont pas accès direct à `auth.users.email`.

**Solution** : Stocker l'email dans `profiles.email` (recommandé) ou utiliser une **Database Function** :

```sql
-- Créer une fonction pour récupérer l'email
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

Puis dans le webhook body :
```json
{
  "email": "{{get_user_email(new.id)}}"
}
```

**OU plus simple** : Stocker `email` dans `profiles` lors de l'inscription (déjà fait probablement).

---

## ✅ Checklist Setup

- [ ] Webhook N8N créé et activé
- [ ] Webhooks Supabase créés pour chaque événement
- [ ] Body des webhooks configuré avec les bonnes variables
- [ ] Testé avec un événement réel (ex: level up)
- [ ] Vérifié que les emails arrivent
- [ ] Configuré Telegram (optionnel)

---

## 🎯 Workflow Final dans N8N

```
Supabase Webhook → Function (enrich data) → Supabase Node (get user) 
  → Function (combine) → Switch (emailType) → Templates → SMTP/Telegram
```

**OU plus simple** si email est dans profiles :

```
Supabase Webhook → Switch (emailType) → Templates → SMTP/Telegram
```

---

## 💡 Avantages de cette Approche

1. ✅ **Pas de SQL triggers** - Tout dans Supabase Dashboard
2. ✅ **Interface visuelle** - Facile à modifier
3. ✅ **Logs centralisés** - Voir tous les webhooks dans Supabase
4. ✅ **Retry automatique** - Supabase gère les échecs
5. ✅ **Test facile** - Tester depuis Supabase Dashboard

---

C'est effectivement **beaucoup plus simple** que les SQL triggers ! 🚀

Souhaitez-vous que je vous aide à configurer les webhooks Supabase pour chaque événement ?
