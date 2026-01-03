# 🧪 Test SMTP Supabase - Guide Rapide

## Configuration Gmail (5 minutes)

### 1. Créer un mot de passe d'application Gmail

1. Allez sur: https://myaccount.google.com/apppasswords
2. Connectez-vous
3. Sélectionnez:
   - App: **Mail**
   - Device: **Other (Custom name)**
   - Nom: **Supabase**
4. Cliquez **Generate**
5. **Copiez le mot de passe** (16 caractères)

### 2. Configurer dans Supabase

1. Allez sur: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/settings/auth
2. Cliquez **SMTP Settings**
3. Activez **Enable Custom SMTP**
4. Remplissez:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: votreemail@gmail.com
   Password: [le mot de passe d'application de 16 caractères]
   Sender Email: votreemail@gmail.com
   Sender Name: The Human Catalyst University
   ```
5. Cliquez **Save**

### 3. Tester

1. En bas de la page, cliquez **"Send Test Email"**
2. Entrez votre email
3. Cliquez **Send**
4. Vérifiez votre boîte email (et spam)

✅ **Si vous recevez l'email** → Ça fonctionne!

---

## Configuration SendGrid (Alternative)

Si Gmail ne fonctionne pas:

1. Créez un compte: https://signup.sendgrid.com/
2. Vérifiez un expéditeur (Settings → Sender Authentication)
3. Créez une clé API (Settings → API Keys)
4. Dans Supabase:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [votre clé API SendGrid]
   Sender Email: [l'email vérifié]
   ```

---

## Erreurs Courantes

**"Invalid credentials"**
→ Vérifiez le mot de passe/API key

**"Connection timeout"**
→ Vérifiez le port (587) et le host

**Email pas reçu**
→ Vérifiez le dossier spam

---

## Besoin d'aide?

Dites-moi quelle erreur vous voyez exactement! 🎯

