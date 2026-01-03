# 📧 Email Automation Setup Guide - Supabase

This guide explains how to set up and use the email automation system for The Human Catalyst University using Supabase.

## 🎯 Overview

The email automation system sends automated emails for:
1. **Sign-in Confirmations** - Sent when users sign in to their account
2. **Payment Confirmations** - Sent when users complete a subscription payment
3. **Lesson Completions** - Sent when users complete a lesson
4. **New Lessons Available** - Sent when new lessons are added to the platform
5. **App Updates** - Sent for announcements and platform updates

## 🔧 Setup Instructions

### Step 1: Configure Supabase SMTP

1. **Go to Supabase Dashboard:**
   - Navigate to https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm
   - Go to **Settings** → **Auth** → **SMTP Settings**

2. **Enable Custom SMTP:**
   - Toggle "Enable Custom SMTP" to ON
   - Configure your SMTP server:
     - **Host:** Your SMTP server (e.g., `smtp.gmail.com`, `smtp.sendgrid.net`)
     - **Port:** SMTP port (usually 587 for TLS or 465 for SSL)
     - **Username:** Your SMTP username
     - **Password:** Your SMTP password
     - **Sender Email:** `noreply@humancatalystbeacon.com` (or your verified domain)
     - **Sender Name:** `The Human Catalyst University`

3. **SMTP Service Options:**
   - **Gmail:** Use Gmail SMTP (requires app password)
   - **SendGrid:** Use SendGrid SMTP
   - **Mailgun:** Use Mailgun SMTP
   - **AWS SES:** Use Amazon SES SMTP
   - **Any SMTP service:** Works with any SMTP-compatible service

### Step 2: Run Database Migration

Run the email system migration in Supabase SQL Editor:

1. **Go to SQL Editor:**
   - Navigate to https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/sql
   - Click "New Query"

2. **Run Migration:**
   - Open `supabase/migrations/create_email_system.sql`
   - Copy and paste the contents
   - Click "Run" to execute

This creates:
- `email_queue` table for queuing emails
- `send_email_via_smtp()` function for queuing emails
- `process_email_queue()` function for processing emails

### Step 3: Deploy Supabase Edge Function

Deploy the email Edge Function:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref mbffycgrqfeesfnhhcdm

# Deploy the email function
supabase functions deploy send-email
```

**Or manually via Dashboard:**
1. Go to **Edge Functions** in Supabase Dashboard
2. Create new function: `send-email`
3. Copy contents from `supabase/functions/send-email/index.ts`
4. Deploy

### Step 4: Set Edge Function Secrets (Optional)

If you need custom configuration, set secrets:

```bash
supabase secrets set SITE_NAME="The Human Catalyst University"
supabase secrets set SITE_URL="https://humancatalystbeacon.com"
supabase secrets set FROM_EMAIL="noreply@humancatalystbeacon.com"
supabase secrets set FROM_NAME="The Human Catalyst University"
```

Or via Dashboard:
- Go to **Edge Functions** → **Settings** → **Secrets**

### Step 5: Configure Environment Variables

Update your `server.env` file:

```env
# Email Configuration (Supabase SMTP)
# Configure SMTP in Supabase Dashboard: Settings > Auth > SMTP Settings
FROM_EMAIL=noreply@humancatalystbeacon.com
FROM_NAME=The Human Catalyst University
SITE_NAME=The Human Catalyst University
SITE_URL=https://humancatalystbeacon.com
```

## 📨 Email Types & Triggers

### 1. Sign-in Confirmation Emails

**Trigger:** Automatically sent when a user successfully signs in

**Location:** `src/contexts/AuthContext.jsx` - `signIn()` function

**What it includes:**
- Sign-in time
- IP address (if available)
- Security notice if sign-in wasn't user

**Configuration:** No additional setup needed - works automatically

### 2. Payment Confirmation Emails

**Trigger:** Automatically sent when:
- User completes Stripe checkout (`checkout.session.completed` webhook)
- Payment success endpoint is called (`/api/payment-success`)

**Location:** `server.js` - Payment webhook handlers

**What it includes:**
- Plan name (Student/Teacher)
- Payment amount
- Subscription ID
- Welcome message

**Configuration:** No additional setup needed - works automatically

### 3. Lesson Completion Emails

**Trigger:** Automatically sent when:
- User completes a lesson via `courseService.completeLesson()`
- User completes a roadmap lesson via `roadmapService.completeLesson()`

**Location:** 
- `src/services/courseService.js`
- `src/services/roadmapService.js`

**What it includes:**
- Lesson title
- Course name
- XP earned
- Total XP
- Continue learning button

**Configuration:** No additional setup needed - works automatically

### 4. New Lessons Available Emails

**Trigger:** Manually triggered via API endpoint or Edge Function

**Usage:**
```javascript
// From client-side
import { emailService } from './services/emailService'

await emailService.sendNewLessonsAvailable(
  'user@example.com',
  'John Doe',
  [
    {
      title: 'Introduction to Mindfulness',
      courseName: 'Insight Masterschool',
      url: 'https://humancatalystbeacon.com/courses/1/chapter/1/lesson/1'
    }
  ]
)
```

### 5. App Update/Announcement Emails

**Trigger:** Manually triggered via API endpoint or Edge Function

**Usage:**
```javascript
// From client-side
import { emailService } from './services/emailService'

