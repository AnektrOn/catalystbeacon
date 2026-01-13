import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePageTransition } from '../contexts/PageTransitionContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const { startTransition, endTransition } = usePageTransition()
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
    e.stopPropagation()
    
    console.log('Form submitted', { formData })
    
    // Validate form first
    const isValid = validateForm()
    console.log('Form validation result:', isValid, { errors })
    
    if (!isValid) {
      console.log('Form validation failed, showing errors')
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          errorElement.focus()
        }
      }
      return
    }
    
    setLoading(true)
    setErrors({})

    // Force minimum loading time of 500ms for smooth transition
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 500))

    try {
      console.log('Calling signUp function...')
      // Security: Password comes from user input (formData.password), never hardcoded
      // All passwords are user-provided and validated before submission
      const [signUpResult] = await Promise.all([
        signUp(formData.email, formData.password, { full_name: formData.fullName.trim() }),
        minLoadingTime
      ])
      
      console.log('SignUp result:', signUpResult)
      const { data, error } = signUpResult || {}
      
      if (error) {
        console.error('SignUp error:', error)
        toast.error(error.message || 'Failed to create account')
        setLoading(false)
      } else {
        console.log('SignUp successful, data:', data)
        // Check if user was immediately signed in (email confirmation disabled)
        if (data?.user && data?.session) {
          // User is signed in, redirect to dashboard (keep loader visible)
          console.log('User signed in immediately, redirecting to dashboard')
          setTimeout(() => {
            navigate('/dashboard?new_user=true')
          }, 100)
        } else if (data?.user) {
          // User needs to verify email, redirect to login (keep loader visible)
          console.log('Email confirmation required, redirecting to login')
          setTimeout(() => {
            navigate('/login')
          }, 100)
        } else {
          console.error('Unexpected signup response - no user data')
          toast.error('Account creation completed but unexpected response received')
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('Signup error (catch block):', error)
      toast.error(error?.message || 'An unexpected error occurred')
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-cyan-900/20 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2940&auto=format&fit=crop"
          alt="Inspiring landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-8 left-8 text-white z-20">
          <p className="text-sm opacity-70">Begin your transformation journey</p>
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
                  // Fallback to default logo
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
              Create Your Account to Unleash Your Dreams
            </h1>
            
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full px-4 py-3.5 bg-ethereal-glass border ${
                  errors.email ? 'border-red-500' : 'border-ethereal'
                } rounded-ethereal text-ethereal-text placeholder-ethereal-text/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all`}
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className={`w-full px-4 py-3.5 bg-ethereal-glass border ${
                  errors.fullName ? 'border-red-500' : 'border-ethereal'
                } rounded-ethereal text-ethereal-text placeholder-ethereal-text/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all`}
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>
              )}
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className={`w-full px-4 py-3.5 bg-ethereal-glass border ${
                  errors.password ? 'border-red-500' : 'border-ethereal'
                } rounded-ethereal text-ethereal-text placeholder-ethereal-text/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all pr-12`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
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
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className={`w-full px-4 py-3.5 bg-ethereal-glass border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-ethereal'
                } rounded-ethereal text-ethereal-text placeholder-ethereal-text/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all pr-12`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-3 mt-6">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-white/60 cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 underline">
                  Terms of Service
                </Link>
                ,{' '}
                <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link to="/cookies" className="text-emerald-400 hover:text-emerald-300 underline">
                  Data Usage Practices
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-xs text-red-400 -mt-2">{errors.agreeToTerms}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group mt-6"
            >
              {loading ? (
                <>
                  <span>Creating Account...</span>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </>
              ) : (
                <>
                  <span>Start Creating</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-white/40">
            <p>
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </Link>
              ,{' '}
              <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link to="/cookies" className="text-white/60 hover:text-white transition-colors">
                Data Usage Practices
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
