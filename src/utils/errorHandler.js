/**
 * Standardized error handling utility for the mastery system
 */
import { logError } from './logger';

/**
 * Handle errors consistently across all components
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {Function} setError - Function to set error state
 * @param {Function} setLoading - Function to set loading state (optional)
 * @returns {string} User-friendly error message
 */
export const handleError = (error, context, setError, setLoading = null) => {
  logError(error, context);
  
  // Set loading to false if provided
  if (setLoading) {
    setLoading(false);
  }
  
  // Generate user-friendly error message
  let userMessage = 'An unexpected error occurred. Please try again.';
  
  if (error.message) {
    // Handle specific error types
    if (error.message.includes('Network')) {
      userMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('permission')) {
      userMessage = 'You don\'t have permission to perform this action.';
    } else if (error.message.includes('not found')) {
      userMessage = 'The requested item was not found.';
    } else if (error.message.includes('duplicate')) {
      userMessage = 'This item already exists.';
    } else if (error.message.includes('validation')) {
      userMessage = 'Please check your input and try again.';
    } else {
      // Use the original error message if it's user-friendly
      userMessage = error.message;
    }
  }
  
  // Set the error state
  if (setError) {
    setError(userMessage);
  }
  
  return userMessage;
};

/**
 * Clear error state
 * @param {Function} setError - Function to clear error state
 */
export const clearError = (setError) => {
  if (setError) {
    setError(null);
  }
};

/**
 * Handle async operations with standardized error handling
 * @param {Function} operation - The async operation to execute
 * @param {string} context - Context for error messages
 * @param {Function} setError - Function to set error state
 * @param {Function} setLoading - Function to set loading state
 * @returns {Promise} Result of the operation
 */
export const handleAsyncOperation = async (operation, context, setError, setLoading = null) => {
  try {
    if (setLoading) {
      setLoading(true);
    }
    clearError(setError);
    
    const result = await operation();
    return result;
  } catch (error) {
    handleError(error, context, setError, setLoading);
    throw error;
  }
};

/**
 * Retry an operation with exponential backoff
 * @param {Function} operation - The async operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the operation
 */
export const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
