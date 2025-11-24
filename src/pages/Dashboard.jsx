import React, { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { User, CreditCard, Award, BookOpen, Settings as SettingsIcon, Target, Users } from 'lucide-react'
import SignupTest from '../components/SignupTest'

const Dashboard = () => {
  const { user, profile, signOut, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Handle payment success redirect
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')

    if (payment === 'success' && sessionId && user) {
      // Show alert to confirm payment success
      alert('🎉 Payment completed! Processing your subscription...')

      console.log('Payment success detected:', { sessionId, userId: user.id })

      // Call payment success endpoint to update role
      fetch(`http://localhost:3001/api/payment-success?session_id=${sessionId}`)
        .then(response => response.json())
        .then(data => {
          console.log('Payment success response:', data)
          alert(`✅ Subscription activated! Your role is now: ${data.role}`)

          // Refresh profile to get updated subscription status
          fetchProfile(user.id)

          // Clean up URL
          navigate('/dashboard', { replace: true })
        })
        .catch(error => {
          console.error('Error processing payment success:', error)
          alert('⚠️ Payment completed but there was an error updating your subscription. Please refresh the page.')

          // Still try to refresh profile
          fetchProfile(user.id)
          navigate('/dashboard', { replace: true })
        })
    }
  }, [searchParams, user, fetchProfile, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const userRole = profile?.role || 'Free'
  const displayName = profile?.full_name || user?.email || 'User'

  return (
    <div className="w-full">
      {/* Mobile-Optimized Header */}
      <header className="mb-6">
        <div className="dashboard-header flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Welcome back, {displayName}</p>
          </div>
          <div className="dashboard-header-actions flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${userRole === 'Free' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                userRole === 'Student' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                  userRole === 'Teacher' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                    'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
              {userRole}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Profile Card */}
            <div className="dashboard-card bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-slate-600/50">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-medium text-lg">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-slate-400 truncate">
                        Profile
                      </dt>
                      <dd className="text-base sm:text-lg font-medium text-white truncate">
                        {displayName}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/30 px-4 sm:px-5 py-3">
                <div className="text-sm">
                  <button
                    onClick={() => navigate('/profile')}
                    className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View profile →
                  </button>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="dashboard-card bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-slate-600/50">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-slate-400 truncate">
                        Subscription
                      </dt>
                      <dd className="text-base sm:text-lg font-medium text-white truncate">
                        {userRole}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/30 px-4 sm:px-5 py-3">
                <div className="text-sm">
                  <button
                    onClick={() => navigate('/pricing')}
                    className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {userRole === 'Free' ? 'Upgrade plan →' : 'Manage subscription →'}
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="dashboard-card bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-slate-600/50">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-slate-400 truncate">
                        Level
                      </dt>
                      <dd className="text-base sm:text-lg font-medium text-white truncate">
                        Level {profile?.level || 1}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/30 px-4 sm:px-5 py-3">
                <div className="text-sm">
                  <span className="text-yellow-400 font-medium">
                    {profile?.current_xp || 0} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signup Test - Remove in production - Hide on mobile */}
          <div className="hidden lg:block">
            <SignupTest />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="dashboard-quick-actions grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-slate-600/50 hover:border-emerald-500/50"
              >
                <div className="text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-white" />
                  <div className="text-xs sm:text-sm font-medium text-white">Profile</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-slate-600/50 hover:border-emerald-500/50"
              >
                <div className="text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-white" />
                  <div className="text-xs sm:text-sm font-medium text-white">Pricing</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/courses')}
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-slate-600/50 hover:border-emerald-500/50"
              >
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-white" />
                  <div className="text-xs sm:text-sm font-medium text-white">Courses</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/mastery')}
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-slate-600/50 hover:border-emerald-500/50"
              >
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-white" />
                  <div className="text-xs sm:text-sm font-medium text-white">Mastery</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/community')}
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-slate-600/50 hover:border-emerald-500/50"
              >
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-white" />
                  <div className="text-xs sm:text-sm font-medium text-white">Community</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard