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


    const result = await emailService.sendSignUpConfirmation(email, userName)

    if (result.success) {
      return res.json({ success: true, message: 'Email sent successfully' })
    } else {
      return res.status(500).json({ error: result.error || 'Failed to send email' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

module.exports = sendSignUpEmail

