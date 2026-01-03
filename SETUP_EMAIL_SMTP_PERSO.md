# 📧 Setup Email avec Votre Serveur SMTP Personnel

## ✅ Solution: Utiliser Votre Serveur Mail Personnel

J'ai créé une solution qui utilise **directement votre serveur SMTP** - pas besoin de service externe payant!

---

## 🔧 Configuration en 2 Étapes

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
SMTP_USER=votre-email@votre-domaine.com
SMTP_PASS=votre_mot_de_passe

# Email Configuration
FROM_EMAIL=noreply@votre-domaine.com
FROM_NAME=The Human Catalyst University
SITE_NAME=The Human Catalyst University
SITE_URL=https://app.humancatalystbeacon.com
```

**Exemples de configuration:**

#### Si vous utilisez un serveur mail standard:
```env
SMTP_HOST=mail.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=votre_mot_de_passe
```

#### Si vous utilisez SSL/TLS (port 465):
```env
SMTP_HOST=smtp.votre-domaine.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=votre_mot_de_passe
```

#### Si vous utilisez un hébergeur (OVH, O2Switch, etc.):
```env
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=votre_mot_de_passe
```

---

## 🧪 Tester

1. **Installez nodemailer:**
   ```bash
   npm install nodemailer
   ```

2. **Ajoutez la config dans `server.env`**

3. **Redémarrez le serveur:**
   ```bash
   pm2 restart hcuniversity-app
   ```

4. **Créez un nouveau compte** dans votre application

5. **Vérifiez votre email** (et le dossier spam)

6. **Vous devriez recevoir:** "🎉 Welcome to The Human Catalyst University!"

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

### Vérification 1: Nodemailer est installé?

```bash
npm list nodemailer
```

### Vérification 2: La config est correcte?

```bash
cat server.env | grep SMTP
```

### Vérification 3: Les ports sont ouverts?

Vérifiez que les ports 587 ou 465 sont ouverts sur votre serveur.

### Vérification 4: Les identifiants sont corrects?

Testez avec un client email (Thunderbird, Outlook) pour vérifier que les identifiants fonctionnent.

---

## 📋 Checklist

- [ ] `nodemailer` installé (`npm install nodemailer`)
- [ ] `SMTP_HOST` configuré dans `server.env`
- [ ] `SMTP_PORT` configuré (587 ou 465)
- [ ] `SMTP_USER` configuré
- [ ] `SMTP_PASS` configuré
- [ ] Serveur redémarré (`pm2 restart hcuniversity-app`)
- [ ] Testé: Création d'un compte → Email reçu

---

## 🎯 Avantages

- ✅ **Gratuit:** Utilise votre serveur existant
- ✅ **Simple:** Juste la config SMTP
- ✅ **Fiable:** Nodemailer est très stable
- ✅ **Pas de dépendance externe:** Tout reste sur votre serveur

---

## 💡 Note

Si vous avez besoin d'aide pour trouver vos paramètres SMTP, regardez dans:
- Le panneau de contrôle de votre hébergeur
- Les paramètres de votre client email
- La documentation de votre hébergeur

Dites-moi quand vous avez configuré et on teste! 🚀

