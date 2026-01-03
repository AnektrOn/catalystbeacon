# Fix EAGAIN Build Error

## The Problem

```
Failed to minify the bundle. Error: static/js/main.19e631f3.js from Terser plugin
EAGAIN
```

This is a **resource exhaustion error** - your server ran out of memory or file handles during minification.

## Quick Fix

**Build WITHOUT minification** (the app will work, files will just be larger):

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# Clean
rm -rf build

# Build without minification (uses existing build:no-minify script)
npm run build:no-minify

# Restart
pm2 restart hcuniversity-app
```

## Alternative: Build with Light Settings

If that still fails:

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

rm -rf build

# Light build (no sourcemaps, less memory)
npm run build:light

pm2 restart hcuniversity-app
```

## Why This Happens

- **EAGAIN** = "Resource temporarily unavailable"
- Terser (minifier) needs lots of memory
- Your server doesn't have enough resources during minification
- Solution: Skip minification (app works fine, just larger files)

## Permanent Fix Options

### Option 1: Increase System Limits

```bash
# Increase file handle limit
ulimit -n 65536

# Then build
npm run build
```

### Option 2: Build Locally, Deploy Build Folder

Build on your local machine (more resources), then upload the `build/` folder.

### Option 3: Use Unminified Build (Recommended for Now)

Just use `npm run build:no-minify` - the app works perfectly, files are just larger.

## Verify It Works

After building:

```bash
# Check if build succeeded
ls -la build/index.html

# Check if it has JS references
grep "static/js" build/index.html

# Test server
curl http://localhost:3001/ | head -20
```

