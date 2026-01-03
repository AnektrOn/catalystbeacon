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

## Current School Names in Database

Your database contains the following `school_name` values:

1. **Institute of Applied Sovereignty** (1 course)
2. **Institute of Behavioral Design** (1 course)
3. **Institute of Cognitive Defense** (8 courses)
4. **Institute of Economic Architecture** (23 courses)
5. **Institute of Emotional Integration** (5 courses)
6. **Institute of Energetic Anatomy** (17 courses)
7. **Institute of Historical Deconstruction** (2 courses)
8. **Institute of Quantum Mechanics** (3 courses)
9. **Institute of Reality Engineering** (1 course)
10. **Institute of Systemic Analysis** (3 courses)

## Adding Background Images

1. **Add images to** `public/assets/schools/` directory
   - Recommended format: `.jpg`, `.png`, or `.webp`
   - Recommended size: 1200x800px to 2000x1200px
   - Optimize for web (under 500KB)
   - Suggested naming: `institute-of-[name]-bg.jpg` (lowercase, hyphens)

2. **Update the mapping** in `src/pages/CourseCatalogPage.jsx` (around line 225):
   - Uncomment the line for the school you want to add an image to
   - Update the file path to match your image filename
   ```javascript
   const schoolImageMap = {
     'Institute of Economic Architecture': '/assets/schools/institute-of-economic-architecture-bg.jpg',
     'Institute of Energetic Anatomy': '/assets/schools/institute-of-energetic-anatomy-bg.jpg',
     // Uncomment and add more as needed
   };
   ```

3. **Use exact school_name values** - The mapping is case-sensitive and must match exactly what's in your database (including spaces and capitalization).

## Notes

- Background images are applied to ALL course card views (mobile, desktop grid, list, grouped)
- A gradient overlay is automatically applied for text readability
- If no image is mapped, cards will use the default glass effect styling
- Images are loaded from the `public` directory, so paths start with `/assets/`

