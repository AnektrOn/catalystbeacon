# OAuth (Google sign-in) for Android app (Capacitor)

When you built the web app as an **Android app** (Capacitor), sign-in with Google can fail because:

1. In the native app, the WebView’s origin is not your production URL (e.g. `https://localhost` or `capacitor://...`), so Supabase/Google reject the redirect.
2. The redirect URL must be **allowlisted** in both Supabase and Google.

This project fixes (1) by using a **fixed redirect URL** when the app runs on a native platform.

---

## What the code does

- **Web:** Redirect URL = `window.location.origin/dashboard` (e.g. `https://app.humancatalystbeacon.com/dashboard`).
- **Native (Android/iOS):** Redirect URL = **fixed URL** so it’s always allowlisted:
  - `REACT_APP_MOBILE_OAUTH_REDIRECT_URL` if set in env, otherwise
  - `https://app.humancatalystbeacon.com` → redirect path = `https://app.humancatalystbeacon.com/dashboard`

So after Google sign-in, Supabase redirects the user to that HTTPS URL. For the **same** flow to work inside the Android app, the app’s WebView must load that same URL (see “Option A” below).

---

## Option A: App loads from your web URL (recommended for store)

1. **Capacitor:** In production builds, serve the app from your site so the WebView’s origin is your domain.
   - In `capacitor.config.ts` you can set `server.url` when building for production, e.g. `https://app.humancatalystbeacon.com`, so the Android app loads that URL instead of the bundled files.
   - Then the OAuth redirect goes to the same origin the app is already on; no custom scheme needed.

2. **Supabase → Authentication → URL Configuration**
   - **Redirect URLs:** add  
     `https://app.humancatalystbeacon.com/dashboard`  
     (and optionally `https://app.humancatalystbeacon.com/**`).

3. **Google Cloud Console → OAuth client**
   - **Authorized JavaScript origins:** `https://app.humancatalystbeacon.com`
   - **Authorized redirect URIs:** your Supabase callback, e.g.  
     `https://<project-ref>.supabase.co/auth/v1/callback`

4. **Env (optional)**  
   If you use a different app URL, set when building the app:
   - `REACT_APP_MOBILE_OAUTH_REDIRECT_URL=https://yourapp.com`

After that, “Sign in with Google” in the Android app should complete and land the user on the dashboard.

---

## Option B: Custom URL scheme (optional)

If you want the app to open via a custom scheme (e.g. `hcbeacon://`) after OAuth:

1. **Supabase → Redirect URLs**  
   Add e.g. `hcbeacon://humancatalystbeacon.com/dashboard` and/or `hcbeacon://**`.

2. **Android:** Your `AndroidManifest.xml` intent filter already declares the `hcbeacon` scheme; ensure the host/path match the redirect URL you add in Supabase.

3. **Env**  
   Set when building the app:  
   `REACT_APP_MOBILE_OAUTH_REDIRECT_URL=hcbeacon://humancatalystbeacon.com`

4. **Deep linking**  
   The app already handles OAuth callback tokens from the **hash** (`#access_token=...&refresh_token=...`) in `src/utils/deepLinking.js`, so when the app is opened with that URL it will set the session and navigate to the dashboard.

---

## Checklist (Android app store)

- [ ] Supabase **Redirect URLs** include the URL you use on native (e.g. `https://app.humancatalystbeacon.com/dashboard` or your custom scheme).
- [ ] Google OAuth client has the correct **Authorized JavaScript origins** and **Authorized redirect URIs** (Supabase callback).
- [ ] If using Option A: Capacitor production build loads the app from that same URL (`server.url` or equivalent).
- [ ] If using Option B: `REACT_APP_MOBILE_OAUTH_REDIRECT_URL` is set and Android intent filter matches the scheme/host/path.
- [ ] Run the **handle_new_user** migration in Supabase so new OAuth signups create a profile without the “user_id” error (see `supabase/migrations/20260208_fix_handle_new_user_trigger.sql`).

See also **OAUTH_SETUP.md** for web and Supabase/Google setup in general.
