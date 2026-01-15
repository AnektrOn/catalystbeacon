# 🔧 Fix : Erreur "cannot read line 170" dans N8N

## ❌ Problème

L'erreur "cannot read line 170" est causée par les **template literals imbriqués** (backticks dans backticks) qui ne fonctionnent pas bien dans N8N.

## ✅ Solution : Utiliser un Array + join()

Au lieu d'utiliser des template literals imbriqués, utilisez un **array** et `join()` :

---

## 📝 Code Corrigé

### Version avec Array (Recommandée)

```javascript
// Sign Up Email Template - Version Fonctionnelle
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://app.humancatalystbeacon.com';

const userName = emailData.userName || 'there';
const userEmail = emailData.email || 'unknown@example.com';

// Construire le HTML avec un array
const htmlParts = [];

htmlParts.push('<!DOCTYPE html>');
htmlParts.push('<html lang="en">');
htmlParts.push('<head>');
htmlParts.push('<meta charset="UTF-8">');
htmlParts.push('<title>Your Journey Begins</title>');
htmlParts.push('<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600&display=swap" rel="stylesheet">');
htmlParts.push('<style>body { background-color: #050508; color: #e0e0e0; font-family: "Rajdhani", Arial, sans-serif; }</style>');
htmlParts.push('</head>');
htmlParts.push('<body style="background-color: #050508;">');
htmlParts.push('<table width="600" style="background-color: #0a0a0e; border-radius: 24px;">');
htmlParts.push('<tr><td align="center" style="padding: 40px;">');
htmlParts.push('<div style="font-family: "Cinzel", serif; font-size: 28px; color: #ffffff;">');
htmlParts.push('HC <span style="color: #a5f3fc;">BEACON</span>');
htmlParts.push('</div>');
htmlParts.push('<h1 style="font-family: "Cinzel", serif; color: #ffffff; font-size: 36px; text-align: center;">');
htmlParts.push('The Path <br/><span style="color: #a78bfa;">Is Open</span>.');
htmlParts.push('</h1>');
htmlParts.push('<p style="color: #e0e0e0; font-size: 18px;">Greetings, <strong>' + userName + '</strong>.</p>');
htmlParts.push('<p style="color: #b0b0b0; font-size: 16px;">You have taken the first step on a journey of transcendence.</p>');
htmlParts.push('<p style="text-align: center; margin-top: 30px;">');
htmlParts.push('<a href="' + siteUrl + '/dashboard" style="display: inline-block; padding: 16px 40px; background-color: rgba(165, 243, 252, 0.05); border: 1px solid rgba(165, 243, 252, 0.3); color: #a5f3fc; font-family: "Cinzel", serif; text-decoration: none; border-radius: 50px; text-transform: uppercase;">Enter the Sanctuary</a>');
htmlParts.push('</p>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('</body>');
htmlParts.push('</html>');

const html = htmlParts.join('');

return {
  json: {
    to: userEmail,
    subject: 'The Path Is Open. Your Journey Begins.',
    html: html
  }
};
```

---

## 🎯 Pourquoi Ça Marche

1. **Pas de template literals imbriqués** → Évite les erreurs de parsing
2. **Array + join()** → Plus lisible et fiable
3. **Variables séparées** → Facile à déboguer
4. **Concaténation simple** → Fonctionne toujours dans N8N

---

## 📋 Utilisation

1. **Copiez** le code de `N8N_FUNCTION_NEW_USER_WORKING.js`
2. **Collez** dans un Function Node après le Switch Node
3. **Testez** avec vos données
4. **Vérifiez** que le HTML est généré

---

## 🔍 Debug

Si vous avez encore des erreurs :

1. **Vérifiez les données d'entrée** :
   ```javascript
   console.log('emailData:', emailData);
   console.log('userName:', emailData.userName);
   console.log('email:', emailData.email);
   ```

2. **Testez avec des valeurs par défaut** :
   ```javascript
   const userName = emailData?.userName || 'there';
   const userEmail = emailData?.email || 'test@example.com';
   ```

3. **Vérifiez la syntaxe** : Pas de virgules manquantes, quotes bien fermées

---

## ✅ Checklist

- [ ] Code copié depuis `N8N_FUNCTION_NEW_USER_WORKING.js`
- [ ] Function Node créé après Switch Node
- [ ] Variables d'environnement configurées (SITE_URL)
- [ ] Test avec données réelles
- [ ] HTML généré sans erreur
- [ ] SMTP Node configuré pour utiliser `{{ $json.html }}`

---

## 🚀 Prochaines Étapes

1. **Copiez** le code de `N8N_FUNCTION_NEW_USER_WORKING.js`
2. **Collez** dans le Function Node
3. **Testez** avec vos données
4. **Configurez** le SMTP Node avec `{{ $json.to }}`, `{{ $json.subject }}`, `{{ $json.html }}`

Le code devrait maintenant fonctionner sans erreur !
