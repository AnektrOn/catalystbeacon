# 📧 Étape 1: Email de Confirmation de Connexion

## ✅ Le Code est Déjà en Place!

L'email de confirmation de connexion est **déjà intégré** dans votre code. Il s'envoie automatiquement quand un utilisateur se connecte.

**Fichier:** `src/contexts/AuthContext.jsx` - fonction `signIn()`

---

## 🔧 Étape 1: Déployer la Fonction Edge Supabase

### Option A: Via la Ligne de Commande (Recommandé)

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier votre projet
supabase link --project-ref mbffycgrqfeesfnhhcdm

# 4. Déployer la fonction
supabase functions deploy send-email
```

### Option B: Via le Dashboard Supabase (Plus Simple)

1. **Allez sur:** https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions

2. **Vérifiez si `send-email` existe:**
   - Si elle existe → C'est bon! ✅
   - Si elle n'existe pas → Continuez ci-dessous

3. **Créer la fonction:**
   - Cliquez sur **"Create a new function"**
   - Nommez-la: `send-email`
   - Ouvrez le fichier: `supabase/functions/send-email/index.ts`
   - **Copiez TOUT le contenu**
   - Collez dans l'éditeur Supabase
   - Cliquez sur **"Deploy"**

✅ **C'est fait pour cette étape!**

---

## 🔧 Étape 2: Configurer SMTP dans Supabase

1. **Allez sur:** https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/settings/auth

2. **Cliquez sur "SMTP Settings"** dans le menu de gauche

3. **Activez "Enable Custom SMTP"** (le bouton doit être vert/ON)

4. **Remplissez les champs:**

### Si vous utilisez Gmail:

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
2. Sélectionnez "Mail" et "Other (Custom name)"
3. Entrez "Supabase"
4. Cliquez "Generate"
5. **Copiez le mot de passe** (16 caractères)

### Si vous utilisez SendGrid (Alternative):

```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [votre clé API SendGrid]
Sender Email: [email vérifié dans SendGrid]
Sender Name: The Human Catalyst University
```

5. **Cliquez sur "Save"**

6. **Testez:**
   - En bas de la page, cliquez **"Send Test Email"**
   - Entrez votre email
   - Vérifiez votre boîte email (et le dossier spam)

✅ **Si vous recevez l'email de test → SMTP fonctionne!**

---

## 🧪 Étape 3: Tester l'Email de Connexion

1. **Déconnectez-vous** de votre application (si vous êtes connecté)

2. **Reconnectez-vous** avec votre compte

3. **Vérifiez votre boîte email** (et le dossier spam)

4. **Vous devriez recevoir un email** avec:
   - "Sign-in Confirmation" comme sujet
   - L'heure de connexion
   - Un bouton "Go to Dashboard"

✅ **Si vous recevez l'email → Ça fonctionne!**

---

## ❓ Si Ça Ne Fonctionne Pas

### Vérification 1: La fonction est-elle déployée?

- Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
- Vérifiez que `send-email` existe

### Vérification 2: SMTP est-il configuré?

- Allez sur: Settings → Auth → SMTP Settings
- Vérifiez que "Enable Custom SMTP" est activé
- Vérifiez que tous les champs sont remplis

### Vérification 3: Les logs montrent quoi?

Ouvrez la console du navigateur (F12) et regardez:
- Y a-t-il des erreurs?
- Voyez-vous "Sign-in email send failed"?

### Vérification 4: La table email_queue existe-t-elle?

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/editor
2. Cherchez la table `email_queue`
3. Si elle n'existe pas → Exécutez `supabase/migrations/create_email_system.sql`

---

## 📋 Checklist

- [ ] Fonction `send-email` déployée dans Supabase
- [ ] SMTP configuré dans Supabase Dashboard
- [ ] Email de test envoyé avec succès
- [ ] Testé: Déconnexion → Reconnexion → Email reçu

---

## 🎯 Prochaine Étape

Une fois que l'email de connexion fonctionne, on passera à l'email de confirmation de paiement!

Dites-moi quand vous avez terminé cette étape et on continue! 🚀

