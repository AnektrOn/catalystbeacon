import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setErrors({})

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignupPage.jsx:87',message:'Calling signUp - before',data:{email:formData.email.trim(),hasFullName:!!formData.fullName.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Security: Password comes from user input (formData.password), never hardcoded
      // All passwords are user-provided and validated before submission
      const { data, error } = await signUp(formData.email, formData.password, { 
        full_name: formData.fullName.trim() 
      })
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignupPage.jsx:94',message:'signUp returned - after',data:{hasError:!!error,hasData:!!data,hasUser:!!data?.user,hasSession:!!data?.session,userId:data?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (!error) {
        // Check if user was immediately signed in (email confirmation disabled)
        if (data?.user && data?.session) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignupPage.jsx:98',message:'Signup success with session - navigating to dashboard',data:{userId:data?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          // User is signed in, redirect to dashboard
          // Small delay to ensure auth state is updated before navigation
          setTimeout(() => {
            navigate('/dashboard')
          }, 100)
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignupPage.jsx:101',message:'Signup success without session - navigating to login',data:{hasUser:!!data?.user,userId:data?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          // User needs to verify email, redirect to login
          navigate('/login')
        }
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignupPage.jsx:104',message:'Signup catch block',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error('Signup error:', error)
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
              <span className="text-2xl sm:text-3xl">🚀</span>
            </div>
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-slate-300">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="auth-form mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  errors.fullName ? 'border-red-500' : 'border-slate-600/50'
                } placeholder-slate-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base`}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-400">{errors.fullName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  errors.email ? 'border-red-500' : 'border-slate-600/50'
                } placeholder-slate-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  errors.password ? 'border-red-500' : 'border-slate-600/50'
                } placeholder-slate-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base`}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-400">{errors.password}</p>
              )}
              <p className="mt-1.5 text-[10px] sm:text-xs text-slate-400">
                Must be at least 6 characters with uppercase, lowercase, and number
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-600/50'
                } placeholder-slate-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={loading}
                className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 focus:ring-emerald-500 border-slate-600 rounded bg-slate-700/50 mt-0.5"
              />
              <label htmlFor="agreeToTerms" className="ml-2 sm:ml-3 block text-xs sm:text-sm text-slate-300">
                I agree to the{' '}
                <Link to="/terms" className="text-emerald-400 hover:text-emerald-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-xs sm:text-sm text-red-400">{errors.agreeToTerms}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="auth-button group relative w-full flex justify-center py-3 sm:py-3.5 px-4 border border-transparent text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
