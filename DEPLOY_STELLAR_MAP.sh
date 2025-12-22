#!/bin/bash
# Deploy stellar-map branch to server

set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

echo "🚀 DEPLOYING STELLAR-MAP BRANCH..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ~/domains/humancatalystbeacon.com/public_html/app

# Step 1: Backup environment files
echo "📋 Step 1: Backing up environment files..."
BACKUP_DIR=~/app_backup_$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/.env"
    echo "   ✅ Backed up .env"
fi

if [ -f "server.env" ]; then
    cp server.env "$BACKUP_DIR/server.env"
    echo "   ✅ Backed up server.env"
fi

if [ -f ".htaccess" ]; then
    cp .htaccess "$BACKUP_DIR/.htaccess"
    echo "   ✅ Backed up .htaccess"
fi

echo ""

# Step 2: Pull latest stellar-map branch
echo "📋 Step 2: Pulling latest stellar-map branch..."
git fetch origin stellar-map
git checkout stellar-map
git pull origin stellar-map
echo "   ✅ Updated to latest stellar-map"
echo ""

# Step 3: Restore environment files
echo "📋 Step 3: Restoring environment files..."
if [ -f "$BACKUP_DIR/.env" ]; then
    cp "$BACKUP_DIR/.env" .env
    echo "   ✅ Restored .env"
fi

if [ -f "$BACKUP_DIR/server.env" ]; then
    cp "$BACKUP_DIR/server.env" server.env
    echo "   ✅ Restored server.env"
fi

if [ -f "$BACKUP_DIR/.htaccess" ]; then
    cp "$BACKUP_DIR/.htaccess" .htaccess
    echo "   ✅ Restored .htaccess"
fi

echo ""

# Step 4: Install dependencies (if needed)
echo "📋 Step 4: Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/react-scripts" ]; then
    echo "   Installing dependencies..."
    npm install --legacy-peer-deps
else
    echo "   ✅ Dependencies already installed"
fi
echo ""

# Step 5: Build
echo "📋 Step 5: Building application..."
npm run build
echo "   ✅ Build complete"
echo ""

# Step 6: Fix permissions
echo "📋 Step 6: Fixing permissions..."
chmod -R 755 build
find build -type f -exec chmod 644 {} \;
chmod 644 .htaccess 2>/dev/null || true
echo "   ✅ Permissions fixed"
echo ""

# Step 7: Create/update .htaccess if needed
if [ ! -f ".htaccess" ]; then
    echo "📋 Step 7: Creating .htaccess..."
    cat > .htaccess << 'HTACCESS'
RewriteEngine On
RewriteBase /

# Set proper MIME types
<IfModule mod_mime.c>
    AddType application/javascript js
    AddType text/css css
    AddType image/svg+xml svg
    AddType application/json json
    AddType font/woff woff
    AddType font/woff2 woff2
</IfModule>

# Directory index
DirectoryIndex build/index.html index.php index.html

# Allow access to build folder
<Directory "build">
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>

# Proxy API requests to Node.js server
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Serve static files from build folder
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} ^/static/
RewriteRule ^static/(.*)$ build/static/$1 [L]

# Serve other static assets
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|map|webp)$
RewriteRule ^(.*)$ build/$1 [L]

# Serve React app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ build/index.html [L]
HTACCESS
    chmod 644 .htaccess
    echo "   ✅ .htaccess created"
fi

# Step 8: Create index.php if needed
if [ ! -f "index.php" ]; then
    echo "📋 Step 8: Creating index.php..."
    cat > index.php << 'PHP'
<?php
header('Location: build/index.html');
exit;
?>
PHP
    chmod 644 index.php
    echo "   ✅ index.php created"
fi

echo ""

# Step 9: Restart PM2 server
echo "📋 Step 9: Restarting PM2 server..."
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
fi

if pm2 list | grep -q "hcuniversity-app"; then
    pm2 restart hcuniversity-app
    echo "   ✅ Server restarted"
else
    pm2 start server.js --name hcuniversity-app
    pm2 save
    echo "   ✅ Server started"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📊 Status:"
pm2 status hcuniversity-app
echo ""
echo "🌐 Website: https://app.humancatalystbeacon.com"
echo "📝 Branch: stellar-map"
echo "📅 Commit: $(git log -1 --oneline)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

