# 📧 Function Node - Template Email Nouvel Utilisateur (Version Simple)

## ❌ Problème

L'erreur "cannot read line 170" est causée par les template literals imbriqués (backticks dans backticks) qui ne fonctionnent pas bien dans N8N.

## ✅ Solution : Version avec Concaténation

Utilisez cette version qui utilise la concaténation de strings au lieu de template literals :

---

## 📝 Code Complet pour Function Node

Copiez ce code dans un **Function Node** après le Switch Node (branche "new-user") :

```javascript
// Sign Up Email Template - Version Corrigée
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://app.humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst Beacon';

// Construire le HTML avec concaténation
const userName = emailData.userName || 'there';
const userEmail = emailData.email || 'unknown@example.com';

const html = '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Your Journey Begins</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600&display=swap" rel="stylesheet">' +
    '<style>' +
        'body { margin: 0; padding: 0; background-color: #050508; color: #e0e0e0; font-family: \'Rajdhani\', Arial, sans-serif; }' +
        'table { border-spacing: 0; border-collapse: collapse; }' +
        'a { text-decoration: none; color: #a5f3fc; }' +
        '@media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }' +
    '</style>' +
'</head>' +
'<body style="background-color: #050508; margin: 0; padding: 0;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #050508;">' +
        '<tr><td align="center" style="padding: 40px 0;">' +
            '<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0e; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08);">' +
                '<tr><td style="height: 2px; background: linear-gradient(90deg, #050508, #a5f3fc, #a78bfa, #050508);">&nbsp;</td></tr>' +
                '<tr><td align="center" style="padding: 40px 0 20px 0;">' +
                    '<div style="font-family: \'Cinzel\', serif; font-size: 28px; font-weight: 600; letter-spacing: 4px; color: #ffffff;">' +
                        'HC <span style="color: #a5f3fc;">BEACON</span>' +
                    '</div>' +
                    '<div style="font-family: \'Rajdhani\', sans-serif; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 3px; margin-top: 8px;">The Catalyst Path</div>' +
                '</td></tr>' +
                '<tr><td style="padding: 0 50px 30px 50px;">' +
                    '<h1 style="font-family: \'Cinzel\', serif; color: #ffffff; font-size: 36px; font-weight: 400; margin: 0 0 25px 0; text-align: center;">' +
                        'The Path <br/><span style="color: #a78bfa;">Is Open</span>.' +
                    '</h1>' +
                    '<p style="font-family: \'Rajdhani\', Arial, sans-serif; color: #e0e0e0; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">' +
                        'Greetings, <strong>' + userName + '</strong>.' +
                    '</p>' +
                    '<p style="font-family: \'Rajdhani\', Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">' +
                        'You have taken the first step on a journey of transcendence. While the world sleeps in routine, you have chosen to awaken your potential and seek mastery.' +
                    '</p>' +
                    '<p style="font-family: \'Rajdhani\', Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 40px;">' +
                        'Your sanctuary is ready. We have prepared your <strong>Personal Roadmap</strong> to guide you through the initial stages of wisdom.' +
                    '</p>' +
                    '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +
                        '<tr><td align="center">' +
                            '<a href="' + siteUrl + '/dashboard" style="display: inline-block; padding: 16px 40px; background-color: rgba(165, 243, 252, 0.05); border: 1px solid rgba(165, 243, 252, 0.3); color: #a5f3fc; font-family: \'Cinzel\', serif; font-weight: 600; font-size: 16px; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 2px;">' +
                                'Enter the Sanctuary' +
                            '</a>' +
                        '</td></tr>' +
                    '</table>' +
                '</td></tr>' +
                '<tr><td align="center" style="padding: 20px 50px;">' +
                    '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +
                        '<tr><td style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); height: 1px;"></td></tr>' +
                    '</table>' +
                '</td></tr>' +
                '<tr><td style="padding: 10px 40px 50px 40px;">' +
                    '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +
                        '<tr><td align="center" valign="top">' +
                            '<table width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">' +
                                '<tr><td align="center" style="padding: 10px;">' +
                                    '<div style="color: #fb923c; font-size: 24px; margin-bottom: 10px;">✦</div>' +
                                    '<div style="font-family: \'Cinzel\', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase;">Resonance</div>' +
                                    '<div style="font-family: \'Rajdhani\', Arial, sans-serif; color: #888; font-size: 13px;">Build your harmonic streak.</div>' +
                                '</td></tr>' +
                            '</table>' +
                            '<table width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">' +
                                '<tr><td align="center" style="padding: 10px;">' +
                                    '<div style="color: #a5f3fc; font-size: 24px; margin-bottom: 10px;">◈</div>' +
                                    '<div style="font-family: \'Cinzel\', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase;">Roadmap</div>' +
                                    '<div style="font-family: \'Rajdhani\', Arial, sans-serif; color: #888; font-size: 13px;">Your path to evolution.</div>' +
                                '</td></tr>' +
                            '</table>' +
                            '<table width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">' +
                                '<tr><td align="center" style="padding: 10px;">' +
                                    '<div style="color: #a78bfa; font-size: 24px; margin-bottom: 10px;">❖</div>' +
                                    '<div style="font-family: \'Cinzel\', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase;">Toolbox</div>' +
                                    '<div style="font-family: \'Rajdhani\', Arial, sans-serif; color: #888; font-size: 13px;">Your personal archive.</div>' +
                                '</td></tr>' +
                            '</table>' +
                        '</td></tr>' +
                    '</table>' +
                '</td></tr>' +
                '<tr><td style="background-color: rgba(255, 255, 255, 0.02); padding: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05);">' +
                    '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +
                        '<tr><td align="center" style="color: #6b7280; font-size: 11px; font-family: \'Rajdhani\', Arial, sans-serif;">' +
                            '<p style="margin: 0 0 10px 0;">HC Beacon &copy; 2024. The Awakening.</p>' +
                            '<p style="margin: 0;">' +
                                '<a href="' + siteUrl + '/unsubscribe?email=' + encodeURIComponent(userEmail) + '" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &nbsp;•&nbsp; ' +
                                '<a href="' + siteUrl + '/support" style="color: #6b7280; text-decoration: underline;">Guide</a>' +
                            '</p>' +
                        '</td></tr>' +
                    '</table>' +
                '</td></tr>' +
            '</table>' +
            '<div style="height: 40px;"></div>' +
            '<div style="color: #4b5563; font-size: 10px; font-family: \'Rajdhani\', Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase;">Sent with Intention</div>' +
        '</td></tr>' +
    '</table>' +
'</body>' +
'</html>';

return {
  json: {
    to: userEmail,
    subject: 'The Path Is Open. Your Journey Begins.',
    html: html
  }
};
```

---

## ✅ Avantages de Cette Version

1. **Pas de template literals imbriqués** → Évite les erreurs de parsing
2. **Concaténation simple** → Fonctionne toujours dans N8N
3. **Même design** → Design Ethereal conservé
4. **Variables sécurisées** → `encodeURIComponent` pour les URLs

---

## 🧪 Tester

1. **Copiez** le code ci-dessus dans un Function Node
2. **Connectez** le Function Node après le Switch Node (branche "new-user")
3. **Testez** avec les données que vous avez partagées
4. **Vérifiez** que le HTML est généré correctement

---

## 📋 Checklist

- [ ] Code copié dans Function Node
- [ ] Variables d'environnement configurées (SITE_URL, SITE_NAME)
- [ ] Function Node connecté après Switch Node
- [ ] Test avec données réelles réussi
- [ ] HTML généré sans erreur

---

## 🔧 Si Toujours des Erreurs

Si vous avez encore des erreurs, vérifiez :
1. **Syntaxe JavaScript** : Pas de virgules manquantes
2. **Quotes échappées** : Utilisez `\'` pour les quotes simples dans les strings
3. **Variables** : `emailData.email`, `emailData.userName` existent bien

Partagez l'erreur exacte si le problème persiste.
