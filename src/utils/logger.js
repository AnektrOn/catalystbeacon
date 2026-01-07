/**
 * Centralized logging utility
 * Replaces console statements with a configurable logging system
 * In production, logs can be sent to an external service (e.g., Sentry, LogRocket)
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Get log level from environment or default to INFO in production, DEBUG in development
const getLogLevel = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_LOG_LEVEL 
      ? LOG_LEVELS[process.env.REACT_APP_LOG_LEVEL.toUpperCase()] 
      : LOG_LEVELS.WARN; // Only warnings and errors in production
  }
  return LOG_LEVELS.DEBUG; // All logs in development
};

const currentLogLevel = getLogLevel();

/**
 * Log debug messages (only in development)
 */
export const logDebug = (...args) => {
  if (currentLogLevel <= LOG_LEVELS.DEBUG) {
    console.debug('[DEBUG]', ...args);
  }
};

/**
 * Log info messages
 */
export const logInfo = (...args) => {
  if (currentLogLevel <= LOG_LEVELS.INFO) {
    console.info('[INFO]', ...args);
  }
};

/**
 * Log warning messages
 */
export const logWarn = (...args) => {
  if (currentLogLevel <= LOG_LEVELS.WARN) {
    console.warn('[WARN]', ...args);
  }
  
  // In production, send warnings to error tracking service
  if (process.env.NODE_ENV === 'production' && window.Sentry) {
    window.Sentry.captureMessage(args.join(' '), 'warning');
  }
};

/**
 * Log error messages
 */
export const logError = (error, context = '') => {
  if (currentLogLevel <= LOG_LEVELS.ERROR) {
    const message = context ? `[ERROR] ${context}:` : '[ERROR]';
    console.error(message, error);
  }
  
  // In production, send errors to error tracking service
  if (process.env.NODE_ENV === 'production') {
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { context }
      });
    }
  }
};

/**
 * Log with automatic level detection
 * Replaces console.log, console.warn, console.error
 */
export const log = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  
  // Convenience method that matches console API
  log: logInfo
};

// Default export for easy migration
export default log;
