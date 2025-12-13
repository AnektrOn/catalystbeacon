# Manual Testing Script for Full Application Audit

## Prerequisites
- Application running on http://localhost:3000
- Test user account created
- Browser console open (F12) to check for errors

---

## TEST 1: Authentication & Access Control

### 1.1 Login Page (`/login`)
1. Navigate to http://localhost:3000/login
2. **Test:** Email input accepts text
   - [ ] Type email, verify it appears
3. **Test:** Password input accepts text
   - [ ] Type password, verify it appears (masked)
4. **Test:** Form validation (empty fields)
   - [ ] Click "Sign in" with empty fields
   - [ ] Verify error toast appears
5. **Test:** Invalid credentials
   - [ ] Enter wrong email/password
   - [ ] Verify error message
6. **Test:** Valid login
   - [ ] Enter correct credentials
   - [ ] Verify redirect to `/dashboard`
   - [ ] Verify user is logged in
7. **Test:** "Create account" link
   - [ ] Click link, verify navigates to `/signup`
8. **Test:** "Forgot password" link
   - [ ] Click link, verify navigates (if implemented)

### 1.2 Signup Page (`/signup`)
1. Navigate to http://localhost:3000/signup
2. **Test:** Full name validation
   - [ ] Leave empty, submit → error
   - [ ] Enter 1 character → error
   - [ ] Enter 2+ characters → no error
3. **Test:** Email validation
   - [ ] Invalid email format → error
   - [ ] Valid email → no error
4. **Test:** Password validation
   - [ ] Less than 6 chars → error
   - [ ] No uppercase → error
   - [ ] No lowercase → error
   - [ ] No number → error
   - [ ] Valid password → no error
5. **Test:** Confirm password
   - [ ] Mismatch → error
   - [ ] Match → no error
6. **Test:** Terms checkbox
   - [ ] Unchecked, submit → error
   - [ ] Checked → no error
7. **Test:** Form submission
   - [ ] Fill all fields correctly
   - [ ] Submit form
   - [ ] Verify redirect or success message

### 1.3 Protected Routes
1. **Test:** Access without login
   - [ ] Sign out if logged in
   - [ ] Navigate directly to `/dashboard`
   - [ ] Verify redirect to `/login`
2. **Test:** Access with login
   - [ ] Log in
   - [ ] Navigate to `/dashboard`
   - [ ] Verify access granted
3. **Test:** Session persistence
   - [ ] Log in
   - [ ] Refresh page (F5)
   - [ ] Verify still logged in
   - [ ] Verify profile data loads

### 1.4 Sign Out
1. **Test:** Sign out button
   - [ ] Click user avatar in header
   - [ ] Click "Sign Out"
   - [ ] Verify redirect to `/login`
   - [ ] Verify session cleared

---

## TEST 2: Navigation & Routing

### 2.1 Desktop Sidebar Navigation
1. Log in and navigate to `/dashboard`
2. **Test each navigation item:**
   - [ ] Dashboard button → navigates to `/dashboard`
   - [ ] Courses button → navigates to `/courses`
   - [ ] Mastery button → navigates to `/mastery`
   - [ ] Calendar button → navigates to `/mastery/calendar`
   - [ ] Timer button → navigates to `/mastery/timer`
   - [ ] Profile button → navigates to `/profile`
   - [ ] Community button → navigates to `/community`
   - [ ] Settings button → navigates to `/settings`
3. **Test:** Active route highlighting
   - [ ] Navigate to each route
   - [ ] Verify active button is highlighted
4. **Test:** Sidebar expand/collapse
   - [ ] Click expand/collapse button
   - [ ] Verify sidebar expands/collapses
   - [ ] Verify labels show/hide

### 2.2 Mobile Navigation
1. Resize browser to mobile width (< 768px)
2. **Test:** Bottom navigation
   - [ ] Home button → `/dashboard`
   - [ ] Mastery button → `/mastery`
   - [ ] Courses button → `/courses`
   - [ ] Community button → `/community`
   - [ ] Profile button → `/profile`
3. **Test:** Mobile menu
   - [ ] Click hamburger menu
   - [ ] Verify menu opens
   - [ ] Click menu item
   - [ ] Verify navigates and menu closes

