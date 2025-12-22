# Issues Found and Fixes

## 🔴 Critical Issues Found

### 1. **Duplicate Rows in course_structure**
- **Problem**: Course ID `-1999533944` has **9 duplicate rows**!
- **Impact**: The app uses `.single()` which fails when duplicates exist
- **Fix Applied**: Updated `getCourseStructure()` to handle duplicates by getting the most recent row
- **Prevention**: See `N8N_FIX_DUPLICATES_GUIDE.md` - change N8N to use **Upsert** instead of Insert

### 2. **Missing Structure Data**
- **Problem**: Most courses have `chapter_count: null` and no structure data
- **Affected Courses**: 
  - `-2082364731` (Historical Dynamics...)
  - `-1211732545` (The Politics of Ecstasy...)
  - `-1048589509` (Hermetic Philosophy...)
  - And 8+ more courses
- **Cause**: N8N flow isn't inserting into `course_structure` for these courses
- **Action Needed**: Check your N8N flow - ensure it's inserting `course_structure` for ALL courses

### 3. **Incomplete Lesson Data**
- **Problem**: Even courses with data only show `lesson_1_1`
- **Example**: Course `-1999533944` has 4 chapters but we only see `lesson_1_1`
- **Action Needed**: Run `check_full_course_structure.sql` to see if other lessons exist

## ✅ Fixes Applied

1. **Updated `getCourseStructure()`** - Now handles duplicates gracefully
2. **Enhanced `parseCourseStructure()`** - Auto-detects chapters, better logging
3. **Fixed key prop** in CourseDetailPage

## 📋 Action Items

### Immediate (Do These First):

1. **Run `check_full_course_structure.sql`** to see complete data for courses that have structure
2. **Run `fix_duplicate_course_structure.sql`** to clean up duplicates (backup first!)
3. **Update N8N flow** - Change from Insert to Upsert (see `N8N_FIX_DUPLICATES_GUIDE.md`)

### Next Steps:

4. **Check N8N flow execution** - Why isn't it inserting structure for most courses?
   - Is the `course_structure` insert node executing?
   - Are there any errors in N8N execution logs?
   - Is the flow completing successfully?

5. **Verify lesson mapping** - Check if all lessons are being inserted:
   - `lesson_1_1`, `lesson_1_2`, `lesson_1_3`, `lesson_1_4` for chapter 1
   - `lesson_2_1`, `lesson_2_2`, etc. for chapter 2
   - And so on...

## 🔍 Diagnostic Queries

Run these in Supabase SQL Editor:

```sql
-- See all data for a specific course
SELECT * FROM course_structure WHERE course_id = -1999533944;

-- Count how many courses have structure vs don't
SELECT 
  COUNT(*) FILTER (WHERE cs.course_id IS NOT NULL) as with_structure,
  COUNT(*) FILTER (WHERE cs.course_id IS NULL) as without_structure
FROM course_metadata cm
LEFT JOIN course_structure cs ON cm.course_id = cs.course_id
WHERE cm.status = 'published';
```

## 🎯 Expected Result

After fixes:
- ✅ No duplicate rows
- ✅ All published courses have structure data
- ✅ All lessons for all chapters are populated
- ✅ Lessons appear in the app UI
