# Fix npm install Issues After Git Pull

## The Problem

After `git pull origin main`, `npm install` fails or installs incorrectly, causing 404/405 errors.

## Quick Fix (Run This)

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# Complete clean install
rm -rf node_modules package-lock.json .cache node_modules/.cache
npm cache clean --force
npm install --legacy-peer-deps --force

# Rebuild
npm run build

# Restart
pm2 restart hcuniversity-app
```

## Common npm install Issues

### Issue 1: React 19 Compatibility

React 19.2.0 is very new and `react-scripts@5.0.1` might not fully support it.

**Fix:**
```bash
# Option A: Use --legacy-peer-deps (recommended)
npm install --legacy-peer-deps

# Option B: Force install
npm install --legacy-peer-deps --force
```

### Issue 2: Package Lock Conflicts

If `package-lock.json` changed in git pull, it might conflict.

**Fix:**
```bash
rm -f package-lock.json
npm install --legacy-peer-deps
```

### Issue 3: Node Version Mismatch

React 19 requires Node.js 18.17+ or 20+.

**Check:**
```bash
node --version
# Should be v18.17+ or v20+
```

**Fix if wrong version:**
```bash
# Use nvm to switch versions
nvm use 18
# or
nvm use 20
```

### Issue 4: Corrupted node_modules

**Fix:**
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

### Issue 5: Express 5 Compatibility

Express 5.1.0 is very new and might have issues.

**If Express fails:**
```bash
npm install express@^4.18.0 --legacy-peer-deps
```

## Complete Fix Script

Run this on your server:

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# 1. Clean everything
rm -rf node_modules package-lock.json .cache node_modules/.cache

# 2. Clear npm cache
npm cache clean --force

# 3. Install with legacy peer deps
npm install --legacy-peer-deps --force

# 4. Verify critical packages
ls node_modules/react
ls node_modules/express
ls node_modules/react-app-rewired

# 5. Rebuild
npm run build

# 6. Restart
pm2 restart hcuniversity-app
```

## If npm install Still Fails

Check the error message:

**"Peer dependency conflict":**
```bash
npm install --legacy-peer-deps --force
```

**"Cannot find module":**
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

**"EACCES" or permission errors:**
```bash
sudo chown -R $(whoami) ~/.npm
npm install --legacy-peer-deps
```

**"Out of memory":**
```bash
NODE_OPTIONS='--max-old-space-size=4096' npm install --legacy-peer-deps
```

## Verify Installation

After installing, verify:

```bash
# Check if critical packages exist
test -d node_modules/react && echo "✅ React installed" || echo "❌ React missing"
test -d node_modules/express && echo "✅ Express installed" || echo "❌ Express missing"
test -d node_modules/react-app-rewired && echo "✅ react-app-rewired installed" || echo "❌ react-app-rewired missing"

# Check package versions
npm list react express react-app-rewired
```

## If Nothing Works

Rollback package.json to previous version:

```bash
# See what changed
git diff HEAD~1 HEAD -- package.json

# Restore previous version
git checkout HEAD~1 -- package.json

# Reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

