# 📧 Supabase Email Setup Guide

## ✅ Current Configuration

Your application is now configured to use **Supabase Edge Functions** for sending emails instead of SMTP.

## 🔧 How It Works

1. **Client/Server** calls Supabase Edge Function `send-email`
2. **Edge Function** queues email in `email_queue` table
3. **Database trigger** processes queue and sends via Supabase SMTP
4. **Email delivered** to user

## 📋 Required Setup

### 1. Configure SMTP in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to: **Settings** → **Auth** → **SMTP Settings**
3. Enable **Custom SMTP**
4. Enter your SMTP credentials:
   - **Host**: `smtp.your-provider.com`
   - **Port**: `587` (or `465` for SSL)
   - **Username**: Your email address
   - **Password**: Your email password
   - **Sender email**: `noreply@yourdomain.com`
   - **Sender name**: `The Human Catalyst University`

### 2. Deploy Supabase Edge Function

Make sure the `send-email` Edge Function is deployed:

```bash
# If using Supabase CLI
supabase functions deploy send-email

# Or deploy via Supabase Dashboard:
# Go to Edge Functions → Deploy
```

### 3. Run Database Migration

Run the email queue migration in Supabase SQL Editor:

```sql
-- File: supabase/migrations/create_email_system.sql
-- This creates the email_queue table and functions
```

### 4. Verify Environment Variables

**Server (`server.env`):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Frontend (`.env`):**
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Testing

### Test Signup Email

1. Create a new account
2. Check browser console for: `✅ Sign-up email sent successfully via Supabase`
3. Check server console for email logs
4. Check your email inbox (and spam folder)

### Test Payment Email

1. Complete a payment
2. Check server console for: `✅ Payment confirmation email sent successfully`
3. Check your email inbox

### Test Edge Function Directly

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "sign-up",
    "email": "test@example.com",
    "userName": "Test User"
  }'
```

## 📊 Email Types Supported

- ✅ `sign-up` - Welcome email after account creation
- ✅ `sign-in` - Sign-in confirmation email
- ✅ `payment` - Payment confirmation email
- ✅ `lesson-completion` - Lesson completion notification
- ✅ `new-lessons` - New lessons available notification
- ✅ `app-update` - App update announcements
- ✅ `role-change` - Role change notifications
- ✅ `subscription-cancelled` - Subscription cancellation email
- ✅ `renewal-reminder` - Renewal reminder email

## 🔍 Troubleshooting

### Emails Not Sending

1. **Check Supabase SMTP Configuration**
   - Go to Settings → Auth → SMTP Settings
   - Verify SMTP is enabled and configured correctly
   - Test SMTP connection

2. **Check Edge Function Logs**
   - Go to Supabase Dashboard → Edge Functions → send-email → Logs
   - Look for errors or warnings

3. **Check Email Queue Table**
   ```sql
   SELECT * FROM email_queue 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
   - Check if emails are being queued
   - Check status: `pending`, `sent`, or `failed`

4. **Check Server Logs**
   - Look for: `✅ Email sent via Supabase Edge Function`
   - Or errors: `❌ Error sending email via Supabase`

### Common Issues

**Issue**: "Supabase configuration missing"
- **Fix**: Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `server.env`

**Issue**: "Edge Function not found"
- **Fix**: Deploy the `send-email` Edge Function

**Issue**: "Email queue table not found"
- **Fix**: Run the database migration `create_email_system.sql`

**Issue**: "SMTP not configured"
- **Fix**: Configure SMTP in Supabase Dashboard → Settings → Auth → SMTP Settings

## 📝 Next Steps

1. ✅ Configure SMTP in Supabase Dashboard
2. ✅ Deploy Edge Function (if not already deployed)
3. ✅ Run database migration
4. ✅ Test signup email
5. ✅ Test payment email

## 🎯 Benefits of Supabase Email

- ✅ No external SMTP service needed (uses Supabase's SMTP)
- ✅ Centralized email management
- ✅ Email queue for reliability
- ✅ Built-in retry logic
- ✅ Easy to monitor via Supabase Dashboard
