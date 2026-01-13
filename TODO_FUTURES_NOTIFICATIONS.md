# 📋 To-Do Futures - Notifications

## 🎯 Contexte
Les notifications email pour **new user** et **role change** sont déjà implémentées et prêtes pour la production.

Ce document liste les notifications restantes à implémenter après le déploiement initial.

---

## 📧 Notifications Email Restantes

### Phase 1 - Priorité Haute (Essentiels)

#### 1. Level Up ⭐
**Trigger:** `profiles.level` augmente  
**Quand:** Utilisateur passe au niveau supérieur  
**Template:** Félicitations niveau, nouvelles fonctionnalités débloquées  
**Fichier SQL:** `create-trigger-level-up-final.sql` (déjà créé, à déployer)  
**Fichier N8N:** À créer (similaire à `N8N_FUNCTION_ROLE_CHANGE_ETHEREAL.js`)

**Données à envoyer:**
```json
{
  "emailType": "level-up",
  "email": "user@example.com",
  "userName": "John Doe",
  "oldLevel": 5,
  "newLevel": 6,
  "levelTitle": "Insight Seeker",
  "totalXP": 5000,
  "xpToNextLevel": 1000,
  "unlockedFeatures": ["Advanced Courses", "Community Access"]
}
```

**Status:** ⏳ À implémenter

---

#### 2. Course Completed ⭐
**Trigger:** Toutes les leçons d'un cours complétées  
**Quand:** Utilisateur termine un cours complet  
**Template:** Célébration, certificat, prochain cours suggéré  
**Fichier SQL:** À créer (trigger sur `user_lesson_progress` ou calcul dans app)

**Données à envoyer:**
```json
{
  "emailType": "course-completed",
  "email": "user@example.com",
  "userName": "John Doe",
  "courseName": "Mindfulness Basics",
  "courseId": "course_123",
  "totalLessons": 10,
  "totalXP": 500,
  "completionDate": "2024-01-15",
  "certificateUrl": "https://...",
  "nextCourseUrl": "https://..."
}
```

**Status:** ⏳ À implémenter

---

#### 3. Achievement Unlocked ⭐
**Trigger:** `user_badges` INSERT  
**Quand:** Utilisateur débloque un badge  
**Template:** Badge débloqué, image du badge, célébration  
**Fichier SQL:** À créer (trigger sur `user_badges`)

**Données à envoyer:**
```json
{
  "emailType": "achievement-unlocked",
  "email": "user@example.com",
  "userName": "John Doe",
  "badgeTitle": "First Steps",
  "badgeDescription": "Complete your first lesson",
  "badgeImageUrl": "https://...",
  "xpReward": 100,
  "category": "learning"
}
```

**Status:** ⏳ À implémenter

---

#### 4. Lesson Completed ⭐
**Trigger:** `user_lesson_progress.is_completed` = true  
**Quand:** Utilisateur complète une leçon  
**Template:** Félicitations, XP gagné, prochaine leçon  
**Fichier SQL:** À créer (trigger sur `user_lesson_progress`)

**Données à envoyer:**
```json
{
  "emailType": "lesson-completed",
  "email": "user@example.com",
  "userName": "John Doe",
  "lessonTitle": "Introduction to Mindfulness",
  "courseName": "Mindfulness Basics",
  "xpEarned": 50,
  "totalXP": 1050,
  "courseProgress": 25,
  "nextLessonUrl": "https://..."
}
```

**Status:** ⏳ À implémenter

---

### Phase 2 - Priorité Moyenne (Importants)

#### 5. Subscription Purchased
**Trigger:** `checkout.session.completed` (Stripe Webhook)  
**Quand:** Utilisateur achète un abonnement (Student ou Teacher)  
**Template:** Confirmation d'achat, bienvenue au plan, fonctionnalités  
**Fichier:** Intégration avec `server.js` (webhook Stripe existant)

**Données à envoyer:**
```json
{
  "emailType": "subscription-purchased",
  "email": "user@example.com",
  "userName": "John Doe",
  "planName": "Student Plan",
  "planType": "student",
  "amount": 29.99,
  "currency": "USD",
  "subscriptionId": "sub_xxx",
  "billingPeriod": "monthly"
}
```

**Status:** ⏳ À implémenter

