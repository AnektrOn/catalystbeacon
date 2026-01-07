# Fix: Admin Role Preservation During Subscription Updates

## Problem

When users with **Admin** role subscribed to a plan, their role was being overwritten to "Student" or "Teacher", causing them to lose admin privileges.

## Root Cause

All subscription update handlers were unconditionally updating the `role` field without checking if the user was an Admin:
- `/api/payment-success` endpoint
- `handleCheckoutSessionCompleted` webhook handler
- `handleSubscriptionCreated` webhook handler
- `handleSubscriptionUpdate` webhook handler
- Edge function `stripe-webhook` handler

## Solution

Updated all subscription handlers to:
1. **Check current role** before updating
2. **Preserve Admin role** - only update subscription-related fields if user is Admin
3. **Update role only for non-Admin users** - Free/Student/Teacher users can have their role updated

## Files Fixed

### 1. `server.js`
- ✅ `/api/payment-success` endpoint (line ~313-335)
- ✅ `handleCheckoutSessionCompleted` function (line ~460-499)
- ✅ `handleSubscriptionCreated` function (line ~585-629)
- ✅ `handleSubscriptionUpdate` function (line ~632-658)

### 2. `supabase/functions/stripe-webhook/index.ts`
- ✅ `checkout.session.completed` handler (line ~73-87)
- ✅ `customer.subscription.deleted` handler (line ~136-165)

## How It Works Now

### For Admin Users:
- ✅ Subscription status is updated (`active`, `cancelled`, etc.)
- ✅ Subscription ID is stored
- ✅ Stripe customer ID is stored
- ✅ **Admin role is preserved** - never changed

### For Non-Admin Users:
- ✅ Role is updated based on subscription plan (Student/Teacher)
- ✅ Subscription status is updated
- ✅ Subscription ID is stored
- ✅ Stripe customer ID is stored

## Example Log Output

When an Admin subscribes:
```
Current user role: Admin
New role would be: Student
⚠️ User is Admin - preserving Admin role, only updating subscription info
```

When a regular user subscribes:
```
Current user role: Free
New role would be: Student
Updating role from Free to Student
```

## Testing

1. **Test Admin Subscription:**
   - Login as Admin user
   - Subscribe to Student or Teacher plan
   - Verify: Role remains "Admin", subscription_status becomes "active"

2. **Test Regular User Subscription:**
   - Login as Free user
   - Subscribe to Student plan
   - Verify: Role changes to "Student", subscription_status becomes "active"

3. **Test Admin Cancellation:**
   - Admin cancels subscription
   - Verify: Role remains "Admin", subscription_status becomes "cancelled"

## Deployment

### For Production Server:
1. Update `server.js` on production
2. Restart PM2:
   ```bash
   pm2 restart hcuniversity-app
   ```

### For Edge Function:
1. Deploy updated `stripe-webhook` function:
   ```bash
   # Or use manual deployment via dashboard
   supabase functions deploy stripe-webhook
   ```

## Important Notes

- ⚠️ **Admin users can now subscribe** without losing their admin privileges
- ⚠️ **Subscription cancellation** for Admins will only update subscription status, not downgrade role
- ✅ **Regular users** still get role updates as expected
- ✅ **All subscription data** (status, IDs) is still properly tracked for Admins

