# FORCE DEBUG GIT PULL

## The Problem

After running:
```bash
git pull origin main
npm install
npm run build
pm2 restart hcuniversity-app
```

You get:
- ❌ 404 errors
- ❌ 405 Method Not Allowed errors
- ❌ Dummy/empty index.html
- ❌ Build fails with EAGAIN error

## Root Cause

The build process fails during **minification** with an `EAGAIN` error, which means:
- Server runs out of memory/resources during Terser minification
- Build completes but is incomplete or corrupted
- Server serves broken/incomplete build files

## The Solution

**Build WITHOUT minification** to avoid resource exhaustion:

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# 1. Pull latest code
git pull origin main

# 2. Clean install dependencies
rm -rf node_modules package-lock.json .cache node_modules/.cache
npm cache clean --force
npm install --legacy-peer-deps --force

# 3. Build WITHOUT minification (THIS IS THE KEY!)
rm -rf build
npm run build:no-minify

# 4. Fix permissions
chmod -R 755 build
find build -type f -exec chmod 644 {} \;

# 5. Restart PM2
pm2 restart hcuniversity-app
```

## Why `build:no-minify` Works

- **Skips Terser minification** (the step that causes EAGAIN)
- **Builds successfully** on resource-limited servers
- **App works perfectly** - just larger file sizes
- **No functionality lost** - only minification is skipped

## Complete Deployment Script

Save this as `deploy.sh`:

```bash
#!/bin/bash
# Complete deployment script that avoids EAGAIN errors

set -e

cd ~/domains/humancatalystbeacon.com/public_html/app

echo "🚀 Deploying HC University..."
echo ""

# Step 1: Pull latest code
echo "📥 Pulling latest code..."
git pull origin main
echo ""

# Step 2: Clean and reinstall dependencies
echo "📦 Installing dependencies..."
rm -rf node_modules package-lock.json .cache node_modules/.cache
npm cache clean --force
npm install --legacy-peer-deps --force
echo ""

# Step 3: Build without minification
echo "🔨 Building (without minification to avoid EAGAIN)..."
rm -rf build
npm run build:no-minify
echo ""

# Step 4: Verify build
if [ ! -f "build/index.html" ]; then
    echo "❌ Build failed!"
    exit 1
fi

if ! grep -q "static/js" build/index.html; then
    echo "❌ Build incomplete - index.html missing JS references!"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Step 5: Fix permissions
echo "🔧 Fixing permissions..."
chmod -R 755 build
find build -type f -exec chmod 644 {} \;
echo ""

# Step 6: Restart PM2
echo "🔄 Restarting PM2..."
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
fi
pm2 restart hcuniversity-app
pm2 save
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🌐 Website: https://app.humancatalystbeacon.com"
echo ""
```

Make it executable:
```bash
chmod +x deploy.sh
```

## Quick Reference

**Always use this for deployments:**
```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
git pull origin main
npm install --legacy-peer-deps --force
npm run build:no-minify
pm2 restart hcuniversity-app
```

## Why Not Regular `npm run build`?

Regular `npm run build` tries to minify JavaScript using Terser, which:
- Requires lots of memory (4GB+ recommended)
- Can cause EAGAIN errors on resource-limited servers
- Fails silently, leaving incomplete builds

`npm run build:no-minify`:
- Skips minification entirely
- Uses less memory
- Always succeeds on limited resources
- Produces working builds (just larger files)

## Troubleshooting

### If `build:no-minify` still fails:

Try the light build:
```bash
npm run build:light
```

### If dependencies fail to install:

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --force
```

### If PM2 won't start:

```bash
pm2 delete hcuniversity-app
export $(grep -v '^#' server.env | xargs)
pm2 start server.js --name hcuniversity-app
pm2 save
```

### If you still get 404 errors:

1. Check if build succeeded:
   ```bash
   ls -la build/index.html
   grep "static/js" build/index.html
   ```

2. Check PM2 logs:
   ```bash
   pm2 logs hcuniversity-app --lines 50
   ```

3. Test Node.js directly:
   ```bash
   curl http://localhost:3001/
   ```

## What Changed

The key insight: **The build was failing during minification**, not during compilation. By skipping minification, we avoid the resource exhaustion that causes EAGAIN errors.

## Notes

- Unminified builds are **larger** but work perfectly
- For production, larger files are acceptable if minification causes failures
- Consider building locally and uploading `build/` folder if you need minification
- The `--legacy-peer-deps` flag is needed for React 19 compatibility

## Summary

**The fix:** Use `npm run build:no-minify` instead of `npm run build` to avoid EAGAIN errors during deployment.

**Always remember:** 
- `npm run build` = tries to minify = EAGAIN error on limited servers
- `npm run build:no-minify` = skips minification = works every time ✅



