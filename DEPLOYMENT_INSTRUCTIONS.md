# Deployment Instructions - Roadmap Update

## 🚀 Deploy to Production Server

### Step 1: Pull Latest Changes on Server

SSH into your server and run:

```bash
cd /path/to/your/hcuniversity
git pull origin main
```

### Step 2: Install Dependencies (if any new ones)

```bash
npm install
```

### Step 3: Build for Production

```bash
npm run build
```

### Step 4: Restart Server

**If using PM2:**
```bash
pm2 restart hcuniversity
# or
pm2 restart all
```

**If using systemd:**
```bash
sudo systemctl restart hcuniversity
```

**If using simple node:**
```bash
# Stop the current process
pkill -f "node server.js"

# Start in background
nohup npm start &
```

### Step 5: Apply Database Migration

Go to **Supabase Dashboard** → SQL Editor and run:

1. **Main migration** (creates tables and functions):
   - Open file: `supabase/migrations/20250101000001_create_roadmap_system.sql`
   - Copy ALL contents
   - Paste and Run in SQL Editor

2. **Assign courses to Ignition**:
```sql
UPDATE course_metadata
SET masterschool = 'Ignition'
WHERE course_id IN (
  SELECT course_id FROM course_metadata LIMIT 15
);
```

### Step 6: Verify Deployment

1. Visit: `https://yourdomain.com/roadmap/ignition`
2. Should see circular bubbles in winding path
3. Click a lesson to test tracking
4. Check browser console for any errors

---

## 🔄 Quick Deploy Commands (Copy-Paste)

### For VPS/Cloud Server:

```bash
# SSH into server
ssh user@your-server-ip

# Navigate to project
cd /path/to/hcuniversity

# Pull changes
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart (choose your method)
pm2 restart hcuniversity
# OR
sudo systemctl restart hcuniversity
# OR
pkill -f "node server.js" && nohup npm start &

# Exit SSH
exit
```

### For Vercel:

```bash
# Vercel auto-deploys from GitHub, but you can trigger manually:
vercel --prod
```

### For Netlify:

```bash
# Netlify auto-deploys from GitHub, or trigger manually:
netlify deploy --prod
```

### For Heroku:

```bash
git push heroku main
```

---

## 📋 Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] `/roadmap/ignition` shows lessons
- [ ] Can click and navigate to lessons
- [ ] Lesson tracker appears on right side
- [ ] Timer starts counting (3 minutes)
- [ ] Scroll tracking works
- [ ] Complete button enables after requirements met
- [ ] Mobile view works (tracker on bottom)
- [ ] All 287 lessons visible

---

## 🗄️ Database Updates Required

### Option A: Via Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
2. Run these queries in order:

**Query 1: Create roadmap tables (optional - for full features)**
```sql
-- Copy from: supabase/migrations/20250101000001_create_roadmap_system.sql
-- This creates roadmap_progress and roadmap_notifications tables
-- OPTIONAL: The roadmap works without these tables using fallbacks
```

**Query 2: Assign courses to masterschools (REQUIRED)**
```sql
-- Assign courses to Ignition
UPDATE course_metadata
SET masterschool = 'Ignition'
WHERE course_id IN (
  SELECT course_id FROM course_metadata ORDER BY course_id LIMIT 20
);

-- Optionally assign to Insight
UPDATE course_metadata
SET masterschool = 'Insight'
WHERE course_id IN (
  SELECT course_id 
  FROM course_metadata 
  WHERE masterschool IS NULL 
  ORDER BY course_id 
  LIMIT 20
);

-- Optionally assign to Transformation
UPDATE course_metadata
SET masterschool = 'Transformation'
WHERE course_id IN (
  SELECT course_id 
  FROM course_metadata 
  WHERE masterschool IS NULL 
  ORDER BY course_id 
  LIMIT 20
);
```

**Query 3: Verify assignments**
```sql
SELECT 
  masterschool,
  COUNT(*) as course_count,
  SUM((SELECT COUNT(*) FROM course_content cc WHERE cc.course_id = cm.course_id)) as total_lessons
FROM course_metadata cm
WHERE masterschool IN ('Ignition', 'Insight', 'Transformation')
GROUP BY masterschool;
```

---

## 🌐 Environment Variables

Make sure your production `.env` file has:

```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

---

## 🐛 Troubleshooting Production

### Issue: White screen / Blank page

**Check:**
```bash
# View build logs
npm run build

# Check for errors in output
```

**Fix:** Usually a build error. Check console for details.

### Issue: "No lessons available"

**Check Supabase:**
```sql
SELECT COUNT(*) FROM course_metadata WHERE masterschool = 'Ignition';
```

**Fix:** Assign courses using Query 2 above.

### Issue: Tracker not working

**Check browser console** on production site.

**Common fix:** Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## 📊 Monitor After Deployment

1. **Check server logs** for errors
2. **Monitor Supabase** for database queries
3. **Test on mobile** device
4. **Check all routes**:
   - `/roadmap/ignition`
   - `/roadmap/ignition/Mental%20Fitness` (stat link pages)
   - Individual lesson pages

---

## 🔙 Rollback (If Needed)

```bash
# SSH into server
ssh user@your-server-ip

# Go to project
cd /path/to/hcuniversity

# Rollback to previous commit
git reset --hard HEAD~1

# Rebuild
npm run build

# Restart
pm2 restart hcuniversity
```

---

## ✅ Success Criteria

Deployment successful when:
- ✅ `/roadmap/ignition` loads
- ✅ See circular golden bubbles
- ✅ Winding S-curve path visible
- ✅ First lesson unlocked (golden border)
- ✅ Can click and navigate to lessons
- ✅ Lesson content loads
- ✅ Tracker panel appears on right
- ✅ Timer counts up
- ✅ Scroll percentage updates
- ✅ Button enables after 3 min + 100% scroll

---

## 📞 Support

If deployment fails:
1. Check server logs: `pm2 logs` or `journalctl -u hcuniversity`
2. Check Supabase logs in dashboard
3. Test locally first: `npm run build && npm start`
4. Review browser console errors

**Commit SHA:** 171c4ab  
**Deployment Date:** January 1, 2026  
**Feature:** Ignition Roadmap System

