# Fix Subscription 500 Error on Production

## Problem Summary

The subscription checkout is failing on production with:
- **Edge Function**: Returns HTTP 500
- **API Server Fallback**: Returns HTTP 503 (STRIPE_SECRET_KEY not configured)

## Root Causes

1. **Edge Function Missing Environment Variables**: The Supabase Edge Function `create-checkout-session` is missing required environment variables (secrets)
2. **API Server Missing Stripe Key**: The production server's `server.env` file doesn't have `STRIPE_SECRET_KEY` configured
3. **Poor Error Messages**: Previous error handling didn't show which environment variable was missing

## Solution

### Step 1: Deploy Updated Edge Function

The edge function has been improved with:
- ✅ Environment variable validation with detailed error messages
- ✅ Better error handling and logging
- ✅ Response format compatibility fixes

**Choose your deployment method:**

#### Option A: Manual Deployment (Easiest - No CLI needed!)

1. Go to: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions
2. Click on `create-checkout-session` (or create it if it doesn't exist)
3. Open `supabase/functions/create-checkout-session/index.ts` in your editor
4. Copy ALL the code
5. Paste into Supabase editor
6. Click **"Deploy"**

✅ **Done!** See `DEPLOY_EDGE_FUNCTION_MANUAL.md` for detailed steps.

#### Option B: CLI Deployment (If login works)

```bash
# From project root
cd /Users/conesaleo/hcuniversity/hcuniversity

# Make sure you're logged in
supabase login

# Link project (if not already linked)
supabase link --project-ref mbffycgrqfeesfnhhcdm

# Deploy the updated function
supabase functions deploy create-checkout-session
```

#### Option C: CLI with Access Token (If login doesn't work)

```bash
# Get token from: https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN=your_token_here

# Deploy
supabase functions deploy create-checkout-session --project-ref mbffycgrqfeesfnhhcdm
```

### Step 2: Configure Edge Function Secrets

Go to **Supabase Dashboard** → **Edge Functions** → **Settings** → **Secrets**

Add these secrets (all are required):

1. **STRIPE_SECRET_KEY**
   - Value: Your Stripe secret key (starts with `sk_live_` for production)
   - Found in: Stripe Dashboard → Developers → API keys

2. **SUPABASE_URL**
   - Value: `https://mbffycgrqfeesfnhhcdm.supabase.co`

3. **SUPABASE_ANON_KEY**
   - Value: Your Supabase anon key
   - Found in: Supabase Dashboard → Settings → API → Project API keys

4. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key (⚠️ **Keep this secret!**)
   - Found in: Supabase Dashboard → Settings → API → Project API keys

5. **SITE_URL**
   - Value: `https://app.humancatalystbeacon.com`

### Step 3: Configure Production Server Environment

SSH into your production server and update `server.env`:

```bash
# SSH into server
ssh your-username@humancatalystbeacon.com

# Navigate to app directory
cd ~/domains/humancatalystbeacon.com/public_html/app

# Edit server.env
nano server.env
```

Make sure these are set (replace with actual values):

```env
STRIPE_SECRET_KEY=sk_live_xxxxx
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3001
NODE_ENV=production
```

**Restart PM2 after updating:**

```bash
pm2 restart hcuniversity-app
pm2 logs hcuniversity-app --lines 50
```

### Step 4: Test the Fix

1. **Test Edge Function Directly:**
   - Try subscribing on the pricing page
   - Check browser console for detailed error messages
   - If edge function fails, it should show which environment variable is missing

2. **Check Edge Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → `create-checkout-session` → Logs
   - Look for error messages indicating missing environment variables

3. **Test API Server Fallback:**
   - If edge function is configured correctly, it should work
   - If it still fails, the API server fallback should work (if `server.env` is configured)

## What Was Fixed

### Edge Function (`supabase/functions/create-checkout-session/index.ts`)
- ✅ Added validation for all required environment variables
- ✅ Returns detailed error messages indicating which variable is missing
- ✅ Improved error logging for debugging
- ✅ Fixed response format to include both `id` and `sessionId` for compatibility

### Frontend (`src/pages/PricingPage.jsx`)
- ✅ Better error message display to users
- ✅ Handles both response formats (`id`/`sessionId`)
- ✅ Shows detailed error messages from server

## Verification

After deploying and configuring:

1. **Edge Function should return 200** with checkout session URL
2. **If edge function fails**, it will show a clear error message like:
   ```json
   {
     "error": "Server configuration error: STRIPE_SECRET_KEY is not set",
     "details": "Please configure STRIPE_SECRET_KEY in Supabase Edge Function secrets"
   }
   ```
3. **Browser console** will show detailed error messages
4. **User will see** a toast notification with the error (if any)

## Next Steps

1. Deploy the updated edge function
2. Configure all 5 environment variables in Supabase
3. Update `server.env` on production server
4. Test subscription flow
5. Monitor logs for any remaining issues

