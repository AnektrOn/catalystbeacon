# OAuth sign-in (Google / Gmail) setup

If users **cannot sign up or sign in with Google** (or other providers), the cause is almost always configuration in **Supabase** and/or **Google Cloud Console**. Follow these steps.

**Android / iOS app (Capacitor):** See **[ANDROID_OAUTH.md](./ANDROID_OAUTH.md)** for native redirect URL and store-ready setup.

---

## 1. Supabase Dashboard – URL configuration

1. Open your project: [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **URL Configuration**.
3. Set **Site URL** to your production URL (no trailing slash), e.g.:
   - `https://humancatalystbeacon.com`
   - Do **not** use `http://localhost:3000` here for production.
4. Under **Redirect URLs**, add every URL where users may land after login. Add **each** of these if you use them:
   - Production: `https://humancatalystbeacon.com/dashboard`
   - Optional (wildcard): `https://humancatalystbeacon.com/**`
   - Local dev: `http://localhost:3000/dashboard` and/or `http://localhost:3000/**`
5. Save.

The app uses `redirectTo: ${window.location.origin}/dashboard`, so the **exact** redirect URL is `https://yourdomain.com/dashboard`. That exact URL (or a wildcard that matches it) must be in the list.

---

## 2. Supabase Dashboard – Google provider

1. In the same project: **Authentication** → **Providers** → **Google**.
2. Enable **Google**.
3. You will see a **Callback URL (for Google)**. It looks like:
   - `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
4. Copy that URL; you will add it in Google Cloud in the next section.
5. Leave **Client ID** and **Client Secret** empty for now; you will paste them after creating the OAuth client in Google.

---

## 3. Google Cloud Console – OAuth client

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → select (or create) your project.
2. **APIs & Services** → **Credentials**.
3. **Create credentials** → **OAuth client ID**.
4. If asked, configure the **OAuth consent screen**:
   - User type: **External** (so any Gmail user can sign in).
   - Fill App name, User support email, Developer contact.
   - **Publishing status**: if you leave the app in **Testing**, only test users you add can sign in. To allow **anyone** to sign up with Gmail, set the app to **In production** (after completing the consent screen).
5. Application type: **Web application**.
6. **Authorized JavaScript origins** – add:
   - `https://humancatalystbeacon.com`
   - `http://localhost:3000` (for local dev)
7. **Authorized redirect URIs** – add **exactly** the Supabase callback URL from step 2 above, e.g.:
   - `https://mbffycgrqfeesfnhhcdm.supabase.co/auth/v1/callback`
   - No typo, no trailing slash unless Supabase shows one.
8. Create. Copy the **Client ID** and **Client Secret**.

---

## 4. Paste credentials into Supabase

1. Back in Supabase: **Authentication** → **Providers** → **Google**.
2. Paste **Client ID** and **Client Secret** from Google Cloud.
3. Save.

---

## 5. “No one can sign up” – checklist

| Check | Where |
|-------|--------|
| **Site URL** = production URL (e.g. `https://humancatalystbeacon.com`) | Supabase → Auth → URL Configuration |
| **Redirect URLs** contains `https://yourdomain.com/dashboard` (or `https://yourdomain.com/**`) | Supabase → Auth → URL Configuration |
| **Google** provider is **enabled** | Supabase → Auth → Providers → Google |
| **Client ID** and **Client Secret** are set | Supabase → Auth → Providers → Google |
| **Authorized redirect URIs** in Google includes **exactly** `https://<project>.supabase.co/auth/v1/callback` | Google Cloud → Credentials → your OAuth client |
| **Authorized JavaScript origins** includes your site (e.g. `https://humancatalystbeacon.com`) | Google Cloud → Credentials → your OAuth client |
| If app is in **Testing**: add test users **or** set OAuth consent to **In production** | Google Cloud → OAuth consent screen |

---

## 6. Other providers (e.g. GitHub, Apple)

- In Supabase: **Authentication** → **Providers** → enable the provider and set the callback URL they show.
- In the provider’s dev console (GitHub, Apple, etc.): create an OAuth app and set the **redirect/callback URL** to the Supabase callback URL from the provider page (e.g. `https://<project>.supabase.co/auth/v1/callback`).
- Add your app’s redirect URL (e.g. `https://humancatalystbeacon.com/dashboard`) to Supabase **Redirect URLs** as in step 1.

---

## 7. After changing settings

- Wait a minute and try again (caches can delay).
- Try in an incognito/private window.
- If it still fails, open the browser **Developer Tools → Network** and **Console** and check for failed requests or error messages when you click “Sign in with Google”.
