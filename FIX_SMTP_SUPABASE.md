# 🔧 Réparer l'Envoi d'Email dans Supabase

## Problème: Impossible d'envoyer un email test depuis Supabase

Voici comment résoudre le problème étape par étape:

---

## ✅ Étape 1: Vérifier la Configuration SMTP

1. **Allez sur:** https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/settings/auth
2. **Cliquez sur "SMTP Settings"** dans le menu de gauche
3. **Vérifiez que "Enable Custom SMTP" est activé** (le bouton doit être vert/ON)

Si ce n'est pas activé → Activez-le et continuez.

---

## ✅ Étape 2: Configurer Gmail SMTP (Option la plus simple)

### 2.1 Créer un mot de passe d'application Gmail

1. Allez sur: https://myaccount.google.com/apppasswords
2. Connectez-vous avec votre compte Gmail
3. Sélectionnez "Mail" et "Other (Custom name)"
4. Entrez: "Supabase"
5. Cliquez sur "Generate"
6. **Copiez le mot de passe** (16 caractères, espaces entre chaque groupe de 4)

### 2.2 Configurer dans Supabase

Dans Supabase Dashboard → Settings → Auth → SMTP Settings:

- **Enable Custom SMTP:** ✅ ON
- **Host:** `smtp.gmail.com`
- **Port:** `587`
- **Username:** Votre adresse Gmail complète (ex: `votreemail@gmail.com`)
- **Password:** Le mot de passe d'application que vous venez de créer (16 caractères)
- **Sender Email:** Votre adresse Gmail (ex: `votreemail@gmail.com`)
- **Sender Name:** `The Human Catalyst University`

### 2.3 Tester

1. Cliquez sur **"Send Test Email"** en bas de la page
2. Entrez votre email
3. Cliquez sur "Send"
4. Vérifiez votre boîte email (et le dossier spam)

---

## ✅ Étape 3: Si Gmail ne fonctionne pas - Utiliser SendGrid (Gratuit)

### 3.1 Créer un compte SendGrid

1. Allez sur: https://signup.sendgrid.com/
2. Créez un compte gratuit (100 emails/jour)
3. Vérifiez votre email
4. Créez un "Sender" (expéditeur):
   - Allez sur "Settings" → "Sender Authentication"
   - Cliquez sur "Verify a Single Sender"
   - Entrez vos informations
   - Vérifiez l'email

### 3.2 Créer une clé API SMTP

1. Allez sur "Settings" → "API Keys"
2. Cliquez sur "Create API Key"
3. Nommez-la: "Supabase"
4. Donnez les permissions "Mail Send"
5. **Copiez la clé API** (vous ne la reverrez plus!)

### 3.3 Configurer dans Supabase

Dans Supabase Dashboard → Settings → Auth → SMTP Settings:

- **Enable Custom SMTP:** ✅ ON
- **Host:** `smtp.sendgrid.net`
- **Port:** `587`
- **Username:** `apikey` (littéralement, le mot "apikey")
- **Password:** La clé API SendGrid que vous venez de créer
- **Sender Email:** L'email que vous avez vérifié dans SendGrid
- **Sender Name:** `The Human Catalyst University`

### 3.4 Tester

1. Cliquez sur **"Send Test Email"**
2. Entrez votre email
3. Vérifiez votre boîte email

---

## ❌ Erreurs Courantes

### Erreur: "Invalid credentials"
- Vérifiez que le mot de passe/API key est correct
- Pour Gmail: Utilisez un mot de passe d'application, pas votre mot de passe normal
- Pour SendGrid: Utilisez la clé API, pas votre mot de passe de compte

### Erreur: "Connection timeout"
- Vérifiez le port (587 pour TLS, 465 pour SSL)
- Vérifiez que le host est correct (`smtp.gmail.com` ou `smtp.sendgrid.net`)

### Erreur: "Authentication failed"
- Pour Gmail: Assurez-vous d'utiliser un mot de passe d'application
- Pour SendGrid: Assurez-vous que le username est exactement `apikey`

### Email test envoyé mais pas reçu
- Vérifiez le dossier spam
- Vérifiez que l'email de l'expéditeur est vérifié (pour SendGrid)
- Attendez quelques minutes (parfois il y a un délai)

---

## 🧪 Test Rapide

Une fois configuré, testez avec ce script:

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
2. Si la fonction `send-email` existe, cliquez dessus
3. Cliquez sur "Invoke"
4. Utilisez ce JSON:
```json
{
  "emailType": "sign-in",
  "email": "VOTRE_EMAIL@example.com",
  "userName": "Test",
  "loginTime": "2024-01-01 12:00:00"
}
```

---

## 📋 Checklist

- [ ] SMTP activé dans Supabase Dashboard
- [ ] Host correct (`smtp.gmail.com` ou `smtp.sendgrid.net`)
- [ ] Port correct (`587`)
- [ ] Username correct (email Gmail complet ou `apikey` pour SendGrid)
- [ ] Password correct (mot de passe d'application Gmail ou clé API SendGrid)
- [ ] Sender Email correct
- [ ] Test email envoyé avec succès

---

## 💡 Solution Rapide: Gmail

**La solution la plus rapide est Gmail:**

1. Créez un mot de passe d'application: https://myaccount.google.com/apppasswords
2. Dans Supabase:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `votreemail@gmail.com`
   - Password: `xxxx xxxx xxxx xxxx` (le mot de passe d'application)
   - Sender Email: `votreemail@gmail.com`
3. Testez!

---

## 🆘 Si Rien ne Fonctionne

Dites-moi:
1. Quel service email utilisez-vous? (Gmail, SendGrid, autre)
2. Quelle erreur voyez-vous exactement?
3. Avez-vous activé "Enable Custom SMTP"?
4. Avez-vous testé avec "Send Test Email" dans Supabase?

Avec ces informations, je peux vous aider plus précisément! 🎯

