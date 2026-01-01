# Roadmap Implementation Guide

## Overview

This guide documents the complete implementation of the interactive learning roadmap system for HC University. The roadmap is modeled after Duolingo's learning path and has been implemented for the **Ignition** masterschool. This guide will help you replicate the system for **Insight** and **Transformation** masterschools.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Backend Services](#backend-services)
4. [Frontend Components](#frontend-components)
5. [Replication Steps for Insight & Transformation](#replication-steps)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Testing Checklist](#testing-checklist)

---

## System Architecture

### High-Level Flow

```
User visits /roadmap/ignition
    ↓
Fetch lessons from roadmap_lessons view (sorted by difficulty)
    ↓
Check user's roadmap_progress
    ↓
Display lessons with locked/unlocked states
    ↓
User clicks lesson → Navigate to CoursePlayerPage
    ↓
LessonTracker component tracks time (5 min) & scroll (100%)
    ↓
When requirements met → CompleteLessonModal appears
    ↓
Award XP & skill points → Update roadmap_progress
    ↓
Unlock next lesson
```

### Key Principles

1. **Sequential Unlocking**: Users must complete lessons in order
2. **Time & Scroll Tracking**: 5 minutes + 100% scroll required
3. **Dynamic Sorting**: Lessons sorted by difficulty → stat link → course/chapter/lesson
4. **Rewards System**: XP (10 × difficulty) + skill points awarded on completion
5. **Notifications**: Users notified when new lessons added at lower levels

---

## Database Schema

### 1. Migration File

Location: `supabase/migrations/20250101000001_create_roadmap_system.sql`

### 2. Tables Created

#### `roadmap_progress`
Tracks user progress through masterschool roadmaps.

```sql
CREATE TABLE roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  masterschool TEXT NOT NULL CHECK (masterschool IN ('Ignition', 'Insight', 'Transformation')),
  current_lesson_id TEXT,
  lessons_completed JSONB DEFAULT '[]'::jsonb,
  total_lessons_completed INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, masterschool)
);
```

**Key Fields:**
- `lessons_completed`: JSONB array storing completed lesson objects with timestamps
- `masterschool`: Enum for Ignition/Insight/Transformation
- `current_lesson_id`: Last accessed lesson

#### `roadmap_notifications`
Stores notifications about roadmap changes.

```sql
CREATE TABLE roadmap_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  masterschool TEXT NOT NULL,
  message TEXT NOT NULL,
  lessons_added JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT false,
  notification_type TEXT DEFAULT 'lessons_added',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `course_metadata` (Enhanced)
Added `difficulty_numeric` field for consistent sorting.

```sql
ALTER TABLE course_metadata 
ADD COLUMN difficulty_numeric INTEGER DEFAULT 5 CHECK (difficulty_numeric >= 1 AND difficulty_numeric <= 10);
```

#### `user_lesson_progress` (Enhanced)
Added tracking fields for time and scroll.

```sql
ALTER TABLE user_lesson_progress 
ADD COLUMN scroll_percentage INTEGER DEFAULT 0,
ADD COLUMN minimum_time_met BOOLEAN DEFAULT false,
ADD COLUMN can_complete BOOLEAN DEFAULT false,
ADD COLUMN xp_earned INTEGER DEFAULT 0,
ADD COLUMN skills_earned JSONB DEFAULT '{}'::jsonb;
```

### 3. Database Functions

#### `award_roadmap_lesson_xp`
Awards XP and skill points when a lesson is completed.

**Parameters:**
- `p_user_id`: User UUID
- `p_lesson_id`: Lesson ID
- `p_course_id`: Course ID
- `p_chapter_number`: Chapter number
- `p_lesson_number`: Lesson number

**Returns:** JSONB with rewards data

**Logic:**
1. Calculate XP: `difficulty_numeric × 10`
2. Update user's `total_xp_earned` and `current_xp`
3. Create XP transaction record
4. Award skill points for each linked stat
5. Update `user_lesson_progress` with completion data

#### `update_roadmap_progress`
Updates user's roadmap progress when a lesson is completed.

**Parameters:**
- `p_user_id`: User UUID
- `p_masterschool`: Masterschool name
- `p_lesson_id`: Lesson ID
- `p_lesson_title`: Lesson title
- `p_course_id`: Course ID
- `p_chapter_number`: Chapter number
- `p_lesson_number`: Lesson number

**Logic:**
1. Build lesson completion object with timestamp
2. Upsert into `roadmap_progress`
3. Append to `lessons_completed` array
4. Increment `total_lessons_completed`

### 4. Views

#### `roadmap_lessons`
Consolidated view of all lessons in roadmaps.

```sql
CREATE VIEW roadmap_lessons AS
SELECT 
  cm.course_id,
  cm.course_title,
  cm.masterschool,
  cm.difficulty_numeric,
  cm.stats_linked,
  cc.lesson_id,
  cc.lesson_title,
  cc.chapter_number,
  cc.lesson_number,
  (cm.difficulty_numeric * 10) as lesson_xp_reward
FROM course_metadata cm
JOIN course_content cc ON cm.course_id = cc.course_id
WHERE cm.status = 'published'
  AND cm.masterschool IN ('Ignition', 'Insight', 'Transformation')
ORDER BY cm.masterschool, cm.difficulty_numeric, cm.course_id, cc.chapter_number, cc.lesson_number;
```

---

## Backend Services

### RoadmapService (`src/services/roadmapService.js`)

Main service handling all roadmap operations.

#### Key Methods

##### `getRoadmapLessons(masterschool, statLink = null)`
Fetches and sorts all lessons for a masterschool.

**Sorting Algorithm:**
1. Filter by masterschool
2. Sort by `difficulty_numeric` ASC
3. Group by `stats_linked`
4. Sort within groups by course_id → chapter_number → lesson_number

**Usage:**
```javascript
const lessons = await roadmapService.getRoadmapLessons('Ignition');
```

##### `getUserRoadmapProgress(userId, masterschool)`
Gets user's current progress in a masterschool.

**Returns:**
```javascript
{
  user_id: "uuid",
  masterschool: "Ignition",
  current_lesson_id: "lesson-123",
  lessons_completed: [
    {
      lesson_id: "lesson-1",
      lesson_title: "Introduction",
      completed_at: "2025-01-01T12:00:00Z"
    }
  ],
  total_lessons_completed: 5
}
```

##### `isLessonUnlocked(userId, masterschool, lessonId)`
Checks if a lesson is unlocked for a user.

**Logic:**
1. Get all lessons in order
2. Find target lesson index
3. First lesson always unlocked
4. Check if previous lesson is completed

##### `updateLessonTracking(userId, courseId, chapterNumber, lessonNumber, timeSpent, scrollPercentage)`
Updates real-time tracking of lesson progress.

**Called every 10 seconds by the tracking hook.**

**Validation:**
- `minimum_time_met`: timeSpent >= 300 seconds
- `can_complete`: minimum_time_met && scrollPercentage >= 100

##### `completeLesson(...)`
Completes a lesson and awards rewards.

**Steps:**
1. Validate requirements are met
2. Call `award_roadmap_lesson_xp` function
3. Call `update_roadmap_progress` function
4. Return rewards data

##### `getRoadmapByStatLink(masterschool)`
Groups lessons by stat link for pagination.

**Returns:**
```javascript
{
  "Mental Fitness": {
    total: 15,
    pages: 2,
    lessons: [...]
  },
  "Emotional Intelligence": {
    total: 12,
    pages: 2,
    lessons: [...]
  }
}
```

---

## Frontend Components

### 1. RoadmapIgnition Page (`src/pages/RoadmapIgnition.jsx`)

Main roadmap page component.

**Features:**
- Displays lessons in vertical path
- Tabs for different stat links
- Progress summary bar
- Notification banner
- Handles lesson unlocking logic

**State Management:**
```javascript
const [lessons, setLessons] = useState([]);
const [groupedLessons, setGroupedLessons] = useState({});
const [progress, setProgress] = useState(null);
const [notifications, setNotifications] = useState([]);
const [unlockedLessons, setUnlockedLessons] = useState(new Set());
```

**Key Functions:**
- `loadRoadmap()`: Fetches all data on mount
- `getLessonState(lesson)`: Determines if lesson is locked/completed/next
- `handleStatLinkChange(statLink)`: Switches between stat link tabs

### 2. RoadmapNode Component (`src/components/Roadmap/RoadmapNode.jsx`)

Visual representation of a single lesson.

**Props:**
```javascript
{
  lesson: Object,
  isLocked: Boolean,
  isCompleted: Boolean,
  isInProgress: Boolean,
  isNext: Boolean,
  onClick: Function
}
```

**States:**
- `locked`: Gray, disabled, shows lock icon
- `unlocked`: Default state, clickable
- `in-progress`: Yellow border, current lesson
- `completed`: Green border, checkmark icon
- `next`: Blue border, pulsing animation

**Visual Elements:**
- Icon (lock/checkmark/arrow)
- Lesson title
- Course title
- Difficulty level
- XP reward
- Stat badges

### 3. RoadmapPath Component (`src/components/Roadmap/RoadmapPath.jsx`)

Vertical path connecting lesson nodes.

**Features:**
- SVG connectors between lessons
- Animated progress indicators
- Different colors for completed/locked paths
- Pulse animation on current lesson

### 4. LessonTracker Component (`src/components/Roadmap/LessonTracker.jsx`)

Sticky bottom bar tracking lesson progress.

**Props:**
```javascript
{
  courseId: Number,
  chapterNumber: Number,
  lessonNumber: Number,
  lessonId: String,
  lessonTitle: String,
  masterschool: String,
  enabled: Boolean
}
```

**Features:**
- Real-time progress bar
- Time requirement display (5:00 countdown)
- Scroll percentage display
- "Complete Lesson" button (enabled when requirements met)
- Integrates with `useRoadmapLessonTracking` hook

### 5. CompleteLessonModal Component (`src/components/Roadmap/CompleteLessonModal.jsx`)

Modal for completing lessons and showing rewards.

**States:**
1. **Pre-completion**: Confirm completion
2. **Post-completion**: Show rewards and unlock animation

**Rewards Display:**
- XP earned (with icon)
- Skills earned (list)
- Skill points earned
- "Next lesson unlocked" message

**Actions:**
- Continue to next lesson
- Back to roadmap

### 6. RoadmapNotificationBanner Component (`src/components/Roadmap/RoadmapNotificationBanner.jsx`)

Banner showing roadmap updates.

**Notification Types:**
- `lessons_added`: New lessons at lower levels
- `roadmap_update`: General roadmap changes
- `difficulty_changed`: Difficulty adjustments

**Actions:**
- Go to new lessons
- Continue (dismiss)
- Close (X button)

### 7. useRoadmapLessonTracking Hook (`src/hooks/useRoadmapLessonTracking.js`)

Custom hook for tracking lesson progress.

**Features:**
- Starts timer on mount
- Tracks scroll position
- Updates to Supabase every 10 seconds
- Calculates `canComplete` based on requirements

**Returns:**
```javascript
{
  timeSpent: Number,
  scrollPercentage: Number,
  canComplete: Boolean,
  isTracking: Boolean,
  error: String,
  minimumTimeMet: Boolean,
  scrollComplete: Boolean,
  timeRemaining: Number,
  progressPercentage: Number,
  forceUpdate: Function
}
```

**Usage:**
```javascript
const {
  timeSpent,
  scrollPercentage,
  canComplete
} = useRoadmapLessonTracking(
  userId,
  courseId,
  chapterNumber,
  lessonNumber,
  true
);
```

---

## Replication Steps for Insight & Transformation

### Step 1: Verify Database Schema

The database schema already supports all three masterschools. No changes needed.

### Step 2: Create Roadmap Pages

Create new page components:

**For Insight:**
```bash
cp src/pages/RoadmapIgnition.jsx src/pages/RoadmapInsight.jsx
```

**For Transformation:**
```bash
cp src/pages/RoadmapIgnition.jsx src/pages/RoadmapTransformation.jsx
```

**Update the masterschool constant in each file:**

```javascript
// RoadmapInsight.jsx
const masterschool = 'Insight';

// RoadmapTransformation.jsx
const masterschool = 'Transformation';
```

### Step 3: Add Routes

In `src/App.js`, add routes for the new roadmaps:

```javascript
// Import pages
const RoadmapInsight = React.lazy(() => import('./pages/RoadmapInsight'));
const RoadmapTransformation = React.lazy(() => import('./pages/RoadmapTransformation'));

// Add routes in protected section
<Route path="/roadmap/insight" element={
  <ErrorBoundary>
    <React.Suspense fallback={<LoadingScreen />}>
      <RoadmapInsight />
    </React.Suspense>
  </ErrorBoundary>
} />
<Route path="/roadmap/insight/:statLink" element={
  <ErrorBoundary>
    <React.Suspense fallback={<LoadingScreen />}>
      <RoadmapInsight />
    </React.Suspense>
  </ErrorBoundary>
} />

<Route path="/roadmap/transformation" element={
  <ErrorBoundary>
    <React.Suspense fallback={<LoadingScreen />}>
      <RoadmapTransformation />
    </React.Suspense>
  </ErrorBoundary>
} />
<Route path="/roadmap/transformation/:statLink" element={
  <ErrorBoundary>
    <React.Suspense fallback={<LoadingScreen />}>
      <RoadmapTransformation />
    </React.Suspense>
  </ErrorBoundary>
} />
```

### Step 4: Update Course Metadata

Ensure all courses have:
1. `masterschool` field set to 'Insight' or 'Transformation'
2. `difficulty_numeric` field set (1-10)
3. `stats_linked` array populated
4. `status` set to 'published'

**SQL to check:**
```sql
SELECT course_id, course_title, masterschool, difficulty_numeric, stats_linked
FROM course_metadata
WHERE masterschool IN ('Insight', 'Transformation')
ORDER BY masterschool, difficulty_numeric;
```

**SQL to update:**
```sql
-- Example: Set difficulty for a course
UPDATE course_metadata
SET difficulty_numeric = 3
WHERE course_id = 123;

-- Example: Set masterschool
UPDATE course_metadata
SET masterschool = 'Insight'
WHERE course_id = 456;
```

### Step 5: Create CSS Variants (Optional)

You can create custom color schemes for each masterschool:

```css
/* RoadmapInsight.css */
.roadmap-insight__title {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* RoadmapTransformation.css */
.roadmap-transformation__title {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Step 6: Add Navigation Links

Update your navigation menu to include roadmap links:

```javascript
<NavLink to="/roadmap/ignition">Ignition Roadmap</NavLink>
<NavLink to="/roadmap/insight">Insight Roadmap</NavLink>
<NavLink to="/roadmap/transformation">Transformation Roadmap</NavLink>
```

### Step 7: Test Each Roadmap

Follow the [Testing Checklist](#testing-checklist) for each masterschool.

---

## Common Issues & Solutions

### Issue 1: Lessons Not Appearing

**Symptoms:** Roadmap page is empty or shows "No lessons available"

**Possible Causes:**
1. No courses assigned to masterschool
2. Courses not published
3. No lesson content in `course_content` table

**Solution:**
```sql
-- Check courses
SELECT course_id, course_title, masterschool, status
FROM course_metadata
WHERE masterschool = 'Ignition';

-- Check lesson content
SELECT COUNT(*) as lesson_count
FROM course_content cc
JOIN course_metadata cm ON cc.course_id = cm.course_id
WHERE cm.masterschool = 'Ignition';
```

### Issue 2: All Lessons Locked

**Symptoms:** Even the first lesson shows as locked

**Possible Cause:** `isLessonUnlocked` logic error

**Solution:**
Check the first lesson should always return `true`:
```javascript
// In roadmapService.js
if (lessonIndex === 0) {
  return true; // First lesson always unlocked
}
```

### Issue 3: Tracking Not Working

**Symptoms:** Timer not counting, scroll not tracking

**Possible Causes:**
1. Hook not mounted
2. User not authenticated
3. Missing course/lesson IDs

**Solution:**
Check console for errors and verify props:
```javascript
console.log('Tracking enabled:', enabled);
console.log('User ID:', userId);
console.log('Course ID:', courseId);
```

### Issue 4: Can't Complete Lesson

**Symptoms:** Button stays disabled even after requirements met

**Possible Causes:**
1. Time requirement not met (< 5 minutes)
2. Scroll percentage < 100%
3. Database update failing

**Solution:**
Check the tracking data:
```javascript
console.log('Time spent:', timeSpent, 'seconds');
console.log('Scroll:', scrollPercentage, '%');
console.log('Can complete:', canComplete);
```

### Issue 5: XP Not Awarded

**Symptoms:** Lesson completes but no XP received

**Possible Cause:** Database function error

**Solution:**
Check Supabase logs and test function manually:
```sql
SELECT award_roadmap_lesson_xp(
  'user-uuid'::uuid,
  'lesson-123',
  1,
  1,
  1
);
```

### Issue 6: Next Lesson Not Unlocking

**Symptoms:** Completed lesson but next one still locked

**Possible Cause:** `roadmap_progress` not updated

**Solution:**
Check progress table:
```sql
SELECT lessons_completed
FROM roadmap_progress
WHERE user_id = 'user-uuid'
  AND masterschool = 'Ignition';
```

---

## Testing Checklist

### Database Testing

- [ ] Migration applied successfully
- [ ] All tables created with correct schema
- [ ] RLS policies working (users can only see their own data)
- [ ] Database functions execute without errors
- [ ] View returns data correctly

### Service Testing

- [ ] `getRoadmapLessons` returns sorted lessons
- [ ] `getUserRoadmapProgress` returns user data
- [ ] `isLessonUnlocked` correctly identifies unlocked lessons
- [ ] `updateLessonTracking` updates progress
- [ ] `completeLesson` awards XP and updates progress

### Component Testing

- [ ] RoadmapIgnition page loads without errors
- [ ] Lessons display in correct order
- [ ] Locked lessons show lock icon
- [ ] Completed lessons show checkmark
- [ ] Clicking lesson navigates to CoursePlayerPage
- [ ] Stat link tabs work correctly
- [ ] Progress bar shows correct percentage

### Tracking Testing

- [ ] Timer starts on lesson page load
- [ ] Timer counts up correctly
- [ ] Scroll percentage updates as user scrolls
- [ ] Progress updates to database every 10 seconds
- [ ] "Complete Lesson" button enables at 5 min + 100% scroll
- [ ] Modal appears when clicking complete button

### Completion Testing

- [ ] Modal shows correct rewards
- [ ] XP is added to user profile
- [ ] Skill points are awarded
- [ ] Lesson marked as completed
- [ ] Next lesson unlocks
- [ ] "Continue to Next Lesson" navigates correctly
- [ ] "Back to Roadmap" returns to roadmap page

### Notification Testing

- [ ] Notifications appear when new lessons added
- [ ] "Go to New Lessons" navigates correctly
- [ ] Dismiss button works
- [ ] Notifications marked as read

### Edge Cases

- [ ] First lesson always unlocked
- [ ] Last lesson completion handled gracefully
- [ ] No next lesson shows appropriate message
- [ ] Empty roadmap shows empty state
- [ ] Multiple users don't interfere with each other
- [ ] Refreshing page maintains progress
- [ ] Navigating away and back preserves state

### Mobile Testing

- [ ] Roadmap displays correctly on mobile
- [ ] Lesson nodes are tappable
- [ ] Tracker bar is visible and functional
- [ ] Modal is readable on small screens
- [ ] Tabs scroll horizontally if needed

---

## Performance Considerations

### Optimization Tips

1. **Lazy Load Lessons**: Load lessons in chunks of 10
2. **Cache Progress**: Use React Query or similar for caching
3. **Debounce Tracking**: Update database every 10 seconds, not every second
4. **Index Database**: Ensure proper indexes on frequently queried fields
5. **Minimize Re-renders**: Use `useMemo` and `useCallback` appropriately

### Monitoring

Track these metrics:
- Average time to complete lessons
- Completion rate by difficulty
- Drop-off points in roadmap
- Database query performance
- API response times

---

## Future Enhancements

### Planned Features

1. **Adaptive Difficulty**: Adjust lesson difficulty based on user performance
2. **Skill Trees**: Visual skill progression trees
3. **Achievements**: Badges for completing milestones
4. **Leaderboards**: Compare progress with other users
5. **Streaks**: Daily completion streaks with rewards
6. **Recommendations**: AI-powered lesson recommendations
7. **Social Features**: Share progress, compete with friends
8. **Offline Mode**: Download lessons for offline viewing

### Admin Features

1. **Roadmap Editor**: Visual editor for arranging lessons
2. **Analytics Dashboard**: Track user progress and engagement
3. **A/B Testing**: Test different roadmap configurations
4. **Bulk Operations**: Update multiple lessons at once
5. **Preview Mode**: Preview roadmap changes before publishing

---

## Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review completion rates and adjust difficulty
2. **Monthly**: Check for database performance issues
3. **Quarterly**: Update documentation with new features
4. **Yearly**: Review and optimize entire system

### Getting Help

- Check console logs for errors
- Review Supabase logs for database issues
- Test in isolation (single user, single lesson)
- Use browser DevTools to debug React components
- Check network tab for API failures

---

## Conclusion

The roadmap system provides a structured, gamified learning experience that guides users through masterschool content. By following this guide, you can successfully replicate the Ignition roadmap for Insight and Transformation masterschools.

**Key Takeaways:**
- Sequential unlocking ensures proper learning progression
- Time and scroll tracking validates engagement
- Rewards system motivates completion
- Notifications keep users informed of updates
- System is scalable and maintainable

For questions or issues, refer to the [Common Issues](#common-issues--solutions) section or consult the development team.

---

**Document Version:** 1.0  
**Last Updated:** January 1, 2025  
**Author:** HC University Development Team

