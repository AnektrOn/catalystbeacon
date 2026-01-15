# 📧 Template Email - Nouvel Utilisateur

## 🎯 Événement : New User (INSERT sur profiles)

Quand un nouvel utilisateur s'inscrit, envoyez un email de bienvenue.

---

## 📝 Données Disponibles

Depuis le Function Node, vous avez accès à :
- `email` - Email de l'utilisateur
- `userName` - Nom complet (ou 'there' si vide)
- `userId` - ID de l'utilisateur
- `role` - Rôle initial (généralement 'Free')
- `createdAt` - Date de création
- `hasCompletedOnboarding` - Si l'onboarding est complété

---

## 📧 Template Email HTML

### Configuration SMTP Node

- **To Email** : `{{ $json.email }}`
- **Subject** : `The Path Is Open. Your Journey Begins.`
- **Email Type** : `HTML`

### Message HTML (Template Personnalisé HC Beacon)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Journey Begins</title>
    <!-- Fonts matching the widget: Cinzel and Rajdhani -->
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        /* Reset & Base */
        body { margin: 0; padding: 0; background-color: #050508; color: #e0e0e0; font-family: 'Rajdhani', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; display: block; max-width: 100%; }
        a { text-decoration: none; color: #a5f3fc; }
        
        /* Mobile Styles */
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 20px !important; }
            .header-text { font-size: 28px !important; }
            .body-text { font-size: 16px !important; line-height: 1.6 !important; }
            .btn-table { width: 100% !important; }
            .btn-link { width: 100% !important; display: block !important; text-align: center !important; }
            .feature-stack { display: block !important; width: 100% !important; padding-bottom: 20px !important; }
        }
    </style>
</head>
<body style="background-color: #050508; margin: 0; padding: 0;">

    <!-- Preheader Text -->
    <div style="display: none; max-height: 0px; overflow: hidden; color: #050508;">
        The path to mastery has opened. Take your first step into the void.
    </div>

    <!-- Main Container Background (Dark Void, No Image) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #050508;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                
                <!-- Email Content Wrapper (Matching Ethereal Card Design) -->
                <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0e; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);">
                    
                    <!-- Top Ethereal Accent (Cyan to Violet Gradient) -->
                    <tr>
                        <td style="height: 2px; background: linear-gradient(90deg, #050508, #a5f3fc, #a78bfa, #050508); font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                    <!-- Header / Logo -->
                    <tr>
                        <td align="center" style="padding: 40px 0 20px 0;">
                            <!-- Logo Text -->
                            <div style="font-family: 'Cinzel', serif; font-size: 28px; font-weight: 600; letter-spacing: 4px; color: #ffffff; text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);">
                                HC <span style="color: #a5f3fc; text-shadow: 0 0 10px rgba(165, 243, 252, 0.5);">BEACON</span>
                            </div>
                            <div style="font-family: 'Rajdhani', sans-serif; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 3px; margin-top: 8px;">
                                The Catalyst Path
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 0 50px 30px 50px;">
                            <h1 class="header-text" style="font-family: 'Cinzel', serif; color: #ffffff; font-size: 36px; font-weight: 400; margin: 0 0 25px 0; text-transform: uppercase; letter-spacing: 1px; text-align: center; line-height: 1.2;">
                                The Path <br/><span style="color: #a78bfa; text-shadow: 0 0 20px rgba(167, 139, 250, 0.4);">Is Open</span>.
                            </h1>
                            
                            <p class="body-text" style="font-family: 'Rajdhani', Arial, sans-serif; color: #e0e0e0; font-size: 18px; line-height: 1.6; margin-bottom: 20px; text-align: left; font-weight: 400;">
                                Greetings, <strong>{{ $json.userName }}</strong>.
                            </p>
                            
                            <p class="body-text" style="font-family: 'Rajdhani', Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: left; font-weight: 400;">
                                You have taken the first step on a journey of transcendence. While the world sleeps in routine, you have chosen to awaken your potential and seek mastery.
                            </p>

                            <p class="body-text" style="font-family: 'Rajdhani', Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 40px; text-align: left; font-weight: 400;">
                                Your sanctuary is ready. We have prepared your <strong>Personal Roadmap</strong> to guide you through the initial stages of wisdom.
                            </p>

                            <!-- CTA Button (Ethereal Style) -->
                            <table class="btn-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center">
                                        <!-- VML Hack for Outlook button -->
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://votredomaine.com/dashboard" style="height:54px;v-text-anchor:middle;width:240px;" arcsize="50%" stroke="f" fillcolor="#0a0a0e">
                                        <w:anchorlock/>
                                        <v:stroke color="#a5f3fc" weight="1px"/>
                                        <center>
                                        <![endif]-->
                                            <a href="https://votredomaine.com/dashboard" class="btn-link" style="display: inline-block; padding: 16px 40px; background-color: rgba(165, 243, 252, 0.05); border: 1px solid rgba(165, 243, 252, 0.3); color: #a5f3fc; font-family: 'Cinzel', serif; font-weight: 600; font-size: 16px; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">
                                                Enter the Sanctuary
                                            </a>
                                        <!--[if mso]>
                                        </center>
                                        </v:roundrect>
                                        <![endif]-->
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td align="center" style="padding: 20px 50px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); height: 1px;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Features Grid (Icons matching Ethereal Stats Cards) -->
                    <tr>
                        <td style="padding: 10px 40px 50px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" valign="top">
                                        <!-- Column 1: Resonance -->
                                        <table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 10px;">
                                                    <div style="color: #fb923c; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(251, 146, 60, 0.4);">✦</div>
                                                    <div style="font-family: 'Cinzel', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Resonance</div>
                                                    <div style="font-family: 'Rajdhani', Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Build your harmonic streak.</div>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Column 2: Roadmap -->
                                        <table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 10px;">
                                                    <div style="color: #a5f3fc; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">◈</div>
                                                    <div style="font-family: 'Cinzel', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Roadmap</div>
                                                    <div style="font-family: 'Rajdhani', Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Your path to evolution.</div>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Column 3: Toolbox -->
                                        <table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 10px;">
                                                    <div style="color: #a78bfa; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(167, 139, 250, 0.4);">❖</div>
                                                    <div style="font-family: 'Cinzel', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Toolbox</div>
                                                    <div style="font-family: 'Rajdhani', Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Your personal archive.</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: rgba(255, 255, 255, 0.02); padding: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="color: #6b7280; font-size: 11px; font-family: 'Rajdhani', Arial, sans-serif; line-height: 1.6; text-transform: uppercase; letter-spacing: 1px;">
                                        <p style="margin: 0 0 10px 0;">HC Beacon &copy; 2024. The Awakening.</p>
                                        <p style="margin: 0;">
                                            <a href="https://votredomaine.com/unsubscribe?email={{ $json.email }}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &nbsp;•&nbsp; 
                                            <a href="https://votredomaine.com/support" style="color: #6b7280; text-decoration: underline;">Guide</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                
                <!-- Bottom Spacer & Address -->
                <div style="height: 40px;"></div>
                <div style="color: #4b5563; font-size: 10px; font-family: 'Rajdhani', Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase;">
                    Sent with Intention
                </div>

            </td>
        </tr>
    </table>

