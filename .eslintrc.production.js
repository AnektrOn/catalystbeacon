/**
 * ESLint configuration for production builds
 * Prevents console.log statements in production code
 */
module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' 
      ? ['error', { allow: ['error', 'warn'] }] 
      : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
}

