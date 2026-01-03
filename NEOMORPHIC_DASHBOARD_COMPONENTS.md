# Neomorphic Dashboard Components

## Overview
Beautiful neomorphic/neumorphic UI components inspired by smart home interfaces, adapted for the HC University learning platform with earth-tone color palette support.

## 🎨 Design System

### Neomorphic Style
- **Soft shadows**: Inset and outset for 3D effect
- **Subtle elevation**: Cards appear to float
- **Smooth transitions**: 300ms cubic-bezier easing
- **Interactive states**: Hover, active, and focus effects

### Color System Integration
- Uses **CSS variables** from your color palette
- **Automatic adaptation** to all 8 available palettes
- **Dark mode support** built-in
- **Accessible color contrast** maintained

## 📦 Components Created

### 1. **NeomorphicCard** (Base Component)
**File**: `src/components/dashboard/NeomorphicCard.jsx`

The foundation for all dashboard cards.

**Props:**
- `size`: 'small' | 'medium' | 'large' | 'xl'
- `elevated`: boolean - More prominent shadow
- `interactive`: boolean - Clickable with hover effects
- `onClick`: function - Click handler
- `className`: string - Additional classes
- `style`: object - Inline styles

**Usage:**
```jsx
import { NeomorphicCard } from './components/dashboard'

<NeomorphicCard size="medium" elevated interactive onClick={handleClick}>
  <h3>Your Content</h3>
</NeomorphicCard>
```

### 2. **XPCircleWidget** (Hero Element)
**File**: `src/components/dashboard/XPCircleWidget.jsx`

Large circular progress indicator - the centerpiece like the thermostat dial in inspiration.

**Props:**
- `currentXP`: number - Current XP amount
- `levelXP`: number - XP required for next level
- `level`: number - Current level
- `nextLevel`: number - Next level number

**Features:**
- Animated circular progress arc
- Glowing effects
- Orbiting decorative dots (8 positions)
- Smooth transitions
- Responsive sizing

**Usage:**
```jsx
import { XPCircleWidget } from './components/dashboard'

<XPCircleWidget 
  currentXP={750}
  levelXP={1000}
  level={5}
  nextLevel={6}
/>
```

### 3. **StreakCard** (Small Stat)
**File**: `src/components/dashboard/StreakCard.jsx`

Shows daily learning streak with animated fire icon.

**Props:**
- `streak`: number - Current streak days
- `record`: number - Best streak record

**Features:**
- Animated flame icon with flicker effect
- Pulsing glow effect
- Record badge
- Compact layout

**Usage:**
```jsx
import { StreakCard } from './components/dashboard'

<StreakCard streak={14} record={30} />
```

### 4. **ActiveCourseCard** (Course Display)
**File**: `src/components/dashboard/ActiveCourseCard.jsx`

Beautiful course card with hero image (like sunset photos in inspiration).

**Props:**
- `title`: string - Course title
- `image`: string - Course image URL
- `progress`: number - Completion percentage (0-100)
- `lessonsCompleted`: number - Lessons done
- `totalLessons`: number - Total lessons
- `timeRemaining`: string - Estimated time
- `onClick`: function - Click handler

**Features:**
- Hero image with overlay
- Play button on hover
- Progress bar with gradient
- Stats row (lessons, time)
- Continue button
- Image zoom on hover

**Usage:**
```jsx
import { ActiveCourseCard } from './components/dashboard'

<ActiveCourseCard
  title="Ignition: Awakening"
  image="https://images.unsplash.com/photo-1506905925346"
  progress={65}
  lessonsCompleted={13}
  totalLessons={20}
  timeRemaining="2h 30min"
  onClick={() => navigate('/course/ignition')}
/>
```

### 5. **QuickActionsGrid** (Icon Navigation)
**File**: `src/components/dashboard/QuickActionsGrid.jsx`

Grid of icon buttons for quick actions - like smart home device controls.

**Props:**
- `actions`: array - Action items (see default structure below)
- `onActionClick`: function - Handler receiving action ID

**Default Actions:**
```javascript
[
  { id: 'courses', icon: BookOpen, label: 'Courses', color: '#B4833D' },
  { id: 'achievements', icon: Trophy, label: 'Achievements', color: '#B4833D' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', color: '#81754B' },
  { id: 'goals', icon: Target, label: 'Goals', color: '#81754B' },
  { id: 'community', icon: Users, label: 'Community', color: '#66371B' },
  { id: 'favorites', icon: Star, label: 'Favorites', color: '#66371B' },
  { id: 'boost', icon: Zap, label: 'Boost', color: '#B4833D' },
  { id: 'settings', icon: Settings, label: 'Settings', color: '#81754B' },
]
```

**Features:**
- 4-column responsive grid
- Neomorphic icon buttons
- Custom colors per action
- Hover and active states
- Mobile-optimized

**Usage:**
```jsx
import { QuickActionsGrid } from './components/dashboard'

<QuickActionsGrid onActionClick={(id) => console.log(`Clicked: ${id}`)} />
```

### 6. **StatCard** (Generic Metric)
**File**: `src/components/dashboard/StatCard.jsx`

