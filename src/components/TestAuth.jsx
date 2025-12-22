import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const TestAuth = () => {
  const { user, profile, signOut } = useAuth()

  const handleTestSignOut = async () => {
    try {
      console.log('Testing sign out...')
      const result = await signOut()
      console.log('Sign out result:', result)
    } catch (error) {
      console.error('Error during sign out:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h3>Auth Test Component</h3>
      <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
      <p><strong>Profile:</strong> {profile ? profile.role : 'Not loaded'}</p>
      <button 
        onClick={handleTestSignOut}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Sign Out
      </button>
    </div>
  )
}

export default TestAuth
