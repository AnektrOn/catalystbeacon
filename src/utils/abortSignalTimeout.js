/**
 * Timeout signal for fetch(); polyfills AbortSignal.timeout on older Safari (iOS < 16.4).
 */
export function getAbortSignalTimeout(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}