Reusable card for any statistic or metric.

**Props:**
- `icon`: Component - Lucide icon component
- `value`: string | number - Main value
- `label`: string - Metric name
- `subtitle`: string - Additional info
- `trend`: number - Percentage change (optional)
- `color`: string - Icon color

**Features:**
- Icon with colored background
- Large value display
- Optional trend indicator (up/down)
- Flexible content

**Usage:**
```jsx
import { StatCard } from './components/dashboard'
import { Clock } from 'lucide-react'

<StatCard
  icon={Clock}
  value="42h"
  label="Time This Week"
  subtitle="8h more than last week"
  trend={23}
  color="var(--color-dark-goldenrod)"
/>
```

## 🎯 Dashboard Layout Example

```jsx
import {
  XPCircleWidget,
  StreakCard,
  ActiveCourseCard,
  QuickActionsGrid,
  StatCard
} from './components/dashboard'
import { Clock, BookOpen, Award } from 'lucide-react'

const Dashboard = () => {
  return (
    <div className="dashboard-grid">
      {/* Hero Section */}
      <div className="grid-hero">
        <XPCircleWidget 
          currentXP={2450}
          levelXP={3000}
          level={12}
          nextLevel={13}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid-stats">
        <StreakCard streak={28} record={45} />
        <StatCard icon={Clock} value="12h" label="This Week" trend={15} />
        <StatCard icon={BookOpen} value="45" label="Lessons" trend={8} />
        <StatCard icon={Award} value="23" label="Achievements" />
      </div>

      {/* Active Course */}
      <div className="grid-course">
        <ActiveCourseCard
          title="Mental Fitness Mastery"
          image="/sunset.jpg"
          progress={67}
          lessonsCompleted={14}
          totalLessons={21}
          timeRemaining="3h 15min"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid-actions">
        <QuickActionsGrid onActionClick={handleAction} />
      </div>
    </div>
  )
}
```

## 📐 Responsive Grid System

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  padding: 24px;
}

.grid-hero {
  grid-column: span 4;
}

.grid-stats {
  grid-column: span 8;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.grid-course {
  grid-column: span 6;
}

.grid-actions {
  grid-column: span 6;
}

/* Tablet */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .grid-hero {
    grid-column: span 6;
  }
  
  .grid-stats {
    grid-column: span 6;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-course,
  .grid-actions {
    grid-column: span 6;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
  
  .grid-hero,
  .grid-stats,
  .grid-course,
  .grid-actions {
    grid-column: span 1;
  }
  
  .grid-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
```

## 🎨 Color Palette Adaptation

All components automatically adapt to the selected color palette:

**Variables Used:**
- `--color-primary` - Main accent (Dark Goldenrod by default)
- `--color-secondary` - Secondary accent (Coyote)
- `--color-old-lace` - Light background
- `--color-bone` - Secondary light background
- `--color-kobicha` - Dark text
- `--color-coyote` - Muted text
- `--color-earth-green` - Dark backgrounds
- `--gradient-primary` - Primary gradient

**Palettes Available:**
1. **Earth Tone** (default) - Warm browns and golds
2. **Ocean Blue** - Professional blues
3. **Forest Green** - Natural greens
4. **Sunset Orange** - Warm oranges
5. **Ocean Teal** - Calming teals
6. **Rose Pink** - Soft pinks
7. **Lavender** - Purple tones
8. **Amber** - Golden ambers

## ⚡ Performance

- **Pure CSS animations** - Hardware accelerated
- **No heavy computations** - Smooth 60fps
- **Lazy loading ready** - Use React.lazy if needed
- **Minimal re-renders** - Optimized prop handling

## ♿ Accessibility

- **Semantic HTML** - Proper element usage
- **ARIA labels** - On interactive elements
- **Keyboard navigation** - Full support
- **Focus indicators** - Visible focus rings
- **Screen reader friendly** - Descriptive labels

## 🚀 Next Components to Build

Based on the comprehensive list, prioritize:
1. **ProgressBarCard** - Slim horizontal progress
2. **WeeklyProgressWidget** - 7-day bar chart
3. **CalendarWidget** - Schedule view
4. **GoalProgressWidget** - Multiple stacked progress bars
5. **LeaderboardWidget** - Top users list
6. **AchievementCard** - Badge showcase
7. **TimerCard** - Pomodoro/focus timer

## 📝 Notes

- All components use **neomorphic shadows** for consistent 3D effect
- **Mobile-first approach** - Optimized for all screen sizes
- **Dark mode ready** - Automatic adaptation
- **Color palette aware** - Works with all 8 themes
- **Icon library**: Using Lucide React for consistency

## 🎉 Summary

You now have 6 core neomorphic dashboard components ready to use:

✅ **NeomorphicCard** - Base component
✅ **XPCircleWidget** - Hero element with circular progress
✅ **StreakCard** - Daily streak counter
✅ **ActiveCourseCard** - Course display with image
✅ **QuickActionsGrid** - Icon grid navigation
✅ **StatCard** - Generic metric display

All components are production-ready, fully responsive, and integrate seamlessly with your existing color palette system!

