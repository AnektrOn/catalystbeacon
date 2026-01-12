# 🎯 Function Node N8N - Détecter Tous les Événements Profiles

## 🎯 Concept

Au lieu de créer plusieurs webhooks, on utilise **UN SEUL webhook** qui écoute tous les UPDATE sur `profiles`, et on détecte le type d'événement dans N8N.

---

## 📝 Code Function Node Complet

### Function Node : "Detect Event Type"

Placez ce node **juste après le Webhook node** :

```javascript
// Récupérer les données du webhook Supabase
const supabaseData = $input.item.json.body;

// Vérifier que c'est sur profiles
if (supabaseData.table !== 'profiles') {
  return null; // Skip si ce n'est pas sur profiles
}

const newRecord = supabaseData.record;
const oldRecord = supabaseData.old_record || {};

// ============================================
// 0. DÉTECTER NOUVEL UTILISATEUR (INSERT)
// ============================================
if (supabaseData.type === 'INSERT') {
  return {
    json: {
      emailType: 'new-user',
      email: newRecord.email || 'unknown@example.com',
      userName: newRecord.full_name || 'there',
      userId: newRecord.id,
      role: newRecord.role || 'Free',
      createdAt: newRecord.created_at,
      hasCompletedOnboarding: newRecord.has_completed_onboarding || false
    }
  };
}

// Vérifier que c'est un UPDATE (pour les événements suivants)
if (supabaseData.type !== 'UPDATE') {
  return null;
}

// ============================================
// 1. DÉTECTER LEVEL UP
// ============================================
if (newRecord.level > (oldRecord.level || 0)) {
  return {
    json: {
      emailType: 'level-up',
      email: newRecord.email || 'unknown@example.com',
      userName: newRecord.full_name || 'there',
      oldLevel: oldRecord.level || 0,
      newLevel: newRecord.level,
      totalXP: newRecord.current_xp || 0,
      userId: newRecord.id,
      rank: newRecord.rank || 'New Catalyst'
    }
  };
}

// ============================================
// 2. DÉTECTER XP MILESTONE
// ============================================
const milestones = [1000, 5000, 10000, 25000, 50000, 100000];
const oldXP = oldRecord.current_xp || 0;
const newXP = newRecord.current_xp || 0;

for (const milestone of milestones) {
  if (oldXP < milestone && newXP >= milestone) {
    return {
      json: {
        emailType: 'xp-milestone',
        email: newRecord.email || 'unknown@example.com',
        userName: newRecord.full_name || 'there',
        milestone: milestone,
        totalXP: newXP,
        userId: newRecord.id,
        rank: newRecord.rank || 'New Catalyst'
      }
    };
  }
}

// ============================================
// 3. DÉTECTER STREAK MILESTONE
// ============================================
const streakMilestones = [7, 30, 100, 365];
const oldStreak = oldRecord.completion_streak || 0;
const newStreak = newRecord.completion_streak || 0;

if (streakMilestones.includes(newStreak) && newStreak > oldStreak) {
  return {
    json: {
      emailType: 'streak-milestone',
      email: newRecord.email || 'unknown@example.com',
      userName: newRecord.full_name || 'there',
      streakDays: newStreak,
      oldStreak: oldStreak,
      userId: newRecord.id,
      rank: newRecord.rank || 'New Catalyst'
    }
  };
}

// ============================================
// 4. DÉTECTER ROLE CHANGE
// ============================================
if (newRecord.role !== oldRecord.role && oldRecord.role !== null) {
  return {
    json: {
      emailType: 'role-change',
      email: newRecord.email || 'unknown@example.com',
      userName: newRecord.full_name || 'there',
      oldRole: oldRecord.role || 'Free',
      newRole: newRecord.role || 'Free',
      userId: newRecord.id
    }
  };
}

// ============================================
// 5. DÉTECTER SUBSCRIPTION ACTIVATED
// ============================================
if (
  newRecord.subscription_status === 'active' &&
  (oldRecord.subscription_status === null || oldRecord.subscription_status !== 'active')
) {
  return {
    json: {
      emailType: 'subscription-activated',
      email: newRecord.email || 'unknown@example.com',
      userName: newRecord.full_name || 'there',
      subscriptionStatus: newRecord.subscription_status,
      subscriptionId: newRecord.subscription_id || null,
      role: newRecord.role || 'Free',
      userId: newRecord.id
    }
  };
}

// ============================================
// 6. DÉTECTER SUBSCRIPTION CANCELLED
// ============================================
if (
  oldRecord.subscription_status === 'active' &&
  newRecord.subscription_status !== 'active' &&
  newRecord.subscription_status !== null
) {
  return {
    json: {
      emailType: 'subscription-cancelled',
      email: newRecord.email || 'unknown@example.com',
      userName: newRecord.full_name || 'there',
      oldStatus: oldRecord.subscription_status,
      newStatus: newRecord.subscription_status,
      userId: newRecord.id
    }
  };
}

// ============================================
// 7. DÉTECTER ONBOARDING COMPLETED
// ============================================
if (
  newRecord.has_completed_onboarding === true &&
  (oldRecord.has_completed_onboarding === false || oldRecord.has_completed_onboarding === null)
) {
  return {
    json: {
      emailType: 'onboarding-completed',
      email: newRecord.email || 'unknown@example.com',
      userName: newRecord.full_name || 'there',
      userId: newRecord.id,
      onboardingCompletedAt: newRecord.onboarding_completed_at
    }
  };
}

// Si aucun événement détecté, retourner null (sera filtré)
return null;
```

