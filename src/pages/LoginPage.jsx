import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePageTransition } from '../contexts/PageTransitionContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const { startTransition, endTransition } = usePageTransition()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Prefer reading from the form DOM for robustness (autofill + programmatic input),
    // then fall back to React state.
    const form = e.currentTarget
    const domEmail = (form?.elements?.email?.value ?? '').toString()
    const domPassword = (form?.elements?.password?.value ?? '').toString()
    const emailValue = (email || domEmail).trim()
    const passwordValue = (password || domPassword).trim()

    // Keep state in sync if the DOM had values (e.g. autofill)
    if (domEmail && domEmail !== email) setEmail(domEmail)
    if (domPassword && domPassword !== password) setPassword(domPassword)
    
    if (!emailValue) {
      toast.error('Please enter your email')
      return
    }
    
    if (!passwordValue) {
      toast.error('Please enter your password')
      return
    }
    
    setLoading(true)

    // Force minimum loading time of 500ms for smooth transition
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 500))

    try {
      // Wait for both the actual sign in AND minimum loading time
      const [signInResult] = await Promise.all([
        signIn(emailValue, passwordValue),
        minLoadingTime
      ])
      
      if (signInResult?.error) {
        toast.error(signInResult.error.message || 'Failed to sign in. Please check your credentials.')
        setLoading(false)
      } else {
        // Keep loader visible during navigation
        setTimeout(() => {
          navigate('/dashboard')
        }, 100)
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Use global loader instead of local loading state
  useEffect(() => {
    if (loading) {
      startTransition();
    } else {
      endTransition();
    }
  }, [loading, startTransition, endTransition]);

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Left Side - Hero Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-orange-900/20 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1623705267866-71d69d886f75?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Tom Bullock"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-8 left-8 text-white z-20">
          <p className="text-sm opacity-70">Picture of Tom Bullock</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center space-x-3">
              <img 
                src="/hc-logo.svg" 
                alt="HC University" 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <span className="text-white text-xl font-semibold tracking-wide">Human Catalyst University</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Welcome Back to Your Journey
            </h1>
            
            <p className="text-white/60 text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3.5 bg-ethereal-glass border border-ethereal rounded-ethereal text-ethereal-text placeholder-ethereal-text/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all pr-12"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-white/40">
            <p>
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
