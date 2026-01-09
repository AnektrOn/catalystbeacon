/**
 * Date utility functions
 * Handles timezone-aware date operations
 */

/**
 * Get the current date in the user's local timezone as YYYY-MM-DD string
 * This ensures dates are accurate regardless of the user's timezone
 * @returns {string} Date string in YYYY-MM-DD format (local timezone)
 */
export function getLocalDateString(date = null) {
  const d = date || new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get the start of today in local timezone as ISO string
 * @returns {string} ISO string for start of today (00:00:00 local time)
 */
export function getTodayStartISO() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  const startOfDay = new Date(year, month, day, 0, 0, 0, 0)
  return startOfDay.toISOString()
}

/**
 * Get the end of today in local timezone as ISO string
 * @returns {string} ISO string for end of today (23:59:59.999 local time)
 */
export function getTodayEndISO() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  const endOfDay = new Date(year, month, day, 23, 59, 59, 999)
  return endOfDay.toISOString()
}

/**
 * Check if a date string (YYYY-MM-DD) is today in local timezone
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is today
 */
export function isToday(dateString) {
  return dateString === getLocalDateString()
}

/**
 * Get the first day of the current month in local timezone as YYYY-MM-DD
 * @returns {string} Date string for first day of month
 */
export function getFirstDayOfMonth() {
  const now = new Date()
  return getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1))
}

/**
 * Get the last day of the current month in local timezone as YYYY-MM-DD
 * @returns {string} Date string for last day of month
 */
export function getLastDayOfMonth() {
  const now = new Date()
  return getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}
