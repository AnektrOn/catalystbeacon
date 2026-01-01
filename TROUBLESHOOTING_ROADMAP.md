# Roadmap Troubleshooting Guide

## Issue: "Failed to load lesson" or Empty Roadmap

This happens because the database isn't set up yet. Here's how to fix it:

---

## 🚀 Quick Fix (5 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run Quick Fix Script

Copy and paste this into the SQL Editor:

```sql
-- Check what courses you have
SELECT course_id, course_title, masterschool 
FROM course_metadata 
LIMIT 5;
```

**Click Run.** Do you see any courses? 
- ✅ **Yes:** Continue to Step 3
- ❌ **No:** You need to create courses first. Ask me how.

### Step 3: Assign a Course to Ignition

```sql
-- Assign first published course to Ignition
UPDATE course_metadata
SET 
  masterschool = 'Ignition',
  stats_linked = ARRAY['Mental Fitness', 'Focus'],
  status = 'published'
WHERE course_id = (
  SELECT course_id 
  FROM course_metadata 
  WHERE status = 'published' OR status IS NULL
  LIMIT 1
);
```

**Click Run.** You should see "Success" with "1 row affected".

### Step 4: Verify Lessons Exist

```sql
-- Check if this course has lessons
SELECT 
  cc.lesson_id,
  cc.lesson_title,
  cc.course_id,
  cc.chapter_number,
  cc.lesson_number,
  cm.course_title
FROM course_content cc
JOIN course_metadata cm ON cc.course_id = cm.course_id
WHERE cm.masterschool = 'Ignition'
ORDER BY cc.course_id, cc.chapter_number, cc.lesson_number
LIMIT 10;
```

**Click Run.** 

**Results:**
- ✅ **See lessons:** Great! Go to Step 5
- ❌ **No lessons:** The course has no content. Try assigning a different course in Step 3.

### Step 5: Refresh Roadmap

1. Go back to your app: `http://localhost:3000/roadmap/ignition` (or your port)
2. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. You should now see circular lesson bubbles! 🎉

---

## 🎯 Still Not Working? Try This

### Check: Do you have the roadmap_lessons view?

The roadmap needs a database view to work. Run this:

```sql
-- Try to query the view
SELECT * FROM roadmap_lessons WHERE masterschool = 'Ignition' LIMIT 5;
```

**If you get "relation does not exist":**
You need to apply the full migration. See "Full Setup" below.

---

## 📚 Full Setup (If Quick Fix Didn't Work)

### Option A: Apply Full Migration

1. Open: `supabase/migrations/20250101000001_create_roadmap_system.sql`
2. Copy **ALL 316 lines**
3. Paste into Supabase SQL Editor
4. Click **Run**
5. Wait for "Success"
6. Then run the Quick Fix (Step 3 above)

### Option B: Manual Setup

If the migration fails, run these one by one:

#### 1. Add difficulty field:
```sql
ALTER TABLE course_metadata 
ADD COLUMN IF NOT EXISTS difficulty_numeric INTEGER DEFAULT 5;
```

#### 2. Create the view:
```sql
CREATE OR REPLACE VIEW roadmap_lessons AS
SELECT 
  cm.course_id,
  cm.course_title,
  cm.masterschool,
  COALESCE(cm.difficulty_numeric, 5) as difficulty_numeric,
  cm.stats_linked,
  cc.lesson_id,
  cc.lesson_title,
  cc.chapter_number,
  cc.lesson_number,
  (COALESCE(cm.difficulty_numeric, 5) * 10) as lesson_xp_reward
FROM course_metadata cm
JOIN course_content cc ON cm.course_id = cc.course_id
WHERE cm.status = 'published'
  AND cm.masterschool IN ('Ignition', 'Insight', 'Transformation')
ORDER BY cm.masterschool, cm.difficulty_numeric, cm.course_id, cc.chapter_number, cc.lesson_number;
```

