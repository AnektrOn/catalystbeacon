# 🔑 Stripe Price IDs Configuration Guide

## Why Use Environment Variables?

**Hardcoded Price IDs are risky because:**
- ❌ **Maintenance Risk**: Need to update code and redeploy to change prices
- ❌ **Environment Confusion**: Can't easily switch between test/production
- ❌ **No Flexibility**: Can't update pricing without code changes
- ❌ **Deployment Issues**: Different IDs for test vs live mode

**Using Environment Variables:**
- ✅ **Easy Updates**: Change prices without touching code
- ✅ **Environment Separation**: Different IDs for test/production
- ✅ **Best Practice**: Follows 12-factor app principles
- ✅ **Flexibility**: Update configuration without redeployment

---

## Step 1: Get Your Stripe Price IDs

1. Go to https://dashboard.stripe.com
2. Click **Products** → **Add product**
3. Create your products:

### **Student Plan**
- **Product Name**: "Student Plan"
- **Add Price**: 
  - Amount: €55
  - Billing period: Monthly (recurring)
  - Copy the **Price ID** (starts with `price_`)

### **Teacher Plan**
- **Product Name**: "Teacher Plan"  
- **Add Price**:
  - Amount: €150
  - Billing period: Monthly (recurring)
  - Copy the **Price ID** (starts with `price_`)

**Optional**: Create yearly prices too for discounts

---

## Step 2: Update Server Environment Variables

On your server, edit `server.env`:

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
nano server.env
```

Add these lines:

```bash
# Stripe Price IDs
STRIPE_STUDENT_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_STUDENT_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_TEACHER_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_TEACHER_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
```

**Save and exit** (Ctrl+O, Enter, Ctrl+X)

---

## Step 3: Update Frontend Environment Variables

On your server, edit `.env` (or `.env.production`):

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
nano .env
```

Add these lines:

```bash
# Stripe Price IDs (Frontend - Vite uses VITE_ prefix)
VITE_STRIPE_STUDENT_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
VITE_STRIPE_STUDENT_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
VITE_STRIPE_TEACHER_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
VITE_STRIPE_TEACHER_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
```

**Save and exit**

---

## Step 4: Restart Services

After updating environment variables:

```bash
# Rebuild frontend (to pick up new env vars)
npm run build

# Restart PM2 to load new server.env
pm2 restart hcuniversity-app

# Check logs
pm2 logs hcuniversity-app --lines 10
```

---

## Step 5: Verify It Works

1. **Check server logs** - Should see no errors
2. **Visit pricing page** - Should load correctly
3. **Test checkout** - Should use correct Price IDs

---

## Fallback Values

If environment variables are not set, the code will use these **test Price IDs** as fallbacks:
- Student Monthly: `price_1RutXI2MKT6Humxnh0WBkhCp`
- Student Yearly: `price_1SB9e52MKT6Humxnx7qxZ2hj`
- Teacher Monthly: `price_1SBPN62MKT6HumxnBoQgAdd0`
- Teacher Yearly: `price_1SB9co2MKT6HumxnOSALvAM4`

**⚠️ Important**: Replace these with your actual production Price IDs!

---

## Test vs Production

### **Test Mode (Development)**
- Use test Price IDs from Stripe test mode
- Keys start with `sk_test_` and `pk_test_`
- Price IDs from test products

### **Production Mode (Live)**
- Use live Price IDs from Stripe live mode
- Keys start with `sk_live_` and `pk_live_`
- Price IDs from live products

**Never mix test and production keys/IDs!**

---

## Troubleshooting

### **Price ID Not Working**
1. Check Price ID is correct (starts with `price_`)
2. Verify Price ID matches the Stripe mode (test vs live)
3. Check environment variables are loaded:
   ```bash
   # Server
   pm2 env 0 | grep STRIPE_PRICE
   
   # Frontend (check in browser console)
   console.log(import.meta.env.VITE_STRIPE_STUDENT_MONTHLY_PRICE_ID)
   ```

### **Role Not Updating After Payment**
1. Check Price ID in webhook logs
2. Verify `getRoleFromPriceId()` function in `server.js`
3. Check server logs: `pm2 logs hcuniversity-app`

---

## Summary

✅ **Price IDs are now configurable via environment variables**
✅ **Easy to update without code changes**
✅ **Separate test/production configurations**
✅ **Follows best practices**

**Next Steps:**
1. Create products in Stripe
2. Get your Price IDs
3. Add them to `server.env` and `.env`
4. Restart services
5. Test!

