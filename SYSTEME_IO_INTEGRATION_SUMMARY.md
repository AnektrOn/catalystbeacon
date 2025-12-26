# Systeme.io Integration - Complete ✅

## What Was Implemented

### 1. Webhook Endpoints (`server.js`)

Added three webhook endpoints to handle Systeme.io events:

- **`POST /api/webhook/systeme/contact-created`** - Handles new signups from Systeme.io
  - Creates user in Supabase Auth
  - Auto-confirms email
  - Creates profile with Systeme.io data
  - Stores affiliate information

- **`POST /api/webhook/systeme/purchase-completed`** - Handles completed purchases
  - Upgrades user to `Student` role
  - Creates payment record
  - Tracks affiliate commissions
  - Updates subscription status

- **`POST /api/webhook/systeme/affiliate-tracking`** - Handles affiliate referrals
  - Stores affiliate information in user profile
  - Creates commission records

### 2. Database Schema (`supabase/migrations/add_systeme_io_integration.sql`)

Added fields to `profiles` table:
- `systeme_contact_id` - Systeme.io contact ID
- `systeme_order_id` - Order ID for purchases
- `systeme_purchase_amount` - Purchase amount
- `systeme_purchase_currency` - Currency (default: USD)
- `systeme_product_name` - Product name
- `affiliate_id` - Affiliate who referred the user
- `affiliate_name` - Affiliate name
- `phone` - Phone number from Systeme.io

Created new tables:
- **`payments`** - Tracks all Systeme.io payments
- **`affiliate_commissions`** - Tracks affiliate commissions

### 3. User Creation Function

`createUserFromSysteme()` function:
- Creates user in Supabase Auth with service role
- Auto-confirms email (no verification needed)
- Generates random password (user should reset on first login)
- Creates profile with Systeme.io metadata
- Handles existing users gracefully

## How It Works

### Signup Flow
1. User signs up in Systeme.io funnel
2. Systeme.io sends webhook → `/api/webhook/systeme/contact-created`
3. Server creates user in Supabase (email auto-confirmed)
4. Profile created with Systeme.io data
5. User can log in immediately (password reset recommended)

### Payment Flow
1. User completes purchase in Systeme.io
2. Systeme.io sends webhook → `/api/webhook/systeme/purchase-completed`
3. Server finds user by email (or creates if new)
4. User upgraded to `Student` role
5. Payment record created
6. Subscription status set to `active`

### Affiliate Flow
1. User referred by affiliate
2. Systeme.io sends webhook → `/api/webhook/systeme/affiliate-tracking`
3. Affiliate info stored in profile
4. Commission record created

## Next Steps

### 1. Run Database Migration
```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/add_systeme_io_integration.sql
```

### 2. Configure Systeme.io Webhooks
See `SYSTEME_IO_SETUP_GUIDE.md` for detailed instructions.

Webhook URLs:
- Contact Created: `https://app.humancatalystbeacon.com/api/webhook/systeme/contact-created`
- Purchase Completed: `https://app.humancatalystbeacon.com/api/webhook/systeme/purchase-completed`
- Affiliate Tracking: `https://app.humancatalystbeacon.com/api/webhook/systeme/affiliate-tracking`

### 3. Add Environment Variable (Optional)
Add to `server.env`:
```env
SYSTEME_WEBHOOK_SECRET=your_secret_here
```

### 4. Deploy Changes
```bash
# On your server
cd ~/domains/humancatalystbeacon.com/public_html/app
git pull origin main
npm install
pm2 restart hcuniversity-app
```

## Important Notes

1. **Password Reset**: Users created from Systeme.io get a random password. Consider adding a password reset flow for first-time login.

2. **Email Confirmation**: Emails are auto-confirmed, so users can log in immediately.

3. **Existing Users**: If a user already exists, the system updates their profile with Systeme.io data instead of creating a duplicate.

4. **Role Upgrade**: Purchases automatically upgrade users to `Student` role.

5. **Affiliate Tracking**: Affiliate information is stored both in the user profile and in a separate commissions table.

## Testing

Test the webhooks using curl:

```bash
# Test contact created
curl -X POST https://app.humancatalystbeacon.com/api/webhook/systeme/contact-created \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","first_name":"Test","last_name":"User","contact_id":"test_123"}'

# Test purchase completed
curl -X POST https://app.humancatalystbeacon.com/api/webhook/systeme/purchase-completed \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","order_id":"order_123","amount":99.00,"currency":"USD","product_name":"Test Product"}'
```

## Files Modified/Created

- ✅ `server.js` - Added webhook endpoints and user creation logic
- ✅ `supabase/migrations/add_systeme_io_integration.sql` - Database schema
- ✅ `SYSTEME_IO_SETUP_GUIDE.md` - Complete setup guide
- ✅ `SYSTEME_IO_INTEGRATION_SUMMARY.md` - This file

## Support

If you encounter issues:
1. Check server logs: `pm2 logs hcuniversity-app`
2. Verify webhook payload format matches expected format
3. Check Supabase service role key is correct
4. Ensure database migration has been run

