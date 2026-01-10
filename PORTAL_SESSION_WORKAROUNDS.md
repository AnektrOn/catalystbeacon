# 5 Workarounds for "Manage Subscription" CORS Error

## Problem
The "Manage Subscription" button fails in production because it tries to call `http://localhost:3001/api/create-portal-session`, which causes CORS errors.

## Root Cause
`SettingsPage.jsx` uses `process.env.REACT_APP_API_URL` which defaults to `http://localhost:3001` in production.

---

## ✅ WORKAROUND 1: Use Supabase Edge Function (IMPLEMENTED - BEST)
**Status:** ✅ Already implemented in `SettingsPage.jsx`

**How it works:**
- Uses Supabase Edge Function at `/functions/v1/create-portal-session`
- No CORS issues (same domain as Supabase)
- Automatically falls back to API server if Edge Function fails
- Uses authentication token from Supabase session

**Pros:**
- ✅ No CORS issues
- ✅ Works in production
- ✅ Secure (uses Supabase auth)
- ✅ Automatic fallback

**Cons:**
- Requires Supabase Edge Function to be deployed

**Code location:** `src/pages/SettingsPage.jsx` lines 471-518

---

## WORKAROUND 2: Auto-detect Environment (IMPLEMENTED)
**Status:** ✅ Already implemented in `SettingsPage.jsx`

**How it works:**
- Detects if running on `localhost` vs production
- Uses `window.location.origin` in production
- Falls back to environment variables

**Code:**
```javascript
const API_URL = process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 
                (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                    ? 'http://localhost:3001' 
                    : window.location.origin);
```

**Pros:**
- ✅ Works automatically in both dev and production
- ✅ No configuration needed

**Cons:**
- Assumes API server runs on same domain (may need reverse proxy)

---

## WORKAROUND 3: Use Relative URL with Proxy
**Status:** ⚠️ Requires server configuration

**How it works:**
- Use relative URL: `/api/create-portal-session`
- Configure production server to proxy `/api/*` to backend
- No CORS issues (same origin)

**Implementation:**
1. In `vite.config.js` or production server, add proxy:
```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://your-backend-server.com',
        changeOrigin: true,
      }
    }
  }
})
```

2. Update code:
```javascript
const API_URL = ''; // Empty = relative URL
const response = await fetch('/api/create-portal-session', { ... });
```

**Pros:**
- ✅ No CORS issues
- ✅ Works in production
- ✅ Simple URL

**Cons:**
- ⚠️ Requires server/proxy configuration

---

## WORKAROUND 4: Environment Variable Detection
**Status:** 📝 Manual configuration needed

**How it works:**
- Set `VITE_API_URL` or `REACT_APP_API_URL` in production `.env`
- Use proper environment variable detection

**Implementation:**
1. Create `.env.production`:
```
VITE_API_URL=https://api.humancatalystbeacon.com
# OR
REACT_APP_API_URL=https://api.humancatalystbeacon.com
```

2. Update code:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 
                process.env.REACT_APP_API_URL || 
                (import.meta.env.PROD ? window.location.origin : 'http://localhost:3001');
```

**Pros:**
- ✅ Explicit configuration
- ✅ Works with Vite or Create React App

**Cons:**
- ⚠️ Requires environment variable setup
- ⚠️ Must rebuild for changes

---

## WORKAROUND 5: Direct Stripe Client-Side (NOT RECOMMENDED)
**Status:** ❌ Not recommended for security

**How it works:**
- Use Stripe.js client-side library
- Create portal session directly from frontend
- Requires exposing Stripe secret key (SECURITY RISK)

**Why NOT recommended:**
- ❌ Exposes secret keys to frontend
- ❌ Security vulnerability
- ❌ Violates Stripe best practices

**Alternative:** Use Stripe Customer Portal with public key (but still needs backend for customer ID lookup)

---

## Current Implementation Status

✅ **WORKAROUND 1 & 2 are IMPLEMENTED** in `src/pages/SettingsPage.jsx`

The code now:
1. First tries Supabase Edge Function (no CORS)
2. Falls back to API server with auto-detected URL
3. Handles errors gracefully

## Testing Checklist

- [ ] Test in development (localhost)
- [ ] Test in production (app.humancatalystbeacon.com)
- [ ] Verify Supabase Edge Function is deployed
- [ ] Check browser console for errors
- [ ] Verify redirect to Stripe portal works

## Next Steps

1. **Deploy Supabase Edge Function** (if not already deployed):
   ```bash
   supabase functions deploy create-portal-session
   ```

2. **Set environment variables** in production:
   - `REACT_APP_SUPABASE_URL` or `VITE_SUPABASE_URL`
   - `REACT_APP_API_URL` or `VITE_API_URL` (optional, for fallback)

3. **Test the "Manage Subscription" button** in production

4. **If still failing**, check:
   - Supabase Edge Function deployment status
   - Environment variables are set correctly
   - Browser console for specific error messages