#### 3. Test the view:
```sql
SELECT * FROM roadmap_lessons WHERE masterschool = 'Ignition' LIMIT 5;
```

If you see results, you're good!

---

## 🔍 Debugging Checklist

Use this to find the problem:

### 1. Check Database Connection
```sql
SELECT NOW(); -- Should return current time
```
✅ Works → Database connected  
❌ Error → Check Supabase credentials in `.env.local`

### 2. Check if Tables Exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('course_metadata', 'course_content');
```
✅ See 2 rows → Tables exist  
❌ Missing → Your schema isn't set up

### 3. Check if Courses Exist
```sql
SELECT COUNT(*) FROM course_metadata;
```
✅ Count > 0 → You have courses  
❌ Count = 0 → Need to create courses

### 4. Check if Lessons Exist
```sql
SELECT COUNT(*) FROM course_content;
```
✅ Count > 0 → You have lessons  
❌ Count = 0 → Need to add lesson content

### 5. Check Masterschool Assignment
```sql
SELECT course_id, course_title, masterschool 
FROM course_metadata 
WHERE masterschool = 'Ignition';
```
✅ See rows → Courses assigned  
❌ Empty → Run Quick Fix Step 3

### 6. Check View Exists
```sql
SELECT COUNT(*) FROM roadmap_lessons WHERE masterschool = 'Ignition';
```
✅ Count > 0 → Roadmap should work!  
❌ Error or 0 → View missing or no data

---

## 🎨 What You Should See

When everything works:

### On Roadmap Page (`/roadmap/ignition`):
- **Header:** "Ignition Roadmap"
- **Progress bar:** "0 of X lessons completed"
- **Circular bubbles** in a winding S-curve
- **First bubble:** Golden border (unlocked)
- **Other bubbles:** Gray with lock icon (locked)
- **Hover:** Tooltip shows lesson details

### When You Click a Bubble:
- **If unlocked:** Navigate to lesson page
- **If locked:** Nothing happens (stays locked)

### On Lesson Page:
- Lesson content loads
- Bottom sticky bar shows progress tracker
- Timer starts counting
- Scroll percentage updates

---

## ❌ Common Errors & Fixes

### Error: "No lessons available"
**Cause:** No courses assigned to Ignition  
**Fix:** Run Quick Fix Step 3

### Error: "Failed to load lesson"
**Cause:** Lesson data incomplete or missing  
**Fix:** 
1. Check lesson exists: `SELECT * FROM course_content WHERE lesson_id = 'the-id';`
2. Check course structure exists
3. Try a different course

### Error: "relation roadmap_lessons does not exist"
**Cause:** Database view not created  
**Fix:** Run Full Migration or create view manually (see Full Setup)

### Error: Page is blank/white
**Cause:** JavaScript error  
**Fix:**
1. Open browser console (F12)
2. Look for red errors
3. Share the error message

### Error: Redirects to landing page
**Cause:** Navigation issue (already fixed!)  
**Fix:** Make sure you accepted the latest RoadmapNode.jsx changes

---

## 📞 Still Stuck?

Share this information:

1. **What you see:** Screenshot of the roadmap page
2. **Browser console errors:** Press F12, copy any red errors
3. **SQL query results:** Run this and share results:
```sql
SELECT 
  (SELECT COUNT(*) FROM course_metadata) as total_courses,
  (SELECT COUNT(*) FROM course_metadata WHERE masterschool = 'Ignition') as ignition_courses,
  (SELECT COUNT(*) FROM course_content) as total_lessons,
  (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'roadmap_lessons')) as view_exists;
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Roadmap page loads without errors
2. ✅ You see circular bubbles
3. ✅ First bubble has golden border
4. ✅ Clicking unlocked bubble opens lesson
5. ✅ Lesson page loads with content
6. ✅ Progress tracker appears at bottom

---

**Last Updated:** January 1, 2025  
**For:** Ignition Roadmap Implementation

