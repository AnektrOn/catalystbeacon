# Troubleshooting: Lessons Not Appearing

## Quick Checks

### 1. Check Browser Console
Open your browser's developer console (F12) and look for logs starting with `[CourseService]`. You should see:
- `parseCourseStructure:` with details about what was found
- Chapter and lesson counts

### 2. Run SQL Diagnostic
Run the queries in `debug_lessons_not_appearing.sql` in Supabase SQL Editor to check:
- If `course_structure` table has data
- If `chapter_count` is set correctly
- If lesson fields (`lesson_1_1`, `lesson_1_2`, etc.) are populated

## Common Issues

### Issue 1: `chapter_count` is 0 or NULL
**Symptom:** Chapters don't appear at all

**Fix:** 
- Check your N8N flow - make sure `chapter_count` is set to the actual number of chapters
- The code now auto-detects chapters even if `chapter_count` is 0, but it's better to set it correctly

**SQL Check:**
```sql
SELECT course_id, chapter_count, chapter_title_1, chapter_title_2
FROM course_structure
WHERE course_id = YOUR_COURSE_ID;
```

### Issue 2: Lesson fields are NULL or empty
**Symptom:** Chapters appear but no lessons show

**Fix:**
- Check your N8N mapping - make sure lessons are being mapped to `lesson_1_1`, `lesson_1_2`, etc.
- Verify the JSON structure matches what N8N expects

**SQL Check:**
```sql
SELECT 
  course_id,
  lesson_1_1,
  lesson_1_2,
  lesson_1_3,
  lesson_1_4
FROM course_structure
WHERE course_id = YOUR_COURSE_ID;
```

### Issue 3: Wrong field names in N8N
**Symptom:** Data exists but lessons don't parse

**Fix:**
- Ensure N8N is using exact field names:
  - `chapter_title_1`, `chapter_title_2`, etc. (not `chapterTitle_1`)
  - `lesson_1_1`, `lesson_1_2`, etc. (not `lesson_1_1_title`)

**Expected Format:**
```
course_structure table:
- chapter_count: 2
- chapter_title_1: "Introduction"
- lesson_1_1: "Welcome to the Course"
- lesson_1_2: "Getting Started"
- chapter_title_2: "Advanced Topics"
- lesson_2_1: "Deep Dive"
```

### Issue 4: Data not inserted by N8N
**Symptom:** `course_metadata` exists but `course_structure` is missing

**Fix:**
- Check N8N execution logs
- Verify the Supabase insert node is executing
- Check for foreign key constraint errors (course_id must exist in course_metadata)

**SQL Check:**
```sql
-- Find courses without structure
SELECT cm.course_id, cm.course_title
FROM course_metadata cm
LEFT JOIN course_structure cs ON cm.course_id = cs.course_id
WHERE cs.course_id IS NULL;
```

## Step-by-Step Debugging

### Step 1: Verify Data in Database
```sql
-- Replace 1 with an actual course_id
SELECT * FROM course_structure WHERE course_id = 1;
```

### Step 2: Check Console Logs
1. Open browser console (F12)
2. Navigate to a course detail page
3. Look for `[CourseService] parseCourseStructure:` logs
4. Check what values are being parsed

### Step 3: Verify N8N Flow
1. Check that `course_structure` insert is happening AFTER `course_metadata`
2. Verify the field mappings match the expected column names
3. Check that `course_id` matches between tables

### Step 4: Test Parsing Manually
In browser console on course detail page:
```javascript
// Check what the service is receiving
const courseService = require('./services/courseService').default;
// Or check the network tab for the API response
```

## What I Fixed

1. **Added auto-detection of chapters** - If `chapter_count` is 0, the code now checks for `chapter_title_1`, `chapter_title_2`, etc.
2. **Added console logging** - You'll see detailed logs about what's being parsed
3. **Include chapters with no lessons** - Chapters will show even if they have no lessons yet

## Next Steps

1. **Run the diagnostic SQL** (`debug_lessons_not_appearing.sql`)
2. **Check browser console** for parsing logs
3. **Verify N8N flow** is inserting data correctly
4. **Share the results** and I can help further!
