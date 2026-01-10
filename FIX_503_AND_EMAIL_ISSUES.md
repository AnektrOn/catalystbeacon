# Fix 503 Error and Email Issues

## ✅ Fixes Applied

### 1. **503 Error on Subscribe Button**
- **Problem**: Server returns 503 if Stripe is not configured
- **Fix**: Added better error messages and validation
- **Location**: `server.js` line 223-230

### 2. **Email Service Not Sending**
- **Problem**: Email service fails silently if SMTP not configured
- **Fix**: 
  - Made email service optional (doesn't fail signup)
  - Added direct API call instead of using client-side service
  - Better error logging
- **Locations**: 
  - `server.js` line 185-188 (email endpoint)
  - `src/contexts/AuthContext.jsx` line 390-425 (signup email)

## 🔧 Required Configuration

### For Payment (Subscribe Button) to Work:

**File: `server.env`** (in project root)
```env
STRIPE_SECRET_KEY=sk_live_xxxxx  # Your Stripe secret key
STRIPE_STUDENT_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_STUDENT_YEARLY_PRICE_ID=price_xxxxx
STRIPE_TEACHER_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_TEACHER_YEARLY_PRICE_ID=price_xxxxx
```

### For Email Service to Work:

**File: `server.env`** (in project root)
```env
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
SMTP_SECURE=false  # true for port 465, false for 587
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=The Human Catalyst University
```

### For Frontend to Connect to Backend:

**File: `.env`** (in project root)
```env
REACT_APP_API_URL=http://localhost:3001  # For development
# OR for production:
REACT_APP_API_URL=https://your-domain.com
```

## 🧪 How to Test

### 1. Check Server is Running
```bash
# Check if server.js is running
ps aux | grep "node server.js"
# OR if using PM2:
pm2 list
```

### 2. Check Server Configuration
```bash
# View server.env
cat server.env

# Check if Stripe key is set
grep STRIPE_SECRET_KEY server.env
```

### 3. Test Subscribe Button
1. Go to `/pricing` page
2. Click "Subscribe" button
3. Check browser console for errors
4. Check server console for logs

### 4. Test Email on Signup
1. Create a new account
2. Check browser console for email logs
3. Check server console for email logs
4. Check your email inbox (and spam folder)

## 📋 Troubleshooting

### 503 Error on Subscribe
**Check:**
1. Is `server.js` running? (`node server.js` or `pm2 list`)
2. Is `STRIPE_SECRET_KEY` set in `server.env`?
3. Is the key valid? (starts with `sk_live_` or `sk_test_`)
4. Is `REACT_APP_API_URL` pointing to the correct server?

**Fix:**
```bash
# Start server if not running
node server.js
# OR
pm2 start server.js --name hcuniversity-api
```

### No Email on Signup
**Check:**
1. Are SMTP credentials set in `server.env`?
2. Check server console for email errors
3. Check browser console for email logs

**Fix:**
- Add SMTP configuration to `server.env`
- Or use Supabase Edge Function for emails (alternative)

## 🔍 Debug Commands

```bash
# Check server logs
tail -f server.log
# OR if using PM2:
pm2 logs hcuniversity-api

# Test server endpoint directly
curl -X POST http://localhost:3001/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_xxxxx","userId":"user-id","userEmail":"test@example.com"}'

# Test email endpoint
curl -X POST http://localhost:3001/api/send-signup-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","userName":"Test User"}'
```

## 📝 Next Steps

1. **Configure Stripe** in `server.env`
2. **Configure SMTP** in `server.env` (optional but recommended)
3. **Restart server** after configuration changes
4. **Test both flows** (signup and subscribe)
