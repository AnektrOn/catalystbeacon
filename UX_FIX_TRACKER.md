# UX Fix Tracker (Desktop + Mobile)

This is the living implementation checklist for **UI/UX fixes** across the full app (desktop + mobile).  
Style target: **Apple-like ethereal glass** (calm, light, minimal chrome, consistent tap targets).

## Conventions
- **Status**: `[ ]` todo, `[~]` in progress, `[x]` done
- **Scope**: `M` = mobile, `D` = desktop
- **Refs**: point to the *exact* file(s) to edit

## Global System (All Pages)
- [~] **(M/D) Single overlay system / z-index scale** (dropdowns, sheets, modals never overlap incorrectly)  
  - **Refs**: `src/styles/glassmorphism.css`, `src/styles/mobile-responsive.css`, shared modal components
- [~] **(M/D) One scroll container strategy** (avoid nested scroll jitter + clipped content under header/bottom nav)  
  - **Refs**: `src/components/AppShellMobile.jsx`, `src/styles/mobile-responsive.css`, page containers
- [~] **(M/D) Tap targets**: enforce ≥44×44 for all interactive elements (chips, icon buttons, list rows)  
  - **Refs**: `src/styles/glassmorphism.css`, `src/styles/mobile-responsive.css`, page components
- [ ] **(M) Remove “hover JS” behaviors** (no `onMouseEnter/Leave` for mobile)  
  - **Refs**: `src/pages/CourseCatalogPage.jsx`, `src/pages/CourseDetailPage.jsx`, course cards

---

## App Shell

### Header + Actions (`AppShellMobile`)
- [x] **(M) Reduce header cognitive load**: center = page title (not XP + achievement widgets)  
  - **Refs**: `src/components/AppShellMobile.jsx`
- [~] **(M) “More actions” menu and Color Palette**: avoid nested fixed-position popups; use a single sheet/menu pattern  
  - **Refs**: `src/components/AppShellMobile.jsx`, `src/components/common/ColorPaletteDropdown.css`, `src/components/common/ColorPaletteDropdown.jsx`
- [ ] **(M) Bottom nav “double glass”**: currently layered twice (muddy/heavy). Reduce to one glass surface.  
  - **Refs**: `src/components/AppShellMobile.jsx`, `src/styles/mobile-responsive.css`

### Desktop Shell (`AppShell`)
- [ ] **(D) Remove debug network beacons** (hardcoded local ingest) from production UI  
  - **Refs**: `src/components/AppShell.jsx`
- [ ] **(D) Tooltip behavior only on hover devices** (avoid unnecessary listeners)  
  - **Refs**: `src/components/AppShell.jsx`

---

## Dashboard (`/dashboard`)

### XP Hero Card (`XPCircleWidgetV2`)
- [x] **(M) Center the circle + remove left-weighted layout**  
  - **Refs**: `src/components/dashboard/XPCircleWidgetV2.jsx`, `src/components/dashboard/XPCircleWidgetV2.css`
- [x] **(M) Tighten hierarchy**: larger circle on mobile + “Next at …” line  
  - **Refs**: `src/components/dashboard/XPCircleWidgetV2.jsx`, `src/components/dashboard/XPCircleWidgetV2.css`
- [ ] **(M) Reduce dead space further**: remove corner min/max numbers on mobile and replace with a single compact progress line  
  - **Refs**: `src/components/dashboard/XPCircleWidgetV2.jsx`, `src/components/dashboard/XPCircleWidgetV2.css`

### Stat Cards + Layout
- [~] **(M/D) Glass consistency for dashboard cards** (ModernCard should inherit glass tokens consistently)  
  - **Refs**: `src/components/dashboard/ModernCard.jsx`, `src/components/dashboard/ModernCard.css`, `src/components/dashboard/StatCardV2.css`
- [ ] **(M) Dashboard spacing under fixed header/bottom nav** (ensure no clipped content / proper safe area)  
  - **Refs**: `src/components/AppShellMobile.jsx`, `src/styles/mobile-responsive.css`, `src/pages/DashboardNeomorphic.css`

---

## Mastery (`/mastery/*`)
- [x] **(M/D) Responsive rendering correctness** (ensure the intended mobile components render on tablet/mobile widths)  
  - **Problem (observed)**: mobile shell was showing the desktop calendar due to breakpoint mismatch; produced unreadable “cards-in-grid” month view.  
  - **Fix**: render mobile Mastery components below `lg` and desktop at `lg+` (align with AppShell breakpoint).  
  - **Refs**: `src/pages/Mastery.jsx`
- [~] **(M) Tab bar style mismatch** (currently slate pill; should use ethereal glass tokens)  
  - **Problem (observed)**: tab bar reads like a separate “dark UI kit”, not the app’s glass language; active tab is visually heavy.  
  - **Best fix**: `glass-effect` container, lighter borders, calmer active state (subtle gradient + sheen), consistent 44px height.  
  - **Refs**: `src/pages/Mastery.jsx`
