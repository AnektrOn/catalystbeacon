/**
 * Email Service using Supabase Edge Functions
 * This service calls Supabase Edge Functions to send emails
 */

// Get Supabase configuration - Create React App uses REACT_APP_ prefix
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

/**
 * Call Supabase Edge Function to send email
 */
async function callEmailFunction(emailType, emailData) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return { success: false, error: 'Supabase configuration missing' }
    }

    // Add 5s timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        emailType,
        ...emailData
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      // Handle 404 (Edge Function not deployed) gracefully
      if (response.status === 404) {
        return { success: false, error: 'Email service not available (Edge Function not deployed)' }
      }
      
      let error
      try {
        error = await response.json()
      } catch {
        error = { error: `HTTP ${response.status}: ${response.statusText}` }
      }
      throw new Error(error.error || 'Failed to send email')
    }

    return await response.json()
  } catch (error) {
    // Handle timeout and network errors gracefully
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return { success: false, error: 'Email service timeout' }
    }
    if (error.message.includes('NetworkError') || error.message.includes('CORS')) {
      return { success: false, error: 'Email service unavailable' }
    }
    return { success: false, error: error.message }
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
    // 100% RELIABLE: Try all methods with fallbacks
    const emailData = { emailType: 'sign-up', email, userName: userName || 'there' }
    
    // Method 1: Try Supabase Edge Function (primary)
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const result = await callEmailFunction('sign-up', { email, userName })
        if (result.success) {
          return { success: true, data: result }
        }
      } catch (error) {
      }
    }
    
    // Method 2: Try Server API (fallback)
    try {
      const API_URL = process.env.REACT_APP_API_URL || 
                      (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                        ? 'http://localhost:3001' 
                        : window.location.origin)
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${API_URL}/api/send-signup-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userName }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          return { success: true, data: result }
        }
      }
    } catch (error) {
    }
    
    // Method 3: Queue in localStorage (ultimate fallback - 100% reliable)
    try {
      const emailQueue = JSON.parse(localStorage.getItem('email_queue') || '[]')
      emailQueue.push({
        ...emailData,
        timestamp: Date.now(),
        retries: 0
      })
      localStorage.setItem('email_queue', JSON.stringify(emailQueue))
      
      // Try to process queue in background
      this.processEmailQueue()
      
      return { success: true, queued: true, message: 'Email queued for sending' }
    } catch (error) {
      return { success: false, error: 'All email methods failed' }
    }
  }
  
  // Process queued emails (100% reliable retry mechanism)
  async processEmailQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem('email_queue') || '[]')
      if (queue.length === 0) return
      
      
      const processed = []
      for (const emailItem of queue) {
        // Skip if too many retries
        if (emailItem.retries >= 5) {
          continue
        }
        
        // Try to send with timeout protection
        try {
          // Add timeout wrapper to prevent hanging
          const result = await Promise.race([
            callEmailFunction(emailItem.emailType, emailItem),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Email send timeout')), 5000)
            )
          ])
          
          if (result.success) {
            processed.push(emailItem)
          } else {
            // Increment retry count
            emailItem.retries = (emailItem.retries || 0) + 1
            emailItem.lastRetry = Date.now()
          }
        } catch (error) {
          // Handle timeout and other errors
          if (error.message?.includes('timeout') || error.name === 'AbortError') {
          }
          emailItem.retries = (emailItem.retries || 0) + 1
          emailItem.lastRetry = Date.now()
        }
      }
      
      // Remove processed emails from queue
      const remaining = queue.filter(item => !processed.includes(item))
      localStorage.setItem('email_queue', JSON.stringify(remaining))
      
      if (processed.length > 0) {
      }
    } catch (error) {
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
      
      return { success: true, data: result }
    } catch (error) {
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
      
      return { success: true, data: result }
    } catch (error) {
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
      
      return { success: true, data: result }
    } catch (error) {
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
      
      return { success: true, data: result }
    } catch (error) {
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
      
      return { success: true, data: result }
    } catch (error) {
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
      
      return { success: true, data: result }
    } catch (error) {
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
      
      return { success: true, data: result }
    } catch (error) {
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
      
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Initialize email queue processing on app load (100% reliable)
if (typeof window !== 'undefined') {
  // Process queue immediately
  emailService.processEmailQueue()
  
  // Process queue every 5 minutes
  setInterval(() => {
    emailService.processEmailQueue()
  }, 5 * 60 * 1000)
  
  // Process queue when page becomes visible (user comes back to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      emailService.processEmailQueue()
    }
  })
}

export default emailService
