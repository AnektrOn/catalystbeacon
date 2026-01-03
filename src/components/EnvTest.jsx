import React from 'react'

/**
 * Temporary component to test environment variables
 * Remove this after confirming env vars are working
 */
const EnvTest = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
  const apiUrl = process.env.REACT_APP_API_URL
  
  // Get all REACT_APP_ variables
  const allReactAppVars = Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_'))
    .reduce((obj, key) => {
      obj[key] = process.env[key] ? 'SET' : 'NOT SET'
      return obj
    }, {})
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: 'white', 
      border: '2px solid red', 
      padding: '10px', 
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '400px'
    }}>
      <h3 style={{ margin: 0, color: 'red' }}>🔍 Environment Variables Test</h3>
      <div style={{ marginTop: '10px' }}>
        <div><strong>REACT_APP_SUPABASE_URL:</strong> {supabaseUrl ? `✅ SET (${supabaseUrl.substring(0, 30)}...)` : '❌ NOT SET'}</div>
        <div><strong>REACT_APP_SUPABASE_ANON_KEY:</strong> {supabaseKey ? '✅ SET' : '❌ NOT SET'}</div>
        <div><strong>REACT_APP_API_URL:</strong> {apiUrl || 'Not set'}</div>
        <div style={{ marginTop: '10px' }}>
          <strong>All REACT_APP_ vars:</strong>
          <pre style={{ fontSize: '10px', margin: '5px 0' }}>{JSON.stringify(allReactAppVars, null, 2)}</pre>
        </div>
        <div style={{ marginTop: '10px', fontSize: '10px', color: 'gray' }}>
          NODE_ENV: {process.env.NODE_ENV}
        </div>
      </div>
    </div>
  )
}

export default EnvTest

