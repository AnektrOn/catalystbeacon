# 📧 Liste Complète des Triggers Email avec N8N

## 🎯 Vue d'Ensemble

Cette liste recense tous les événements qui devraient déclencher un email dans votre application. Chaque trigger sera configuré comme un workflow N8N séparé ou une route dans un workflow unique.

---

## 1️⃣ **AUTHENTIFICATION & COMPTE**

### 1.1 **Inscription (Sign Up)** ✅ PRIORITÉ HAUTE
- **Trigger**: `user.created` (Supabase Auth)
- **Quand**: Nouvel utilisateur s'inscrit
- **Données**:
  ```json
  {
    "emailType": "sign-up",
    "email": "user@example.com",
    "userName": "John Doe",
    "signupDate": "2024-01-15"
  }
  ```
- **Template**: Email de bienvenue avec lien vers dashboard
- **Action**: Accueillir, expliquer les prochaines étapes

### 1.2 **Connexion (Sign In)** ⚠️ OPTIONNEL
- **Trigger**: `auth.login` (via webhook ou log)
- **Quand**: Utilisateur se connecte (optionnel, peut être désactivé)
- **Données**:
  ```json
  {
    "emailType": "sign-in",
    "email": "user@example.com",
    "userName": "John Doe",
    "loginTime": "2024-01-15 10:30",
    "ipAddress": "192.168.1.1"
  }
  ```
- **Template**: Confirmation de connexion (sécurité)
- **Action**: Notifier si connexion suspecte

### 1.3 **Réinitialisation de Mot de Passe**
- **Trigger**: `auth.password_reset_requested`
- **Quand**: Utilisateur demande un reset
- **Données**:
  ```json
  {
    "emailType": "password-reset",
    "email": "user@example.com",
    "resetLink": "https://...",
    "expiresIn": "1 hour"
  }
  ```
- **Template**: Lien de réinitialisation
- **Action**: Envoyé par Supabase Auth (pas besoin de N8N)

### 1.4 **Email Vérifié**
- **Trigger**: `auth.email_verified`
- **Quand**: Utilisateur vérifie son email
- **Données**:
  ```json
  {
    "emailType": "email-verified",
    "email": "user@example.com",
    "userName": "John Doe"
  }
  ```
- **Template**: Confirmation de vérification
- **Action**: Féliciter, encourager à commencer

---

## 2️⃣ **ABONNEMENTS & PAIEMENTS**

### 2.1 **Achat Student Subscription** ✅ PRIORITÉ HAUTE
- **Trigger**: `checkout.session.completed` (Stripe Webhook)
- **Quand**: Utilisateur achète le plan Student
- **Données**:
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
- **Template**: Confirmation d'achat, bienvenue au plan Student
- **Action**: Expliquer les fonctionnalités Student, lien vers dashboard

### 2.2 **Achat Teacher Subscription** ✅ PRIORITÉ HAUTE
- **Trigger**: `checkout.session.completed` (Stripe Webhook)
- **Quand**: Utilisateur achète le plan Teacher
- **Données**:
  ```json
  {
    "emailType": "subscription-purchased",
    "email": "user@example.com",
    "userName": "John Doe",
    "planName": "Teacher Plan",
    "planType": "teacher",
    "amount": 99.99,
    "currency": "USD",
    "subscriptionId": "sub_xxx"
  }
  ```
- **Template**: Confirmation d'achat, bienvenue au plan Teacher
- **Action**: Expliquer les fonctionnalités Teacher, créer cours

### 2.3 **Changement de Plan (Upgrade/Downgrade)** ✅ PRIORITÉ HAUTE
- **Trigger**: `customer.subscription.updated` (Stripe Webhook)
- **Quand**: Utilisateur change de plan (Free → Student, Student → Teacher, etc.)
- **Données**:
  ```json
  {
    "emailType": "subscription-upgraded", // ou "subscription-downgraded"
    "email": "user@example.com",
    "userName": "John Doe",
    "oldPlan": "Student Plan",
    "newPlan": "Teacher Plan",
    "oldRole": "Student",
    "newRole": "Teacher",
    "effectiveDate": "2024-01-15"
  }
  ```
- **Template**: Notification de changement, nouvelles fonctionnalités
- **Action**: Expliquer ce qui change, ce qui reste

### 2.4 **Annulation d'Abonnement** ✅ PRIORITÉ HAUTE
- **Trigger**: `customer.subscription.deleted` (Stripe Webhook)
- **Quand**: Utilisateur annule son abonnement
- **Données**:
  ```json
  {
    "emailType": "subscription-cancelled",
    "email": "user@example.com",
    "userName": "John Doe",
    "planName": "Student Plan",
    "cancellationDate": "2024-01-15",
    "accessUntil": "2024-02-15", // Fin de période payée
    "reactivateUrl": "https://.../pricing"
  }
  ```