### 2.3 Header Components
1. **Test:** Color palette dropdown
   - [ ] Click palette icon
   - [ ] Verify dropdown opens
   - [ ] Click a palette
   - [ ] Verify colors change
   - [ ] Refresh page
   - [ ] Verify palette persists
2. **Test:** User profile dropdown
   - [ ] Click user avatar
   - [ ] Verify dropdown opens
   - [ ] Click "Profile" → navigates to `/profile`
   - [ ] Click "Settings" → navigates to `/settings`
   - [ ] Click "Sign Out" → signs out
3. **Test:** Theme toggle
   - [ ] Click sun/moon icon
   - [ ] Verify theme changes
   - [ ] Verify persists after refresh

---

## TEST 3: Settings Page (`/settings`)

### 3.1 Navigation Between Sections
1. Navigate to `/settings`
2. **Test each section button:**
   - [ ] Account button → shows Account section
   - [ ] Notifications button → shows Notifications section
   - [ ] Appearance button → shows Appearance section
   - [ ] Privacy button → shows Privacy section
3. **Test:** Active section highlighting
   - [ ] Verify active button is highlighted

### 3.2 Account Section
1. Navigate to Account section
2. **Test:** Display name input
   - [ ] Type in display name field
   - [ ] Verify text appears
3. **Test:** Email display
   - [ ] Verify email shows (read-only)
   - [ ] Verify field is disabled
4. **Test:** Save Changes button
   - [ ] Change display name
   - [ ] Click "Save Changes"
   - [ ] Verify loading state
   - [ ] Verify success toast
   - [ ] Verify profile updates
   - [ ] Refresh page
   - [ ] Verify changes persist

### 3.3 Notifications Section
1. Navigate to Notifications section
2. **Test each toggle:**
   - [ ] Email notifications toggle
   - [ ] Push notifications toggle
   - [ ] Course updates toggle
3. **Test:** Save Preferences button
   - [ ] Toggle settings
   - [ ] Click "Save Preferences"
   - [ ] Verify success toast

### 3.4 Appearance Section
1. Navigate to Appearance section
2. **Test:** Color theme display
   - [ ] Verify ColorPaletteDropdown is visible
   - [ ] Click dropdown
   - [ ] Verify palettes list
3. **Test:** Background image file upload
   - [ ] Click "Upload Image" button
   - [ ] Select image file (JPEG, PNG, GIF, WebP)
   - [ ] Verify file selection dialog opens
   - [ ] Select file
   - [ ] Verify upload starts
   - [ ] Verify loading state
   - [ ] Verify success toast
   - [ ] Verify preview shows
   - [ ] Verify background displays in AppShell
4. **Test:** Background image URL input
   - [ ] Enter image URL
   - [ ] Verify URL validation
   - [ ] Click "Save URL"
   - [ ] Verify success
   - [ ] Verify preview shows
5. **Test:** Remove background
   - [ ] Click "Remove Background"
   - [ ] Verify background removed
   - [ ] Verify default gradient shows
6. **Test:** Image validation
   - [ ] Try uploading non-image file → error
   - [ ] Try uploading >5MB file → error
   - [ ] Try invalid URL → error

### 3.5 Privacy Section
1. Navigate to Privacy section
2. **Test each toggle:**
   - [ ] Public profile toggle
   - [ ] Show progress toggle
3. **Test:** Save Privacy Settings button
   - [ ] Toggle settings
   - [ ] Click "Save Privacy Settings"
   - [ ] Verify success toast

---

## TEST 4: Dashboard Page (`/dashboard`)

1. Navigate to `/dashboard`
2. **Test:** Widgets render
   - [ ] Daily Ritual Widget visible
   - [ ] Quick Actions Widget visible
   - [ ] XP Progress Widget visible
   - [ ] Other widgets visible
3. **Test:** "Begin Ritual" button
   - [ ] Click button
   - [ ] Verify action executes
4. **Test:** Quick action buttons
   - [ ] Click each quick action
   - [ ] Verify navigation or action
5. **Test:** Widget interactions
   - [ ] Click on widgets
   - [ ] Verify interactions work

---

## TEST 5: Profile Page (`/profile`)

