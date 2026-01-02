# Setup Server.js Backend for Pricing

## Step 1: Make sure server.js is running

On your server, check if server.js is running:

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# Check if PM2 is running it
pm2 list

# If not running, start it:
pm2 start server.js --name hcuniversity-api --env production

# Or if you have a different setup, check:
ps aux | grep "node server.js"
```

## Step 2: Update .env file

Edit your `.env` file on the server:

```bash
nano .env
```

Add or update:
```bash
REACT_APP_API_URL=https://app.humancatalystbeacon.com
# OR if your backend runs on port 3001:
REACT_APP_API_URL=https://app.humancatalystbeacon.com:3001
```

## Step 3: Make sure server.js has CORS enabled

Check that your `server.js` has CORS configured to allow requests from your frontend domain.

## Step 4: Rebuild and restart

```bash
npm run build
pm2 restart hcuniversity-app
```

## Step 5: Test

Visit the pricing page and try to subscribe. Check browser console for any errors.

