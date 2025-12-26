# 🏠 Local Development Workflow

## The Process (What You Want)

1. **Edit code locally** → Make changes on your computer
2. **Test on localhost** → See if it works on your computer first
3. **Deploy to server** → Only after it works locally, send to server

---

## 📋 Step-by-Step Workflow

### Step 1: Set Up Local Environment

#### 1.1 Create `.env` file (if you don't have it)

Create `.env` in the project root:
```env
REACT_APP_SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
REACT_APP_SITE_NAME=The Human Catalyst University
REACT_APP_SITE_URL=http://localhost:3000
NODE_ENV=development
```

#### 1.2 Create `server.env` file (for backend)

Create `server.env` in the project root:
```env
PORT=3001
NODE_ENV=development
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

### Step 2: Run Locally (Two Terminals)

#### Terminal 1: Frontend (React App)
```bash
# Go to project folder
cd /Users/conesaleo/hcuniversity/hcuniversity

# Install dependencies (first time only)
npm install

# Start React app
npm start
```

**Result:** Opens http://localhost:3000 in your browser

#### Terminal 2: Backend (Node.js Server)
```bash
# Same folder
cd /Users/conesaleo/hcuniversity/hcuniversity

# Load environment variables and start server
export $(grep -v '^#' server.env | xargs)
node server.js
```

**Result:** Server runs on http://localhost:3001

---

### Step 3: Make Changes & Test

1. **Edit any file** (e.g., `server.js`, `src/App.js`, etc.)
2. **Save the file**
3. **Check localhost:**
   - Frontend: http://localhost:3000 (auto-refreshes)
   - Backend: Restart `node server.js` if you changed `server.js`

4. **Test your changes:**
   - Open browser to http://localhost:3000
   - Test the feature you changed
   - Check browser console for errors (F12)
   - Check Terminal 2 for server errors

---

### Step 4: When It Works Locally → Deploy to Server

#### 4.1 Commit Changes to Git
```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with message
git commit -m "Description of what you changed"

# Push to GitHub
git push origin main
```

#### 4.2 Deploy to Server (SSH)

```bash
# Connect to server
ssh -p 65002 u933166613@82.180.152.127

# Go to app folder
cd ~/domains/humancatalystbeacon.com/public_html/app

# Pull latest code
git pull origin main

# Install any new dependencies
npm install --legacy-peer-deps

# Rebuild the app
npm run build

# Restart server
pm2 restart hcuniversity-app
```

---

## 🔄 Complete Workflow Example

### Example: Adding Systeme.io Webhook

1. **Edit `server.js` locally**
   ```bash
   # Make your changes in Cursor/VS Code
   ```

2. **Test locally**
   ```bash
   # Terminal 1
   npm start
   
   # Terminal 2
   export $(grep -v '^#' server.env | xargs)
   node server.js
   
   # Test webhook with curl
   curl -X POST http://localhost:3001/api/webhook/systeme/contact-created \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","first_name":"Test"}'
   ```

3. **If it works → Deploy**
   ```bash
   git add server.js
   git commit -m "Add Systeme.io webhook endpoint"
   git push origin main
   
   # Then SSH to server and pull
   ssh -p 65002 u933166613@82.180.152.127
   cd ~/domains/humancatalystbeacon.com/public_html/app
   git pull origin main
   pm2 restart hcuniversity-app
   ```

---

## 🛠️ Quick Commands Reference

### Local Development
```bash
# Start frontend
npm start

# Start backend (in another terminal)
export $(grep -v '^#' server.env | xargs)
node server.js

# Build for production (test build locally)
npm run build
```

### Git Commands
```bash
# See what changed
git status

# Add all changes
git add .

# Commit
git commit -m "Your message here"

# Push to GitHub
git push origin main
```

### Server Deployment
```bash
# SSH to server
ssh -p 65002 u933166613@82.180.152.127

# Update code
cd ~/domains/humancatalystbeacon.com/public_html/app
git pull origin main

# Rebuild
npm run build

# Restart
pm2 restart hcuniversity-app
```

---

## ⚠️ Important Notes

1. **Always test locally first** - Don't push broken code
2. **Check both terminals** - Frontend AND backend must run
3. **Environment variables** - Make sure `.env` and `server.env` exist
4. **Git before deploy** - Always commit and push before deploying
5. **Server restart** - Always restart PM2 after deploying

---

## 🐛 Troubleshooting

### Frontend not loading?
- Check Terminal 1 for errors
- Make sure `.env` file exists
- Try `npm install` again

### Backend not working?
- Check Terminal 2 for errors
- Make sure `server.env` exists
- Check if port 3001 is already in use

### Changes not showing?
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Restart both terminals
- Clear browser cache

---

## ✅ Checklist Before Deploying

- [ ] Code works on localhost:3000
- [ ] Backend works on localhost:3001
- [ ] No errors in browser console
- [ ] No errors in terminal
- [ ] Changes committed to git
- [ ] Pushed to GitHub
- [ ] Ready to deploy!

---

**Remember: Local first, then deploy! 🚀**

