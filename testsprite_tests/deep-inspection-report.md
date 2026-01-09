# Deep Inspection Report

**Generated:** 2026-01-09T01:25:05.972Z  
**Framework:** Expert-Level Codebase Analysis

---

## Executive Summary

- **Components Checked:** 152
- **Routes Defined:** 33
- **Services Checked:** 12
- **Database Tables:** 14
- **Total Issues:** 430

---

## 1. Component Inspection

### Checked Components
- components/Account.jsx
- components/AppShell.jsx
- components/AppShellMobile.jsx
- components/Auth.jsx
- components/AuthBypass.jsx
- components/ConnectionTest.jsx
- components/Debug.jsx
- components/DebugSignOut.jsx
- components/EnvDebug.jsx
- components/EnvTest.jsx
- components/ErrorBoundary.jsx
- components/NotificationBadge.jsx
- components/ProtectedRoute.jsx
- components/ProtectedSubscriptionRoute.jsx
- components/QuizComponent.jsx
- components/RequireRole.jsx
- components/Roadmap/CompleteLessonModal.jsx
- components/Roadmap/LessonTracker.jsx
- components/Roadmap/RoadmapNode.jsx
- components/Roadmap/RoadmapNotificationBanner.jsx
- components/Roadmap/RoadmapPath.jsx
- components/SEOHead.jsx
- components/SignupTest.jsx
- components/SimpleSupabaseTest.jsx
- components/SupabaseTest.jsx
- components/TestAuth.jsx
- components/UpgradeModal.jsx
- components/UserProfileDropdown.jsx
- components/auth/AuthLayout.jsx
- components/auth/LoginForm.jsx
- components/auth/SignupForm.jsx
- components/common/ColorPaletteDropdown.jsx
- components/common/ErrorDisplay.jsx
- components/common/LoadingSpinner.jsx
- components/common/SkeletonLoader.jsx
- components/dashboard/AchievementsWidget.jsx
- components/dashboard/ActiveCourseCard.jsx
- components/dashboard/AllLessonsCard.jsx
- components/dashboard/CoherenceWidget.jsx
- components/dashboard/ConstellationNavigatorWidget.jsx
- components/dashboard/CurrentLessonWidget.jsx
- components/dashboard/DailyRitualWidget.jsx
- components/dashboard/HabitsCompletedCard.jsx
- components/dashboard/ModernCard.jsx
- components/dashboard/MoodTracker.jsx
- components/dashboard/NeomorphicCard.jsx
- components/dashboard/QuickActionsGrid.jsx
- components/dashboard/QuickActionsWidget.jsx
- components/dashboard/SchoolProgressAreaChart.jsx
- components/dashboard/SchoolProgressAreaChartDesktop.jsx
- components/dashboard/SchoolProgressAreaChartMobile.jsx
- components/dashboard/StatCard.jsx
- components/dashboard/StatCardV2.jsx
- components/dashboard/StatCardV2.test.jsx
- components/dashboard/StreakCard.jsx
- components/dashboard/TeacherFeedWidget.jsx
- components/dashboard/XPCircleWidget.jsx
- components/dashboard/XPCircleWidgetV2.jsx
- components/dashboard/XPProgressChart.jsx
- components/dashboard/XPProgressWidget.jsx
- components/landing/Interactive3DSection.jsx
- components/landing/ScrollAware3D.jsx
- components/landing/SpaceSlideshow3D.jsx
- components/mastery/CalendarTab.jsx
- components/mastery/CalendarTabMobile.jsx
- components/mastery/HabitsTab.jsx
- components/mastery/HabitsTabCompact.jsx
- components/mastery/HabitsTabFixed.jsx
- components/mastery/HabitsTabMobile.jsx
- components/mastery/HabitsTabRobust.jsx
- components/mastery/HabitsTabSimple.jsx
- components/mastery/ToolboxTab.jsx
- components/mastery/ToolboxTabCompact.jsx
- components/mastery/ToolboxTabFixed.jsx
- components/mastery/ToolboxTabMobile.jsx
- components/mastery/ToolboxTabRobust.jsx
- components/profile/ProgressBar.jsx
- components/profile/RadarChart.jsx
- components/social/CreatePostModal.jsx
- components/stellar-map/FogOverlay2D.jsx
- components/stellar-map/NodeTooltip.jsx
- components/stellar-map/StellarMap.jsx
- components/stellar-map/StellarMapAnalytics.jsx
- components/stellar-map/StellarMapBreadcrumb.jsx
- components/stellar-map/StellarMapControls.jsx
- components/stellar-map/StellarMapDebugOverlay.jsx
- components/stellar-map/StellarMapErrorBoundary.jsx
- components/stellar-map/StellarMapLegend.jsx
- components/stellar-map/StellarMapMiniMap.jsx
- components/stellar-map/StellarMapSearch.jsx
- components/stellar-map/StellarMapSettings.jsx
- components/stellar-map/YouTubePlayerModal.jsx
- components/stellar-map/core/InteractionManager.js
- components/stellar-map/core/NodeRenderer.js
- components/stellar-map/core/ThreeSceneManager.js
- components/stellar-map/hooks/useXPVisibility.js
- components/stellar-map/r3f/CameraTracker.jsx
- components/stellar-map/r3f/CanvasNode.jsx
- components/stellar-map/r3f/CanvasStarNode.jsx
- components/stellar-map/r3f/CanvasStellarMap.jsx
- components/stellar-map/r3f/ConnectionLines.jsx
- components/stellar-map/r3f/CoreSun.jsx
- components/stellar-map/r3f/FogOverlay.jsx
- components/stellar-map/r3f/FogSphere.jsx
- components/stellar-map/r3f/NodeSphere.jsx
- components/stellar-map/r3f/StarNode.jsx
- components/stellar-map/r3f/StarfieldBackground.jsx
- components/stellar-map/r3f/StellarMapScene.jsx
- components/stellar-map/utils/debugHelpers.js
- components/test/MasteryTestComponent.jsx
- components/ui/3d-image-gallery.jsx
- components/ui/CosmicLoader.jsx
- components/ui/alert.jsx
- components/ui/avatar.jsx
- components/ui/badge.jsx
- components/ui/button.jsx
- components/ui/card.jsx
- components/ui/checkbox.jsx
- components/ui/dialog.jsx
- components/ui/dropdown-menu.jsx
- components/ui/input.jsx
- components/ui/label.jsx
- components/ui/progress.jsx
- components/ui/separator.jsx
- components/ui/sheet.jsx
- components/ui/sonner.jsx
- components/ui/tabs.jsx
- pages/Achievements.jsx
- pages/AwakeningLandingPage.jsx
- pages/CommunityPage.jsx
- pages/CourseCatalogPage.jsx
- pages/CourseCreationPage.jsx
- pages/CourseDetailPage.jsx
- pages/CoursePlayerPage.jsx
- pages/Dashboard.jsx
- pages/DashboardNeomorphic.jsx
- pages/EnhancedLandingPage.jsx
- pages/ForgotPasswordPage.jsx
- pages/LandingPage.jsx
- pages/LoginPage.jsx
- pages/Mastery.jsx
- pages/PricingPage.jsx
- pages/PrivacyPage.jsx
- pages/ProfessionalLandingPage.jsx
- pages/ProfilePage.jsx
- pages/RoadmapIgnition.jsx
- pages/SettingsPage.jsx
- pages/SignupPage.jsx
- pages/StellarCardGalleryDemo.jsx
- pages/StellarMapPage.jsx
- pages/TermsPage.jsx
- pages/TimerPage.jsx

