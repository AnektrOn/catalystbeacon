# 🔧 Production Sign Up/Sign In Fix

## Problem

Sign up and sign in were not working in production because the React app was built **without** the required Supabase environment variables. 

In Create React App, environment variables are embedded at **BUILD TIME**, not runtime. If `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are not available during `npm run build`, they become `undefined` in the built JavaScript bundle, causing authentication to fail.

## Root Cause

The production build process (`deploy.sh`) was not ensuring that the React app environment variables were available before building. The `server.env` file only contains server-side variables, not the `REACT_APP_` prefixed variables needed by the React app.

## Solution

### Option 1: Run the Fix Script (Recommended)

On your production server, run:

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
bash fix-production-env.sh
```

This script will:
1. ✅ Create `.env.production` file with Supabase credentials
2. ✅ Load environment variables
3. ✅ Rebuild the application with correct variables
4. ✅ Restart PM2

### Option 2: Manual Fix

1. **SSH into your production server:**
   ```bash
   ssh your-server
   cd ~/domains/humancatalystbeacon.com/public_html/app
   ```

2. **Create `.env.production` file:**
   ```bash
   cat > .env.production << 'EOF'
   # Production Environment Variables for React App
   REACT_APP_SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZmZ5Y2dycWZlZXNmbmhoY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTEwOTQsImV4cCI6MjA3NDUyNzA5NH0.vRB4oPdeQ4bQBns1tOLEzoS6YWY-RjrK_t65y2D0hTM
   REACT_APP_SITE_NAME=The Human Catalyst University
   REACT_APP_SITE_URL=https://humancatalystbeacon.com
   EOF
   ```

3. **Rebuild the application:**
   ```bash
   export $(grep -v '^#' .env.production | xargs)
   rm -rf build
   NODE_ENV=production npm run build:no-minify
   ```

4. **Restart PM2:**
   ```bash
   pm2 restart hcuniversity-app
   pm2 save
   ```

## What Was Fixed

### 1. Updated `deploy.sh`
- ✅ Now checks for `.env.production` before building
- ✅ Creates `.env.production` automatically if missing
- ✅ Loads environment variables before build
- ✅ Verifies variables are set before building
- ✅ Sets `NODE_ENV=production` during build

### 2. Created `fix-production-env.sh`
- ✅ Standalone script to fix the issue immediately
- ✅ Can be run anytime to ensure environment is correct
- ✅ Includes verification steps

## Verification

After running the fix, verify it's working:

1. **Check browser console** - Should not see "Missing Supabase environment variables" error
2. **Try signing up** - Should work without errors
3. **Try signing in** - Should authenticate successfully

## Future Deployments

The updated `deploy.sh` script will now automatically:
- ✅ Check for environment variables before building
- ✅ Create `.env.production` if missing
- ✅ Load variables before build
- ✅ Verify variables are set

You should **not** need to run the fix script again unless the `.env.production` file is deleted.

## Important Notes

1. **`.env.production` is gitignored** - This is correct for security. The file should exist on the production server but not be committed to git.

2. **Environment variables are build-time** - In Create React App, `REACT_APP_` variables are embedded into the JavaScript bundle during build. You must rebuild after changing them.

3. **Server variables vs React variables**:
   - `server.env` → For Node.js server (PM2)
   - `.env.production` → For React app build

## Troubleshooting

If sign up/sign in still doesn't work after running the fix:

1. **Check browser console** for errors
2. **Verify `.env.production` exists** on production server
3. **Check build output** - Should not show "undefined" for Supabase URL
4. **Verify PM2 is running** - `pm2 list`
5. **Check PM2 logs** - `pm2 logs hcuniversity-app`

## Related Files

- `src/lib/supabaseClient.js` - Supabase client configuration
- `deploy.sh` - Updated deployment script
- `fix-production-env.sh` - Standalone fix script
- `server.env` - Server-side environment variables (unchanged)



