# Quick Fix After Git Pull Issues

## The Problem

After `git pull origin main`, you get 404/405 errors or dummy index.html, even though it was working before.

## Most Likely Causes

1. **My recent server.js changes** - I just modified the routing handlers
2. **Dependencies changed** - `package.json` might have been updated
3. **Build configuration changed** - `config-overrides.js` might have changed
4. **Apache/Node.js conflict** - Apache might be serving instead of Node.js

## Quick Fix (Try This First)

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# 1. Pull latest code (includes my fixes)
git pull origin main

# 2. Clean rebuild
rm -rf build node_modules/.cache
npm install --legacy-peer-deps
npm run build

# 3. Verify build
ls -la build/index.html
# Should show the file exists

# 4. Restart PM2
pm2 restart hcuniversity-app

# 5. Check logs
pm2 logs hcuniversity-app --lines 20
```

## If That Doesn't Work - Rollback server.js

If my changes broke it, rollback just server.js:

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# See what server.js looked like before
git show HEAD~1:server.js > server.js.backup

# Restore previous version
git checkout HEAD~1 -- server.js

# Restart
pm2 restart hcuniversity-app
```

## If Still Broken - Check What Changed

```bash
# See what files changed
git diff HEAD~1 HEAD --name-only

# See changes to server.js
git diff HEAD~1 HEAD -- server.js

# See changes to package.json
git diff HEAD~1 HEAD -- package.json
```

## Test if Node.js is Working

```bash
# Test if Node.js serves correctly
curl http://localhost:3001/

# If this returns HTML, Node.js is working
# If this fails, the issue is in server.js or build
```

## Check Apache Configuration

If Apache is serving files instead of proxying to Node.js:

```bash
# Check .htaccess
cat .htaccess | grep -A 5 "RewriteRule"

# Should proxy to localhost:3001
# If it's serving build/ directly, that's the problem
```

## Nuclear Option - Full Rollback

If nothing works, rollback to the last working commit:

```bash
# Find the last working commit
git log --oneline -10

# Rollback to a specific commit (replace COMMIT_HASH)
git checkout <COMMIT_HASH>

# Rebuild
npm install --legacy-peer-deps
npm run build
pm2 restart hcuniversity-app
```

## What I Changed

I modified `server.js` to:
1. Move `trust proxy` to the top (fixes rate limiter errors)
2. Simplify the catch-all route handler

If these changes broke it, you can rollback just server.js as shown above.

