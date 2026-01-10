# 🔍 Debug Payment Database Update Issues

## Problem
Payment completes but database is not updated.

## Debugging Steps

### 1. Check Server Logs

Look for these log messages in order:

```
=== PAYMENT SUCCESS ENDPOINT CALLED ===
Session ID: cs_test_...
Stripe session retrieved: { id: ..., userId: ..., subscriptionId: ... }
Stripe subscription retrieved: { id: ..., priceId: ..., status: ... }
Determined role: Student for price ID: price_...
🔑 Using userId: ...
Current user profile: { role: ..., subscription_status: ..., subscription_id: ... }
🔄 Attempting to update profile with data: { subscription_status: 'active', ... }
🔄 Database update attempt 1/3 for userId: ...
✅ Profile updated successfully (attempt 1): ...
✅ VERIFIED UPDATE: { id: ..., role: ..., subscription_status: 'active', ... }
✅ Subscription record created/updated: ...
=== PAYMENT SUCCESS COMPLETE ===
```

### 2. Check Browser Console

Look for:
```
🔍 Payment success check: { payment: 'success', sessionId: '...', hasUser: true, userId: '...' }
🎯 PAYMENT SUCCESS DETECTED: { payment: 'success', sessionId: '...', userId: '...' }
📍 API URL: https://app.humancatalystbeacon.com (or http://localhost:3001)
🔄 Processing payment success...
📡 Payment success response status: 200
✅ Payment success data received: { success: true, role: 'Student', ... }
```

### 3. Check Network Tab

1. Open browser DevTools → Network tab
2. Filter by "payment-success"
3. Check if request was made
4. Check response status (should be 200)
5. Check response body (should have `success: true`)

### 4. Common Issues

#### Issue 1: Missing userId in session metadata
**Symptoms:**
- Log shows: "Missing userId in session metadata"
- Error: "Missing userId in session metadata"

**Fix:** The code now tries to find user by `stripe_customer_id` as fallback

#### Issue 2: API URL is wrong
**Symptoms:**
- Network request fails with CORS error
- Network request goes to `localhost:3001` in production

**Fix:** Already fixed - uses `window.location.origin` in production

#### Issue 3: Database update fails silently
**Symptoms:**
- No error in logs
- Database not updated

**Fix:** Added retry logic and better error logging

#### Issue 4: Session doesn't have subscription
**Symptoms:**
- Error: "No subscription found in checkout session"

**Fix:** Check if Stripe checkout session was created correctly

### 5. Manual Database Check

Run this SQL to check the current state:

```sql
-- Check profile
SELECT 
  id, 
  email, 
  role, 
  subscription_status, 
  subscription_id, 
  stripe_customer_id,
  updated_at
FROM profiles
WHERE id = 'YOUR_USER_ID'
ORDER BY updated_at DESC;

-- Check subscriptions table
SELECT 
  user_id,
  stripe_subscription_id,
  status,
  plan_type,
  updated_at
FROM subscriptions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY updated_at DESC;
```

### 6. Test Payment Success Endpoint Manually

```bash
# Replace with actual session_id from Stripe
curl "https://app.humancatalystbeacon.com/api/payment-success?session_id=cs_test_..." \
  -H "Content-Type: application/json"
```

### 7. Check Webhook

The webhook should also update the database. Check webhook logs:

```bash
# In Stripe Dashboard → Webhooks → View logs
# Look for "checkout.session.completed" event
```

### 8. Force Update (Emergency)

If payment succeeded but database wasn't updated, you can manually update:

```sql
-- Replace with actual values
UPDATE profiles
SET 
  subscription_status = 'active',
  subscription_id = 'sub_...',
  role = 'Student',
  updated_at = NOW()
WHERE id = 'USER_ID';

-- Also create subscription record
INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  plan_type,
  current_period_start,
  current_period_end
) VALUES (
  'USER_ID',
  'cus_...',
  'sub_...',
  'active',
  'monthly',
  NOW(),
  NOW() + INTERVAL '1 month'
) ON CONFLICT (user_id, stripe_subscription_id) 
DO UPDATE SET
  status = 'active',
  updated_at = NOW();
```

## Expected Behavior

After successful payment:
1. ✅ `subscription_status` = 'active'
2. ✅ `subscription_id` = Stripe subscription ID
3. ✅ `role` = 'Student' (or 'Teacher' if teacher plan)
4. ✅ `stripe_customer_id` = Stripe customer ID
5. ✅ Record in `subscriptions` table

## Next Steps

1. Check server logs for the exact error
2. Check browser console for frontend errors
3. Check network tab for failed requests
4. Verify Stripe session has `userId` in metadata
5. Test endpoint manually with curl
6. Check webhook logs in Stripe Dashboard
