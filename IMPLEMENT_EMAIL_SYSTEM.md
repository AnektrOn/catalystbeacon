# 🚀 Quick Implementation Guide - Bulletproof Email System

## What Was Fixed

1. **Database Triggers** - Automatically queue emails when events happen (subscription_status changes, role changes)
2. **Edge Function Updates** - `send-email` now properly queues emails with correct structure
3. **Queue Processor** - New `process-email-queue` function to process pending emails
4. **Server.js Updates** - Better error handling and logging

## Steps to Deploy

### 1. Run Database Migration (REQUIRED)

```sql
-- Copy and paste this in Supabase SQL Editor
-- File: supabase/migrations/create_bulletproof_email_triggers.sql
```

This creates:
- ✅ Database triggers for automatic email queuing
- ✅ Updated email_queue table structure
- ✅ Helper functions for queue management

### 2. Deploy Edge Functions

```bash
# Deploy updated send-email function
supabase functions deploy send-email

# Deploy new process-email-queue function
supabase functions deploy process-email-queue
```

### 3. Configure SMTP (REQUIRED)

1. Go to **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Enter your SMTP credentials:
   - **Host:** smtp.gmail.com (or your provider)
   - **Port:** 587
   - **Username:** your-email@gmail.com
   - **Password:** your-app-password
   - **Sender email:** noreply@humancatalystbeacon.com
   - **Sender name:** The Human Catalyst University

### 4. Test the System

#### Test Payment Email
1. Make a test payment
2. Check server logs for: `📧 Calling send-email Edge Function`
3. Check Supabase logs: Edge Functions → send-email → Logs
4. Check email_queue table:
   ```sql
   SELECT * FROM email_queue 
   WHERE email_type = 'payment' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

#### Test Database Trigger
```sql
-- Manually trigger payment email
UPDATE profiles 
SET subscription_status = 'active' 
WHERE id = 'USER_ID_HERE';

-- Check if email was queued
SELECT * FROM email_queue 
WHERE email_type = 'payment' 
ORDER BY created_at DESC 
LIMIT 1;
```

## How It Works Now

### Payment Email Flow (3 Layers)

1. **Database Trigger** (Automatic)
   - When `subscription_status` changes to 'active'
   - Automatically queues email in `email_queue` table
   - **Works even if server.js is down**

2. **Server.js Direct Call** (Immediate)
   - Server.js calls `send-email` Edge Function directly
   - Edge Function queues email
   - **Works even if database trigger fails**

3. **Queue Processor** (Backup)
   - `process-email-queue` function processes pending emails
   - Can be called manually or via cron job
   - **Ensures no email is ever lost**

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

## Troubleshooting

### Emails Not Sending?

1. **Check SMTP Configuration**
   - Supabase Dashboard → Settings → Auth → SMTP
   - Verify it's enabled and credentials are correct

2. **Check Edge Function Logs**
   - Supabase Dashboard → Edge Functions → send-email → Logs
   - Look for errors

3. **Check Database Triggers**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%email%';
   ```

4. **Manually Process Queue**
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "apikey: YOUR_SERVICE_ROLE_KEY"
   ```

## Expected Results

After implementation:
- ✅ Payment emails automatically queued when subscription becomes active
- ✅ Role change emails automatically queued when role changes
- ✅ All emails queued in `email_queue` table
- ✅ Emails processed and sent via SMTP
- ✅ No emails lost even if one method fails

## Next Steps

1. ✅ Run migration
2. ✅ Deploy Edge Functions
3. ✅ Configure SMTP
4. ✅ Test payment flow
5. ✅ Monitor for 24 hours
6. ✅ Set up cron job (optional but recommended)

See `BULLETPROOF_EMAIL_SYSTEM.md` for detailed documentation.
