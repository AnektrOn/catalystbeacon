import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { logDebug, logWarn, logError } from '../utils/logger'

const DataCacheContext = createContext(null)

export const useDataCache = () => {
  const context = useContext(DataCacheContext)
  // Return null if not available instead of throwing - allows graceful degradation
  return context
}

/**
 * Data Cache Provider
 * Provides centralized caching with sessionStorage persistence
 * Prevents duplicate requests and provides stable data access
 */
export const DataCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({})
  const [loadingStates, setLoadingStates] = useState({})
  const pendingRequests = useRef({}) // Track in-flight requests to prevent duplicates

  // Load cache from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('app_data_cache')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Only restore cache if it's less than 1 hour old
        const cacheAge = parsed.timestamp ? Date.now() - parsed.timestamp : Infinity
        if (cacheAge < 3600000) { // 1 hour
          setCache(parsed.data || {})
          logDebug('📦 DataCache: Restored cache from sessionStorage', Object.keys(parsed.data || {}).length, 'keys')
        } else {
          logDebug('📦 DataCache: Cache expired, clearing')
          sessionStorage.removeItem('app_data_cache')
        }
      }
    } catch (error) {
      logWarn('📦 DataCache: Error loading from sessionStorage:', error)
    }
  }, [])

  // Debounced save to sessionStorage — coalesces rapid consecutive cache updates
  const saveDebounceRef = useRef(null)
  useEffect(() => {
    clearTimeout(saveDebounceRef.current)
    saveDebounceRef.current = setTimeout(() => {
      try {
        const toStore = {
          data: cache,
          timestamp: Date.now()
        }
        sessionStorage.setItem('app_data_cache', JSON.stringify(toStore))
      } catch (error) {
        logWarn('📦 DataCache: Error saving to sessionStorage:', error)
        try {
          sessionStorage.removeItem('app_data_cache')
          sessionStorage.setItem('app_data_cache', JSON.stringify({ data: cache, timestamp: Date.now() }))
        } catch (e) {
          logWarn('📦 DataCache: Could not save cache, storage may be full')
        }
      }
    }, 300)
    return () => clearTimeout(saveDebounceRef.current)
  }, [cache])

  /**
   * Get data from cache
   */
  const getCached = useCallback((key) => {
    return cache[key] || null
  }, [cache])

  /**
   * Set data in cache
   */
  const setCached = useCallback((key, data, ttl = 3600000) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
        ttl
      }
    }))
  }, [])

  /**
   * Fetch data with caching
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function that returns a Promise with the data
   * @param {Object} options - { force: boolean, ttl: number }
   */
  const fetchWithCache = useCallback(async (key, fetchFn, options = {}) => {
    const { force = false, ttl = 3600000 } = options

    // Check if already loading (prevent duplicate requests)
    if (pendingRequests.current[key] && !force) {
      return pendingRequests.current[key]
    }

    // Check cache first (unless forced)
    if (!force) {
      const cached = cache[key]
      if (cached) {
        const age = Date.now() - cached.timestamp
        if (age < cached.ttl) {
          logDebug(`✅ DataCache: Using cached data for ${key} (age: ${Math.round(age / 1000)}s)`)
          return { data: cached.data, fromCache: true }
        } else {
          logDebug(`⏰ DataCache: Cache expired for ${key}, fetching fresh data`)
        }
      }
    }

    // Set loading state
    setLoadingStates(prev => ({ ...prev, [key]: true }))

    // Create request promise
    const requestPromise = (async () => {
      try {
        const result = await fetchFn()
        const data = result?.data !== undefined ? result.data : result
        
        // Store in cache
        setCached(key, data, ttl)
        
        return { data, fromCache: false }
      } catch (error) {
        logError(error, `DataCache - Error fetching ${key}`)
        // Return cached data if available (even if expired) as fallback
        const cached = cache[key]
        if (cached?.data) {
          logDebug(`📦 DataCache: Using stale cache for ${key} due to error`)
          return { data: cached.data, fromCache: true, error }
        }
        throw error
      } finally {
        setLoadingStates(prev => {
          const newState = { ...prev }
          delete newState[key]
          return newState
        })
        delete pendingRequests.current[key]
      }
    })()

    // Store pending request
    pendingRequests.current[key] = requestPromise

    return requestPromise
  }, [cache, setCached])

  /**
   * Invalidate cache for a key or pattern
   */
  const invalidateCache = useCallback((keyOrPattern) => {
    if (typeof keyOrPattern === 'string') {
      // Exact match
      setCache(prev => {
        const newCache = { ...prev }
        delete newCache[keyOrPattern]
        return newCache
      })
    } else if (keyOrPattern instanceof RegExp) {
      // Pattern match
      setCache(prev => {
        const newCache = { ...prev }
        Object.keys(newCache).forEach(key => {
          if (keyOrPattern.test(key)) {
            delete newCache[key]
          }
        })
        return newCache
      })
    }
  }, [])

  /**
   * Clear all cache
   */
  const clearCache = useCallback(() => {
    setCache({})
    sessionStorage.removeItem('app_data_cache')
  }, [])

  /**
   * Check if data is loading
   */
  const isLoading = useCallback((key) => {
    return loadingStates[key] === true
  }, [loadingStates])

  /**
   * Get cache stats
   */
  const getCacheStats = useCallback(() => {
    const keys = Object.keys(cache)
    const totalSize = JSON.stringify(cache).length
    return {
      keys: keys.length,
      size: totalSize,
      sizeKB: (totalSize / 1024).toFixed(2)
    }
  }, [cache])

  const value = useMemo(() => ({
    getCached,
    setCached,
    fetchWithCache,
    invalidateCache,
    clearCache,
    isLoading,
    getCacheStats,
  }), [getCached, setCached, fetchWithCache, invalidateCache, clearCache, isLoading, getCacheStats])

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  )
}

export default DataCacheProvider

