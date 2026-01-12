# Analyse du Flow Mail - Changements de Plan d'Abonnement

## 📋 Vue d'ensemble du Flow Mail

### 1. **Déclenchement des Emails**

Les emails sont déclenchés dans plusieurs scénarios liés aux abonnements Stripe :

#### A. **Webhook Stripe → Server.js**
- **Événement**: `customer.subscription.updated`
- **Handler**: `handleSubscriptionUpdate()` (ligne 1016)
- **Action**: Met à jour le profil utilisateur et envoie un email si le rôle change

#### B. **Webhook Stripe → Server.js**
- **Événement**: `customer.subscription.deleted`
- **Handler**: `handleSubscriptionDeleted()` (ligne 1104)
- **Action**: Downgrade vers Free et envoie un email de cancellation

### 2. **Flow Complet d'un Changement de Plan**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Stripe envoie webhook: customer.subscription.updated     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. server.js reçoit le webhook                               │
│    → handleSubscriptionUpdate(subscription)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Récupération du profil utilisateur                        │
│    → SELECT id, role, email, full_name FROM profiles         │
│      WHERE stripe_customer_id = customerId                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Détermination du nouveau rôle                             │
│    → newRole = getRoleFromPriceId(priceId)                   │
│    → oldRole = profile.role                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Préparation de la mise à jour                             │
│    → Si oldRole !== 'Admin': updateData.role = newRole       │
│    → Sinon: on préserve le rôle Admin                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Mise à jour de la base de données                         │
│    → UPDATE profiles SET ... WHERE id = profile.id          │
│    → Retry logic (3 tentatives)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Envoi de l'email (SI rôle changé)                         │
│    → if (oldRole !== newRole && profile.email)               │
│    → sendEmailViaSupabase('role-change', {...})              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. server.js → Supabase Edge Function                        │
│    → POST /functions/v1/send-email                           │
│    → Headers: Authorization: Bearer SERVICE_ROLE_KEY          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Edge Function: send-email/index.ts                        │
│    → Génère le template HTML (getRoleChangeTemplate)          │
│    → Insère dans email_queue (table de queue)                │
│    → Retourne success                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. Process Email Queue (background)                        │
│     → process-email-queue Edge Function                      │
│     → Lit email_queue WHERE status = 'pending'               │
│     → Envoie via SMTP configuré dans Supabase                 │
│     → UPDATE email_queue SET status = 'sent'                 │
└─────────────────────────────────────────────────────────────┘
```

## 🐛 **BUG IDENTIFIÉ**

### **Problème dans `handleSubscriptionUpdate()`**

**Ligne 1089**: La condition pour envoyer l'email est incorrecte :

```javascript
// Send email if role changed
if (oldRole !== newRole && profile.email) {
  await sendEmailViaSupabase('role-change', {...})
}
```

### **Le Bug**

1. **Scénario problématique** :
   - Utilisateur avec rôle `Admin` (oldRole = 'Admin')
   - Subscription change vers un plan Teacher/Student (newRole = 'Teacher')
   - `oldRole !== newRole` = **TRUE** ✅
   - Mais on **NE CHANGE PAS** le rôle dans la DB (ligne 1054-1059)
   - **Résultat**: Email envoyé alors que le rôle n'a PAS changé! ❌

2. **Pourquoi c'est un problème** :
   - L'utilisateur Admin reçoit un email disant "Votre rôle a changé de Admin à Teacher"
   - Mais son rôle reste Admin dans la base de données
   - Confusion et incohérence

### **Solution**

Il faut vérifier si le rôle a **réellement été changé dans la DB**, pas seulement comparer oldRole et newRole.

**Correction proposée** :

```javascript
// Send email if role actually changed in DB
// Only send if user is NOT Admin (because Admin role is preserved)
if (oldRole !== 'Admin' && oldRole !== newRole && profile.email) {
  try {
    await sendEmailViaSupabase('role-change', {
      email: profile.email,
      userName: profile.full_name || 'there',
      oldRole: oldRole,
      newRole: newRole
    })
  } catch (emailError) {
    console.error('Error sending role change email:', emailError)
  }
}
```

**OU mieux encore**, vérifier le résultat de la mise à jour :

```javascript
// Get the actual role after update
const updatedRole = updateResult?.[0]?.role || oldRole

// Send email only if role actually changed in DB
if (updatedRole !== oldRole && profile.email) {
  try {
    await sendEmailViaSupabase('role-change', {
      email: profile.email,
      userName: profile.full_name || 'there',
      oldRole: oldRole,
      newRole: updatedRole  // Use actual updated role
    })
  } catch (emailError) {
    console.error('Error sending role change email:', emailError)
  }
}
```

## 📊 **Autres Points d'Attention**

### 1. **Email Queue**
- Les emails sont d'abord insérés dans `email_queue` (table)
- Un processus background (`process-email-queue`) les envoie ensuite
- Si l'insertion échoue, l'email peut être perdu (mais il y a un fallback)

### 2. **Gestion des Erreurs**
- Les erreurs d'envoi d'email sont catchées mais ne bloquent pas le webhook
- C'est correct car on ne veut pas que l'email bloque la mise à jour du profil

### 3. **Timeout**
- Timeout de 5 secondes sur l'appel à l'Edge Function
- Si timeout, l'email est quand même inséré dans la queue (backup)

## ✅ **Recommandations**

1. **Corriger le bug** dans `handleSubscriptionUpdate()` (ligne 1089)
2. **Ajouter des logs** pour tracer les emails envoyés
3. **Vérifier** que le même bug n'existe pas dans `handleSubscriptionCreated()`
4. **Tester** avec un utilisateur Admin pour confirmer que l'email n'est pas envoyé