---

## 🔀 Switch Node - Router selon emailType

Après le Function Node, ajoutez un **Switch Node** :

### Configuration

1. **Mode** : `Rules`
2. **Value** : `{{ $json.emailType }}`
3. **Rules** :
   - **Rule 1** : `level-up`
   - **Rule 2** : `xp-milestone`
   - **Rule 3** : `streak-milestone`
   - **Rule 4** : `role-change`
   - **Rule 5** : `subscription-activated`
   - **Rule 6** : `subscription-cancelled`
   - **Rule 7** : `onboarding-completed`

---

## 📊 Structure du Workflow

```
┌─────────────┐
│   Webhook   │ ← Reçoit TOUS les UPDATE sur profiles
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Function   │ ← Détecte le type d'événement
│   Node      │    (level-up, xp-milestone, etc.)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Switch    │ ← Route selon emailType
│    Node     │
└──────┬──────┘
       │
       ├─→ level-up ──→ SMTP (template level-up)
       ├─→ xp-milestone ──→ SMTP (template xp-milestone)
       ├─→ streak-milestone ──→ SMTP (template streak)
       ├─→ role-change ──→ SMTP (template role-change)
       ├─→ subscription-activated ──→ SMTP (template subscription)
       ├─→ subscription-cancelled ──→ SMTP (template cancellation)
       └─→ onboarding-completed ──→ SMTP (template onboarding)
```

---

## ✅ Avantages de Cette Approche

1. **Un seul webhook** à maintenir
2. **Un seul trigger** dans Supabase
3. **Détection centralisée** dans N8N
4. **Facile à étendre** : ajoutez une nouvelle détection dans le Function Node
5. **Moins de code** dans Supabase
6. **Plus flexible** : changez la logique sans modifier les triggers

---

## 🧪 Tester

### Test 1 : Level Up

```sql
UPDATE profiles 
SET level = level + 1 
WHERE id = 'USER_ID';
```

**Résultat attendu** : `emailType: 'level-up'`

---

### Test 2 : XP Milestone

```sql
UPDATE profiles 
SET current_xp = 5000 
WHERE id = 'USER_ID' AND current_xp < 5000;
```

**Résultat attendu** : `emailType: 'xp-milestone', milestone: 5000`

---

### Test 3 : Streak Milestone

```sql
UPDATE profiles 
SET completion_streak = 7 
WHERE id = 'USER_ID' AND completion_streak < 7;
```

**Résultat attendu** : `emailType: 'streak-milestone', streakDays: 7`

---

### Test 4 : Role Change

```sql
UPDATE profiles 
SET role = 'Student' 
WHERE id = 'USER_ID' AND role = 'Free';
```

**Résultat attendu** : `emailType: 'role-change', oldRole: 'Free', newRole: 'Student'`

---

## 📋 Checklist

- [ ] Trigger unique créé avec `create-single-webhook-profiles.sql`
- [ ] Anciens triggers supprimés
- [ ] Function Node "Detect Event Type" ajouté dans N8N
- [ ] Switch Node configuré avec toutes les règles
- [ ] Templates email créés pour chaque type
- [ ] Testé avec différents UPDATE
- [ ] Vérifié que chaque événement est correctement détecté

---

## 🚀 Prochaines Étapes

1. **Exécutez** `create-single-webhook-profiles.sql` dans Supabase
2. **Ajoutez** le Function Node dans N8N avec le code ci-dessus
3. **Configurez** le Switch Node avec toutes les règles
4. **Testez** avec différents UPDATE
5. **Créez** les templates email pour chaque type

---

## 💡 Note

**Priorité de détection** : Le code détecte dans cet ordre :
1. Level up (priorité la plus haute)
2. XP milestone
3. Streak milestone
4. Role change
5. Subscription activated
6. Subscription cancelled
7. Onboarding completed

Si plusieurs événements se produisent en même temps (ex: level up + XP milestone), seul le premier sera détecté. Si vous avez besoin de détecter plusieurs événements simultanés, modifiez le code pour retourner un tableau d'événements.
