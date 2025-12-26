import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }
    
    if (!password.trim()) {
      toast.error('Please enter your password')
      return
    }
    
    setLoading(true)

    try {
      
      const { error } = await signIn(email, password)
      
      if (error) {
        toast.error(error.message || 'Failed to sign in. Please check your credentials.')
      } else {
        // Small delay to ensure auth state is updated before navigation
        // The onAuthStateChange handler will update user state, but we give it a moment
        setTimeout(() => {
          navigate('/dashboard')
        }, 100)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-card max-w-md w-full space-y-6 sm:space-y-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-slate-600/50 shadow-2xl">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-3xl">🎓</span>
            </div>
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-slate-300">
            Or{' '}
            <Link
              to="/signup"
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="auth-form mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-600/50 placeholder-slate-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-600/50 placeholder-slate-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-xs sm:text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="auth-button group relative w-full flex justify-center py-3 sm:py-3.5 px-4 border border-transparent text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
