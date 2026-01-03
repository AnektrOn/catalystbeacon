# 📧 Étape 1: Email de Confirmation d'Inscription (Sign Up)

## ✅ Ce qui a été fait

J'ai modifié le code pour envoyer automatiquement un email de bienvenue lors de l'inscription!

**Fichiers modifiés:**
- ✅ `src/contexts/AuthContext.jsx` - Fonction `signUp()` envoie maintenant un email
- ✅ `supabase/functions/send-email/index.ts` - Template d'email de bienvenue ajouté
- ✅ `src/services/emailService.js` - Méthode `sendSignUpConfirmation()` ajoutée

---

## 🔧 Configuration Requise

### Étape 1: Déployer la Fonction Edge Supabase

**Option A: Via Dashboard (Le Plus Simple)**

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions

2. **Vérifiez si `send-email` existe:**
   - Si elle existe → Cliquez dessus → "Deploy" pour mettre à jour
   - Si elle n'existe pas → Créez-la (voir ci-dessous)

3. **Créer/Mettre à jour la fonction:**
   - Ouvrez le fichier: `supabase/functions/send-email/index.ts`
   - **Copiez TOUT le contenu**
   - Dans Supabase Dashboard, collez dans l'éditeur
   - Cliquez sur **"Deploy"**

**Option B: Via Ligne de Commande**

```bash
supabase functions deploy send-email
```

---

### Étape 2: Configurer SMTP dans Supabase

1. **Allez sur:** https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/settings/auth

2. **Cliquez sur "SMTP Settings"**

3. **Activez "Enable Custom SMTP"** (bouton vert/ON)

4. **Remplissez avec Gmail:**

```
Host: smtp.gmail.com
Port: 587
Username: votre-email@gmail.com
Password: [mot de passe d'application - voir ci-dessous]
Sender Email: votre-email@gmail.com
Sender Name: The Human Catalyst University
```

**Pour obtenir le mot de passe d'application Gmail:**
1. Allez sur: https://myaccount.google.com/apppasswords
2. Sélectionnez "Mail" → "Other (Custom name)" → "Supabase"
3. Cliquez "Generate"
4. **Copiez le mot de passe** (16 caractères)
5. Collez-le dans Supabase

5. **Cliquez "Save"**

---

## 🧪 Tester l'Email d'Inscription

### Méthode 1: Créer un Nouveau Compte

1. **Allez sur votre application:**
   - https://app.humancatalystbeacon.com
   - Ou: http://localhost:3000

2. **Cliquez sur "Sign Up" ou "S'inscrire"**

3. **Remplissez le formulaire:**
   - Email (utilisez un email de test)
   - Mot de passe
   - Nom (optionnel)

4. **Cliquez sur "Sign Up"**

5. **Vérifiez votre email:**
   - Ouvrez votre boîte email
   - **Vérifiez aussi le dossier "Spam"**
   - Vous devriez recevoir un email avec le sujet "🎉 Welcome to The Human Catalyst University!"

✅ **Si vous recevez l'email → Ça fonctionne!**

---

### Méthode 2: Vérifier les Logs

1. **Ouvrez la console** du navigateur (F12)

2. **Créez un compte**

3. **Regardez les logs:**
   - Cherchez: "Sign-up confirmation email sent to:"
   - Ou: "Sign-up email send failed"

---

## 📋 Checklist

- [ ] Fonction `send-email` déployée dans Supabase
- [ ] SMTP configuré dans Supabase Dashboard
- [ ] Testé: Création d'un compte → Email reçu

---

## 🎯 Ce que l'Email Contient

L'email de bienvenue contient:
- ✅ Message de bienvenue personnalisé
- ✅ Email du compte créé
- ✅ Date de création
- ✅ Bouton "Go to Dashboard"
- ✅ Liste de ce qu'on peut faire ensuite

---

## ❓ Si Ça Ne Fonctionne Pas

### Vérification 1: La fonction est-elle déployée?
- Allez sur: Supabase Dashboard → Functions
- Vérifiez que `send-email` existe et est déployée

### Vérification 2: SMTP est-il configuré?
- Settings → Auth → SMTP Settings
- Vérifiez que "Enable Custom SMTP" est activé

### Vérification 3: Les logs montrent quoi?
- Console du navigateur (F12)
- Cherchez les erreurs liées à l'email

### Vérification 4: La table email_queue existe-t-elle?
- Allez sur: Supabase Dashboard → Table Editor
- Cherchez `email_queue`
- Si elle n'existe pas → Exécutez `supabase/migrations/create_email_system.sql`

---

## 🎉 Une Fois que Ça Fonctionne

Dites-moi et on passera à l'email suivant (confirmation de paiement)! 🚀