- **Template**: Confirmation d'annulation, date de fin d'accès
- **Action**: Proposer de réactiver, feedback survey

### 2.5 **Renouvellement Automatique (3 jours avant)** ✅ PRIORITÉ MOYENNE
- **Trigger**: `invoice.upcoming` (Stripe Webhook) ou Cron Job
- **Quand**: 3 jours avant le renouvellement
- **Données**:
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
- **Template**: Rappel de renouvellement, option d'annuler
- **Action**: Informer, permettre d'annuler facilement

### 2.6 **Paiement Réussi**
- **Trigger**: `invoice.payment_succeeded` (Stripe Webhook)
- **Quand**: Paiement mensuel réussi
- **Données**:
  ```json
  {
    "emailType": "payment-success",
    "email": "user@example.com",
    "userName": "John Doe",
    "planName": "Student Plan",
    "amount": 29.99,
    "currency": "USD",
    "invoiceUrl": "https://...",
    "nextBillingDate": "2024-02-15"
  }
  ```
- **Template**: Reçu de paiement, prochaine facture
- **Action**: Confirmer paiement, lien vers facture

### 2.7 **Échec de Paiement** ✅ PRIORITÉ HAUTE
- **Trigger**: `invoice.payment_failed` (Stripe Webhook)
- **Quand**: Paiement échoue
- **Données**:
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
- **Template**: Alerte d'échec, instructions pour corriger
- **Action**: Demander mise à jour carte, éviter suspension

---

## 3️⃣ **PROGRESSION & GAMIFICATION**

### 3.1 **Level Up** ✅ PRIORITÉ HAUTE
- **Trigger**: `profile.level` change (Supabase Database Trigger)
- **Quand**: Utilisateur passe au niveau supérieur
- **Données**:
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
- **Template**: Félicitations niveau, nouvelles fonctionnalités
- **Action**: Célébrer, montrer progression, encourager

### 3.2 **XP Milestone (1000, 5000, 10000, etc.)**
- **Trigger**: `profile.current_xp` atteint un milestone (Database Trigger)
- **Quand**: XP atteint 1000, 5000, 10000, 25000, 50000, 100000
- **Données**:
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
- **Template**: Célébration milestone, badge spécial
- **Action**: Féliciter, montrer statut dans communauté

### 3.3 **Badge/Achievement Débloqué** ✅ PRIORITÉ HAUTE
- **Trigger**: `user_badges` INSERT (Database Trigger)
- **Quand**: Utilisateur débloque un badge
- **Données**:
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
- **Template**: Badge débloqué, image du badge
- **Action**: Célébrer accomplissement, partager sur réseaux

### 3.4 **Streak Milestone (7, 30, 100 jours)**
- **Trigger**: `profile.completion_streak` atteint milestone (Database Trigger)
- **Quand**: Streak atteint 7, 30, 100, 365 jours
- **Données**:
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
- **Template**: Félicitations streak, motivation continuer
- **Action**: Encourager à maintenir, récompense spéciale

### 3.5 **Streak Perdu (Rappel)**
- **Trigger**: `profile.completion_streak` = 0 (Database Trigger)
- **Quand**: Utilisateur perd son streak
- **Données**:
  ```json
  {
    "emailType": "streak-lost",
    "email": "user@example.com",
    "userName": "John Doe",
    "previousStreak": 15,
    "restartUrl": "https://.../dashboard"
  }
  ```
- **Template**: Rappel doux, encouragement à reprendre
- **Action**: Motiver à recommencer, pas de jugement

---

## 4️⃣ **APPRENTISSAGE & COURS**

### 4.1 **Leçon Complétée** ✅ PRIORITÉ HAUTE
- **Trigger**: `user_lesson_progress.is_completed` = true (Database Trigger)
- **Quand**: Utilisateur complète une leçon
- **Données**:
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
- **Template**: Félicitations, XP gagné, prochaine leçon
- **Action**: Célébrer, suggérer prochaine étape

### 4.2 **Cours Complété** ✅ PRIORITÉ HAUTE
- **Trigger**: Toutes les leçons d'un cours complétées (Database Trigger)
- **Quand**: Utilisateur termine un cours complet
- **Données**:
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
- **Template**: Célébration, certificat, prochain cours
- **Action**: Féliciter, offrir certificat, suggérer suite

