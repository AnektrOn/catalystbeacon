/**
 * Memoization utilities for performance optimization
 */

/**
 * Memoize a function with a cache
 * @param {Function} fn - Function to memoize
 * @param {Function} getKey - Function to generate cache key
 * @returns {Function} Memoized function
 */
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Memoize async functions
 * @param {Function} fn - Async function to memoize
 * @param {Function} getKey - Function to generate cache key
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Function} Memoized async function
 */
export const memoizeAsync = (fn, getKey = (...args) => JSON.stringify(args), ttl = 300000) => {
  const cache = new Map();
  
  return async (...args) => {
    const key = getKey(...args);
    const now = Date.now();
    
    if (cache.has(key)) {
      const { result, timestamp } = cache.get(key);
      if (now - timestamp < ttl) {
        return result;
      }
    }
    
    try {
      const result = await fn(...args);
      cache.set(key, { result, timestamp: now });
      return result;
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Debounce a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle a function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (fn, limit) => {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Clear all memoization caches
 */
export const clearMemoizationCache = () => {
  // This would need to be implemented per component
  // as we can't access all caches from here
};
