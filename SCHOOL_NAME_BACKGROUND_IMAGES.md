# School Name Background Images Guide

## Getting the List of School Names

The `school_name` values are automatically extracted from your `course_metadata` table and logged to the browser console when the courses page loads.

### Method 1: Browser Console (Easiest)
1. Open the Course Catalog page
2. Open browser DevTools (F12)
3. Check the console for logs like:
   ```
   📚 Unique school_name values found: ['Institute', 'Mental Fitness', ...]
   📚 Total unique school_name values: X
   ```

### Method 2: SQL Query
Run this in Supabase SQL Editor:
```sql
SELECT 
    school_name,
    COUNT(*) as course_count
FROM course_metadata
WHERE status = 'published'
GROUP BY school_name
ORDER BY school_name;
```

### Method 3: React DevTools
1. Open React DevTools
2. Find `CourseCatalogPage` component
3. Check the `schoolNames` state value

## Adding Background Images

1. **Add images to** `public/assets/schools/` directory
   - Recommended format: `.jpg`, `.png`, or `.webp`
   - Recommended size: 1200x800px to 2000x1200px
   - Optimize for web (under 500KB)

2. **Update the mapping** in `src/pages/CourseCatalogPage.jsx` (around line 210):
   ```javascript
   const schoolImageMap = {
     'Institute': '/assets/schools/institute-bg.jpg',
     'Mental Fitness': '/assets/schools/mental-fitness-bg.jpg',
     // Add more mappings here
   };
   ```

3. **Use exact school_name values** - The mapping is case-sensitive and must match exactly what's in your database.

## Notes

- Background images are applied to ALL course card views (mobile, desktop grid, list, grouped)
- A gradient overlay is automatically applied for text readability
- If no image is mapped, cards will use the default glass effect styling
- Images are loaded from the `public` directory, so paths start with `/assets/`

