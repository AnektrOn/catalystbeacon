import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CosmicLoader from '../components/ui/CosmicLoader'

const PageTransitionContext = createContext()

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext)
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider')
  }
  return context
}

export const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)

  useEffect(() => {
    // Show loader when route changes
    setIsTransitioning(true)
    
    // Minimum display time of 500ms
    const minTime = setTimeout(() => {
      setDisplayLocation(location)
      setIsTransitioning(false)
    }, 500)

    return () => clearTimeout(minTime)
  }, [location.pathname])

  const startTransition = () => setIsTransitioning(true)
  const endTransition = () => setIsTransitioning(false)

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, startTransition, endTransition }}>
      {isTransitioning ? (
        <CosmicLoader message="Loading..." />
      ) : (
        children
      )}
    </PageTransitionContext.Provider>
  )
}

