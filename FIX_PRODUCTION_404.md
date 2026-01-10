# Fix Production 404 Error - Missing Build Directory

## Problem
Production server is returning 404 for `/build/index.html`. The build directory is missing or PM2 is running from the wrong directory.

## Quick Fix

SSH into your production server and run:

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# 1. Check if build directory exists
ls -la build/

# 2. If build doesn't exist or is empty, rebuild:
rm -rf build
npm run build:no-minify

# 3. Verify build was created:
ls -la build/index.html
ls -la build/static/js/

# 4. Check PM2 working directory:
pm2 jlist | grep -A 5 "hcuniversity-app"

# 5. If PM2 is running from wrong directory, restart it:
pm2 delete hcuniversity-app
cd ~/domains/humancatalystbeacon.com/public_html/app
pm2 start server.js --name hcuniversity-app --cwd $(pwd)
pm2 save

# 6. Check PM2 logs to verify:
pm2 logs hcuniversity-app --lines 20
```

You should see in the logs:
- ✅ `Serving React app from: /path/to/build`
- ✅ `Found index.html at: /path/to/build/index.html`

## Common Issues

### Issue 1: Build Directory Missing
**Solution:** Run `npm run build:no-minify` in the app directory

### Issue 2: PM2 Running from Wrong Directory
**Solution:** Delete and restart PM2 from the correct directory:
```bash
pm2 delete hcuniversity-app
cd ~/domains/humancatalystbeacon.com/public_html/app
pm2 start server.js --name hcuniversity-app --cwd $(pwd)
```

### Issue 3: Build Failed Silently
**Solution:** Check for build errors:
```bash
npm run build:no-minify 2>&1 | tail -50
```

### Issue 4: Apache Serving Wrong Files
If you have `.htaccess`, make sure it's proxying to Node.js, not serving files directly.