1. Navigate to `/profile`
2. **Test:** Profile information display
   - [ ] Name displays
   - [ ] Email displays
   - [ ] Avatar displays (if set)
   - [ ] Background image displays (if set)
   - [ ] Stats display
3. **Test:** Profile edit form
   - [ ] Edit fields
   - [ ] Submit form
   - [ ] Verify updates

---

## TEST 6: Mastery System (`/mastery`)

### 6.1 Tab Navigation
1. Navigate to `/mastery`
2. **Test each tab:**
   - [ ] Calendar tab → shows calendar
   - [ ] Habits tab → shows habits
   - [ ] Toolbox tab → shows toolbox
   - [ ] Achievements tab → shows achievements
   - [ ] Timer tab → shows timer

### 6.2 Calendar Tab (`/mastery/calendar`)
1. Navigate to Calendar tab
2. **Test:** Calendar renders
   - [ ] Calendar displays
   - [ ] Events show
3. **Test:** Event creation
   - [ ] Create event
   - [ ] Verify event appears
4. **Test:** Event completion
   - [ ] Click "Complete" button
   - [ ] Verify event marked complete

### 6.3 Habits Tab (`/mastery/habits`)
1. Navigate to Habits tab
2. **Test:** Habits list
   - [ ] Habits display
3. **Test:** Habit tracking
   - [ ] Click habit button
   - [ ] Verify completion

### 6.4 Toolbox Tab (`/mastery/toolbox`)
1. Navigate to Toolbox tab
2. **Test:** Toolbox items
   - [ ] Items display
3. **Test:** Item interactions
   - [ ] Click items
   - [ ] Verify interactions

### 6.5 Timer Tab (`/mastery/timer`)
1. Navigate to Timer tab
2. **Test:** Timer display
   - [ ] Timer shows
3. **Test:** Timer controls
   - [ ] Start button → timer starts
   - [ ] Stop button → timer stops
   - [ ] Pause button → timer pauses
4. **Test:** Mode switching
   - [ ] Switch to Focus mode
   - [ ] Switch to Short Break
   - [ ] Switch to Long Break
   - [ ] Verify mode changes

---

## TEST 7: Course System

### 7.1 Course Catalog (`/courses`)
1. Navigate to `/courses`
2. **Test:** Course list
   - [ ] Courses display
3. **Test:** Course filtering
   - [ ] Use filters
   - [ ] Verify results update
4. **Test:** Search
   - [ ] Enter search term
   - [ ] Verify results
5. **Test:** Course card click
   - [ ] Click course card
   - [ ] Verify navigates to course detail

### 7.2 Course Detail (`/courses/:courseId`)
1. Navigate to a course detail page
2. **Test:** Course information
   - [ ] Course details display
3. **Test:** Enrollment
   - [ ] Click enroll button
   - [ ] Verify enrollment
4. **Test:** Chapter navigation
   - [ ] Click chapter
   - [ ] Verify expands
5. **Test:** Lesson navigation
   - [ ] Click lesson
   - [ ] Verify navigates to player

### 7.3 Course Player
1. Navigate to a lesson
2. **Test:** Lesson content
   - [ ] Content displays
3. **Test:** Navigation buttons
   - [ ] Previous lesson button
   - [ ] Next lesson button
4. **Test:** Progress tracking
   - [ ] Complete lesson
   - [ ] Verify progress updates

---

## TEST 8: Community Page (`/community`)

1. Navigate to `/community`
2. **Test:** Post list
   - [ ] Posts display
3. **Test:** Create post
   - [ ] Click create post button
   - [ ] Verify modal opens
   - [ ] Fill form
   - [ ] Submit
   - [ ] Verify post appears
4. **Test:** Post interactions
   - [ ] Like button
   - [ ] Comment button
5. **Test:** Leaderboard
   - [ ] Leaderboard displays
6. **Test:** Search
   - [ ] Enter search term
   - [ ] Verify results
7. **Test:** Filters
   - [ ] Apply filters
   - [ ] Verify results update

---

## TEST 9: Stellar Map (`/stellar-map`)

1. Navigate to `/stellar-map`
2. **Test:** Map rendering
   - [ ] Map displays
3. **Test:** Node interactions
   - [ ] Click nodes
   - [ ] Verify tooltips
4. **Test:** Navigation controls
   - [ ] Zoom controls
   - [ ] Pan controls
