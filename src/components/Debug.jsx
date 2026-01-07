import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const Debug = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
  const [connectionStatus, setConnectionStatus] = useState('Testing...')

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) {
          setConnectionStatus(`Auth Error: ${error.message}`)
        } else {
          setConnectionStatus('Auth: Connected')
        }
      } catch (err) {
        setConnectionStatus(`Connection Error: ${err.message}`)
      }
    }
    
    testConnection()
  }, [])

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h3>Debug Information</h3>
      <p><strong>Supabase URL:</strong> {supabaseUrl ? 'Present' : 'Missing'}</p>
      <p><strong>Supabase Key:</strong> {supabaseAnonKey ? 'Present' : 'Missing'}</p>
      <p><strong>URL Value:</strong> {supabaseUrl || 'Not set'}</p>
      <p><strong>Key Value:</strong> {supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'Not set'}</p>
      <p><strong>Connection Status:</strong> {connectionStatus}</p>
    </div>
  )
}

export default Debug
