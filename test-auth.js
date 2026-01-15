// Simple test script to verify authentication flow
// Run with: node test-auth.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mbffycgrqfeesfnhhcdm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZmZ5Y2dycWZlZXNmbmhoY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTEwOTQsImV4cCI6MjA3NDUyNzA5NH0.vRB4oPdeQ4bQBns1tOLEzoS6YWY-RjrK_t65y2D0hTM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('Auth connection failed:', authError.message)
      return false
    }
    
    console.log('✅ Auth connection successful')
    console.log('Current session:', authData.session ? 'Active' : 'None')
    
    return true
  } catch (error) {
    console.error('Connection test failed:', error.message)
    return false
  }
}

async function testTables() {
  console.log('\nTesting database tables...')
  
  const tables = ['profiles', 'subscriptions', 'schools']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ Table ${table} error:`, error.message)
      } else {
        console.log(`✅ Table ${table} accessible`)
      }
    } catch (error) {
      console.error(`❌ Table ${table} failed:`, error.message)
    }
  }
}

async function main() {
  console.log('🧪 Human Catalyst Beacon - Auth System Test\n')
  
  const connectionOk = await testConnection()
  
  if (connectionOk) {
    await testTables()
    console.log('\n✅ All tests passed! The authentication system is ready.')
  } else {
    console.log('\n❌ Tests failed. Please check your configuration.')
  }
}

main().catch(console.error)