</body>
</html>
```

### Variables N8N Utilisées

- `{{ $json.userName }}` - Nom de l'utilisateur (remplace `{User_Name}`)
- `{{ $json.email }}` - Email de l'utilisateur (pour le lien unsubscribe)

### URLs à Personnaliser

Remplacez `https://votredomaine.com` par votre domaine réel :
- **Lien CTA** : `https://votredomaine.com/dashboard` → Changez par votre URL de dashboard
- **Lien Unsubscribe** : `https://votredomaine.com/unsubscribe?email={{ $json.email }}` → Changez par votre URL de désinscription
- **Lien Support** : `https://votredomaine.com/support` → Changez par votre URL de support

---

## 🔔 Template Telegram (Optionnel)

Si vous voulez aussi envoyer une notification Telegram :

### Configuration Telegram Node

- **Operation** : `Send Message`
- **Chat ID** : `{{ $json.telegramChatId }}` (à récupérer depuis votre DB)
- **Text** :

```
🎉 Nouveau membre !

Bienvenue {{ $json.userName }} !

Nous sommes ravis de vous accueillir dans notre communauté d'apprentissage.

Votre parcours commence maintenant :
📚 Cours interactifs
🏆 Système de niveaux
🔥 Streaks quotidiens
🎖️ Badges et achievements

Commencez votre parcours : https://votredomaine.com/dashboard

Bonne chance ! 🚀
```

---

## 📊 Structure du Workflow

```
Webhook (reçoit INSERT sur profiles)
  ↓
Function Node (détecte "new-user")
  ↓
Switch Node (route vers "new-user")
  ↓
SMTP Node (email de bienvenue)
  ↓
Telegram Node (optionnel - notification)
```

---

## 🧪 Tester

### Test 1 : Créer un Nouvel Utilisateur (Test)

```sql
-- ATTENTION : Ceci crée un vrai utilisateur
-- Utilisez seulement pour tester dans un environnement de développement

INSERT INTO profiles (id, email, full_name, role)
VALUES (
  gen_random_uuid(),
  'test-new-user@example.com',
  'Test New User',
  'Free'
);
```

### Test 2 : Vérifier dans N8N

1. Allez dans **Executions**
2. Ouvrez la dernière exécution
3. Vérifiez que :
   - ✅ Webhook node reçoit les données
   - ✅ Function Node détecte `emailType: 'new-user'`
   - ✅ Switch Node route vers "new-user"
   - ✅ SMTP Node envoie l'email
   - ✅ Tous les nodes sont verts

### Test 3 : Vérifier l'Email

Vérifiez la boîte mail de l'utilisateur :
- L'email de bienvenue devrait être reçu
- Le contenu devrait être correct

---

## ✅ Checklist

- [ ] Trigger "new-user-webhook" créé
- [ ] Function Node détecte "new-user" (code mis à jour)
- [ ] Switch Node a une règle pour "new-user"
- [ ] SMTP Node configuré avec template de bienvenue
- [ ] Workflow activé
- [ ] Test avec INSERT réussi
- [ ] Email de bienvenue reçu

---

## 🚀 Prochaines Étapes

1. **Exécutez** `create-webhook-new-user.sql` dans Supabase
2. **Mettez à jour** le Function Node dans N8N avec le code qui détecte "new-user"
3. **Ajoutez** une règle "new-user" dans le Switch Node
4. **Configurez** le SMTP Node avec le template de bienvenue
5. **Testez** avec un INSERT réel (ou dans un environnement de test)

---

## 💡 Notes

- **Quand se déclenche** : À chaque INSERT sur `profiles` (nouvelle inscription)
- **Format Supabase** : `type: "INSERT"`, `old_record: null`
- **Données disponibles** : Toutes les colonnes du nouveau profil
- **Email recommandé** : Envoyez-le immédiatement après l'inscription

---

## 📚 Ressources

- `create-webhook-new-user.sql` - Script SQL pour créer le trigger
- `N8N_FUNCTION_DETECT_ALL_EVENTS.md` - Code Function Node (mis à jour avec new-user)
- `N8N_SMTP_SETUP.md` - Configuration SMTP
