# Fix Production Issues - 503 and CORS Errors

## 🔴 Current Issues

1. **503 Error on Checkout Session**: Server returning 503 when trying to create checkout session
2. **404 on send-email Edge Function**: Email Edge Function not deployed
3. **CORS Errors**: Multiple CORS errors with Supabase

## ✅ Fixes Applied

### 1. Email Service Resilience
- ✅ Handles 404 gracefully (Edge Function not deployed)
- ✅ Handles CORS errors gracefully
- ✅ Falls back to server API if Edge Function unavailable
- ✅ Non-blocking (signup won't fail if email fails)

### 2. Checkout Session Error Handling
- ✅ Better error messages for 503
- ✅ Handles 404 on Edge Function
- ✅ Improved fallback logic

## 🔧 Required Actions

### 1. Deploy send-email Edge Function

The `send-email` Edge Function is returning 404, meaning it's not deployed.

**Option A: Deploy via Supabase Dashboard**
1. Go to Supabase Dashboard → Edge Functions
2. Click "Deploy" or "Create Function"
3. Name: `send-email`
4. Copy code from `supabase/functions/send-email/index.ts`
5. Deploy

**Option B: Deploy via CLI**
```bash
supabase functions deploy send-email
```

### 2. Fix 503 Error on Checkout

The server at `https://app.humancatalystbeacon.com/api/create-checkout-session` is returning 503.

**Check:**
1. Is `server.js` running on the production server?
   ```bash
   # SSH into server
   ssh user@your-server
   
   # Check if running
   pm2 list
   # OR
   ps aux | grep "node server.js"
   ```

2. Is Stripe configured in `server.env`?
   ```bash
   # On server, check:
   cat server.env | grep STRIPE_SECRET_KEY
   ```

3. Is the server accessible?
   ```bash
   # Test from your machine:
   curl https://app.humancatalystbeacon.com/api/create-checkout-session
   # Should return JSON error, not connection refused
   ```

**Fix:**
```bash
# On production server:
cd /path/to/your/app

# Make sure server.env has:
STRIPE_SECRET_KEY=sk_live_xxxxx
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Start/restart server:
pm2 restart hcuniversity-api
# OR
node server.js
```

### 3. Fix CORS Errors

CORS errors suggest the server isn't allowing requests from your domain.

**Check server.js CORS configuration:**
```javascript
// Should allow your domain
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://app.humancatalystbeacon.com']
    : true,
  credentials: true
}
```

**Update server.js if needed:**
```javascript
// In server.js, update CORS:
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://app.humancatalystbeacon.com'])
    : true,
  credentials: true,
  optionsSuccessStatus: 200
}
```

## 🧪 Testing After Fixes

### Test Email
1. Create a new account
2. Check browser console - should see email attempt logs
3. Check if email arrives (may take a few minutes)

### Test Checkout
1. Go to `/pricing` page
2. Click "Subscribe"
3. Should redirect to Stripe Checkout
4. If 503, check server logs

### Test Server
```bash
# Test server endpoint directly:
curl -X POST https://app.humancatalystbeacon.com/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_1RutXI2MKT6Humxnh0WBkhCp","userId":"test","userEmail":"test@example.com"}'
```

## 📋 Quick Checklist

- [ ] Deploy `send-email` Edge Function in Supabase
- [ ] Verify `server.js` is running on production
- [ ] Check `STRIPE_SECRET_KEY` is set in `server.env`
- [ ] Check CORS configuration allows your domain
- [ ] Test checkout flow
- [ ] Test signup email

## 🔍 Debug Commands

```bash
# Check server status
pm2 status
pm2 logs hcuniversity-api

# Check server.env
cat server.env | grep -E "STRIPE|SUPABASE"

# Test server endpoint
curl -v https://app.humancatalystbeacon.com/api/create-checkout-session

# Check Edge Functions
# In Supabase Dashboard → Edge Functions → send-email → Logs
```
