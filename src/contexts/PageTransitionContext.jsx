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

  useEffect(() => {
    // Désactivé: Ne plus montrer le loader à chaque changement de route
    // Cela causait l'impression d'un rechargement complet de la page
    // Le loader n'est maintenant affiché que manuellement via startTransition()
    
    // Optionnel: Si vous voulez garder une transition très rapide (100ms max)
    // Décommentez les lignes ci-dessous:
    // setIsTransitioning(true)
    // const minTime = setTimeout(() => {
    //   setIsTransitioning(false)
    // }, 100)
    // return () => clearTimeout(minTime)
  }, [location])

  // Safety timeout: always end transition after max 10 seconds to prevent infinite loading
  useEffect(() => {
    if (isTransitioning) {
      const safetyTimeout = setTimeout(() => {
        console.warn('⚠️ PageTransition: Safety timeout reached, forcing endTransition');
        setIsTransitioning(false);
      }, 10000); // 10 seconds max

      return () => clearTimeout(safetyTimeout);
    }
  }, [isTransitioning]);

  const startTransition = () => {
    console.log('🔄 PageTransition: Starting transition');
    setIsTransitioning(true);
  };
  
  const endTransition = () => {
    console.log('✅ PageTransition: Ending transition');
    setIsTransitioning(false);
  };

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, startTransition, endTransition }}>
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

