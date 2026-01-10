# Stripe Foreign Data Wrapper (FDW) Integration Guide

## Overview

Supabase provides a [Stripe Foreign Data Wrapper](https://supabase.com/docs/guides/database/extensions/wrappers/stripe) that allows you to query Stripe data directly from PostgreSQL. This can be used as a **verification and sync mechanism** for your subscription system.

## Benefits for Your Subscription System

### 1. **Real-time Verification**
Query Stripe directly to verify subscription status when needed:
```sql
-- Check if a subscription is actually active in Stripe
-- ⚠️ IMPORTANT: Status is in attrs->>'status', not a direct column
SELECT id, customer, attrs->>'status' as status, current_period_end
FROM stripe.subscriptions
WHERE id = 'sub_xxx';
```

### 2. **Backup Sync Mechanism**
Create a cron job to periodically sync Stripe subscriptions to your database:
```sql
-- Sync all active subscriptions from Stripe to your database
-- ⚠️ IMPORTANT: Status is in attrs->>'status'
INSERT INTO subscriptions (user_id, stripe_subscription_id, status, ...)
SELECT 
  p.id as user_id,
  s.id as stripe_subscription_id,
  s.attrs->>'status' as status,
  ...
FROM stripe.subscriptions s
JOIN profiles p ON p.stripe_customer_id = s.customer
WHERE s.attrs->>'status' = 'active'
ON CONFLICT (stripe_subscription_id) DO UPDATE SET
  status = EXCLUDED.status,
  current_period_end = EXCLUDED.current_period_end;
```

### 3. **Data Reconciliation**
Compare your database with Stripe to find discrepancies:
```sql
-- Find subscriptions in Stripe that aren't in your database
SELECT s.id, s.customer, s.attrs->>'status' as status
FROM stripe.subscriptions s
LEFT JOIN subscriptions sub ON sub.stripe_subscription_id = s.id
WHERE sub.id IS NULL;
```

### 4. **Audit Trail**
Query Stripe events directly:
```sql
-- Check recent subscription events
SELECT id, type, created, attrs
FROM stripe.events
WHERE type LIKE 'customer.subscription%'
ORDER BY created DESC
LIMIT 50;
```

## Setup Instructions

### Step 1: Enable Wrappers Extension

```sql
-- Enable the wrappers extension
CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;
```

### Step 2: Enable Stripe Wrapper

```sql
-- Create the Stripe foreign data wrapper
CREATE FOREIGN DATA WRAPPER stripe_wrapper
  HANDLER stripe_fdw_handler
  VALIDATOR stripe_fdw_validator;
```

### Step 3: Store Stripe API Key in Vault (Recommended)

```sql
-- Store your Stripe secret key securely in Vault
SELECT vault.create_secret(
  'sk_live_...', -- Your Stripe secret key
  'stripe',
  'Stripe API key for Wrappers'
);
```

**Note:** This returns a `key_id` that you'll use in the next step.

### Step 4: Create Stripe Server Connection

```sql
-- Create the server connection (replace <key_ID> with the key_id from Step 3)
CREATE SERVER stripe_server
  FOREIGN DATA WRAPPER stripe_wrapper
  OPTIONS (
    api_key_id '<key_ID>', -- From vault.create_secret
    api_url 'https://api.stripe.com/v1/',
    api_version '2024-06-20'
  );
```

### Step 5: Create Schema for Stripe Tables

```sql
-- Create a schema to hold foreign tables
CREATE SCHEMA IF NOT EXISTS stripe;
```

### Step 6: Import Stripe Tables

```sql
-- Import all Stripe tables (or specific ones)
IMPORT FOREIGN SCHEMA stripe
  FROM SERVER stripe_server
  INTO stripe;

-- OR import only specific tables you need:
IMPORT FOREIGN SCHEMA stripe
  LIMIT TO ("subscriptions", "customers", "checkout_sessions", "events")
  FROM SERVER stripe_server
  INTO stripe;
```

## Usage Examples

### Query Active Subscriptions

```sql
-- Get all active subscriptions from Stripe
SELECT 
  s.id as stripe_subscription_id,
  s.customer as stripe_customer_id,
  s.attrs->>'status' as status,
  s.current_period_start,
  s.current_period_end,
  s.attrs->>'items' as items
FROM stripe.subscriptions s
WHERE s.attrs->>'status' = 'active';
```

### Sync Subscription to Database

```sql
-- Sync a specific subscription from Stripe to your database
WITH stripe_sub AS (
  SELECT 
    id,
    customer,
    status,
    current_period_start,
    current_period_end
  FROM stripe.subscriptions
  WHERE id = 'sub_xxx'
)
INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  current_period_start,
  current_period_end
)
SELECT 
  p.id,
  stripe_sub.customer,
  stripe_sub.id,
  stripe_sub.status,
  TO_TIMESTAMP(stripe_sub.current_period_start),
  TO_TIMESTAMP(stripe_sub.current_period_end)
FROM stripe_sub
JOIN profiles p ON p.stripe_customer_id = stripe_sub.customer
ON CONFLICT (stripe_subscription_id) DO UPDATE SET
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  updated_at = NOW();
```

### Create Sync Function

```sql
-- Create a function to sync subscriptions from Stripe
CREATE OR REPLACE FUNCTION sync_subscriptions_from_stripe()
RETURNS TABLE(synced_count INTEGER, error_count INTEGER) AS $$
DECLARE
  synced INTEGER := 0;
  errors INTEGER := 0;
  stripe_sub RECORD;
BEGIN
  -- Loop through active subscriptions in Stripe
  FOR stripe_sub IN
    SELECT 
      s.id,
      s.customer,
      s.attrs->>'status' as status,
      s.current_period_start,
      s.current_period_end,
      s.attrs->'items'->'data'->0->'price'->>'recurring'->>'interval' as plan_type
    FROM stripe.subscriptions s
    WHERE s.attrs->>'status' IN ('active', 'trialing', 'past_due')
  LOOP
    BEGIN
      -- Try to insert or update subscription
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        plan_type,
        status,
        current_period_start,
        current_period_end
      )
      SELECT 
        p.id,
        stripe_sub.customer,
        stripe_sub.id,
        COALESCE(stripe_sub.plan_type, 'monthly'),
        stripe_sub.status,
        TO_TIMESTAMP(stripe_sub.current_period_start),
        TO_TIMESTAMP(stripe_sub.current_period_end)
      FROM profiles p
      WHERE p.stripe_customer_id = stripe_sub.customer
      ON CONFLICT (stripe_subscription_id) DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW();
      
      synced := synced + 1;
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      RAISE WARNING 'Failed to sync subscription %: %', stripe_sub.id, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT synced, errors;
END;
$$ LANGUAGE plpgsql;
```

### Schedule Automatic Sync (Using pg_cron)

```sql
-- Schedule sync to run every hour
SELECT cron.schedule(
  'sync-stripe-subscriptions',
  '0 * * * *', -- Every hour
  $$SELECT sync_subscriptions_from_stripe()$$
);
```

## Integration with Your Current System

### Option 1: Verification Endpoint

Add an endpoint to verify subscription status against Stripe:

```javascript
// In server.js
app.get('/api/verify-subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params
    
    // Query Stripe directly via FDW
    const { data, error } = await supabase.rpc('verify_stripe_subscription', {
      subscription_id: subscriptionId
    })
    
    if (error) throw error
    
    res.json({ verified: true, data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### Option 2: Reconciliation Job

Run a daily job to find and fix discrepancies:

```sql
-- Find subscriptions in Stripe that don't match your database
SELECT 
  s.id as stripe_subscription_id,
  s.attrs->>'status' as stripe_status,
  sub.status as db_status,
  s.customer
FROM stripe.subscriptions s
LEFT JOIN subscriptions sub ON sub.stripe_subscription_id = s.id
WHERE s.attrs->>'status' != COALESCE(sub.status, 'none')
  OR sub.id IS NULL;
```

### Option 3: Real-time Sync on Webhook Failure

If webhook fails, use FDW as backup:

```javascript
// In webhook handler, if update fails:
if (updateError) {
  console.error('Webhook update failed, syncing from Stripe FDW...')
  
  // Query Stripe directly to get latest data
  const { data: stripeSub } = await supabase
    .from('stripe.subscriptions')
    .select('*')
    .eq('id', subscription.id)
    .single()
  
  // Update database with Stripe data
  // ...
}
```

## Limitations

1. **Read-Only for Most Objects**: Most Stripe objects are read-only. Only `customers`, `products`, and `subscriptions` support write operations.

2. **API Rate Limits**: Stripe has rate limits. Don't query too frequently.

3. **Performance**: Large queries may be slower than direct API calls.

4. **Webhook Events**: FDW doesn't support real-time webhook events - you still need webhooks for instant updates.

## Recommended Approach

1. **Primary**: Keep using webhooks and API endpoints (fast, real-time)
2. **Backup**: Use FDW for verification and reconciliation (periodic sync)
3. **Audit**: Use FDW to query Stripe events for debugging

## Next Steps

1. Set up the FDW following the steps above
2. Create the sync function
3. Schedule a daily/hourly sync job
4. Add verification endpoints if needed
5. Monitor for discrepancies

## References

- [Supabase Stripe FDW Documentation](https://supabase.com/docs/guides/database/extensions/wrappers/stripe)
- [Stripe API Reference](https://stripe.com/docs/api)
