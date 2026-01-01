# Exact Deploy Commands for humancatalystbeacon.com

## 🚀 Copy-Paste These Commands

### Step 1: SSH into your server

```bash
ssh YOUR_USERNAME@YOUR_SERVER_IP
```

### Step 2: Deploy the code

```bash
cd ~/domains/humancatalystbeacon.com/public_html/app && \
git pull origin main && \
npm install && \
npm run build && \
pm2 restart all
```

That's it! One command does everything. ✅

---

## 🗄️ Step 3: Update Database

1. Go to: https://supabase.com/dashboard/project/mbffycgrqfeesfnhhcdm/editor
2. Click **SQL Editor**
3. Copy-paste and run:

```sql
-- Assign courses to Ignition
UPDATE course_metadata
SET masterschool = 'Ignition'
WHERE course_id IN (
  SELECT course_id FROM course_metadata LIMIT 20
);
```

---

## ✅ Verify It Worked

Visit: https://humancatalystbeacon.com/roadmap/ignition

You should see:
- 🔵 Circular golden bubbles
- 🌊 Winding S-curve path
- ⏱️ Tracker panel on right
- 📚 Your 287 lessons

---

## 🐛 If Something Goes Wrong

**Check logs:**
```bash
pm2 logs hcuniversity
```

**Restart manually:**
```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
pm2 restart all
```

**Check build:**
```bash
cd ~/domains/humancatalystbeacon.com/public_html/app
npm run build
# Look for errors
```

---

## 🎯 That's All!

- ✅ Code is pushed to GitHub
- ✅ One command deploys everything
- ✅ Just update Supabase database
- ✅ Visit the site!

**URL:** https://humancatalystbeacon.com/roadmap/ignition

