# Fix N8N Duplicate Inserts

## Problem
Your N8N flow is creating duplicate rows in `course_structure` table. Course ID `-1999533944` has 9 duplicate rows!

## Solution 1: Use UPSERT in N8N (Recommended)

Instead of using **Insert** in your Supabase node, use **Upsert**:

### N8N Supabase Node Settings:
1. **Operation**: Change from `Insert` to `Upsert`
2. **Upsert Conflict Target**: Select `course_id` (this is the unique field)
3. **Upsert Conflict Action**: Select `update` (update existing row) or `ignore` (skip if exists)

This way, if a row with the same `course_id` already exists, it will update it instead of creating a duplicate.

## Solution 2: Check Before Insert (Alternative)

Add a **Code Node** before the Supabase Insert node:

```javascript
// Check if course_structure already exists
const courseId = $input.first().json.course_id;

// Query Supabase to check if exists
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  $env.SUPABASE_URL,
  $env.SUPABASE_KEY
);

const { data, error } = await supabase
  .from('course_structure')
  .select('id')
  .eq('course_id', courseId)
  .maybeSingle();

if (data) {
  // Already exists, skip insert
  return [];
} else {
  // Doesn't exist, proceed with insert
  return $input.all();
}
```

## Solution 3: Clean Up Existing Duplicates

Run the SQL in `fix_duplicate_course_structure.sql` to:
1. Remove duplicate rows (keeping only the most recent)
2. Add a unique constraint to prevent future duplicates

**⚠️ WARNING**: Back up your database before running the delete query!

## Why This Happened

N8N workflows can run multiple times, or if there's an error and you retry, it might insert again. Using **Upsert** is the safest approach.

## After Fixing

1. Clean up existing duplicates using `fix_duplicate_course_structure.sql`
2. Update your N8N flow to use Upsert
3. Re-run your N8N flow - it should now update existing rows instead of creating duplicates
