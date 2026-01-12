/**
 * Exemple d'intégration N8N pour l'envoi d'emails
 * 
 * Remplace la fonction sendEmailViaSupabase() dans server.js
 */

/**
 * Envoie un email via N8N Webhook
 * @param {string} emailType - Type d'email (role-change, subscription-cancelled, etc.)
 * @param {object} emailData - Données de l'email (email, userName, etc.)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendEmailViaN8N(emailType, emailData) {
  try {
    // URL du webhook N8N (configuré dans les variables d'environnement)
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/send-email'
    
    if (!N8N_WEBHOOK_URL) {
      console.warn('⚠️ N8N_WEBHOOK_URL not configured - cannot send email')
      return { success: false, error: 'N8N webhook URL not configured' }
    }

    // Timeout de 10 secondes pour éviter les blocages
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    console.log(`📧 Calling N8N webhook for: ${emailType} to ${emailData.email}`)

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailType,
        ...emailData
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { error: errorText || `HTTP ${response.status}: ${response.statusText}` }
      }
      console.error('❌ N8N webhook error:', error)
      throw new Error(error.error || 'Failed to send email via N8N')
    }

    const result = await response.json()
    console.log('✅ Email sent via N8N:', result)
    return { success: true, ...result }
  } catch (error) {
    // Handle timeout gracefully
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      console.warn('⚠️ Email send timeout via N8N webhook')
      return { success: false, error: 'Email service timeout' }
    }
    
    // Handle network errors
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
      console.error('❌ N8N webhook unavailable (service down?)')
      return { success: false, error: 'Email service unavailable' }
    }
    
    console.error('❌ Error sending email via N8N:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Exemple d'utilisation dans handleSubscriptionUpdate()
 */
async function handleSubscriptionUpdateExample(subscription) {
  // ... code existant pour mettre à jour le profil ...
  
  // Envoi de l'email via N8N (au lieu de sendEmailViaSupabase)
  if (updatedRole !== oldRole && profile.email) {
    try {
      console.log(`📧 Sending role change email via N8N: ${oldRole} → ${updatedRole}`)
      await sendEmailViaN8N('role-change', {
        email: profile.email,
        userName: profile.full_name || 'there',
        oldRole: oldRole,
        newRole: updatedRole
      })
    } catch (emailError) {
      console.error('Error sending role change email:', emailError)
      // Ne pas throw - l'email ne doit pas bloquer la mise à jour du profil
    }
  }
}

/**
 * Exemple d'utilisation pour subscription cancelled
 */
async function handleSubscriptionDeletedExample(subscription) {
  // ... code existant ...
  
  if (profile.email) {
    try {
      await sendEmailViaN8N('subscription-cancelled', {
        email: profile.email,
        userName: profile.full_name || 'there',
        planName: planName,
        cancellationDate: new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError)
    }
  }
}

/**
 * Exemple d'utilisation pour payment confirmation
 */
async function handleCheckoutSessionCompletedExample(session) {
  // ... code existant ...
  
  if (userEmail) {
    try {
      await sendEmailViaN8N('payment', {
        email: userEmail,
        userName: userName || 'there',
        planName: planName,
        amount: amount,
        currency: 'USD',
        subscriptionId: subscriptionId
      })
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError)
    }
  }
}

module.exports = {
  sendEmailViaN8N
}
