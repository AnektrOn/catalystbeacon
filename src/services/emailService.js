/**
 * Email Service using Supabase Edge Functions
 * This service calls Supabase Edge Functions to send emails
 */

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

/**
 * Call Supabase Edge Function to send email
 */
async function callEmailFunction(emailType, emailData) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        emailType,
        ...emailData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send email')
    }

    return await response.json()
  } catch (error) {
    console.error('Error calling email function:', error)
    throw error
  }
}

/**
 * Email Service for sending transactional and notification emails
 */
class EmailService {
  /**
   * Send a sign-up confirmation email
   * Uses the server API endpoint (more reliable than Edge Functions)
   * @param {string} email - User's email address
   * @param {string} userName - User's name
   * @returns {Promise<Object>}
   */
  async sendSignUpConfirmation(email, userName) {
    try {
      // Use server API endpoint instead of Edge Function
      const API_URL = process.env.REACT_APP_API_URL || window.location.origin
      
      const response = await fetch(`${API_URL}/api/send-signup-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userName
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to send email' }))
        throw new Error(error.error || 'Failed to send email')
      }

      const result = await response.json()
      console.log('Sign-up confirmation email sent to:', email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending sign-up email:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send a sign-in confirmation email
   * @param {string} email - User's email address
   * @param {string} userName - User's name
   * @param {string} loginTime - Time of login
   * @param {string} ipAddress - IP address (optional)
   * @returns {Promise<Object>}
   */
  async sendSignInConfirmation(email, userName, loginTime, ipAddress = null) {
    try {
      const result = await callEmailFunction('sign-in', {
        email,
        userName,
        loginTime,
        ipAddress
      })
      
      console.log('Sign-in confirmation email sent to:', email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending sign-in email:', error)
      return { success: false, error }
    }
  }

  /**
   * Send a payment confirmation email
   * @param {string} email - User's email address
   * @param {string} userName - User's name
   * @param {string} planName - Subscription plan name
   * @param {string} amount - Payment amount
   * @param {string} currency - Currency code
   * @param {string} subscriptionId - Stripe subscription ID
   * @returns {Promise<Object>}
   */
  async sendPaymentConfirmation(email, userName, planName, amount, currency = 'USD', subscriptionId = null) {
    try {
      const result = await callEmailFunction('payment', {
        email,
        userName,
        planName,
        amount,
        currency,
        subscriptionId
      })
      
      console.log('Payment confirmation email sent to:', email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending payment confirmation email:', error)
      return { success: false, error }
    }
  }

  /**
   * Send a lesson completion email
   * @param {string} email - User's email address
   * @param {string} userName - User's name
   * @param {string} lessonTitle - Completed lesson title
   * @param {string} courseName - Course name
   * @param {number} xpEarned - XP earned from lesson
   * @param {number} totalXP - User's total XP
   * @returns {Promise<Object>}
   */
  async sendLessonCompletion(email, userName, lessonTitle, courseName, xpEarned, totalXP) {
    try {
      const result = await callEmailFunction('lesson-completion', {
        email,
        userName,
        lessonTitle,
        courseName,
        xpEarned,
        totalXP
      })
      
      console.log('Lesson completion email sent to:', email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending lesson completion email:', error)
      return { success: false, error }
    }
  }

  /**
   * Send a new lessons available email
   * @param {string} email - User's email address
   * @param {string} userName - User's name
   * @param {Array} newLessons - Array of new lesson objects {title, courseName, url}
   * @returns {Promise<Object>}
   */
  async sendNewLessonsAvailable(email, userName, newLessons) {
    try {
      const result = await callEmailFunction('new-lessons', {
        email,
        userName,
        newLessons
      })
      
      console.log('New lessons email sent to:', email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending new lessons email:', error)
      return { success: false, error }
    }
  }

  /**
   * Send an app update/announcement email
   * @param {string} email - User's email address
   * @param {string} userName - User's name
   * @param {string} title - Update title
   * @param {string} message - Update message/content
   * @param {string} ctaText - Call-to-action text (optional)
   * @param {string} ctaUrl - Call-to-action URL (optional)
   * @returns {Promise<Object>}
   */
  async sendAppUpdate(email, userName, title, message, ctaText = null, ctaUrl = null) {
    try {
      const result = await callEmailFunction('app-update', {
        email,
        userName,
        title,
        message,
        ctaText,
        ctaUrl
      })
      
      console.log('App update email sent to:', email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending app update email:', error)
      return { success: false, error }
    }
  }

  /**
   * Send a role change email
   * @param {string} email - User's email address
   * @param {string} userName - User's name
   * @param {string} oldRole - Previous role
   * @param {string} newRole - New role
   * @returns {Promise<Object>}
   */
  async sendRoleChange(email, userName, oldRole, newRole) {
    try {
      const result = await callEmailFunction('role-change', {
        email,
        userName,
        oldRole,
        newRole
      })
      
      console.log('Role change email sent to:', email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending role change email:', error)
      return { success: false, error }
    }
  }

  /**
   * Send a subscription cancellation email
   * @param {string} email - User's email address
   * @param {string} userName - User's name
   * @param {string} planName - Cancelled plan name
   * @param {string} cancellationDate - Date of cancellation
   * @returns {Promise<Object>}
   */
  async sendSubscriptionCancelled(email, userName, planName, cancellationDate) {
    try {
      const result = await callEmailFunction('subscription-cancelled', {
        email,
        userName,
        planName,
        cancellationDate
      })
      
      console.log('Subscription cancellation email sent to:', email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending subscription cancellation email:', error)
      return { success: false, error }
    }
  }

  /**
   * Send a renewal reminder email (3 days before)
   * @param {string} email - User's email address
   * @param {string} userName - User's name
   * @param {string} planName - Plan name
   * @param {number} amount - Renewal amount
   * @param {string} currency - Currency code
   * @param {string} renewalDate - Renewal date
   * @param {string} cancelUrl - URL to cancel subscription
   * @returns {Promise<Object>}
   */
  async sendRenewalReminder(email, userName, planName, amount, currency, renewalDate, cancelUrl) {
    try {
      const result = await callEmailFunction('renewal-reminder', {
        email,
        userName,
        planName,
        amount,
        currency,
        renewalDate,
        cancelUrl
      })
      
      console.log('Renewal reminder email sent to:', email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending renewal reminder email:', error)
      return { success: false, error }
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService
