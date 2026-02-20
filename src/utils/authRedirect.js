/**
 * Base URL for OAuth and auth redirects (password reset, magic link, etc.).
 * On native (Capacitor Android/iOS), returns a fixed URL so Supabase/Google
 * allow the redirect. On web, returns window.location.origin.
 * See OAUTH_SETUP.md and ANDROID_OAUTH.md.
 */
export function getAuthRedirectBaseUrl() {
  try {
    const { Capacitor } = require('@capacitor/core')
    if (Capacitor && Capacitor.isNativePlatform()) {
      return process.env.REACT_APP_MOBILE_OAUTH_REDIRECT_URL || 'https://app.humancatalystbeacon.com'
    }
  } catch (_) {
    // Capacitor not available (e.g. SSR or non-Capacitor build)
  }
  return typeof window !== 'undefined' ? window.location.origin : ''
}

export function getAuthRedirectUrl(path = '/dashboard') {
  const base = getAuthRedirectBaseUrl()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
