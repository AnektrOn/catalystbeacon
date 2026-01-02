# Debug Server Environment Variables

## Step 1: Pull Latest Code

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
git pull origin main
```

## Step 2: Check if server.env exists

```bash
ls -la server.env
cat server.env
```

## Step 3: If server.env doesn't exist, create it

```bash
nano server.env
```

Add these lines (replace with your actual values):
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
STRIPE_STUDENT_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_STUDENT_YEARLY_PRICE_ID=price_xxxxx
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

## Step 4: Verify server.js has dotenv

```bash
head -5 server.js
```

You should see:
```javascript
require('dotenv').config({ path: './server.env' })
```

## Step 5: Test loading env vars manually

```bash
node -e "require('dotenv').config({ path: './server.env' }); console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING');"
```

If it says "MISSING", check:
- Is server.env in the same directory as server.js?
- Does server.env have STRIPE_SECRET_KEY=... (no spaces around =)
- Are there any quotes around the values? (shouldn't be)

## Step 6: Restart PM2

```bash
pm2 delete hcuniversity-api
pm2 start server.js --name hcuniversity-api
pm2 logs hcuniversity-api --lines 20
```

## Step 7: If still not working, try absolute path

Edit server.js and change:
```javascript
require('dotenv').config({ path: './server.env' })
```

To:
```javascript
require('dotenv').config({ path: __dirname + '/server.env' })
```

Then restart:
```bash
pm2 restart hcuniversity-api
```

