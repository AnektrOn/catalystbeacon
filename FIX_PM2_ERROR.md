# Fix PM2 Error for hcuniversity-api

## Step 1: Check the Error Logs

Run this on your server to see what's wrong:

```bash
pm2 logs hcuniversity-api --lines 50
```

This will show you the error message.

## Step 2: Common Issues and Fixes

### Issue 1: Missing Environment Variables

If you see errors about missing environment variables, check your `server.env` file:

```bash
cat server.env
```

Make sure it has:
- `STRIPE_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (optional, defaults to 3001)

### Issue 2: Missing Dependencies

If you see "Cannot find module" errors:

```bash
npm install
```

### Issue 3: Port Already in Use

If you see "EADDRINUSE" error:

```bash
# Find what's using the port
lsof -i :3001

# Kill the process or change PORT in server.env
```

## Step 3: Restart with Correct Environment

```bash
# Delete the errored process
pm2 delete hcuniversity-api

# Start fresh with environment file
pm2 start server.js --name hcuniversity-api --env production

# Or if you use server.env:
pm2 start server.js --name hcuniversity-api --env-file server.env
```

## Step 4: Check Status

```bash
pm2 list
pm2 logs hcuniversity-api --lines 20
```

## Step 5: Make it Start on Reboot

```bash
pm2 save
pm2 startup
```

