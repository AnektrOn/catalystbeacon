# 🔒 Bulletproof Email System - Implementation Guide

## Problem Identified

**Current Issue:** Only sign-up emails work because they're called directly from the frontend. Payment emails and other emails are queued but never actually sent because:
1. The `send-email` Edge Function only queues emails, doesn't send them
2. There's no background processor to send queued emails
3. Database triggers don't exist to automatically queue emails on events

## Solution: Multi-Layer Bulletproof System

This system has **3 independent layers** - if one fails, the others still work:

### Layer 1: Database Triggers (Automatic)
- Automatically queue emails when `subscription_status` changes to 'active'
- Automatically queue emails when `role` changes
- **Works even if server.js is down**

### Layer 2: Direct Edge Function Calls (Immediate)
- Server.js and frontend directly call `send-email` Edge Function
- Edge Function queues email AND attempts direct send
- **Works even if database triggers fail**

### Layer 3: Queue Processor (Backup)
- `process-email-queue` Edge Function processes pending emails
- Can be called by Supabase cron job every minute
- **Ensures no email is ever lost**

## Implementation Steps

### Step 1: Run Database Migration

```sql
-- Run this in Supabase SQL Editor
\i supabase/migrations/create_bulletproof_email_triggers.sql
```

This creates:
- Updated `email_queue` table with proper structure
- Database triggers that automatically queue emails on events
- Helper functions for queue management

### Step 2: Deploy Edge Functions

```bash
# Deploy send-email function (updated to actually send emails)
supabase functions deploy send-email

# Deploy process-email-queue function (processes queue)
supabase functions deploy process-email-queue
```

### Step 3: Set Up Supabase Cron Job (Optional but Recommended)

In Supabase Dashboard → Database → Cron Jobs:

```sql
-- Run every minute to process email queue
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    )
  ) AS request_id;
  $$
);
```

### Step 4: Configure SMTP in Supabase

1. Go to Supabase Dashboard → Settings → Auth → SMTP Settings
2. Enable "Enable Custom SMTP"
3. Enter your SMTP credentials:
   - **Host:** smtp.gmail.com (or your SMTP provider)
   - **Port:** 587
   - **Username:** your-email@gmail.com
   - **Password:** your-app-password
   - **Sender email:** noreply@humancatalystbeacon.com
   - **Sender name:** The Human Catalyst University

## How It Works

### Payment Confirmation Email Flow

1. **User completes payment** → Stripe webhook fires
2. **Server.js updates profile** → `subscription_status = 'active'`
3. **Database trigger fires** → Automatically queues payment email
4. **Server.js also calls Edge Function** → Direct email send attempt
5. **Queue processor runs** → Processes any pending emails every minute

**Result:** Email is sent via at least one method, often multiple methods (redundancy)

### Sign-Up Email Flow

1. **User signs up** → Frontend calls `send-email` Edge Function
2. **Edge Function sends email** → Direct send + queue as backup
3. **Email delivered** → User receives welcome email

## Testing

### Test Payment Email

1. Make a test payment
2. Check Supabase logs for:
   - "📧 Sending payment confirmation email"
   - "✅ Payment confirmation email sent"
3. Check `email_queue` table:
   ```sql
   SELECT * FROM email_queue 
   WHERE email_type = 'payment' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
4. Verify email status is 'sent'

### Test Database Trigger

1. Manually update a profile:
   ```sql
   UPDATE profiles 
   SET subscription_status = 'active' 
   WHERE id = 'USER_ID';
   ```
2. Check if email was queued:
   ```sql
   SELECT * FROM email_queue 
   WHERE email_type = 'payment' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

### Test Queue Processor

1. Manually call the processor:
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
   ```
2. Check if pending emails were processed

## Monitoring

### Check Email Queue Status

```sql
SELECT 
  email_type,
  status,
  COUNT(*) as count
FROM email_queue
GROUP BY email_type, status
ORDER BY email_type, status;
```

### Check Failed Emails

```sql
SELECT 
  id,
  email_type,
  recipient_email,
  error_message,
  attempts,
  created_at
FROM email_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Processing Stats

```sql
SELECT 
  DATE(created_at) as date,
  email_type,
  status,
  COUNT(*) as count
FROM email_queue
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), email_type, status
ORDER BY date DESC, email_type;
```

## Troubleshooting

### Emails Not Sending

1. **Check SMTP Configuration**
   - Go to Supabase Dashboard → Settings → Auth → SMTP
   - Verify SMTP is enabled and credentials are correct

2. **Check Edge Function Logs**
   - Go to Supabase Dashboard → Edge Functions → send-email → Logs
   - Look for errors

3. **Check Database Triggers**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%email%';
   ```

4. **Check Email Queue**
   ```sql
   SELECT * FROM email_queue WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10;
   ```

### Emails Queued But Not Sent

1. **Check Queue Processor**
   - Verify `process-email-queue` function is deployed
   - Check if cron job is running (if configured)
   - Manually trigger processor to test

2. **Check Retry Logic**
   - Emails retry up to 3 times
   - Check `attempts` and `max_attempts` in queue

## Benefits of This System

✅ **Bulletproof:** 3 independent layers ensure emails are never lost
✅ **Automatic:** Database triggers work even if server is down
✅ **Redundant:** Multiple methods ensure delivery
✅ **Monitored:** Easy to check queue status and failures
✅ **Scalable:** Queue processor handles high volume
✅ **Reliable:** Retry logic handles temporary failures

## Next Steps

1. ✅ Run database migration
2. ✅ Deploy Edge Functions
3. ✅ Configure SMTP in Supabase
4. ✅ Set up cron job (optional)
5. ✅ Test payment email flow
6. ✅ Monitor email queue for 24 hours
7. ✅ Adjust retry logic if needed
