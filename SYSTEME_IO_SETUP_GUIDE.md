# Systeme.io Integration Setup Guide

This guide will help you set up Systeme.io webhooks to automatically create users in Supabase, track payments, and manage affiliate commissions.

## 📋 Prerequisites

1. Systeme.io account with webhook access
2. Your server running on `https://app.humancatalystbeacon.com`
3. Supabase project with the migration applied

## 🔧 Step 1: Run Database Migration

Run the migration file to add Systeme.io fields to your database:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/add_systeme_io_integration.sql
```

This will:
- Add Systeme.io fields to `profiles` table
- Create `payments` table for tracking purchases
- Create `affiliate_commissions` table for tracking affiliate commissions

## 🔑 Step 2: Add Environment Variables

Add these to your `server.env` file on your Hostinger server:

```env
SYSTEME_WEBHOOK_SECRET=your_webhook_secret_here
```

**Note:** If Systeme.io doesn't provide webhook secrets, you can leave this empty. The webhook will still work, but you should add IP whitelisting in production.

## 🌐 Step 3: Configure Systeme.io Webhooks

### 3.1 Contact Created (Signup) Webhook

1. Go to Systeme.io → Settings → Webhooks
2. Add a new webhook:
   - **Event:** Contact Created / New Contact
   - **URL:** `https://app.humancatalystbeacon.com/api/webhook/systeme/contact-created`
   - **Method:** POST
   - **Format:** JSON

**Expected Payload:**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "contact_id": "contact_123",
  "affiliate_id": "aff_456"
}
```

### 3.2 Purchase Completed Webhook

1. Add another webhook:
   - **Event:** Purchase Completed / Order Completed
   - **URL:** `https://app.humancatalystbeacon.com/api/webhook/systeme/purchase-completed`
   - **Method:** POST
   - **Format:** JSON

**Expected Payload:**
```json
{
  "email": "user@example.com",
  "contact_id": "contact_123",
  "order_id": "order_789",
  "amount": 99.00,
  "currency": "USD",
  "product_name": "Student Monthly Plan",
  "affiliate_id": "aff_456",
  "purchase_date": "2025-12-22T10:00:00Z"
}
```

### 3.3 Affiliate Tracking Webhook

1. Add another webhook:
   - **Event:** Affiliate Tracking / Referral
   - **URL:** `https://app.humancatalystbeacon.com/api/webhook/systeme/affiliate-tracking`
   - **Method:** POST
   - **Format:** JSON

**Expected Payload:**
```json
{
  "email": "user@example.com",
  "contact_id": "contact_123",
  "affiliate_id": "aff_456",
  "affiliate_name": "John Affiliate",
  "commission_amount": 10.00
}
```

## 🔄 Step 4: How It Works

### Signup Flow

1. User signs up through Systeme.io funnel
2. Systeme.io sends webhook to `/api/webhook/systeme/contact-created`
3. Server creates user in Supabase Auth (with auto-confirmed email)
4. Profile is automatically created with Systeme.io data
5. User can log in immediately (password reset required on first login)

### Payment Flow

1. User completes purchase in Systeme.io
2. Systeme.io sends webhook to `/api/webhook/systeme/purchase-completed`
3. Server finds user by email (or creates if doesn't exist)
4. User role is upgraded to `Student`
5. Payment record is created in `payments` table
6. Subscription status is set to `active`

### Affiliate Flow

1. User is referred by an affiliate
2. Systeme.io sends webhook to `/api/webhook/systeme/affiliate-tracking`
3. Affiliate information is stored in user's profile
4. Commission record is created in `affiliate_commissions` table

## 🧪 Step 5: Testing

### Test Contact Created Webhook

```bash
curl -X POST https://app.humancatalystbeacon.com/api/webhook/systeme/contact-created \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "contact_id": "test_123",
    "affiliate_id": "aff_test"
  }'
```

### Test Purchase Completed Webhook

```bash
curl -X POST https://app.humancatalystbeacon.com/api/webhook/systeme/purchase-completed \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "contact_id": "test_123",
    "order_id": "order_test",
    "amount": 99.00,
    "currency": "USD",
    "product_name": "Test Product",
    "affiliate_id": "aff_test"
  }'
```

## 📊 Step 6: View Data

### Check User Profile

```sql
SELECT 
  id, 
  email, 
  full_name, 
  role,
  systeme_contact_id,
  affiliate_id,
  systeme_order_id,
  systeme_purchase_amount
FROM profiles
WHERE systeme_contact_id IS NOT NULL;
```

### Check Payments

```sql
SELECT 
  p.*,
  pr.email,
  pr.full_name
FROM payments p
JOIN profiles pr ON p.user_id = pr.id
ORDER BY p.created_at DESC;
```

### Check Affiliate Commissions

```sql
SELECT 
  ac.*,
  pr.email,
  pr.full_name
FROM affiliate_commissions ac
JOIN profiles pr ON ac.user_id = pr.id
ORDER BY ac.created_at DESC;
```

## 🔒 Security Notes

1. **Webhook Secret:** If Systeme.io provides webhook secrets, add them to `SYSTEME_WEBHOOK_SECRET` and implement signature verification in `verifySystemeWebhook` function.

2. **IP Whitelisting:** In production, consider adding IP whitelisting to only accept webhooks from Systeme.io IPs.

3. **Rate Limiting:** The webhook endpoints use general rate limiting. Adjust if needed.

4. **Password Reset:** Users created from Systeme.io get a random password. They should reset it on first login. Consider adding a password reset flow.

## 🐛 Troubleshooting

### User Not Created

- Check server logs: `pm2 logs hcuniversity-app`
- Verify webhook is being received
- Check if email already exists in Supabase
- Verify Supabase service role key is correct

### Payment Not Tracked

- Check if user exists (email match)
- Verify webhook payload format matches expected format
- Check `payments` table exists and has correct permissions

### Affiliate Not Tracked

- Verify `affiliate_id` is in webhook payload
- Check `affiliate_commissions` table exists
- Verify user profile is updated correctly

## 📝 Next Steps

1. Set up password reset flow for Systeme.io users
2. Add email notifications when users are created
3. Create admin dashboard to view Systeme.io signups and payments
4. Set up automated affiliate commission payouts
5. Add analytics to track conversion rates

## 🔗 Related Files

- `server.js` - Webhook endpoints and user creation logic
- `supabase/migrations/add_systeme_io_integration.sql` - Database schema
- `.env` / `server.env` - Environment variables

