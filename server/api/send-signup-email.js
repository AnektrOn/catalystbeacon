/**
 * API endpoint to send sign-up confirmation email
 * Called from the frontend after successful signup
 */

const emailService = require('../emailService')

async function sendSignUpEmail(req, res) {
  try {
    const { email, userName } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    console.log('📧 Sending sign-up confirmation email to:', email)

    const result = await emailService.sendSignUpConfirmation(email, userName)

    if (result.success) {
      console.log('✅ Sign-up email sent successfully')
      return res.json({ success: true, message: 'Email sent successfully' })
    } else {
      console.error('❌ Failed to send sign-up email:', result.error)
      return res.status(500).json({ error: result.error || 'Failed to send email' })
    }
  } catch (error) {
    console.error('❌ Error in sendSignUpEmail:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

module.exports = sendSignUpEmail

