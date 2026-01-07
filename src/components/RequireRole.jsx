import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Crown, Lock } from 'lucide-react'
import { getUpgradeMessage } from '../lib/permissions'

const RequireRole = ({ 
  children, 
  requiredRole, 
  fallback = null,
  showUpgrade = true 
}) => {
  const { profile } = useAuth()
  
  const userRole = profile?.role || 'Free'
  
  // Check if user has required role
  const hasAccess = () => {
    switch (requiredRole) {
      case 'Student':
        return ['Student', 'Teacher', 'Admin'].includes(userRole)
      case 'Teacher':
        return ['Teacher', 'Admin'].includes(userRole)
      case 'Admin':
        return userRole === 'Admin'
      default:
        return true
    }
  }

  if (hasAccess()) {
    return children
  }

  if (fallback) {
    return fallback
  }

  if (!showUpgrade) {
    return null
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center">
          <Crown className="h-5 w-5 mr-2" />
          Premium Feature
        </CardTitle>
        <CardDescription>
          {getUpgradeMessage(userRole, requiredRole)}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button>
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  )
}

export default RequireRole