- [ ] **(M) Calendar control density** (too many stacked controls before content: tabs + month nav + month/week/day switcher)  
  - **Problem (observed)**: content starts too low; “controls occupy ~30–40% viewport” on small phones.  
  - **Best fix**: compact segmented control (icons only on xs), reduce vertical padding, make month nav + view switcher visually merge into one header block.  
  - **Refs**: `src/components/mastery/CalendarTabMobile.jsx`
- [ ] **(M) Calendar day cell information design**  
  - **Problem (observed)**: month grid must never render full task cards inside each day; only show dots/counts, with details on tap.  
  - **Best fix**: month cells show `dayNumber + up to 3 dots + overflow count`, day modal/day view shows the full list.  
  - **Refs**: `src/components/mastery/CalendarTabMobile.jsx`
- [ ] **(M) Calendar modal visual system**  
  - **Problem**: modal uses `bg-slate-800` and custom borders; can mismatch glass tokens and compete with bottom nav.  
  - **Best fix**: `glass-effect` sheet, consistent border/shadow tokens, scroll lock + safe-area padding.  
  - **Refs**: `src/components/mastery/CalendarTabMobile.jsx`, `src/styles/mobile-responsive.css`
- [ ] **(M) Calendar performance**: N+1 habit completion queries per month; replace with single-range query for all habits  
  - **Refs**: `src/components/mastery/CalendarTabMobile.jsx`, `src/services/masteryService.js`
- [ ] **(M) Habits/Tools cards**: move destructive actions into “…” or swipe actions; keep one primary CTA per card  
  - **Refs**: `src/components/mastery/HabitsTabMobile.jsx`, `src/components/mastery/ToolboxTabMobile.jsx`

---

## Courses

### Catalog (`/courses`)
- [x] **(M/D) Loading resilience**: fail-safe loading with per-request timeouts; courses render even if school unlock status fails  
  - **Problem**: page stuck in loading state if `getSchoolsWithUnlockStatus` or `getCoursesBySchool` timed out.  
  - **Fix**: added `withTimeout` wrapper, graceful error handling, early returns for empty data, courses load independently of school unlock status.  
  - **Refs**: `src/pages/CourseCatalogPage.jsx` (lines 37-239)
- [x] **(M) Remove hover JS handlers**; all `onMouseEnter`/`onMouseLeave` removed for mobile compatibility  
  - **Refs**: `src/pages/CourseCatalogPage.jsx` (removed from filter buttons, course cards, retry button)
- [x] **(M) Fix tap target sizes**: all filter chips now `min-h-[44px]` (was `min-h-[36px] sm:min-h-[40px]`)  
  - **Refs**: `src/pages/CourseCatalogPage.jsx` (lines 595, 616)
- [ ] **(M) Filters too dense**: collapse into a single "Filters" button opening a bottom sheet (Search + Filters + View only)  
  - **Refs**: `src/pages/CourseCatalogPage.jsx`
- [ ] **(M) Remove contradictory layout**: `flex-wrap` + `overflow-x-auto` chips  
  - **Refs**: `src/pages/CourseCatalogPage.jsx`

### Detail (`/courses/:courseId`)
- [ ] **(M) Replace hover interactions with touch pressed states**  
  - **Refs**: `src/pages/CourseDetailPage.jsx`
- [ ] **(M) Sticky bottom CTA**: Start/Continue pinned; content above scrolls  
  - **Refs**: `src/pages/CourseDetailPage.jsx`

### Player (`/courses/:courseId/chapters/:chapterNumber/lessons/:lessonNumber`)
- [ ] **(M/D) Tracking integrity**: ensure lesson progress writes use correct `course_id` FK consistently  
  - **Refs**: `src/services/courseService.js`, `src/services/roadmapService.js`, `src/pages/CoursePlayerPage.jsx`
- [ ] **(M) Single “Chapters” control**: one bottom sheet for navigation; remove competing menus/drawers  
  - **Refs**: `src/pages/CoursePlayerPage.jsx`

---

## Roadmap (`/roadmap/ignition`)
- [ ] **(M/D) Tap targets**: nodes and controls ≥44×44; avoid gesture conflicts with page scroll  
  - **Refs**: `src/pages/RoadmapIgnition.jsx`, roadmap components

---

## Profile (`/profile`)
- [ ] **(M/D) Remove noisy debug logs** from production UI flows  
  - **Refs**: `src/pages/ProfilePage.jsx`
- [ ] **(M) Make settings-like sections scanable** (iOS list rows, separators, less dense forms)  
  - **Refs**: `src/pages/ProfilePage.jsx`

---

## Settings (`/settings`)
- [ ] **(M) Structure**: group into iOS-like sections; reduce form density and improve affordances  
  - **Refs**: `src/pages/SettingsPage.jsx`

---

## Low Priority
- [ ] **Stellar Map** (explicitly lowest priority)  
  - **Refs**: `src/pages/StellarMap2DPage.jsx`, `src/components/stellar-map/*`


