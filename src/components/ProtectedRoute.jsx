import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Ne plus bloquer avec un loader si on a déjà un user et profile
  // Cela évite l'impression de rechargement à chaque navigation ou changement de fenêtre
  // Le loading ne doit bloquer que lors du premier chargement de l'app
  if (loading && (!user || !profile)) {
    // Seulement montrer le loader lors de l'initialisation initiale (pas de user ou profile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Si on a user et profile mais loading est true (ex: TOKEN_REFRESHED),
  // on ignore le loading et on affiche le contenu

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