### Issues
No issues found.

---

## 2. Route Inspection

### Defined Routes
- /login
- /signup
- /pricing
- /forgot-password
- /terms
- /privacy
- /landing
- /landing-3d
- /test
- /mastery-test
- /dashboard
- /dashboard/classic
- /profile
- /mastery
- /mastery/calendar
- /mastery/habits
- /mastery/toolbox
- /mastery/achievements
- /mastery/timer
- /calendar
- /community
- /timer
- /settings
- /roadmap/ignition
- /roadmap/ignition/:statLink
- /courses
- /courses/create
- /courses/:courseId
- /courses/:courseId/chapters/:chapterNumber/lessons/:lessonNumber
- /stellar-map
- /achievements
- /
- *

### Issues

**Missing Routes (3):**
- 14
- 0
- /cookies

---

## 3. Service Inspection

### Checked Services
- services/courseService.js
- services/emailService.js
- services/habitsService.js
- services/lessonProgressService.js
- services/lessonsService.js
- services/levelsService.js
- services/masteryService.js
- services/roadmapService.js
- services/schoolService.js
- services/skillsService.js
- services/socialService.js
- services/stellarMapService.js

### Issues
No issues found.

---

## 4. Database Inspection

### Tables Found
- roadmap_progress
- roadmap_notifications
- course_structure
- course_description
- user_stellar_node_completions
- payments
- affiliate_commissions
- email_queue
- notifications
- badges
- user_badges
- constellation_families
- constellations
- stellar_map_nodes

