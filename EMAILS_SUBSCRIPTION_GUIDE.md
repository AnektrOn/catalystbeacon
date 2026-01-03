# 📧 Guide des Emails d'Abonnement

## ✅ Emails Automatiques Configurés

### 1. 📧 Email de Confirmation de Paiement
**Quand:** Lorsqu'un utilisateur complète un paiement
**Contenu:**
- Plan souscrit (Student/Teacher)
- Montant payé
- ID de l'abonnement
- Message de bienvenue

**Déclencheur:** `checkout.session.completed` webhook

---

### 2. 🔄 Email de Changement de Rôle
**Quand:** Lorsque le rôle d'un utilisateur change (ex: Student → Teacher)
**Contenu:**
- Ancien rôle
- Nouveau rôle
- Accès aux nouvelles fonctionnalités

**Déclencheur:** `customer.subscription.updated` webhook (si le rôle change)

---

### 3. ⚠️ Email d'Annulation d'Abonnement
**Quand:** Lorsqu'un utilisateur annule son abonnement
**Contenu:**
- Plan annulé
- Date d'annulation
- Information sur la fin de l'accès
- Lien pour réactiver

**Déclencheur:** `customer.subscription.deleted` webhook

---

### 4. ⏰ Email de Rappel 3 Jours Avant Renouvellement
**Quand:** 3 jours avant le renouvellement automatique
**Contenu:**
- Date de renouvellement
- Montant qui sera facturé
- Lien pour annuler (si souhaité)
- Lien vers le tableau de bord

**Déclencheur:** `invoice.upcoming` webhook (Stripe envoie cet événement ~3 jours avant)

---

## 🔧 Configuration Requise

### Webhooks Stripe à Configurer

Dans votre Dashboard Stripe (https://dashboard.stripe.com/webhooks):

1. **Allez sur Webhooks**
2. **Ajoutez/modifiez votre endpoint**
3. **Sélectionnez ces événements:**
   - ✅ `checkout.session.completed` - Confirmation de paiement
   - ✅ `customer.subscription.created` - Nouvel abonnement
   - ✅ `customer.subscription.updated` - Changement d'abonnement (rôle)
   - ✅ `customer.subscription.deleted` - Annulation
   - ✅ `invoice.payment_succeeded` - Paiement réussi
   - ✅ `invoice.payment_failed` - Échec de paiement
   - ✅ `invoice.upcoming` - **NOUVEAU** - Rappel avant renouvellement

### URL du Webhook

**Production:**
```
https://votre-domaine.com/api/webhook
```

**Développement:**
```
http://localhost:3001/api/webhook
```

---

## 🧪 Tester les Emails

### Test 1: Confirmation de Paiement
1. Complétez un paiement test dans Stripe
2. Vérifiez votre email
3. Vous devriez recevoir l'email de confirmation

### Test 2: Changement de Rôle
1. Modifiez l'abonnement d'un utilisateur dans Stripe
2. Changez le plan (Student → Teacher ou vice versa)
3. Vérifiez l'email de changement de rôle

### Test 3: Annulation
1. Annulez un abonnement dans Stripe Dashboard
2. Vérifiez l'email d'annulation

### Test 4: Rappel de Renouvellement
1. Créez un abonnement test dans Stripe
2. Modifiez la date de renouvellement pour être dans 3 jours
3. Stripe enverra automatiquement l'événement `invoice.upcoming`
4. Vérifiez l'email de rappel

**Ou utilisez Stripe CLI:**
```bash
stripe trigger invoice.upcoming
```

---

## 📋 Checklist de Configuration

- [ ] Webhook `invoice.upcoming` ajouté dans Stripe Dashboard
- [ ] Tous les webhooks pointent vers votre endpoint
- [ ] SMTP configuré dans Supabase
- [ ] Fonction `send-email` déployée
- [ ] Test de chaque type d'email effectué

---

## 🔍 Vérification

### Vérifier que les Emails sont Envoyés

1. **Vérifiez les logs du serveur:**
   ```bash
   # Regardez les logs pour voir les emails envoyés
   pm2 logs
   ```

2. **Vérifiez la table email_queue:**
   ```sql
   SELECT * FROM email_queue 
   WHERE email_type IN ('payment', 'role-change', 'subscription-cancelled', 'renewal-reminder')
   ORDER BY created_at DESC 
   LIMIT 20;
   ```

3. **Vérifiez les webhooks Stripe:**
   - Allez sur Stripe Dashboard → Webhooks
   - Cliquez sur votre endpoint
   - Vérifiez les événements reçus

---

## ⚙️ Personnalisation

### Modifier les Templates d'Email

Les templates sont dans:
- `supabase/functions/send-email/index.ts`

Fonctions de template:
- `getPaymentConfirmationTemplate()` - Confirmation de paiement
- `getRoleChangeTemplate()` - Changement de rôle
- `getSubscriptionCancelledTemplate()` - Annulation
- `getRenewalReminderTemplate()` - Rappel de renouvellement

Après modification, redéployez:
```bash
supabase functions deploy send-email
```

---

## 🎯 Résumé

✅ **4 types d'emails automatiques:**
1. Confirmation de paiement → Envoyé à chaque paiement
2. Changement de rôle → Envoyé quand le rôle change
3. Annulation → Envoyé quand l'abonnement est annulé
4. Rappel 3 jours avant → Envoyé automatiquement par Stripe

✅ **Tout est automatique** - Aucune action manuelle requise!

✅ **Webhook `invoice.upcoming`** - Doit être ajouté dans Stripe Dashboard

---

## 🆘 Problèmes Courants

### Email de rappel pas reçu
- Vérifiez que `invoice.upcoming` est dans les webhooks Stripe
- Vérifiez que le webhook arrive bien (logs Stripe)
- Vérifiez que SMTP est configuré dans Supabase

### Email de changement de rôle pas envoyé
- Vérifiez que le rôle a vraiment changé (ancien ≠ nouveau)
- Vérifiez les logs du serveur pour les erreurs

### Emails pas reçus du tout
- Vérifiez SMTP dans Supabase Dashboard
- Vérifiez le dossier spam
- Vérifiez la table `email_queue` pour voir si les emails sont en queue

---

Tout est prêt! Il suffit d'ajouter le webhook `invoice.upcoming` dans Stripe Dashboard! 🎉

