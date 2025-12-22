import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.jsx:7',message:'ProtectedRoute render',data:{loading,hasUser:!!user,userId:user?.id,hasProfile:!!profile,profileId:profile?.id,requiredRole,currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, [loading, user, profile, requiredRole, location.pathname]);
  // #endregion

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.jsx:21',message:'ProtectedRoute redirecting to login - no user',data:{currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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