### 4.3 **Nouvelles Leçons Disponibles**
- **Trigger**: `lessons` INSERT dans cours suivi (Database Trigger)
- **Quand**: Nouvelle leçon ajoutée à un cours suivi
- **Données**:
  ```json
  {
    "emailType": "new-lessons",
    "email": "user@example.com",
    "userName": "John Doe",
    "newLessons": [
      {
        "title": "Advanced Techniques",
        "courseName": "Mindfulness Basics",
        "url": "https://..."
      }
    ]
  }
  ```
- **Template**: Liste nouvelles leçons, liens directs
- **Action**: Informer, encourager à continuer

### 4.4 **Nouveau Cours Disponible (Abonné)**
- **Trigger**: `courses` INSERT + user a subscription active (Database Trigger)
- **Quand**: Nouveau cours publié pour abonnés
- **Données**:
  ```json
  {
    "emailType": "new-course-available",
    "email": "user@example.com",
    "userName": "John Doe",
    "courseName": "Advanced Meditation",
    "courseDescription": "...",
    "courseImageUrl": "https://...",
    "courseUrl": "https://...",
    "instructorName": "Dr. Smith"
  }
  ```
- **Template**: Nouveau cours, aperçu, CTA
- **Action**: Présenter nouveau contenu, encourager à explorer

### 4.5 **Quiz Réussi**
- **Trigger**: `quiz_attempts.score` >= passing_score (Database Trigger)
- **Quand**: Utilisateur réussit un quiz
- **Données**:
  ```json
  {
    "emailType": "quiz-passed",
    "email": "user@example.com",
    "userName": "John Doe",
    "quizTitle": "Mindfulness Quiz",
    "score": 85,
    "passingScore": 70,
    "xpEarned": 25,
    "courseName": "Mindfulness Basics"
  }
  ```
- **Template**: Félicitations, score, XP gagné
- **Action**: Célébrer réussite, encourager à continuer

---

## 5️⃣ **ENGAGEMENT & HABITUDES**

### 5.1 **Habit Complété (Daily)**
- **Trigger**: `user_daily_tracking` INSERT/UPDATE (Database Trigger)
- **Quand**: Utilisateur complète un habit quotidien
- **Données**:
  ```json
  {
    "emailType": "habit-completed",
    "email": "user@example.com",
    "userName": "John Doe",
    "habitTitle": "Morning Meditation",
    "streakDays": 5,
    "xpEarned": 10,
    "totalHabitsCompleted": 25
  }
  ```
- **Template**: Félicitations habit, streak, motivation
- **Action**: Célébrer, montrer progression

### 5.2 **Inactivité (7 jours)** ⚠️ OPTIONNEL
- **Trigger**: Cron Job (vérifie dernière activité)
- **Quand**: Utilisateur inactif depuis 7 jours
- **Données**:
  ```json
  {
    "emailType": "inactivity-reminder",
    "email": "user@example.com",
    "userName": "John Doe",
    "daysInactive": 7,
    "lastActivity": "2024-01-08",
    "resumeUrl": "https://.../dashboard"
  }
  ```
- **Template**: On vous manque, suggestions de contenu
- **Action**: Réengager, proposer contenu personnalisé

### 5.3 **Inactivité (30 jours)** ⚠️ OPTIONNEL
- **Trigger**: Cron Job
- **Quand**: Utilisateur inactif depuis 30 jours
- **Données**:
  ```json
  {
    "emailType": "inactivity-warning",
    "email": "user@example.com",
    "userName": "John Doe",
    "daysInactive": 30,
    "subscriptionStatus": "active",
    "resumeUrl": "https://.../dashboard"
  }
  ```
- **Template**: Rappel plus urgent, risque de perte d'accès
- **Action**: Réengager fortement, offrir aide

---

## 6️⃣ **COMMUNAUTÉ & SOCIAL**

### 6.1 **Nouveau Follower**
- **Trigger**: `follows` INSERT (Database Trigger)
- **Quand**: Quelqu'un suit l'utilisateur
- **Données**:
  ```json
  {
    "emailType": "new-follower",
    "email": "user@example.com",
    "userName": "John Doe",
    "followerName": "Jane Smith",
    "followerProfileUrl": "https://..."
  }
  ```
- **Template**: Nouveau follower, profil
- **Action**: Informer, encourager interaction

### 6.2 **Commentaire sur Post**
- **Trigger**: `comments` INSERT (Database Trigger)
- **Quand**: Quelqu'un commente un post de l'utilisateur
- **Données**:
  ```json
  {
    "emailType": "post-comment",
    "email": "user@example.com",
    "userName": "John Doe",
    "commenterName": "Jane Smith",
    "commentText": "Great post!",
    "postTitle": "My Learning Journey",
    "postUrl": "https://..."
  }
  ```
