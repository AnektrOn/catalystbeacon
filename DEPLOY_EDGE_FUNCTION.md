# How to Deploy Supabase Edge Function

## 🚀 Quick Start: Choose Your Method

### Method 1: Manual Deployment via Dashboard (Easiest - No CLI needed!)

**This is the simplest method and doesn't require CLI login:**

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/functions

2. **Check if function exists:**
   - Look for `create-checkout-session` in the list
   - If it exists, click on it and go to **"Edit"**
   - If it doesn't exist, click **"Create a new function"** and name it `create-checkout-session`

3. **Copy the function code:**
   - Open: `supabase/functions/create-checkout-session/index.ts` in your editor
   - **Copy ALL the code** (Ctrl+A, Ctrl+C / Cmd+A, Cmd+C)

4. **Paste and deploy:**
   - Paste the code into the Supabase editor
   - Click **"Deploy"** or **"Save"**

✅ **Done!** The function is now deployed.

---

### Method 2: CLI with Access Token (If login doesn't work)

If `supabase login` doesn't work, use an access token instead:

1. **Get your access token:**
   - Go to: https://supabase.com/dashboard/account/tokens
   - Click **"Generate new token"**
   - Copy the token (you'll only see it once!)

2. **Set the token:**
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_token_here
   ```

3. **Deploy without login:**
   ```bash
   # Install CLI if needed
   npm install -g supabase
   
   # Deploy using the token
   SUPABASE_ACCESS_TOKEN=your_token_here supabase functions deploy create-checkout-session --project-ref mbffycgrqfeesfnhhcdm
   ```

---

### Method 3: CLI with Standard Login (If it works)

```bash
# Step 1: Install Supabase CLI
npm install -g supabase

# Step 2: Login to Supabase
supabase login

# Step 3: Link Your Project
supabase link --project-ref mbffycgrqfeesfnhhcdm

# Step 4: Deploy the Function
supabase functions deploy create-checkout-session
```

**Troubleshooting `supabase login` issues:**

- **If browser doesn't open:** Try running with `--debug` flag:
  ```bash
  supabase login --debug
  ```

- **If using Safari:** Try Chrome or Firefox instead

- **If getting 401 errors:** Use Method 2 (access token) instead

- **If network issues:** Check firewall/proxy settings

## Step 5: Set Environment Variables in Supabase

Go to Supabase Dashboard → Edge Functions → Settings → Secrets

**IMPORTANT:** Add ALL of these secrets (the function will return 500 errors if any are missing):

- `STRIPE_SECRET_KEY` = your Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `SITE_URL` = https://app.humancatalystbeacon.com
- `SUPABASE_URL` = https://mbffycgrqfeesfnhhcdm.supabase.co
- `SUPABASE_ANON_KEY` = your anon key (found in Supabase Dashboard → Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY` = your service role key (found in Supabase Dashboard → Settings → API, **keep this secret!**)

**Note:** The function now validates all environment variables and will return detailed error messages if any are missing.

## Step 6: Test

The function should now be available at:
`https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/create-checkout-session`

