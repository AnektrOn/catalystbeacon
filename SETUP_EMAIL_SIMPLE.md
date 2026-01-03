# 📧 Setup Email avec Votre Serveur SMTP - Guide Simple

## ✅ Solution: Votre Serveur Mail Personnel

J'ai créé une solution qui utilise **directement votre serveur SMTP** - 100% gratuit, pas de service externe!

---

## 🚀 Setup en 3 Étapes

### Étape 1: Installer Nodemailer

```bash
npm install nodemailer
```

### Étape 2: Configurer dans server.env

Ouvrez `server.env` et ajoutez vos paramètres SMTP:

```env
# SMTP Configuration (votre serveur mail)
SMTP_HOST=smtp.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=votre_mot_de_passe

# Email Configuration
FROM_EMAIL=noreply@votre-domaine.com
FROM_NAME=The Human Catalyst University
SITE_NAME=The Human Catalyst University
SITE_URL=https://app.humancatalystbeacon.com
```

**Où trouver ces infos?**
- Dans le panneau de contrôle de votre hébergeur
- Dans les paramètres de votre client email (Thunderbird, Outlook)
- Dans la documentation de votre hébergeur

**Exemples courants:**

#### OVH:
```env
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_SECURE=false
```

#### O2Switch:
```env
SMTP_HOST=smtp.o2switch.net
SMTP_PORT=587
SMTP_SECURE=false
```

#### Serveur mail standard:
```env
SMTP_HOST=mail.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Si vous utilisez SSL (port 465):
```env
SMTP_PORT=465
SMTP_SECURE=true
```

### Étape 3: Redémarrer le Serveur

```bash
pm2 restart hcuniversity-app
```

---

## 🧪 Tester

1. **Créez un nouveau compte** dans votre application
2. **Vérifiez votre email** (et le dossier spam)
3. **Vous devriez recevoir:** "🎉 Welcome to The Human Catalyst University!"

---

## 🔍 Vérifier les Logs

```bash
pm2 logs hcuniversity-app --lines 30
```

Cherchez:
- `✅ Email transporter created` → Configuration OK!
- `📧 Sending sign-up confirmation email` → Email en cours
- `✅ Email sent successfully` → Réussi!

---

## ❓ Si Ça Ne Fonctionne Pas

### Vérification 1: Nodemailer installé?

```bash
npm list nodemailer
```

### Vérification 2: La config est correcte?

```bash
cat server.env | grep SMTP
```

### Vérification 3: Testez avec un client email

Si vous pouvez envoyer des emails avec Thunderbird/Outlook avec les mêmes identifiants, ça devrait fonctionner!

---

## 📋 Checklist

- [ ] `nodemailer` installé
- [ ] `SMTP_HOST` dans `server.env`
- [ ] `SMTP_PORT` dans `server.env` (587 ou 465)
- [ ] `SMTP_USER` dans `server.env`
- [ ] `SMTP_PASS` dans `server.env`
- [ ] Serveur redémarré
- [ ] Testé: Création d'un compte → Email reçu

---

## ✅ Avantages

- ✅ **100% Gratuit:** Utilise votre serveur existant
- ✅ **Simple:** Juste la config SMTP
- ✅ **Fiable:** Nodemailer est très stable
- ✅ **Pas de dépendance externe:** Tout reste sur votre serveur

Dites-moi quand vous avez configuré et on teste! 🚀

