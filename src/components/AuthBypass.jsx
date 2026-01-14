import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthBypass = () => {
  const [isBypassing, setIsBypassing] = useState(false)
  const navigate = useNavigate()

  const bypassAuth = () => {
    setIsBypassing(true)
    // Clear any existing auth state
    // Clear all Supabase auth tokens from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key)
      }
    })
    sessionStorage.clear()
    
    // Navigate to login
    navigate('/login')
  }

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <h3 className="font-semibold mb-2 text-yellow-800">Auth Bypass (Debug)</h3>
      <p className="text-sm text-yellow-700 mb-3">
        If the app is stuck in loading, you can bypass the auth check and go directly to login.
      </p>
      <button
        onClick={bypassAuth}
        disabled={isBypassing}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
      >
        {isBypassing ? 'Bypassing...' : 'Go to Login'}
      </button>
    </div>
  )
}

export default AuthBypass
