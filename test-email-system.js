/**
 * Script de test pour vérifier que le système d'email fonctionne
 * Usage: node test-email-system.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './server.env' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans server.env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testEmailSystem() {
  console.log('🧪 Test du système d\'email...\n')

  // Test 1: Vérifier que la table email_queue existe
  console.log('1️⃣ Vérification de la table email_queue...')
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Erreur:', error.message)
      console.log('💡 Solution: Exécutez le fichier supabase/migrations/create_email_system.sql dans Supabase SQL Editor')
      return false
    }
    console.log('✅ Table email_queue existe\n')
  } catch (err) {
    console.error('❌ Erreur:', err.message)
    return false
  }

  // Test 2: Vérifier que la fonction Edge Function existe
  console.log('2️⃣ Vérification de la fonction Edge Function...')
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        emailType: 'sign-in',
        email: 'test@example.com',
        userName: 'Test User',
        loginTime: new Date().toLocaleString()
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Erreur:', error.error || 'Fonction non trouvée')
      console.log('💡 Solution: Déployez la fonction send-email dans Supabase Dashboard')
      return false
    }

    const result = await response.json()
    console.log('✅ Fonction Edge Function fonctionne')
    console.log('   Résultat:', result)
    console.log('')
  } catch (err) {
    console.error('❌ Erreur:', err.message)
    console.log('💡 Solution: Vérifiez que la fonction send-email est déployée')
    return false
  }

  // Test 3: Vérifier qu'un email peut être ajouté à la queue
  console.log('3️⃣ Test d\'ajout d\'email à la queue...')
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .insert({
        to_email: 'test@example.com',
        subject: 'Test Email',
        html_content: '<p>Test</p>',
        email_type: 'test',
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erreur:', error.message)
      return false
    }

    console.log('✅ Email ajouté à la queue avec succès')
    console.log('   ID:', data.id)
    console.log('')

    // Nettoyer le test
    await supabase
      .from('email_queue')
      .delete()
      .eq('id', data.id)

    console.log('🧹 Email de test supprimé\n')
  } catch (err) {
    console.error('❌ Erreur:', err.message)
    return false
  }

  // Test 4: Vérifier la configuration SMTP (si possible)
  console.log('4️⃣ Vérification de la configuration SMTP...')
  console.log('   ⚠️  Note: La configuration SMTP doit être vérifiée manuellement dans Supabase Dashboard')
  console.log('   📍 Allez sur: Settings → Auth → SMTP Settings')
  console.log('   ✅ Vérifiez que "Enable Custom SMTP" est activé\n')

  console.log('✅ Tous les tests sont passés!')
  console.log('\n📧 Pour tester un email réel:')
  console.log('   1. Connectez-vous à votre application')
  console.log('   2. Vérifiez votre boîte email')
  console.log('   3. Vous devriez recevoir un email de confirmation de connexion\n')

  return true
}

// Exécuter les tests
testEmailSystem()
  .then(success => {
    if (success) {
      console.log('🎉 Le système d\'email est prêt!')
      process.exit(0)
    } else {
      console.log('\n❌ Certains tests ont échoué. Vérifiez les solutions ci-dessus.')
      process.exit(1)
    }
  })
  .catch(err => {
    console.error('❌ Erreur fatale:', err)
    process.exit(1)
  })

