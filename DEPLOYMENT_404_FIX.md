# Fix 404/405/Dummy Index.html After Deployment

## 🔍 Common Causes

### 1. **Build Directory Empty or Incomplete**
The build process might be failing silently, leaving an empty `build` directory.

**Symptoms:**
- 404 errors on all routes
- Empty or "dummy" index.html (just the template without bundled JS)
- No JavaScript files in `build/static/js/`

**Fix:**
```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
rm -rf build
npm run build
# Verify build succeeded:
ls -la build/
ls -la build/static/js/
```

### 2. **PM2 Running from Wrong Directory**
PM2 might be running from a different directory than where you built the app.

**Symptoms:**
- Server starts but can't find build directory
- PM2 logs show: "Build directory not found"

**Fix:**
```bash
# Check PM2 working directory
pm2 jlist | grep -A 10 "hcuniversity-app"

# Delete and restart from correct directory
cd ~/domains/humancatalystbeacon.com/public_html/app
pm2 delete hcuniversity-app
pm2 start server.js --name hcuniversity-app --cwd $(pwd)
pm2 save
```

### 3. **Apache/Nginx Intercepting Requests**
If Apache is configured to serve files directly, it might be serving an old/empty build before requests reach Node.js.

**Symptoms:**
- 404 errors even though PM2 is running
- Different content than what Node.js should serve
- `.htaccess` file exists and might be misconfigured

**Fix:**
Check your `.htaccess` file. It should proxy API requests to Node.js:
```apache
# Proxy API requests to Node.js server
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Serve React app (fallback to Node.js)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
```

**OR** disable Apache serving and let Node.js handle everything:
```apache
# Just proxy everything to Node.js
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
```

### 4. **Build Process Failing Silently**
The build might be failing but not showing errors.

**Symptoms:**
- Build appears to complete but no files created
- Build directory exists but is empty
- No error messages during build

**Fix:**
```bash
# Run build with verbose output
npm run build 2>&1 | tee build.log

# Check for errors
grep -i error build.log
grep -i warning build.log

# Check if build actually created files
ls -la build/
du -sh build/  # Should be several MB, not KB
```

### 5. **Port Conflict or Server Not Running**
Node.js server might not be running on port 3001.

**Symptoms:**
- 404/405 errors
- Connection refused errors

**Fix:**
```bash
# Check if port 3001 is in use
lsof -i :3001

# Check PM2 status
pm2 list
pm2 logs hcuniversity-app --lines 50

# Restart PM2
pm2 restart hcuniversity-app
```

### 6. **Method Not Allowed (405 Error)**
The server might be rejecting certain HTTP methods.

**Symptoms:**
- 405 Method Not Allowed errors
- POST requests failing

**Fix:**
Check `server.js` - make sure all routes are defined before the catch-all handler:
```javascript
// API routes first
app.post('/api/...', ...)
app.get('/api/...', ...)

// Static files
app.use(express.static(buildPath))

// Catch-all LAST (for React Router)
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'))
})
```

## 🚀 Complete Fix Script

Run this on your production server:

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app

# 1. Clean everything
rm -rf build node_modules/.cache

# 2. Reinstall dependencies
npm install --legacy-peer-deps

# 3. Build with verbose output
NODE_OPTIONS='--max-old-space-size=4096' npm run build 2>&1 | tee build.log

# 4. Verify build
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    echo "❌ Build failed! Check build.log"
    exit 1
fi

# Check if JS files exist
JS_COUNT=$(find build/static/js -name "*.js" 2>/dev/null | wc -l)
if [ "$JS_COUNT" -eq 0 ]; then
    echo "❌ No JavaScript files found! Build incomplete."
    exit 1
fi

echo "✅ Build successful: $JS_COUNT JS files"

# 5. Fix permissions
chmod -R 755 build
find build -type f -exec chmod 644 {} \;

# 6. Restart PM2 from correct directory
pm2 delete hcuniversity-app 2>/dev/null || true
export $(grep -v '^#' server.env | xargs)
pm2 start server.js --name hcuniversity-app
pm2 save

# 7. Check logs
pm2 logs hcuniversity-app --lines 20
```

## 🔍 Diagnostic Commands

```bash
# Check build directory
ls -la build/
ls -la build/static/js/ | head -5

# Check if index.html has bundled JS
grep -o "static/js/[^"]*" build/index.html | head -3

# Check PM2 status
pm2 list
pm2 info hcuniversity-app

# Check server logs
pm2 logs hcuniversity-app --lines 50

# Check if server is responding
curl http://localhost:3001/
curl http://localhost:3001/api/health 2>/dev/null || echo "No health endpoint"

# Check file sizes (build should be several MB)
du -sh build/
du -sh build/static/
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] `build/index.html` exists and is > 1KB
- [ ] `build/index.html` contains `<script src="/static/js/...">` tags
- [ ] `build/static/js/` contains `.js` files
- [ ] `build/static/css/` contains `.css` files
- [ ] PM2 process `hcuniversity-app` is running
- [ ] PM2 logs show "Serving React app from: /path/to/build"
- [ ] Port 3001 is listening: `lsof -i :3001`
- [ ] Server responds: `curl http://localhost:3001/`
- [ ] No errors in PM2 logs: `pm2 logs hcuniversity-app`

## 🆘 Still Having Issues?

1. **Check PM2 logs:**
   ```bash
   pm2 logs hcuniversity-app --lines 100
   ```

2. **Check build output:**
   ```bash
   cat build.log | grep -i error
   ```

3. **Verify server.js is finding build directory:**
   ```bash
   node -e "console.log(require('path').join(__dirname, 'build'))"
   ```

4. **Test server directly:**
   ```bash
   node server.js
   # Then visit http://localhost:3001 in browser
   ```

5. **Check Apache/nginx configuration:**
   - Make sure it's proxying to `http://localhost:3001`
   - Not serving files directly from `build/` directory

