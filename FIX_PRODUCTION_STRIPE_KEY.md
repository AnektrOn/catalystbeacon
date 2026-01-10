# Fix Production Stripe Key Issue

## Problem
The server is crashing because `STRIPE_SECRET_KEY` in `server.env` is set to a placeholder value (`your_stripe_secret_key_here`).

## Solution

### Step 1: Get Your Stripe Secret Key
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for production)

### Step 2: Update server.env on Production Server

SSH into your production server and edit the `server.env` file:

```bash
# Navigate to your app directory
cd /path/to/your/app

# Edit server.env
nano server.env
# or
vi server.env
```

Update these lines:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE  # Replace with your actual key
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET  # Replace with your actual webhook secret
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key  # Replace with your actual service role key
```

**Important:**
- Remove any spaces around the `=` sign
- Don't use quotes around the values
- Make sure there are no trailing spaces

### Step 3: Restart PM2

After updating the file, restart your PM2 process:

```bash
pm2 restart hcuniversity-app
# or
pm2 restart all
```

### Step 4: Verify

Check the logs to confirm it's working:

```bash
pm2 logs hcuniversity-app --lines 20
```

You should see:
- ✅ No more "ERROR: STRIPE_SECRET_KEY is not set correctly" messages
- ✅ Server should start successfully
- ✅ "STRIPE_SECRET_KEY loaded: YES (sk_test_...)" message

## Security Notes

⚠️ **Never commit `server.env` to git!** It contains sensitive keys.

Make sure `server.env` is in your `.gitignore` file.

## Alternative: Use PM2 Environment Variables

If you prefer not to store keys in files, you can set them directly in PM2:

```bash
pm2 set hcuniversity-app:env:STRIPE_SECRET_KEY "sk_test_YOUR_KEY"
pm2 restart hcuniversity-app
```

But the `server.env` file approach is recommended for easier management.
