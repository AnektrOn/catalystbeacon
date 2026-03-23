import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
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

  // Safety timeout: always end transition after max 10 seconds to prevent infinite loading
  useEffect(() => {
    if (isTransitioning) {
      const safetyTimeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 10000);

      return () => clearTimeout(safetyTimeout);
    }
  }, [isTransitioning]);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
  }, []);
  
  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const value = useMemo(
    () => ({ isTransitioning, startTransition, endTransition }),
    [isTransitioning, startTransition, endTransition]
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      {isTransitioning && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CosmicLoader message="Loading..." />
        </div>
      )}
    </PageTransitionContext.Provider>
  )
}

