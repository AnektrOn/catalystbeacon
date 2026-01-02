# Fix PM2 Environment Variables (Old PM2 Version)

## Method 1: Use dotenv-cli (Recommended)

```bash
# Install dotenv-cli globally
npm install -g dotenv-cli

# Delete old process
pm2 delete hcuniversity-api

# Start with dotenv
pm2 start "dotenv -e server.env -- node server.js" --name hcuniversity-api

# Check logs
pm2 logs hcuniversity-api --lines 20
```

## Method 2: Create ecosystem.config.js

```bash
# Create ecosystem file
nano ecosystem.config.js
```

Add this content:
```javascript
require('dotenv').config({ path: './server.env' });

module.exports = {
  apps: [{
    name: 'hcuniversity-api',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      PORT: process.env.PORT || 3001
    }
  }]
}
```

Then:
```bash
pm2 delete hcuniversity-api
pm2 start ecosystem.config.js
pm2 save
```

## Method 3: Load env vars manually

```bash
# Delete old process
pm2 delete hcuniversity-api

# Source the env file and start (if using bash)
source server.env && pm2 start server.js --name hcuniversity-api

# Or export variables manually
export $(cat server.env | xargs) && pm2 start server.js --name hcuniversity-api
```

## Method 4: Modify server.js to load dotenv

Edit `server.js` to load environment variables at the top:

```javascript
// Add at the very top of server.js
require('dotenv').config({ path: './server.env' });

const express = require('express')
// ... rest of the code
```

Then:
```bash
pm2 delete hcuniversity-api
pm2 start server.js --name hcuniversity-api
```

## Method 5: Use PM2 with inline env vars

```bash
pm2 delete hcuniversity-api
pm2 start server.js --name hcuniversity-api -- \
  STRIPE_SECRET_KEY="$(grep STRIPE_SECRET_KEY server.env | cut -d '=' -f2)" \
  SUPABASE_URL="$(grep SUPABASE_URL server.env | cut -d '=' -f2)" \
  SUPABASE_SERVICE_ROLE_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY server.env | cut -d '=' -f2)"
```

