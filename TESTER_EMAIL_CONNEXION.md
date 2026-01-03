# 🧪 Tester l'Email de Connexion - Guide Simple

## Comment Tester

### Méthode 1: Dans Votre Application (Le Plus Simple)

1. **Ouvrez votre application:**
   - Allez sur: https://app.humancatalystbeacon.com
   - Ou: http://localhost:3000 (en développement)

2. **Déconnectez-vous:**
   - Cliquez sur votre profil (en haut à droite)
   - Cliquez sur "Sign Out" ou "Déconnexion"

3. **Reconnectez-vous:**
   - Cliquez sur "Sign In" ou "Connexion"
   - Entrez votre email et mot de passe
   - Cliquez sur "Sign In"

4. **Vérifiez votre email:**
   - Ouvrez votre boîte email (Gmail, etc.)
   - **Vérifiez aussi le dossier "Spam" ou "Courrier indésirable"**
   - Vous devriez recevoir un email avec le sujet "Sign-in Confirmation"

✅ **Si vous recevez l'email → Ça fonctionne!**

---

## Vérifier si SMTP est Configuré

### Dans Supabase Dashboard:

1. **Allez sur:** https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/settings/auth

2. **Cliquez sur "SMTP Settings"** dans le menu de gauche

3. **Vérifiez:**
   - Est-ce que "Enable Custom SMTP" est activé? (bouton vert/ON)
   - Est-ce que tous les champs sont remplis?

### Si "Send Test Email" n'existe pas:

C'est normal! Supabase n'a pas toujours ce bouton. On peut tester directement avec l'application.

---

## Méthode Alternative: Tester Directement la Fonction

### Option 1: Via la Console du Navigateur

1. **Connectez-vous** à votre application
2. **Ouvrez la console** (F12)
3. **Exécutez ce code:**

```javascript
// Importer le service email
const { emailService } = await import('/src/services/emailService.js')

// Envoyer un email de test
await emailService.sendSignInConfirmation(
  'votre-email@gmail.com',
  'Votre Nom',
  new Date().toLocaleString(),
  null
)
```

4. **Vérifiez votre email**

### Option 2: Vérifier les Logs

1. **Ouvrez la console** du navigateur (F12)
2. **Reconnectez-vous**
3. **Regardez les logs:**
   - Cherchez: "Sign-in confirmation email sent to:"
   - Ou: "Sign-in email send failed"

---

## Vérifier que Tout est en Place

### 1. La fonction Edge existe-t-elle?

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
2. Cherchez `send-email` dans la liste
3. Si elle n'existe pas → Il faut la créer

### 2. SMTP est-il configuré?

1. Allez sur: Settings → Auth → SMTP Settings
2. Vérifiez que "Enable Custom SMTP" est **activé** (vert/ON)
3. Vérifiez que tous les champs sont remplis

### 3. La table email_queue existe-t-elle?

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/editor
2. Cherchez la table `email_queue`
3. Si elle n'existe pas → Exécutez le fichier SQL: `supabase/migrations/create_email_system.sql`

---

## Diagnostic

### Si vous ne recevez pas l'email:

1. **Vérifiez le dossier spam**
2. **Vérifiez la console du navigateur** (F12) pour les erreurs
3. **Vérifiez les logs Supabase:**
   - Edge Functions → `send-email` → Logs
4. **Vérifiez la table email_queue:**
   ```sql
   SELECT * FROM email_queue 
   WHERE email_type = 'sign-in' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

---

## Configuration SMTP Rapide (Gmail)

Si SMTP n'est pas encore configuré:

1. **Créez un mot de passe d'application Gmail:**
   - https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" → "Other" → "Supabase"
   - Copiez le mot de passe (16 caractères)

2. **Dans Supabase Dashboard:**
   - Settings → Auth → SMTP Settings
   - Activez "Enable Custom SMTP"
   - Remplissez:
     ```
     Host: smtp.gmail.com
     Port: 587
     Username: votre-email@gmail.com
     Password: [le mot de passe d'application]
     Sender Email: votre-email@gmail.com
     Sender Name: The Human Catalyst University
     ```
   - Cliquez "Save"

3. **Testez:**
   - Déconnectez-vous
   - Reconnectez-vous
   - Vérifiez votre email

---

## 🎯 Résumé Simple

**Pour tester:**
1. Déconnectez-vous de l'app
2. Reconnectez-vous
3. Vérifiez votre email (et spam)

**Pour configurer SMTP:**
1. Allez sur Supabase Dashboard → Settings → Auth → SMTP Settings
2. Activez "Enable Custom SMTP"
3. Remplissez avec Gmail (ou SendGrid)
4. Sauvegardez

C'est tout! 🚀