- **Template**: Nouveau commentaire, lien vers post
- **Action**: Notifier, encourager réponse

### 6.3 **Like sur Post**
- **Trigger**: `likes` INSERT (Database Trigger) - OPTIONNEL
- **Quand**: Quelqu'un like un post (peut être désactivé si trop fréquent)
- **Données**:
  ```json
  {
    "emailType": "post-liked",
    "email": "user@example.com",
    "userName": "John Doe",
    "likerName": "Jane Smith",
    "postTitle": "My Learning Journey"
  }
  ```
- **Template**: Notification like (digest quotidien possible)
- **Action**: Informer discrètement

---

## 7️⃣ **NOTIFICATIONS SYSTÈME**

### 7.1 **Mise à Jour de l'Application**
- **Trigger**: Manuel (Admin déclenche)
- **Quand**: Nouvelle fonctionnalité ou mise à jour importante
- **Données**:
  ```json
  {
    "emailType": "app-update",
    "email": "user@example.com",
    "userName": "John Doe",
    "title": "New Features Available!",
    "message": "We've added new courses and improved the dashboard...",
    "ctaText": "Explore Now",
    "ctaUrl": "https://.../dashboard"
  }
  ```
- **Template**: Annonce mise à jour, nouvelles fonctionnalités
- **Action**: Informer, encourager à explorer

### 7.2 **Maintenance Programmée**
- **Trigger**: Manuel (Admin déclenche)
- **Quand**: Maintenance planifiée
- **Données**:
  ```json
  {
    "emailType": "maintenance-notice",
    "email": "user@example.com",
    "userName": "John Doe",
    "maintenanceDate": "2024-01-20",
    "maintenanceTime": "02:00 - 04:00 UTC",
    "duration": "2 hours"
  }
  ```
- **Template**: Avis de maintenance, horaires
- **Action**: Informer à l'avance, minimiser impact

---

## 📊 **PRIORISATION DES WORKFLOWS N8N**

### ✅ **Phase 1 - Essentiels (À faire en premier)**
1. ✅ Sign Up (Inscription)
2. ✅ Subscription Purchased (Student & Teacher)
3. ✅ Subscription Cancelled
4. ✅ Level Up
5. ✅ Lesson Completed
6. ✅ Course Completed
7. ✅ Achievement Unlocked

### ⚠️ **Phase 2 - Importants (Après Phase 1)**
8. ⚠️ Subscription Upgraded/Downgraded
9. ⚠️ Payment Failed
10. ⚠️ Renewal Reminder
11. ⚠️ XP Milestone
12. ⚠️ Streak Milestone

### 📅 **Phase 3 - Engagement (Optionnel)**
13. 📅 Inactivity Reminder (7 jours)
14. 📅 New Lessons Available
15. 📅 New Course Available
16. 📅 Habit Completed

### 🔔 **Phase 4 - Social (Optionnel)**
17. 🔔 New Follower
18. 🔔 Post Comment
19. 🔔 App Update

---

## 🎯 **Recommandations d'Implémentation**

### **Workflow N8N Unique avec Routes**
Créer **1 workflow principal** avec un **Switch Node** qui route selon `emailType` :

```
Webhook → Switch (emailType) → Templates → SMTP → Logs
```

### **Triggers Database**
Utiliser **Supabase Database Triggers** pour déclencher les webhooks N8N :

```sql
-- Exemple: Level Up Trigger
CREATE OR REPLACE FUNCTION notify_level_up()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level > OLD.level THEN
    -- Appeler webhook N8N
    PERFORM net.http_post(
      url := 'https://n8n.yourdomain.com/webhook/email',
      body := jsonb_build_object(
        'emailType', 'level-up',
        'email', (SELECT email FROM auth.users WHERE id = NEW.id),
        'userName', NEW.full_name,
        'oldLevel', OLD.level,
        'newLevel', NEW.level
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### **Configuration N8N**
- **1 Webhook** pour recevoir tous les emails
- **Switch Node** pour router par `emailType`
- **Function Nodes** pour générer templates HTML
- **SMTP Node** (SendGrid) pour envoyer
- **Supabase Node** pour logger dans `email_logs`

---

## 📝 **Prochaines Étapes**

1. ✅ Créer le workflow N8N principal
2. ✅ Configurer les templates pour Phase 1
3. ✅ Tester chaque trigger
4. ✅ Configurer les Database Triggers Supabase
5. ✅ Migrer depuis l'ancien système
6. ✅ Monitorer et optimiser
