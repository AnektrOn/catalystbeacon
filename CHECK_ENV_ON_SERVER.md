# How to Check .env File on Server

## Step 1: SSH into Your Server

```bash
# Replace with your actual server credentials
ssh your-username@your-server-ip
# or if you have a domain:
ssh your-username@humancatalystbeacon.com
```

## Step 2: Navigate to Project Directory

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
```

## Step 3: Check Environment Files

### Check Frontend .env file:
```bash
# View the .env file
cat .env

# Or edit it
nano .env
```

### Check Server .env file (for backend):
```bash
# View server.env
cat server.env

# Or edit it
nano server.env
```

### List all .env files:
```bash
# Find all environment files
ls -la | grep env
```

## Step 4: Required Environment Variables

### Frontend .env file should have (REACT_APP_ prefix for Create React App):

```bash
# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
REACT_APP_STRIPE_STUDENT_MONTHLY_PRICE_ID=price_xxxxx
REACT_APP_STRIPE_STUDENT_YEARLY_PRICE_ID=price_xxxxx
REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID=price_xxxxx
REACT_APP_STRIPE_TEACHER_YEARLY_PRICE_ID=price_xxxxx

# API URL (if using local server)
REACT_APP_API_URL=http://localhost:3001
# OR for production:
REACT_APP_API_URL=https://your-api-domain.com
```

### Server server.env file should have:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_STUDENT_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_STUDENT_YEARLY_PRICE_ID=price_xxxxx
STRIPE_TEACHER_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_TEACHER_YEARLY_PRICE_ID=price_xxxxx

# Server
PORT=3001
```

## Quick Commands to Check Everything

```bash
# 1. Go to project directory
cd ~/domains/humancatalystbeacon.com/public_html/app

# 2. Check if .env exists
ls -la .env

# 3. View .env content (be careful, this shows secrets!)
cat .env

# 4. Check server.env
cat server.env

# 5. Check what environment variables are loaded
env | grep REACT_APP
env | grep STRIPE
env | grep SUPABASE

# 6. Check if server is running
pm2 list
# or
ps aux | grep node
```

## Common Issues

### Issue: .env file doesn't exist
```bash
# Create it
touch .env
nano .env
# Add your variables
```

### Issue: Variables not loading
```bash
# After editing .env, rebuild the app
npm run build

# Restart PM2
pm2 restart hcuniversity-app
```

### Issue: Need to see current values without exposing secrets
```bash
# Check if variables are set (without showing values)
env | grep -E "REACT_APP|STRIPE|SUPABASE" | cut -d= -f1
```

## Editing .env File

```bash
# Using nano (easiest)
nano .env

# Using vi
vi .env

# Using vim
vim .env
```

**In nano:**
- Edit the file
- Press `Ctrl+O` to save
- Press `Enter` to confirm
- Press `Ctrl+X` to exit

## After Making Changes

```bash
# 1. Rebuild frontend (to pick up new env vars)
npm run build

# 2. Restart server
pm2 restart hcuniversity-app

# 3. Check logs
pm2 logs hcuniversity-app --lines 20
```

