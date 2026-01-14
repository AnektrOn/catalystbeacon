/**
 * Application Configuration
 * Centralized configuration for API endpoints and base URLs
 */

// API Base URL - all backend API calls should use this prefix
// In production, .htaccess proxies /api/* to the backend server on port 3001
export const API_BASE_URL = '/api'

// Helper function to build API endpoint URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  // Ensure endpoint starts with /api
  if (cleanEndpoint.startsWith('api/')) {
    return `/${cleanEndpoint}`
  }
  return `${API_BASE_URL}/${cleanEndpoint}`
}

// Common API endpoints
export const API_ENDPOINTS = {
  HEALTH: getApiUrl('health'),
  CREATE_CHECKOUT_SESSION: getApiUrl('create-checkout-session'),
  CREATE_PORTAL_SESSION: getApiUrl('create-portal-session'),
  PAYMENT_SUCCESS: getApiUrl('payment-success'),
  SEND_SIGNUP_EMAIL: getApiUrl('send-signup-email'),
}

export default {
  API_BASE_URL,
  getApiUrl,
  API_ENDPOINTS,
}