---

#### 6. Payment Failed
**Trigger:** `invoice.payment_failed` (Stripe Webhook)  
**Quand:** Paiement échoue  
**Template:** Alerte d'échec, instructions pour corriger  
**Fichier:** Intégration avec `server.js` (webhook Stripe existant)

**Données à envoyer:**
```json
{
  "emailType": "payment-failed",
  "email": "user@example.com",
  "userName": "John Doe",
  "planName": "Student Plan",
  "amount": 29.99,
  "currency": "USD",
  "retryDate": "2024-01-18",
  "updatePaymentUrl": "https://.../billing"
}
```

**Status:** ⏳ À implémenter

---

#### 7. XP Milestone
**Trigger:** `profiles.current_xp` atteint un milestone  
**Quand:** XP atteint 1000, 5000, 10000, 25000, 50000, 100000  
**Template:** Célébration milestone, badge spécial  
**Fichier SQL:** À créer (trigger sur `profiles.current_xp`)

**Données à envoyer:**
```json
{
  "emailType": "xp-milestone",
  "email": "user@example.com",
  "userName": "John Doe",
  "milestoneXP": 10000,
  "totalXP": 10000,
  "achievementBadge": "XP Master"
}
```

**Status:** ⏳ À implémenter

---

#### 8. Streak Milestone
**Trigger:** `profiles.completion_streak` atteint milestone  
**Quand:** Streak atteint 7, 30, 100, 365 jours  
**Template:** Félicitations streak, motivation continuer  
**Fichier SQL:** À créer (trigger sur `profiles.completion_streak`)

**Données à envoyer:**
```json
{
  "emailType": "streak-milestone",
  "email": "user@example.com",
  "userName": "John Doe",
  "streakDays": 30,
  "totalDays": 30,
  "nextMilestone": 100
}
```

**Status:** ⏳ À implémenter

---

#### 9. Renewal Reminder
**Trigger:** `invoice.upcoming` (Stripe Webhook) ou Cron Job  
**Quand:** 3 jours avant le renouvellement  
**Template:** Rappel de renouvellement, option d'annuler  
**Fichier:** Intégration avec `server.js` (webhook Stripe) ou Cron N8N

**Données à envoyer:**
```json
{
  "emailType": "renewal-reminder",
  "email": "user@example.com",
  "userName": "John Doe",
  "planName": "Student Plan",
  "amount": 29.99,
  "currency": "USD",
  "renewalDate": "2024-02-15",
  "cancelUrl": "https://.../cancel"
}
```

**Status:** ⏳ À implémenter

---

### Phase 3 - Priorité Basse (Optionnel)

#### 10. Subscription Upgraded/Downgraded
**Trigger:** `customer.subscription.updated` (Stripe Webhook)  
**Quand:** Utilisateur change de plan  
**Status:** ⏳ À implémenter

#### 11. Subscription Cancelled
**Trigger:** `customer.subscription.deleted` (Stripe Webhook)  
**Quand:** Utilisateur annule son abonnement  
**Status:** ⏳ À implémenter

#### 12. Payment Success
**Trigger:** `invoice.payment_succeeded` (Stripe Webhook)  
**Quand:** Paiement mensuel réussi  
**Status:** ⏳ À implémenter

#### 13. Streak Lost
**Trigger:** `profiles.completion_streak` = 0  
**Quand:** Utilisateur perd son streak  
**Status:** ⏳ À implémenter

#### 14. New Lessons Available
**Trigger:** `lessons` INSERT dans cours suivi  
**Quand:** Nouvelle leçon ajoutée à un cours suivi  
**Status:** ⏳ À implémenter

#### 15. New Course Available
**Trigger:** `courses` INSERT + user a subscription active  
**Quand:** Nouveau cours publié pour abonnés  
**Status:** ⏳ À implémenter

#### 16. Inactivity Reminder (7 jours)
**Trigger:** Cron Job (vérifie dernière activité)  
**Quand:** Utilisateur inactif depuis 7 jours  
**Status:** ⏳ À implémenter

#### 17. Inactivity Warning (30 jours)
**Trigger:** Cron Job  
**Quand:** Utilisateur inactif depuis 30 jours  
**Status:** ⏳ À implémenter

---

## 📱 Notifications Mobiles