5. **Test:** Map controls
   - [ ] All controls work

---

## TEST 10: Color Palette System

1. **Test:** Dropdown functionality
   - [ ] Click palette icon
   - [ ] Verify dropdown opens
   - [ ] Verify all 9 palettes listed
2. **Test:** Palette selection
   - [ ] Select each palette
   - [ ] Verify colors change immediately
   - [ ] Verify CSS variables update
3. **Test:** Persistence
   - [ ] Select palette
   - [ ] Refresh page
   - [ ] Verify palette persists
4. **Test:** Visual changes
   - [ ] Change palette
   - [ ] Navigate to different pages
   - [ ] Verify colors consistent across pages

---

## TEST 11: Forms & Inputs

1. **Test all input types:**
   - [ ] Text inputs accept text
   - [ ] Email inputs validate format
   - [ ] Password inputs mask text
   - [ ] Number inputs accept numbers
   - [ ] URL inputs validate format
   - [ ] Textarea accepts multi-line text
   - [ ] Checkboxes toggle
   - [ ] Radio buttons select
   - [ ] Select dropdowns open and select
   - [ ] File inputs open file dialog

2. **Test validation:**
   - [ ] Required fields show error when empty
   - [ ] Invalid formats show error
   - [ ] Error messages clear when fixed

---

## TEST 12: Error Handling

1. **Test error scenarios:**
   - [ ] Network error (disconnect internet)
   - [ ] Invalid route (navigate to `/invalid`)
   - [ ] Invalid form data
   - [ ] Missing data
2. **Test error display:**
   - [ ] Error messages show
   - [ ] Error boundaries catch crashes
   - [ ] Loading states show
   - [ ] Empty states show

---

## TEST 13: Responsive Design

### Desktop (1024px+)
1. Resize to desktop width
2. **Test:**
   - [ ] Sidebar visible
   - [ ] Layout correct
   - [ ] All components sized correctly

### Tablet (768px - 1023px)
1. Resize to tablet width
2. **Test:**
   - [ ] Layout adapts
   - [ ] Navigation adapts
   - [ ] Components resize

### Mobile (< 768px)
1. Resize to mobile width
2. **Test:**
   - [ ] Mobile navigation shows
   - [ ] Bottom nav works
   - [ ] Touch interactions work
   - [ ] Mobile menu works

---

## TEST 14: Background Image Feature

1. Navigate to Settings → Appearance
2. **Test upload:**
   - [ ] Upload image file
   - [ ] Verify uploads
   - [ ] Verify preview
   - [ ] Verify displays in AppShell
3. **Test URL:**
   - [ ] Enter image URL
   - [ ] Save URL
   - [ ] Verify displays
4. **Test removal:**
   - [ ] Remove background
   - [ ] Verify removed
5. **Test persistence:**
   - [ ] Set background
   - [ ] Refresh page
   - [ ] Verify persists
6. **Test across pages:**
   - [ ] Set background
   - [ ] Navigate to different pages
   - [ ] Verify displays on all pages

---

## Browser Testing

### Chrome
- [ ] Run all tests above
- [ ] Check console for errors
- [ ] Verify all functionality

### Firefox
- [ ] Run all tests above
- [ ] Check console for errors
- [ ] Verify all functionality

### Safari
- [ ] Run all tests above
- [ ] Check console for errors
- [ ] Verify all functionality

---

## Bug Reporting Template

For each bug found, document:
1. **Description:** What doesn't work
2. **Steps to Reproduce:** How to trigger the bug
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happens
5. **Browser/Device:** Chrome/Firefox/Safari, Desktop/Mobile
6. **Screenshot:** If applicable
7. **Console Errors:** Any error messages

---

## Completion Checklist

- [ ] All authentication tests passed
- [ ] All navigation tests passed
- [ ] All settings tests passed
- [ ] All dashboard tests passed
- [ ] All mastery tests passed
- [ ] All course tests passed
- [ ] All community tests passed
- [ ] All stellar map tests passed
- [ ] All component tests passed
- [ ] All form tests passed
- [ ] All error handling tests passed
- [ ] All responsive design tests passed
- [ ] All background image tests passed
- [ ] All browser tests completed
- [ ] Test report created
- [ ] Bugs documented
