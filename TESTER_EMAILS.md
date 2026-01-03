# 🧪 Tester si les Emails Fonctionnent

## Test Rapide (2 minutes)

### 1. Testez en vous connectant

1. Allez sur votre application
2. **Connectez-vous** avec votre compte
3. **Vérifiez votre boîte email** (et le dossier spam)
4. Vous devriez recevoir un email de confirmation de connexion

✅ **Si vous recevez l'email** → Tout fonctionne! 🎉

❌ **Si vous ne recevez pas l'email** → Continuez ci-dessous

---

## Vérifications si ça ne fonctionne pas

### Vérification 1: La table existe-t-elle?

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/editor
2. Cherchez la table `email_queue` dans la liste
3. Si elle n'existe pas → Exécutez `supabase/migrations/create_email_system.sql`

### Vérification 2: La fonction est-elle déployée?

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
2. Cherchez la fonction `send-email`
3. Si elle n'existe pas → Créez-la avec le contenu de `supabase/functions/send-email/index.ts`

### Vérification 3: SMTP est-il configuré?

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/settings/auth
2. Cliquez sur **SMTP Settings**
3. Vérifiez que **"Enable Custom SMTP"** est activé (ON)
4. Vérifiez que tous les champs sont remplis

### Vérification 4: Les emails sont-ils dans la queue?

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/editor
2. Cliquez sur la table `email_queue`
3. Regardez les emails avec le statut `pending`
4. Si vous voyez des emails `pending` → Le problème est avec SMTP
5. Si vous ne voyez rien → Le problème est avec le code

---

## Test Manuel Direct

### Option 1: Via le Dashboard Supabase

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
2. Cliquez sur `send-email`
3. Cliquez sur **"Invoke"** (Invoquer)
4. Utilisez ce JSON:
```json
{
  "emailType": "sign-in",
  "email": "VOTRE_EMAIL@example.com",
  "userName": "Test",
  "loginTime": "2024-01-01 12:00:00"
}
```
5. Cliquez sur **"Invoke Function"**
6. Vérifiez votre email

### Option 2: Via votre application

1. Connectez-vous à votre application
2. Ouvrez la console du navigateur (F12)
3. Regardez s'il y a des erreurs
4. Les emails sont envoyés en arrière-plan, donc pas d'erreur visible = normal

---

## Diagnostic Rapide

**Dites-moi ce que vous voyez:**

1. ✅ Vous recevez des emails → **Tout fonctionne!**
2. ❌ Pas d'emails mais la table `email_queue` a des entrées `pending` → **Problème SMTP**
3. ❌ Pas d'emails et la table `email_queue` est vide → **Problème avec le code**
4. ❌ La table `email_queue` n'existe pas → **Migration non exécutée**

---

## Solution Rapide si Rien ne Fonctionne

Si rien ne fonctionne, dites-moi:
- Avez-vous configuré SMTP dans Supabase? (Oui/Non)
- La table `email_queue` existe-t-elle? (Oui/Non)
- La fonction `send-email` est-elle déployée? (Oui/Non)
- Recevez-vous des emails quand vous vous connectez? (Oui/Non)

Avec ces réponses, je peux vous aider à résoudre le problème exact! 🎯

