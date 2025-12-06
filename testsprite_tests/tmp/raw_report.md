
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** hcuniversity
- **Date:** 2025-12-06
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** TC001-User Registration with Email and Password
- **Test Code:** [TC001_User_Registration_with_Email_and_Password.py](./TC001_User_Registration_with_Email_and_Password.py)
- **Test Error:** The user registration process was tested by filling the signup form with valid email and password and submitting it twice. Each time, the form redirected to the login page but login attempts with the registered credentials failed with 'Invalid login credentials' error. No registration success confirmation message was shown. The user was never able to log in, so role assignment could not be verified. The registration process appears to be broken or incomplete. Task failed.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Sign in error: AuthApiError: Invalid login credentials
    at handleError (http://localhost:3000/static/js/bundle.js:9843:9)
    at async _handleRequest (http://localhost:3000/static/js/bundle.js:9893:5)
    at async _request (http://localhost:3000/static/js/bundle.js:9873:16)
    at async SupabaseAuthClient.signInWithPassword (http://localhost:3000/static/js/bundle.js:6384:15)
    at async signIn (http://localhost:3000/static/js/bundle.js:59710:11)
    at async handleSubmit (http://localhost:3000/static/js/src_pages_LoginPage_jsx.chunk.js:48:9) (at http://localhost:3000/static/js/bundle.js:59720:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Sign in error: AuthApiError: Invalid login credentials
    at handleError (http://localhost:3000/static/js/bundle.js:9843:9)
    at async _handleRequest (http://localhost:3000/static/js/bundle.js:9893:5)
    at async _request (http://localhost:3000/static/js/bundle.js:9873:16)
    at async SupabaseAuthClient.signInWithPassword (http://localhost:3000/static/js/bundle.js:6384:15)
    at async signIn (http://localhost:3000/static/js/bundle.js:59710:11)
    at async handleSubmit (http://localhost:3000/static/js/src_pages_LoginPage_jsx.chunk.js:48:9) (at http://localhost:3000/static/js/bundle.js:59720:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/47b99255-e886-4308-b33e-0dbfdc612504
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** TC002-User Login with Correct Credentials
- **Test Code:** [TC002_User_Login_with_Correct_Credentials.py](./TC002_User_Login_with_Correct_Credentials.py)
- **Test Error:** Tested login functionality for Admin user role successfully but unable to log out due to missing logout option. Cannot proceed with testing other user roles (Free, Student, Teacher). Reporting issue and stopping further testing.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/36c58299-6f82-4496-b688-cf3d332fc96f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** TC003-User Login with Incorrect Credentials
- **Test Code:** [TC003_User_Login_with_Incorrect_Credentials.py](./TC003_User_Login_with_Incorrect_Credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/f860092c-6c6a-42b9-b6ec-7349634e1431
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** TC004-Dashboard Widgets Display and Functionality
- **Test Code:** [TC004_Dashboard_Widgets_Display_and_Functionality.py](./TC004_Dashboard_Widgets_Display_and_Functionality.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/83f2a79f-80dc-40aa-a141-f8a4bc3295e5
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** TC005-Course Catalog Browsing and Enrollment
- **Test Code:** [TC005_Course_Catalog_Browsing_and_Enrollment.py](./TC005_Course_Catalog_Browsing_and_Enrollment.py)
- **Test Error:** Test completed with partial success. User was able to login, browse course catalog, view detailed course pages, enroll in a course, and confirm enrollment by completing a lesson. However, the enrolled courses or learning history section is missing or not accessible from the profile or settings pages, so final verification of enrollment listing could not be completed.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-719592254:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-211735735:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/ba6cb4a6-8841-45db-9a6f-44b9ceb0b2ae
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** TC006-Course Video Lesson Playback and Progress Tracking
- **Test Code:** [TC006_Course_Video_Lesson_Playback_and_Progress_Tracking.py](./TC006_Course_Video_Lesson_Playback_and_Progress_Tracking.py)
- **Test Error:** Testing of video playback and progress tracking cannot proceed because video content is missing on all tested lessons. Progress marking works but core video functionality is unavailable. Please address the missing video content issue to enable full testing.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-719592254:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-211735735:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/2927247c-0650-451b-bdf0-edd76c7378a4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** TC007-Teacher Course Creation and Content Management
- **Test Code:** [TC007_Teacher_Course_Creation_and_Content_Management.py](./TC007_Teacher_Course_Creation_and_Content_Management.py)
- **Test Error:** Teacher role users cannot access the course creation page or create new courses due to missing UI elements and navigation options. The issue has been reported. Task cannot proceed further.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-719592254:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-211735735:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/f95f64b0-c38d-44d3-bb36-f262693cf0ff
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** TC008-Habit Tracking and Streaks Functionality
- **Test Code:** [TC008_Habit_Tracking_and_Streaks_Functionality.py](./TC008_Habit_Tracking_and_Streaks_Functionality.py)
- **Test Error:** Reported issue with Mastery Habits tab navigation preventing further testing of habit features. Task incomplete due to navigation failure.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/4ca79776-627a-42aa-8265-3f062b151729
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** TC009-Toolbox Items Management
- **Test Code:** [TC009_Toolbox_Items_Management.py](./TC009_Toolbox_Items_Management.py)
- **Test Error:** Reported issue: Cannot access Toolbox tab due to Mastery tab button not clickable or missing. Testing cannot proceed further.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/4a53a15c-4a4d-43a3-9564-22b4f819a6db
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** TC010-Calendar Integration for Habit Visualization
- **Test Code:** [TC010_Calendar_Integration_for_Habit_Visualization.py](./TC010_Calendar_Integration_for_Habit_Visualization.py)
- **Test Error:** Test stopped due to inability to access Calendar tab. Reported issue with Calendar tab button click failure preventing further testing of habit completions.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/86567d37-4175-43d5-a3b8-5df58675bbbb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** TC011-Skills System Progress Tracking and Visualization
- **Test Code:** [TC011_Skills_System_Progress_Tracking_and_Visualization.py](./TC011_Skills_System_Progress_Tracking_and_Visualization.py)
- **Test Error:** The task to ensure multiple skills in cognitive, creative, discipline, and social categories are tracked accurately and radar chart visualizations render properly is partially completed. Login, skill progress updates, and lesson completion were successful and skill progress numbers updated accordingly. However, the radar chart visualization for skill progress was not found or did not render on the Mastery or Hub pages as expected. This prevents full verification of radar chart rendering accuracy. Further investigation or development fixes may be needed to address the missing radar chart visualization.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-719592254:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-211735735:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/c11ed31c-baeb-43c4-a9cc-177d2147978a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** TC012-Achievements Display and Progress Update
- **Test Code:** [TC012_Achievements_Display_and_Progress_Update.py](./TC012_Achievements_Display_and_Progress_Update.py)
- **Test Error:** Reported issue: Achievements page navigation is broken from the Community page dropdown. Cannot proceed with badge verification and progress update testing.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/47158282-c85c-4880-9677-75bfcf7e663a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** TC013-Social Feed: Post Creation, Commenting, and Liking
- **Test Code:** [TC013_Social_Feed_Post_Creation_Commenting_and_Liking.py](./TC013_Social_Feed_Post_Creation_Commenting_and_Liking.py)
- **Test Error:** The test for creating posts, commenting, and liking on the community social feed is incomplete. While login, navigation, and opening the post creation modal succeeded, the post submission did not result in the post appearing on the feed. Additionally, no existing posts were found to test commenting or liking functionality. This indicates a possible issue with post submission or feed update. Further investigation or fixes are needed before full verification can be completed.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/posts?columns=%22user_id%22%2C%22title%22%2C%22content%22%2C%22excerpt%22%2C%22post_type%22%2C%22video_url%22%2C%22image_url%22%2C%22tags%22%2C%22is_published%22%2C%22is_public%22&select=*:0:0)
[ERROR] Error creating post: {code: 23514, details: null, hint: null, message: new row for relation "posts" violates check constraint "valid_post_type"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2951:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/be26e749-a5a4-4fab-826e-e57d6160cf3e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** TC014-Subscription Payment Processing via Stripe
- **Test Code:** [TC014_Subscription_Payment_Processing_via_Stripe.py](./TC014_Subscription_Payment_Processing_via_Stripe.py)
- **Test Error:** Subscription management and billing options are missing from the Settings page. Tabs do not update content and only show profile information fields. Unable to proceed with subscription testing. Reporting this issue and stopping further testing.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-719592254:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.-211735735:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/0f4e2750-379f-439f-a755-a929ef31632e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** TC015-Profile Settings Update and Avatar Customization
- **Test Code:** [TC015_Profile_Settings_Update_and_Avatar_Customization.py](./TC015_Profile_Settings_Update_and_Avatar_Customization.py)
- **Test Error:** Reported issue with profile settings update and avatar image change. Stopping further actions as the update functionality is not working as expected.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/f28ca50b-2799-4ada-9425-74830af1d18f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016
- **Test Name:** TC016-UI Responsiveness and Mobile Compatibility
- **Test Code:** [TC016_UI_Responsiveness_and_Mobile_Compatibility.py](./TC016_UI_Responsiveness_and_Mobile_Compatibility.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/aabf6917-3c60-49a1-ac90-307aee01e8a2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017
- **Test Name:** TC017-XP Progression and Level System Accuracy
- **Test Code:** [TC017_XP_Progression_and_Level_System_Accuracy.py](./TC017_XP_Progression_and_Level_System_Accuracy.py)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/3b890ea7-0473-4b61-b903-23e83d8d46fe
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018
- **Test Name:** TC018-Error Handling for Network Failures and Loading States
- **Test Code:** [TC018_Error_Handling_for_Network_Failures_and_Loading_States.py](./TC018_Error_Handling_for_Network_Failures_and_Loading_States.py)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/c87c64a6-f310-4636-95f7-9b479fdadd12
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019
- **Test Name:** TC019-Role-Based Access Control Enforcement
- **Test Code:** [TC019_Role_Based_Access_Control_Enforcement.py](./TC019_Role_Based_Access_Control_Enforcement.py)
- **Test Error:** Logout functionality is broken or inaccessible, preventing testing of different user roles for access control. Reporting this as a critical blocker and stopping further testing until resolved.
Browser Console Logs:
[WARNING] ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. (at http://localhost:3000/static/js/bundle.js:47693:12)
[WARNING] ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. (at http://localhost:3000/static/js/bundle.js:47693:12)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/notifications?select=id&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&is_read=eq.false:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_badges?select=*%2Cbadges%28id%2Ctitle%2Cdescription%2Cbadge_image_url%2Ccategory%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&order=awarded_at.desc&limit=10:0:0)
[WARNING] Error loading user badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_habits', message: Could not find the table 'public.user_badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2165:16)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*%2Ccourse_metadata%28id%2Ctitle%2Cthumbnail_url%29&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&status=eq.in_progress&order=last_accessed_at.desc&limit=1:0:0)
[WARNING] Error loading course progress: {code: 42703, details: null, hint: null, message: column course_metadata_1.title does not exist} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2242:16)
[ERROR] Failed to load resource: the server responded with a status of 404 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/badges?select=*&is_active=eq.true&order=xp_reward.asc&limit=20:0:0)
[WARNING] Error loading all badges: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.challenges', message: Could not find the table 'public.badges' in the schema cache} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2183:16)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.21:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.9:0:0)
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.20:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://mbffycgrqfeesfnhhcdm.supabase.co/rest/v1/user_course_progress?select=*&user_id=eq.8c94448d-e21c-4b7b-be9a-88a5692dc5d6&course_id=eq.NaN:0:0)
[ERROR] Error fetching user course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_services_courseService_js.chunk.js:536:14)
[WARNING] Error loading course progress: {code: 22P02, details: null, hint: null, message: invalid input syntax for type integer: "NaN"} (at http://localhost:3000/static/js/src_pages_Dashboard_jsx.chunk.js:2398:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b692a9d5-fe39-4d3a-84c9-2c716a72a414/e4cccc22-e8e6-430a-bcf6-72670890a7e4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **15.79** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---