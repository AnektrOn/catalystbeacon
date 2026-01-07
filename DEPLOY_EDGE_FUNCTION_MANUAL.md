# Deploy Edge Function Manually (No CLI Required)

This is the **easiest method** - no command line needed!

## Step 1: Open Supabase Dashboard

Go to: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions

## Step 2: Check if Function Exists

- **If `create-checkout-session` exists:**
  - Click on it
  - Click **"Edit"** button
  - Skip to Step 4

- **If it doesn't exist:**
  - Click **"Create a new function"** button
  - Name it: `create-checkout-session`
  - Continue to Step 3

## Step 3: Copy Function Code

1. Open the file: `supabase/functions/create-checkout-session/index.ts`
2. Select ALL the code (Ctrl+A / Cmd+A)
3. Copy it (Ctrl+C / Cmd+C)

## Step 4: Paste and Deploy

1. In the Supabase editor, **delete any existing code**
2. Paste the code you copied (Ctrl+V / Cmd+V)
3. Click **"Deploy"** button (or **"Save"** if editing)

## Step 5: Verify Deployment

You should see:
- ✅ Function deployed successfully
- Function URL: `https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/create-checkout-session`

## Step 6: Configure Secrets (Required!)

**IMPORTANT:** The function will return 500 errors without these secrets!

1. In the Supabase Dashboard, go to: **Edge Functions** → **Settings** → **Secrets**

2. Add these 5 secrets (click **"Add secret"** for each):

   | Secret Name | Value | Where to Find |
   |------------|-------|----------------|
   | `STRIPE_SECRET_KEY` | `sk_live_xxxxx` or `sk_test_xxxxx` | Stripe Dashboard → Developers → API keys |
   | `SUPABASE_URL` | `https://mbffycgrqfeesfnhhcdm.supabase.co` | Your Supabase project URL |
   | `SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API → Project API keys |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API → Project API keys (⚠️ Keep secret!) |
   | `SITE_URL` | `https://app.humancatalystbeacon.com` | Your production site URL |

3. Click **"Save"** after adding each secret

## Step 7: Test

Try subscribing on your pricing page. The function should now work!

If you see errors, check:
- Browser console for error messages
- Supabase Dashboard → Edge Functions → `create-checkout-session` → Logs

---

## Quick Reference: Where to Find Keys

### Stripe Secret Key
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy the **Secret key** (starts with `sk_live_` for production)

### Supabase Keys
1. Go to: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/settings/api
2. Copy:
   - **anon/public** key → Use for `SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

