import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [testResults, setTestResults] = useState({})

  const runTests = async () => {
    setConnectionStatus('testing')
    const results = {}

    // Test 1: Basic Supabase connection
    try {
      const { error } = await supabase.auth.getSession()
      results.auth = { success: !error, error: error?.message }
    } catch (error) {
      results.auth = { success: false, error: error.message }
    }

    // Test 2: Database connection (profiles table)
    try {
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      results.database = { success: !error, error: error?.message }
    } catch (error) {
      results.database = { success: false, error: error.message }
    }

    // Test 3: Environment variables
    const hasUrl = !!process.env.REACT_APP_SUPABASE_URL
    const hasKey = !!process.env.REACT_APP_SUPABASE_ANON_KEY
    results.env = {
      success: hasUrl && hasKey,
      error: !hasUrl ? 'Missing REACT_APP_SUPABASE_URL' : 
             !hasKey ? 'Missing REACT_APP_SUPABASE_ANON_KEY' : null,
      details: {
        url: process.env.REACT_APP_SUPABASE_URL ? 'Present' : 'Missing',
        key: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
      }
    }

    setTestResults(results)
    setConnectionStatus('completed')
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusBadge = (success) => {
    return success ? (
      <Badge variant="default" className="bg-green-500">✅ Success</Badge>
    ) : (
      <Badge variant="destructive">❌ Failed</Badge>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          {connectionStatus === 'testing' && <Badge variant="secondary">🔄 Testing...</Badge>}
          {connectionStatus === 'completed' && <Badge variant="default">✅ Complete</Badge>}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="font-medium">Environment Variables</span>
            {getStatusBadge(testResults.env?.success)}
          </div>
          {testResults.env?.error && (
            <p className="text-sm text-red-600 ml-4">{testResults.env.error}</p>
          )}
          {testResults.env?.details && (
            <div className="text-sm text-gray-600 ml-4">
              <p>URL: {testResults.env.details.url}</p>
              <p>Key: {testResults.env.details.key}</p>
            </div>
          )}

          <div className="flex items-center justify-between p-3 border rounded">
            <span className="font-medium">Supabase Auth</span>
            {getStatusBadge(testResults.auth?.success)}
          </div>
          {testResults.auth?.error && (
            <p className="text-sm text-red-600 ml-4">{testResults.auth.error}</p>
          )}

          <div className="flex items-center justify-between p-3 border rounded">
            <span className="font-medium">Database Connection</span>
            {getStatusBadge(testResults.database?.success)}
          </div>
          {testResults.database?.error && (
            <p className="text-sm text-red-600 ml-4">{testResults.database.error}</p>
          )}
        </div>

        <Button onClick={runTests} variant="outline" className="w-full">
          Run Tests Again
        </Button>
      </CardContent>
    </Card>
  )
}

export default ConnectionTest
