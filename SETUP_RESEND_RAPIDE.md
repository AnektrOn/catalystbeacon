# 🚀 Setup Resend - Solution Simple et Fiable

## ✅ Solution: Resend (Simple, Fiable, Gratuit)

J'ai créé une solution **beaucoup plus simple** que Supabase Edge Functions:
- ✅ Utilise directement votre serveur Node.js
- ✅ Pas besoin de Edge Functions
- ✅ Pas besoin de SMTP complexe
- ✅ Juste une clé API Resend

---

## 📋 Setup en 3 Minutes

### 1. Créer un Compte Resend (Gratuit)

1. Allez sur: **https://resend.com**
2. Cliquez **"Sign Up"** (gratuit)
3. Vérifiez votre email

### 2. Obtenir la Clé API

1. Allez sur: **https://resend.com/api-keys**
2. Cliquez **"Create API Key"**
3. Nom: `HC University`
4. **Copiez la clé** (commence par `re_...`)

### 3. Ajouter dans server.env

Ouvrez `server.env` et ajoutez:

```env
RESEND_API_KEY=re_votre_cle_api_ici
FROM_EMAIL=noreply@humancatalystbeacon.com
FROM_NAME=The Human Catalyst University
SITE_NAME=The Human Catalyst University
SITE_URL=https://app.humancatalystbeacon.com
```

**Sauvegardez!**

### 4. Redémarrer le Serveur

```bash
pm2 restart hcuniversity-app
```

---

## 🧪 Tester

1. **Créez un nouveau compte** dans votre application
2. **Vérifiez votre email** (et le dossier spam)
3. **Vous devriez recevoir:** "🎉 Welcome to The Human Catalyst University!"

---

## ✅ C'est Tout!

**C'est beaucoup plus simple que Supabase!** Juste:
1. Compte Resend
2. Clé API dans `server.env`
3. Redémarrer le serveur

**Pas besoin de:**
- ❌ Edge Functions
- ❌ Configuration SMTP complexe
- ❌ Migrations SQL
- ❌ N8N ou autres outils

---

## 📊 Resend Gratuit

- **100 emails/jour** gratuitement
- **3,000 emails/mois** gratuitement
- Parfait pour commencer!

---

## 🆘 Si Ça Ne Fonctionne Pas

### Vérifier les Logs:

```bash
pm2 logs hcuniversity-app --lines 30
```

Cherchez:
- `✅ Email service loaded (Resend)` → C'est bon!
- `📧 Sending sign-up confirmation email` → Email en cours
- `✅ Sign-up email sent successfully` → Réussi!

### Vérifier la Clé API:

```bash
cat server.env | grep RESEND_API_KEY
```

### Vérifier Resend Dashboard:

1. Allez sur: **https://resend.com/emails**
2. Vérifiez si les emails sont envoyés
3. Vérifiez les erreurs éventuelles

---

## 🎯 Prochaine Étape

Une fois que ça fonctionne, on peut ajouter les autres emails (paiement, etc.) de la même manière!

**Dites-moi quand vous avez configuré Resend et on teste!** 🚀

