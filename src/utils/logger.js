/**
 * Production-safe logger utility
 * Only logs in development mode, prevents console.log in production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args)
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args)
    }
  }
}

export default logger

