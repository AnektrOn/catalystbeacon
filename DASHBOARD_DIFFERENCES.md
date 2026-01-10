# Dashboard vs DashboardNeomorphic

## Current Setup

- **DashboardNeomorphic** (`/dashboard`) - **ACTIVE** - This is what users see
- **Dashboard** (`/dashboard/classic`) - Legacy/alternative version

## Differences

### DashboardNeomorphic (Active)
- Uses `XPCircleWidgetV2` for XP display
- Uses `StatCardV2` and `StreakCard` for stats
- Grid-based layout (12-column grid)
- Has `MoodTracker`, `XPProgressChart`, `AllLessonsCard`, `HabitsCompletedCard`
- More comprehensive dashboard with multiple widgets
- Uses `DashboardNeomorphic.css` for styling

### Dashboard (Classic)
- Uses `EtherealStatsCards` (the 4 cards we just created)
- Uses `XPProgressWidget`, `DailyRitualWidget`, `CoherenceWidget`, `AchievementsWidget`
- Simpler layout
- Has `CurrentLessonWidget`, `ConstellationNavigatorWidget`, `TeacherFeedWidget`
- Uses different widget components

## Recommendation

Since you're using DashboardNeomorphic, we should:
1. **Keep DashboardNeomorphic as the main dashboard**
2. **Either delete Dashboard.jsx** or keep it as a backup
3. **Apply the EtherealStatsCards to DashboardNeomorphic** if you want that design
4. **Fix overflow issues in DashboardNeomorphic** (which I just did)

## Overflow Fix Applied

I've fixed the overflow in DashboardNeomorphic.css:
- Changed stats grid from 4 columns to 2 columns on mobile
- Added proper width constraints
- Added overflow-x: hidden at multiple levels
- Ensured all cards respect viewport width
