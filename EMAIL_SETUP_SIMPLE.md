# 📧 Configuration Email - Guide Simple

## 🎯 Ce que vous devez faire (3 étapes simples)

### Étape 1: Configurer l'email dans Supabase

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm
2. Cliquez sur **Settings** (Paramètres) dans le menu de gauche
3. Cliquez sur **Auth** (Authentification)
4. Cliquez sur **SMTP Settings** (Paramètres SMTP)
5. Activez **"Enable Custom SMTP"** (Activer SMTP personnalisé)

**Vous avez besoin d'un service email. Options simples:**

**Option A - Gmail (Gratuit):**
- Host: `smtp.gmail.com`
- Port: `587`
- Username: votre email Gmail
- Password: [Générez un mot de passe d'application](https://myaccount.google.com/apppasswords)
- Sender Email: votre email Gmail
- Sender Name: `The Human Catalyst University`

**Option B - SendGrid (Gratuit jusqu'à 100 emails/jour):**
1. Créez un compte sur https://sendgrid.com
2. Créez une clé API
3. Utilisez les paramètres SMTP de SendGrid

### Étape 2: Créer la table dans la base de données

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/sql
2. Cliquez sur **"New Query"** (Nouvelle requête)
3. Ouvrez le fichier: `supabase/migrations/create_email_system.sql`
4. Copiez TOUT le contenu
5. Collez dans l'éditeur SQL
6. Cliquez sur **"Run"** (Exécuter)

✅ C'est fait! La table est créée.

### Étape 3: Déployer la fonction email

**Option A - Via la ligne de commande:**
```bash
# Installez Supabase CLI si pas déjà fait
npm install -g supabase

# Connectez-vous
supabase login

# Liez votre projet
supabase link --project-ref mbffycgrqfeesfnhhcdm

# Déployez la fonction
supabase functions deploy send-email
```

**Option B - Via le Dashboard (Plus simple):**
1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
2. Cliquez sur **"Create a new function"**
3. Nommez-la: `send-email`
4. Ouvrez le fichier: `supabase/functions/send-email/index.ts`
5. Copiez TOUT le contenu
6. Collez dans l'éditeur
7. Cliquez sur **"Deploy"** (Déployer)

✅ C'est fait! La fonction est déployée.

## 🧪 Tester

1. Connectez-vous à votre application
2. Vérifiez votre boîte email
3. Vous devriez recevoir un email de confirmation de connexion

## ❓ Problèmes courants

### "Je ne reçois pas d'emails"
- Vérifiez que SMTP est activé dans Supabase
- Vérifiez vos identifiants SMTP
- Vérifiez le dossier spam

### "Erreur lors du déploiement de la fonction"
- Vérifiez que vous êtes connecté: `supabase login`
- Vérifiez que le projet est lié: `supabase link`

### "La table n'existe pas"
- Vérifiez que vous avez bien exécuté le fichier SQL
- Vérifiez dans l'onglet "Table Editor" que `email_queue` existe

## 📋 Checklist rapide

- [ ] SMTP configuré dans Supabase Dashboard
- [ ] Table `email_queue` créée (fichier SQL exécuté)
- [ ] Fonction `send-email` déployée
- [ ] Test: connexion → email reçu

## 🎉 C'est tout!

Une fois ces 3 étapes faites, les emails fonctionneront automatiquement:
- ✅ Email de connexion
- ✅ Email de confirmation de paiement
- ✅ Email de complétion de leçon

Pas besoin de modifier le code, tout est déjà en place!

