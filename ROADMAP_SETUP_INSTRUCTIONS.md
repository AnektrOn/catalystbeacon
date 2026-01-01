# Roadmap Setup Instructions - QUICK START

## ⚠️ Important: You're seeing nothing because the setup isn't complete yet!

Follow these steps in order:

---

## Step 1: Apply Database Migration

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the ENTIRE contents of `supabase/migrations/20250101000001_create_roadmap_system.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for "Success" message

### Option B: Via Supabase CLI

```bash
cd /Users/conesaleo/hcuniversity/hcuniversity
supabase db push
```

---

## Step 2: Verify Migration Worked

Run this query in Supabase SQL Editor:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roadmap_progress', 'roadmap_notifications');

-- Should return 2 rows
```

---

## Step 3: Assign Courses to Ignition Masterschool

You need to have courses with `masterschool = 'Ignition'`. Run this to check:

```sql
SELECT course_id, course_title, masterschool, difficulty_numeric
FROM course_metadata
WHERE masterschool = 'Ignition';
```

**If you see no results**, you need to assign some courses:

```sql
-- Example: Assign first 5 courses to Ignition
UPDATE course_metadata
SET 
  masterschool = 'Ignition',
  difficulty_numeric = CASE 
    WHEN difficulty_level ILIKE '%beginner%' OR difficulty_level ILIKE '%easy%' THEN 2
    WHEN difficulty_level ILIKE '%intermediate%' OR difficulty_level ILIKE '%medium%' THEN 5
    WHEN difficulty_level ILIKE '%advanced%' OR difficulty_level ILIKE '%hard%' THEN 8
    ELSE 5
  END
WHERE course_id IN (
  SELECT course_id 
  FROM course_metadata 
  WHERE status = 'published'
  LIMIT 5
);
```

---

## Step 4: Verify Lessons Are Available

```sql
-- Check if roadmap_lessons view returns data
SELECT 
  course_id,
  course_title,
  lesson_title,
  difficulty_numeric,
  masterschool
FROM roadmap_lessons
WHERE masterschool = 'Ignition'
LIMIT 5;
```

**If this returns 0 rows**, check:
1. Do you have courses with `masterschool = 'Ignition'`?
2. Do those courses have lessons in the `course_content` table?
3. Are the courses `status = 'published'`?

---

## Step 5: Test the Roadmap Page

1. Make sure your React app is running: `npm start`
2. Navigate to: `http://localhost:5173/roadmap/ignition` (or your local port)
3. You should now see lessons!

---

## Common Issues & Fixes

### Issue: "No lessons available in this category yet"

**Cause:** No courses assigned to Ignition masterschool

**Fix:**
```sql
-- Assign all published courses to Ignition temporarily for testing
UPDATE course_metadata
SET masterschool = 'Ignition',
    difficulty_numeric = 5
WHERE status = 'published'
AND masterschool IS NULL;
```

### Issue: "Loading your Ignition roadmap..." forever

**Cause:** JavaScript error or database connection issue

**Fix:**
1. Open browser console (F12)
2. Look for red errors
3. Common errors:
   - `supabase is not defined` → Check your `.env.local` file
   - `Cannot read property...` → Migration not applied
   - Network error → Supabase credentials wrong

### Issue: All lessons are locked

**Cause:** First lesson should always be unlocked, but might be a logic error

**Fix:**
1. Check browser console for errors
2. Verify the `isLessonUnlocked` function is working

### Issue: Page is completely blank

**Cause:** React component error

**Fix:**
1. Check browser console for errors
2. Make sure all imports are correct
3. Verify the route is added to App.js

---

## Quick Test Script

Run this in Supabase SQL Editor to set up test data:

```sql
-- 1. Create or update a test course
UPDATE course_metadata
SET 
  masterschool = 'Ignition',
  difficulty_numeric = 1,
  stats_linked = ARRAY['Mental Fitness', 'Focus'],
  status = 'published'
WHERE course_id = (
  SELECT course_id FROM course_metadata LIMIT 1
);

-- 2. Verify it worked
SELECT 
  course_id,
  course_title,
  masterschool,
  difficulty_numeric,
  stats_linked
FROM course_metadata
WHERE masterschool = 'Ignition';

-- 3. Check if lessons appear in the view
SELECT COUNT(*) as lesson_count
FROM roadmap_lessons
WHERE masterschool = 'Ignition';
```

---

## Debugging Checklist

- [ ] Database migration applied successfully
- [ ] `roadmap_progress` table exists
- [ ] `roadmap_notifications` table exists
- [ ] `roadmap_lessons` view exists
- [ ] At least one course has `masterschool = 'Ignition'`
- [ ] That course has lessons in `course_content`
- [ ] Course `status = 'published'`
- [ ] Browser console shows no errors
- [ ] React app is running
- [ ] Can access other pages (like /dashboard)
- [ ] Supabase connection working

---

## Still Not Working?

### Check Browser Console

Press F12 and look for errors. Common ones:

**Error:** `Failed to fetch roadmap lessons`
**Fix:** Database migration not applied or Supabase connection issue

**Error:** `supabaseClient is not defined`
**Fix:** Check `.env.local` file has correct Supabase credentials

**Error:** `Cannot read property 'lessons' of undefined`
**Fix:** No lessons found in database

### Check Network Tab

1. Press F12 → Network tab
2. Reload the page
3. Look for failed requests (red text)
4. Click on failed request to see details

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Look for recent errors

---

## Need More Help?

Share these details:
1. Browser console errors (screenshot or copy-paste)
2. Result of this SQL query:
   ```sql
   SELECT COUNT(*) FROM roadmap_lessons WHERE masterschool = 'Ignition';
   ```
3. Network tab errors (if any)
4. Whether you successfully ran the migration

---

## Once It's Working...

You should see:
- A header with "Ignition Roadmap"
- Progress bar showing "0 of X lessons completed"
- A vertical list of lesson cards
- First lesson unlocked (no lock icon)
- Other lessons locked
- Stat link tabs (if you have multiple stats)

Click the first lesson to test the tracking system!

