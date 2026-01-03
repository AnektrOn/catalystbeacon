# Quick Fix for 404/405/Dummy Index.html Issues

## 🚨 The Problem

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

## ✅ The Solution

### Option 1: Use the Fix Script (Recommended)

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
bash DEPLOY_FIX.sh
```

### Option 2: Manual Fix

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# 1. Clean build
rm -rf build

# 2. Rebuild
NODE_OPTIONS='--max-old-space-size=4096' npm run build

# 3. Verify build succeeded
if [ ! -f "build/index.html" ]; then
    echo "❌ Build failed! Check errors above"
    exit 1
fi

# Check if JS files exist
JS_FILES=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
if [ "$JS_FILES" -eq 0 ]; then
    echo "❌ No JS files! Build incomplete."
    exit 1
fi

echo "✅ Build OK: $JS_FILES JS files"

# 4. Fix permissions
chmod -R 755 build
find build -type f -exec chmod 644 {} \;

# 5. Restart PM2 from correct directory
pm2 delete hcuniversity-app 2>/dev/null || true
export $(grep -v '^#' server.env | xargs)
pm2 start server.js --name hcuniversity-app
pm2 save

# 6. Check it's working
pm2 logs hcuniversity-app --lines 20
```

## 🔍 Common Issues & Fixes

### Issue 1: Build Directory Empty
**Symptom:** `build/index.html` exists but is just the template (no bundled JS)

**Fix:**
```bash
# Check build output
npm run build 2>&1 | tee build.log
grep -i error build.log

# If build fails, try:
rm -rf node_modules/.cache
npm run build
```

### Issue 2: PM2 Running from Wrong Directory
**Symptom:** PM2 logs show "Build directory not found"

**Fix:**
```bash
# Check where PM2 is running
pm2 jlist | grep -A 10 "hcuniversity-app"

# Restart from correct directory
cd ~/domains/humancatalystbeacon.com/public_html/app
pm2 delete hcuniversity-app
pm2 start server.js --name hcuniversity-app
pm2 save
```

### Issue 3: Apache Serving Old Files
**Symptom:** Getting old content even after rebuild

**Fix:**
```bash
# Clear Apache cache (if using)
sudo service apache2 reload

# Or check .htaccess is proxying to Node.js
cat .htaccess | grep -A 2 "RewriteRule"
```

### Issue 4: Port Not Listening
**Symptom:** Connection refused errors

**Fix:**
```bash
# Check if port 3001 is in use
lsof -i :3001

# Check PM2 status
pm2 list
pm2 logs hcuniversity-app
```

## ✅ Verification

After fixing, verify:

```bash
# 1. Check build exists and has files
ls -la build/
ls -la build/static/js/ | head -3

# 2. Check PM2 is running
pm2 list

# 3. Check server logs
pm2 logs hcuniversity-app --lines 20

# 4. Test server directly
curl http://localhost:3001/ | head -20
```

## 📝 What Changed

The `server.js` file was updated to:
- Better handle non-GET requests (fixes 405 errors)
- Add proper 404 handler
- Improve error messages

## 🆘 Still Not Working?

1. **Check build logs:**
   ```bash
   npm run build 2>&1 | tee build.log
   cat build.log | grep -i error
   ```

2. **Check PM2 logs:**
   ```bash
   pm2 logs hcuniversity-app --lines 100
   ```

3. **Verify build directory:**
   ```bash
   ls -la build/
   du -sh build/  # Should be several MB
   ```

4. **Test server directly:**
   ```bash
   node server.js
   # Visit http://localhost:3001
   ```

