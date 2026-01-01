pricing page# Color Replacement Patterns

## Standard Replacements

### Text Colors
```jsx
// OLD
className="text-gray-900 dark:text-white"
className="text-gray-600 dark:text-gray-400"
className="text-gray-500"

// NEW
style={{ color: 'var(--text-primary)' }}
style={{ color: 'var(--text-secondary)' }}
style={{ color: 'var(--text-secondary)' }}
```

### Background Colors
```jsx
// OLD
className="bg-white/50 dark:bg-black/20"
className="bg-gray-200 dark:bg-gray-700/50"

// NEW
style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 50%, transparent)' }}
style={{ backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 50%, transparent)' }}
```

### Border Colors
```jsx
// OLD
className="border-gray-200 dark:border-white/10"
className="border border-white/10"

// NEW
style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}
style={{ borderColor: 'color-mix(in srgb, var(--bg-primary) 10%, transparent)' }}
```

### Progress Bars
```jsx
// OLD
className="bg-gray-200 dark:bg-gray-700/50"

// NEW
style={{ backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 50%, transparent)' }}
```

### Semantic Colors
```jsx
// OLD
className="text-purple-500"
className="bg-amber-500"
className="from-amber-500 to-amber-600"

// NEW
style={{ color: 'var(--color-primary)' }}
style={{ backgroundColor: 'var(--color-warning)' }}
style={{ background: `linear-gradient(to right, var(--color-warning), color-mix(in srgb, var(--color-warning) 80%, black))` }}
```

## Files Requiring Fixes

### Dashboard Widgets (HIGH PRIORITY)
- [x] XPProgressWidget.jsx
- [ ] DailyRitualWidget.jsx
- [ ] CoherenceWidget.jsx
- [ ] CurrentLessonWidget.jsx
- [ ] ConstellationNavigatorWidget.jsx
- [ ] TeacherFeedWidget.jsx
- [ ] QuickActionsWidget.jsx
- [ ] AchievementsWidget.jsx

### Mastery Pages (HIGH PRIORITY)
- [ ] Mastery.jsx
- [ ] HabitsTab.jsx
- [ ] CalendarTab.jsx
- [ ] ToolboxTab.jsx
- [ ] All HabitsTab variants
- [ ] All ToolboxTab variants

### Course Pages (HIGH PRIORITY)
- [ ] CourseCatalogPage.jsx
- [ ] CourseDetailPage.jsx
- [ ] CoursePlayerPage.jsx

### Profile Page (HIGH PRIORITY)
- [ ] ProfilePage.jsx
- [ ] RadarChart.jsx
- [ ] ProgressBar.jsx

### Common Components (MEDIUM PRIORITY)
- [ ] UpgradeModal.jsx
- [ ] UserProfileDropdown.jsx
- [ ] CreatePostModal.jsx
- [ ] All UI components (button, card, etc.)

### Stellar Map (MEDIUM PRIORITY)
- [ ] StellarMap2D.jsx
- [ ] StellarMap.jsx
- [ ] NodeTooltip.jsx

### Other Pages (LOW PRIORITY)
- [ ] SettingsPage.jsx
- [ ] CommunityPage.jsx
- [ ] PricingPage.jsx
- [ ] Landing pages (can keep some branding)