### Unused Tables
- payments
- affiliate_commissions
- email_queue

---

## 5. Error Handling

### Error Boundaries
- components/ErrorBoundary.jsx
- components/stellar-map/StellarMapErrorBoundary.jsx
- pages/StellarMapPage.jsx
- App.js

### Missing Error Handling
- components/ui/CosmicLoader.jsx: Async function without try/catch

---

## 6. Accessibility

### Issues Found
- components/Account.jsx:69 - Form input without label association
- components/Account.jsx:78 - Form input without label association
- components/Account.jsx:87 - Button without accessible name
- components/Account.jsx:97 - Button without accessible name
- components/AppShell.jsx:55 - Button without accessible name
- components/AppShell.jsx:415 - Image without alt text
- components/AppShell.jsx:438 - Button without accessible name
- components/AppShell.jsx:447 - Image without alt text
- components/AppShell.jsx:481 - Button without accessible name
- components/AppShell.jsx:514 - Button without accessible name
- components/AppShell.jsx:521 - Button without accessible name
- components/AppShellMobile.jsx:432 - Button without accessible name
- components/AppShellMobile.jsx:472 - Button without accessible name
- components/AppShellMobile.jsx:511 - Button without accessible name
- components/AppShellMobile.jsx:532 - Button without accessible name
- components/AppShellMobile.jsx:554 - Button without accessible name
- components/AppShellMobile.jsx:563 - Button without accessible name
- components/AppShellMobile.jsx:591 - Button without accessible name
- components/AppShellMobile.jsx:609 - Button without accessible name
- components/AppShellMobile.jsx:626 - Button without accessible name

---

## 7. Performance

### Issues
- components/AppShell.jsx: Large file (568 lines) - consider splitting
- components/AppShellMobile.jsx: Large file (817 lines) - consider splitting
- components/dashboard/MoodTracker.jsx: Large file (518 lines) - consider splitting
- components/landing/SpaceSlideshow3D.jsx: Large file (512 lines) - consider splitting
- components/mastery/CalendarTab.jsx: Large file (1181 lines) - consider splitting
- components/mastery/CalendarTabMobile.jsx: Large file (599 lines) - consider splitting
- components/mastery/HabitsTab.jsx: Large file (660 lines) - consider splitting
- components/mastery/HabitsTabCompact.jsx: Large file (787 lines) - consider splitting
- components/mastery/HabitsTabFixed.jsx: Large file (595 lines) - consider splitting
- components/mastery/HabitsTabRobust.jsx: Large file (542 lines) - consider splitting
- components/mastery/HabitsTabSimple.jsx: Large file (516 lines) - consider splitting
- components/mastery/ToolboxTab.jsx: Large file (768 lines) - consider splitting
- components/mastery/ToolboxTabCompact.jsx: Large file (675 lines) - consider splitting
- components/mastery/ToolboxTabFixed.jsx: Large file (557 lines) - consider splitting
- components/mastery/ToolboxTabRobust.jsx: Large file (551 lines) - consider splitting
- config/colorPalettes.js: Large file (526 lines) - consider splitting
- contexts/AuthContext.jsx: Large file (552 lines) - consider splitting
- pages/AwakeningLandingPage.jsx: Large file (1410 lines) - consider splitting
- pages/CommunityPage.jsx: Large file (557 lines) - consider splitting
- pages/CourseCatalogPage.jsx: Large file (1445 lines) - consider splitting
- pages/CoursePlayerPage.jsx: Large file (845 lines) - consider splitting
- pages/Dashboard.jsx: Large file (854 lines) - consider splitting
- pages/ProfessionalLandingPage.jsx: Large file (552 lines) - consider splitting
- pages/ProfilePage.jsx: Large file (918 lines) - consider splitting
- pages/SettingsPage.jsx: Large file (919 lines) - consider splitting
- services/courseService.js: Large file (1005 lines) - consider splitting
- services/masteryService.js: Large file (908 lines) - consider splitting
- services/roadmapService.js: Large file (631 lines) - consider splitting
- services/stellarMapService.js: Large file (792 lines) - consider splitting

