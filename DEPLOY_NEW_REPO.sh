#!/bin/bash
# Deploy from new GitHub repository: catalystbeacon

set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

echo "🧹 CLEANING AND DEPLOYING FROM NEW REPOSITORY..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ~/domains/humancatalystbeacon.com/public_html

# Step 1: Stop PM2
echo "📋 Step 1: Stopping PM2 server..."
if pm2 list | grep -q "hcuniversity-app"; then
    pm2 stop hcuniversity-app
    pm2 delete hcuniversity-app
    echo "   ✅ PM2 stopped"
else
    echo "   ✅ PM2 not running"
fi
echo ""

# Step 2: Backup environment files (if they exist)
echo "📋 Step 2: Backing up environment files..."
BACKUP_DIR=~/app_backup_$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

if [ -d "app" ]; then
    if [ -f "app/.env" ]; then
        cp app/.env "$BACKUP_DIR/.env"
        echo "   ✅ Backed up .env"
    fi
    if [ -f "app/server.env" ]; then
        cp app/server.env "$BACKUP_DIR/server.env"
        echo "   ✅ Backed up server.env"
    fi
    if [ -f "app/.htaccess" ]; then
        cp app/.htaccess "$BACKUP_DIR/.htaccess"
        echo "   ✅ Backed up .htaccess"
    fi
fi

echo "   📁 Backup location: $BACKUP_DIR"
echo ""

# Step 3: Delete everything in app folder
echo "📋 Step 3: Deleting old app folder..."
rm -rf app
mkdir -p app
cd app
echo "   ✅ Clean folder created"
echo ""

# Step 4: Clone new repository
echo "📋 Step 4: Cloning new repository..."
echo "   Repository: https://github.com/AnektrOn/catalystbeacon.git"
git clone https://github.com/AnektrOn/catalystbeacon.git .
echo "   ✅ Repository cloned"
echo ""

# Step 5: Restore environment files
echo "📋 Step 5: Restoring environment files..."
if [ -f "$BACKUP_DIR/.env" ]; then
    cp "$BACKUP_DIR/.env" .env
    echo "   ✅ Restored .env"
else
    echo "   ⚠️  No .env backup found - you'll need to create one"
fi

if [ -f "$BACKUP_DIR/server.env" ]; then
    cp "$BACKUP_DIR/server.env" server.env
    echo "   ✅ Restored server.env"
else
    echo "   ⚠️  No server.env backup found - you'll need to create one"
fi

if [ -f "$BACKUP_DIR/.htaccess" ]; then
    cp "$BACKUP_DIR/.htaccess" .htaccess
    echo "   ✅ Restored .htaccess"
fi

echo ""
echo "   ⚠️  IMPORTANT: Verify your .env and server.env files have actual keys!"
echo ""

# Step 6: Install dependencies
echo "📋 Step 6: Installing dependencies..."
echo "   (This takes 3-5 minutes)"
npm install --legacy-peer-deps
echo "   ✅ Dependencies installed"
echo ""

# Step 7: Build
echo "📋 Step 7: Building application..."
echo "   (This takes 2-5 minutes)"
npm run build
echo "   ✅ Build complete"
echo ""

# Step 8: Fix permissions
echo "📋 Step 8: Fixing permissions..."
chmod -R 755 build
find build -type f -exec chmod 644 {} \;
echo "   ✅ Permissions fixed"
echo ""

# Step 9: Create .htaccess
echo "📋 Step 9: Creating .htaccess..."
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
echo ""

# Step 10: Create index.php
echo "📋 Step 10: Creating index.php..."
cat > index.php << 'PHP'
<?php
header('Location: build/index.html');
exit;
?>
PHP
chmod 644 index.php
echo "   ✅ index.php created"
echo ""

# Step 11: Start PM2 server
echo "📋 Step 11: Starting PM2 server..."
if [ -f "server.env" ]; then
    export $(grep -v '^#' server.env | xargs)
fi

pm2 start server.js --name hcuniversity-app
pm2 save
echo "   ✅ Server started"
pm2 status hcuniversity-app
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📊 Summary:"
echo "   ✅ Old files deleted"
echo "   ✅ New repository cloned"
echo "   ✅ Dependencies installed"
echo "   ✅ Application built"
echo "   ✅ Server started"
echo ""
echo "🌐 Website: https://app.humancatalystbeacon.com"
echo "📁 Repository: https://github.com/AnektrOn/catalystbeacon"
echo ""
echo "📝 Next Steps:"
echo "   1. Clear your browser cache"
echo "   2. Visit: https://app.humancatalystbeacon.com"
echo "   3. Check browser console (F12) for any errors"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