### Phase 1 - PWA Notifications (Recommandé pour commencer)

#### 1. Service Worker Setup
**Description:** Configurer Service Worker pour les notifications push  
**Fichiers à créer:**
- `public/sw.js` - Service Worker
- `public/manifest.json` - Manifest PWA (peut déjà exister)
- `src/utils/notificationService.js` - Service de notifications

**Fonctionnalités:**
- [ ] Demander permission de notification
- [ ] Enregistrer le device token
- [ ] Recevoir les notifications push
- [ ] Afficher les notifications dans le navigateur

**Status:** ⏳ À implémenter

---

#### 2. Push Notifications Backend
**Description:** Système backend pour envoyer des notifications push  
**Options:**
- **Supabase Realtime** - Utiliser les subscriptions Supabase
- **Firebase Cloud Messaging (FCM)** - Pour web et mobile
- **OneSignal** - Service tiers simple
- **Web Push Protocol** - Standard web

**Fichiers à créer:**
- `supabase/functions/send-push-notification/index.ts` - Edge Function
- Table `user_push_tokens` - Stocker les tokens de devices

**Status:** ⏳ À implémenter

---

#### 3. In-App Notifications
**Description:** Système de notifications dans l'application  
**Fichiers à créer:**
- `src/components/NotificationCenter.jsx` - Composant de notifications
- `src/contexts/NotificationContext.jsx` - Context pour gérer les notifications
- Table `notifications` - Stocker les notifications en base

**Fonctionnalités:**
- [ ] Badge count (nombre de notifications non lues)
- [ ] Liste des notifications
- [ ] Marquer comme lu
- [ ] Supprimer les notifications
- [ ] Filtres (tous, non lus, par type)

**Status:** ⏳ À implémenter

---

### Phase 2 - Native Mobile Apps (Future)

#### 4. iOS Push Notifications
**Description:** Notifications push natives iOS  
**Requirements:**
- App iOS native (React Native ou Swift)
- Certificat APNs (Apple Push Notification service)
- Intégration avec backend

**Status:** ⏳ À implémenter (quand app iOS sera créée)

---

#### 5. Android Push Notifications
**Description:** Notifications push natives Android  
**Requirements:**
- App Android native (React Native ou Kotlin)
- Firebase Cloud Messaging (FCM)
- Intégration avec backend

**Status:** ⏳ À implémenter (quand app Android sera créée)

---

## 📊 Priorisation

### Ordre Recommandé d'Implémentation

1. **Level Up** (Phase 1) - Le plus impactant pour l'engagement
2. **Course Completed** (Phase 1) - Célébration importante
3. **Achievement Unlocked** (Phase 1) - Gamification
4. **Lesson Completed** (Phase 1) - Feedback immédiat
5. **Subscription Purchased** (Phase 2) - Confirmation transaction
6. **Payment Failed** (Phase 2) - Critique pour rétention
7. **XP Milestone** (Phase 2) - Engagement
8. **Streak Milestone** (Phase 2) - Habitudes
9. **PWA Notifications** (Mobile Phase 1) - Base pour mobile
10. **In-App Notifications** (Mobile Phase 1) - UX améliorée

---

## 🔗 Références

- **Liste complète des triggers:** `N8N_EMAIL_TRIGGERS_LIST.md`
- **Options notifications mobiles:** `MOBILE_NOTIFICATIONS_OPTIONS.md`
- **Guide PWA:** `PWA_EXPLAINED.md`
- **Architecture webhooks:** `ARCHITECTURE_WEBHOOK_UNIQUE.md`

---

## 📝 Notes d'Implémentation

### Pour chaque notification email:
1. Créer le trigger SQL dans Supabase
2. Créer le Function Node dans N8N (template HTML)
3. Ajouter la route dans le Switch Node N8N
4. Tester avec un utilisateur de test
5. Vérifier les logs (Supabase + N8N)

### Pour les notifications mobiles:
1. Commencer par PWA (plus simple, pas besoin d'app store)
2. Utiliser Service Worker pour les notifications web
3. Stocker les tokens de devices en base
4. Créer un système backend pour envoyer les notifications
5. Implémenter l'UI de notifications dans l'app

---

**Date de création:** $(date)  
**Dernière mise à jour:** $(date)
