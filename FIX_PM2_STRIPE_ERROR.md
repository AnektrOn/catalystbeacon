# Fix PM2 Stripe Secret Key Error

## The Problem
PM2 is not loading the `STRIPE_SECRET_KEY` environment variable.

## Solution Steps

### Step 1: Check if server.env exists and has the key

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
cat server.env
```

Make sure it has:
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

### Step 2: Delete the errored PM2 process

```bash
pm2 delete hcuniversity-api
```

### Step 3: Start PM2 with environment file

**Option A: Using server.env file (recommended)**
```bash
pm2 start server.js --name hcuniversity-api --env-file server.env
```

**Option B: Using .env file**
```bash
pm2 start server.js --name hcuniversity-api --env-file .env
```

**Option C: If you don't have a separate env file, use dotenv**
```bash
# Install dotenv-cli if not installed
npm install -g dotenv-cli

# Start with dotenv
pm2 start "dotenv -e server.env -- node server.js" --name hcuniversity-api
```

### Step 4: Verify it's working

```bash
pm2 list
pm2 logs hcuniversity-api --lines 20
```

You should see the server starting without errors.

### Step 5: Save PM2 configuration

```bash
pm2 save
```

## Alternative: Create ecosystem.config.js

If the above doesn't work, create an ecosystem file:

```bash
nano ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [{
    name: 'hcuniversity-api',
    script: 'server.js',
    env_file: './server.env',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

Then start with:
```bash
pm2 start ecosystem.config.js
```

