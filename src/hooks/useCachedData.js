import { useEffect, useState, useCallback } from 'react'
import { useDataCache } from '../contexts/DataCacheContext'

/**
 * Hook for fetching and caching data
 * Provides loading state, error handling, and automatic caching
 * 
 * @param {string} cacheKey - Unique key for caching
 * @param {Function} fetchFn - Async function that returns data
 * @param {Array} dependencies - Dependencies for when to refetch
 * @param {Object} options - { force: boolean, ttl: number, enabled: boolean }
 */
export const useCachedData = (cacheKey, fetchFn, dependencies = [], options = {}) => {
  const { fetchWithCache, getCached, isLoading: cacheIsLoading } = useDataCache()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fromCache, setFromCache] = useState(false)

  const { force = false, ttl = 3600000, enabled = true } = options

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) {
      setLoading(false)
      return
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = getCached(cacheKey)
      if (cached?.data) {
        const age = Date.now() - cached.timestamp
        if (age < cached.ttl) {
          setData(cached.data)
          setFromCache(true)
          setLoading(false)
          setError(null)
          return
        }
      }
    }

    setLoading(true)
    setError(null)
    setFromCache(false)

    try {
      const result = await fetchWithCache(cacheKey, async () => {
        const result = await fetchFn()
        return result?.data !== undefined ? result.data : result
      }, { force: forceRefresh, ttl })

      setData(result.data)
      setFromCache(result.fromCache || false)
    } catch (err) {
      console.error(`❌ useCachedData: Error fetching ${cacheKey}:`, err)
      setError(err)
      // Try to use stale cache as fallback
      const cached = getCached(cacheKey)
      if (cached?.data) {
        setData(cached.data)
        setFromCache(true)
      }
    } finally {
      setLoading(false)
    }
  }, [cacheKey, fetchFn, fetchWithCache, getCached, ttl, enabled, force])

  useEffect(() => {
    fetchData(force)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, force, enabled, ...dependencies])

  const refetch = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  const isLoading = loading || cacheIsLoading(cacheKey)

  return {
    data,
    loading: isLoading,
    error,
    fromCache,
    refetch
  }
}

export default useCachedData