await emailService.sendAppUpdate(
  'user@example.com',
  'John Doe',
  'New Feature: Enhanced Dashboard',
  'We\'ve just launched a new enhanced dashboard with better analytics.',
  'View Dashboard',
  'https://humancatalystbeacon.com/dashboard'
)
```

## 🔍 Testing Email Automation

### Test Sign-in Email

1. Sign in to your account
2. Check your email inbox
3. You should receive a sign-in confirmation email

### Test Payment Email

1. Complete a test payment using Stripe test mode
2. Check your email inbox
3. You should receive a payment confirmation email

### Test Lesson Completion Email

1. Complete a lesson in the app
2. Check your email inbox
3. You should receive a lesson completion email

### Test Edge Function Directly

```bash
curl -X POST https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "sign-in",
    "email": "your-email@example.com",
    "userName": "Test User",
    "loginTime": "2024-01-01 12:00:00"
  }'
```

## 🛠️ How It Works

### Architecture

1. **Client/Server** → Calls Supabase Edge Function `send-email`
2. **Edge Function** → Queues email in `email_queue` table
3. **Database Trigger/Function** → Processes queue and sends via SMTP
4. **SMTP Server** → Delivers email to recipient

### Email Queue System

Emails are queued in the `email_queue` table:
- Status: `pending`, `sent`, or `failed`
- Automatic retry on failure
- Processing via `process_email_queue()` function

### SMTP Configuration

Supabase uses your configured SMTP settings to send emails:
- Configured in Dashboard: Settings → Auth → SMTP Settings
- Works with any SMTP-compatible service
- No additional API keys needed (uses SMTP credentials)

## 🛠️ Troubleshooting

### Emails Not Sending

1. **Check SMTP Configuration:**
   - Verify SMTP is enabled in Supabase Dashboard
   - Test SMTP credentials
   - Check SMTP server logs

2. **Check Email Queue:**
   ```sql
   SELECT * FROM email_queue 
   WHERE status = 'pending' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

3. **Check Edge Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → `send-email` → Logs
   - Look for errors

4. **Verify Edge Function Deployment:**
   ```bash
   supabase functions list
   ```

### SMTP Configuration Issues

1. **Test SMTP Connection:**
   - Use Supabase's SMTP test feature in Dashboard
   - Verify credentials are correct

2. **Check SMTP Limits:**
   - Some services have daily sending limits
   - Check your SMTP provider's dashboard

3. **Verify Sender Email:**
   - Must match SMTP account email
   - Or be a verified sender in your SMTP service

### Edge Function Not Found

1. **Deploy Function:**
   ```bash
   supabase functions deploy send-email
   ```

2. **Check Function URL:**
   - Should be: `https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/send-email`
   - Verify in Edge Functions dashboard

## 📊 Monitoring

### Supabase Dashboard

1. **Email Queue:**
   - Query `email_queue` table to see pending/sent emails
   - Check for failed emails

2. **Edge Function Logs:**
   - View logs in Edge Functions dashboard
   - Monitor function execution

3. **SMTP Logs:**
   - Check your SMTP provider's dashboard
   - Monitor delivery rates

### Database Queries

```sql
-- Check email queue status
SELECT 
  status,
  COUNT(*) as count
FROM email_queue
GROUP BY status;

-- Check recent emails
SELECT * FROM email_queue
ORDER BY created_at DESC
LIMIT 20;

-- Check failed emails
SELECT * FROM email_queue
WHERE status = 'failed'
ORDER BY created_at DESC;
```

## 🎨 Customizing Email Templates

Email templates are located in:
- `supabase/functions/send-email/index.ts` - Template functions

To customize:
1. Edit template functions in Edge Function
2. Modify HTML/CSS in template strings
3. Update branding colors, fonts, etc.
4. Redeploy Edge Function: `supabase functions deploy send-email`

## 🔒 Security Considerations

1. **SMTP Credentials:**
   - Stored securely in Supabase Dashboard
   - Never commit to version control
   - Rotate credentials regularly

2. **Edge Function Security:**
   - Uses Supabase service role key (server-side only)
   - Rate limiting on API endpoints
   - Email validation before sending

3. **RLS Policies:**
   - Email queue table has RLS enabled
   - Only service role can access

## 📝 Production Deployment

### 1. Configure Production SMTP

- Use production SMTP service (SendGrid, Mailgun, AWS SES)
- Verify sender domain
- Set up SPF/DKIM records

### 2. Deploy Edge Function

```bash
supabase functions deploy send-email --project-ref mbffycgrqfeesfnhhcdm
```

### 3. Set Production Secrets

```bash
supabase secrets set SITE_URL="https://humancatalystbeacon.com"
supabase secrets set FROM_EMAIL="noreply@humancatalystbeacon.com"
```

### 4. Test in Production

1. Send test emails
2. Verify delivery
3. Check spam folder
4. Monitor email queue

## 🚀 Next Steps

1. ✅ Configure SMTP in Supabase Dashboard
2. ✅ Run database migration (`create_email_system.sql`)
3. ✅ Deploy Edge Function (`send-email`)
4. ✅ Test sign-in email
5. ✅ Test payment email
6. ✅ Verify email delivery

## 📞 Support

If you encounter issues:
1. Check Supabase Dashboard for SMTP configuration
2. Review Edge Function logs
3. Check email queue table
4. Verify SMTP credentials

For Supabase support: https://supabase.com/docs/guides/auth/auth-smtp