### Optimization Opportunities
- components/AppShell.jsx: Consider using React.memo for large component
- components/ConnectionTest.jsx: Consider using React.memo for large component
- components/DebugSignOut.jsx: Consider using React.memo for large component
- components/EnvTest.jsx: Consider using React.memo for large component
- components/ErrorBoundary.jsx: Consider using React.memo for large component
- components/ProtectedSubscriptionRoute.jsx: Consider using React.memo for large component
- components/QuizComponent.jsx: Consider using React.memo for large component
- components/RequireRole.jsx: Consider using React.memo for large component
- components/Roadmap/CompleteLessonModal.jsx: Consider using React.memo for large component
- components/Roadmap/LessonTracker.jsx: Consider using React.memo for large component
- components/Roadmap/RoadmapNode.jsx: Consider using React.memo for large component
- components/Roadmap/RoadmapNotificationBanner.jsx: Consider using React.memo for large component
- components/Roadmap/RoadmapPath.jsx: Consider using React.memo for large component
- components/SEOHead.jsx: Consider using React.memo for large component
- components/SignupTest.jsx: Consider using React.memo for large component
- components/SimpleSupabaseTest.jsx: Consider using React.memo for large component
- components/SupabaseTest.jsx: Consider using React.memo for large component
- components/UpgradeModal.jsx: Consider using React.memo for large component
- components/UserProfileDropdown.jsx: Consider using React.memo for large component
- components/auth/LoginForm.jsx: Consider using React.memo for large component
- components/auth/SignupForm.jsx: Consider using React.memo for large component
- components/common/ColorPaletteDropdown.jsx: Consider using React.memo for large component
- components/common/SkeletonLoader.jsx: Consider using React.memo for large component
- components/dashboard/AchievementsWidget.jsx: Consider using React.memo for large component
- components/dashboard/ActiveCourseCard.jsx: Consider using React.memo for large component
- components/dashboard/AllLessonsCard.jsx: Consider using React.memo for large component
- components/dashboard/CurrentLessonWidget.jsx: Consider using React.memo for large component
- components/dashboard/DailyRitualWidget.jsx: Consider using React.memo for large component
- components/dashboard/HabitsCompletedCard.jsx: Consider using React.memo for large component
- components/dashboard/QuickActionsGrid.jsx: Consider using React.memo for large component
- components/dashboard/QuickActionsWidget.jsx: Consider using React.memo for large component
- components/dashboard/SchoolProgressAreaChart.jsx: Consider using React.memo for large component
- components/dashboard/SchoolProgressAreaChartDesktop.jsx: Consider using React.memo for large component
- components/dashboard/SchoolProgressAreaChartMobile.jsx: Consider using React.memo for large component
- components/dashboard/StatCardV2.test.jsx: Consider using React.memo for large component
- components/dashboard/XPCircleWidget.jsx: Consider using React.memo for large component
- components/dashboard/XPCircleWidgetV2.jsx: Consider using React.memo for large component
- components/dashboard/XPProgressChart.jsx: Consider using React.memo for large component
- components/landing/ScrollAware3D.jsx: Consider using React.memo for large component
- components/landing/SpaceSlideshow3D.jsx: Consider using React.memo for large component
- components/mastery/CalendarTab.jsx: Consider using React.memo for large component
- components/mastery/HabitsTab.jsx: Consider using React.memo for large component
- components/mastery/HabitsTabCompact.jsx: Consider using React.memo for large component
- components/mastery/HabitsTabFixed.jsx: Consider using React.memo for large component
- components/mastery/HabitsTabMobile.jsx: Consider using React.memo for large component
- components/mastery/HabitsTabRobust.jsx: Consider using React.memo for large component
- components/mastery/HabitsTabSimple.jsx: Consider using React.memo for large component
- components/mastery/ToolboxTab.jsx: Consider using React.memo for large component
- components/mastery/ToolboxTabCompact.jsx: Consider using React.memo for large component
- components/mastery/ToolboxTabFixed.jsx: Consider using React.memo for large component
- components/mastery/ToolboxTabMobile.jsx: Consider using React.memo for large component
- components/mastery/ToolboxTabRobust.jsx: Consider using React.memo for large component
- components/profile/RadarChart.jsx: Consider using React.memo for large component
- components/social/CreatePostModal.jsx: Consider using React.memo for large component
- components/stellar-map/NodeTooltip.jsx: Consider using React.memo for large component
- components/stellar-map/StellarMapBreadcrumb.jsx: Consider using React.memo for large component
- components/stellar-map/StellarMapControls.jsx: Consider using React.memo for large component
- components/stellar-map/StellarMapDebugOverlay.jsx: Consider using React.memo for large component
- components/stellar-map/StellarMapErrorBoundary.jsx: Consider using React.memo for large component
- components/stellar-map/StellarMapLegend.jsx: Consider using React.memo for large component
- components/stellar-map/StellarMapSettings.jsx: Consider using React.memo for large component
- components/stellar-map/YouTubePlayerModal.jsx: Consider using React.memo for large component
- components/stellar-map/utils/debugHelpers.js: Consider using React.memo for large component
- components/test/MasteryTestComponent.jsx: Consider using React.memo for large component
- pages/AwakeningLandingPage.jsx: Consider using React.memo for large component
- pages/CommunityPage.jsx: Consider using React.memo for large component
- pages/CourseCreationPage.jsx: Consider using React.memo for large component
- pages/CourseDetailPage.jsx: Consider using React.memo for large component
- pages/CoursePlayerPage.jsx: Consider using React.memo for large component
- pages/EnhancedLandingPage.jsx: Consider using React.memo for large component
- pages/ForgotPasswordPage.jsx: Consider using React.memo for large component
- pages/LandingPage.jsx: Consider using React.memo for large component
- pages/LoginPage.jsx: Consider using React.memo for large component
- pages/Mastery.jsx: Consider using React.memo for large component
- pages/PricingPage.jsx: Consider using React.memo for large component
- pages/PrivacyPage.jsx: Consider using React.memo for large component
- pages/ProfessionalLandingPage.jsx: Consider using React.memo for large component
- pages/ProfilePage.jsx: Consider using React.memo for large component
- pages/SettingsPage.jsx: Consider using React.memo for large component
- pages/SignupPage.jsx: Consider using React.memo for large component
- pages/TermsPage.jsx: Consider using React.memo for large component
- pages/TimerPage.jsx: Consider using React.memo for large component
- components/AppShell.jsx: Consider using useMemo for expensive computations
- components/Roadmap/LessonTracker.jsx: Consider using React.memo for component optimization
- components/common/ColorPaletteDropdown.jsx: Consider using useMemo for expensive computations
- components/dashboard/AllLessonsCard.jsx: Consider using useMemo for expensive computations
- components/dashboard/HabitsCompletedCard.jsx: Consider using useMemo for expensive computations
- components/dashboard/SchoolProgressAreaChart.jsx: Consider using useMemo for expensive computations
- components/dashboard/SchoolProgressAreaChartDesktop.jsx: Consider using useMemo for expensive computations
- components/dashboard/SchoolProgressAreaChartMobile.jsx: Consider using useMemo for expensive computations
- components/dashboard/XPProgressChart.jsx: Consider using useMemo for expensive computations
- components/landing/SpaceSlideshow3D.jsx: Consider using useMemo for expensive computations
- components/mastery/CalendarTab.jsx: Consider using useMemo for expensive computations
- components/mastery/HabitsTab.jsx: Consider using useMemo for expensive computations
- components/mastery/HabitsTabCompact.jsx: Consider using useMemo for expensive computations
- components/mastery/HabitsTabFixed.jsx: Consider using useMemo for expensive computations
- components/mastery/HabitsTabMobile.jsx: Consider using useMemo for expensive computations
- components/mastery/HabitsTabRobust.jsx: Consider using useMemo for expensive computations
- components/mastery/HabitsTabSimple.jsx: Consider using useMemo for expensive computations
- components/mastery/ToolboxTab.jsx: Consider using useMemo for expensive computations
- components/mastery/ToolboxTabCompact.jsx: Consider using useMemo for expensive computations
- components/mastery/ToolboxTabFixed.jsx: Consider using useMemo for expensive computations
- components/mastery/ToolboxTabMobile.jsx: Consider using useMemo for expensive computations
- components/mastery/ToolboxTabRobust.jsx: Consider using useMemo for expensive computations
- components/stellar-map/StellarMapControls.jsx: Consider using useMemo for expensive computations
- pages/Achievements.jsx: Consider lazy loading this page component
- pages/AwakeningLandingPage.jsx: Consider lazy loading this page component
- pages/AwakeningLandingPage.jsx: Consider using useMemo for expensive computations
- pages/CommunityPage.jsx: Consider lazy loading this page component
- pages/CommunityPage.jsx: Consider using useMemo for expensive computations
- pages/CourseCatalogPage.jsx: Consider lazy loading this page component
- pages/CourseCreationPage.jsx: Consider lazy loading this page component
- pages/CourseCreationPage.jsx: Consider using useMemo for expensive computations
- pages/CourseDetailPage.jsx: Consider lazy loading this page component
- pages/CourseDetailPage.jsx: Consider using useMemo for expensive computations
- pages/CoursePlayerPage.jsx: Consider lazy loading this page component
- pages/CoursePlayerPage.jsx: Consider using useMemo for expensive computations
- pages/Dashboard.jsx: Consider lazy loading this page component
- pages/DashboardNeomorphic.jsx: Consider lazy loading this page component
- pages/EnhancedLandingPage.jsx: Consider lazy loading this page component
- pages/EnhancedLandingPage.jsx: Consider using useMemo for expensive computations
- pages/ForgotPasswordPage.jsx: Consider lazy loading this page component
- pages/LandingPage.jsx: Consider lazy loading this page component
- pages/LoginPage.jsx: Consider lazy loading this page component
- pages/Mastery.jsx: Consider lazy loading this page component
- pages/Mastery.jsx: Consider using useMemo for expensive computations
- pages/PricingPage.jsx: Consider lazy loading this page component
- pages/PricingPage.jsx: Consider using useMemo for expensive computations
- pages/PrivacyPage.jsx: Consider lazy loading this page component
- pages/ProfessionalLandingPage.jsx: Consider lazy loading this page component
- pages/ProfessionalLandingPage.jsx: Consider using useMemo for expensive computations
- pages/ProfilePage.jsx: Consider lazy loading this page component
- pages/ProfilePage.jsx: Consider using useMemo for expensive computations
- pages/RoadmapIgnition.jsx: Consider lazy loading this page component
- pages/SettingsPage.jsx: Consider lazy loading this page component
- pages/SignupPage.jsx: Consider lazy loading this page component
- pages/StellarCardGalleryDemo.jsx: Consider lazy loading this page component
- pages/StellarMapPage.jsx: Consider lazy loading this page component
- pages/TermsPage.jsx: Consider lazy loading this page component
- pages/TimerPage.jsx: Consider lazy loading this page component
- pages/TimerPage.jsx: Consider using useMemo for expensive computations

---

## 8. Security

### Issues Found
- **MEDIUM:** services/habitsService.js: Database query may not respect RLS policies
- **MEDIUM:** services/lessonsService.js: Database query may not respect RLS policies
- **MEDIUM:** services/levelsService.js: Database query may not respect RLS policies
- **MEDIUM:** services/schoolService.js: Database query may not respect RLS policies
- **HIGH:** pages/SignupPage.jsx: Potential hardcoded password

---

## 9. Code Consistency

### Issues
No consistency issues found.

---

## Recommendations

### Add Missing Routes
Define routes that are used but not defined in App.js.
### Security Fixes (HIGH PRIORITY)
- Fix: pages/SignupPage.jsx - Potential hardcoded password
### Accessibility Improvements
Add ARIA labels, alt text, and proper form labels.
### Performance Optimizations
Consider implementing lazy loading and memoization.

---

**Report Generated:** 2026-01-09T01:25:05.972Z
