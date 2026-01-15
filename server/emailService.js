/**
 * Email Service using Nodemailer with your own SMTP server
 * Uses your personal email server - no external services needed
 */

const nodemailer = require('nodemailer')

// SMTP Configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT || 587
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465'
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

// Site configuration
const SITE_NAME = process.env.SITE_NAME || 'The Human Catalyst Beacon'
const SITE_URL = process.env.SITE_URL || 'https://app.humancatalystbeacon.com'
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || 'noreply@humancatalystbeacon.com'
const FROM_NAME = process.env.FROM_NAME || SITE_NAME

// Create transporter (reusable)
let transporter = null

function getTransporter() {
  if (transporter) {
    return transporter
  }

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    // Add TLS options for better compatibility
    tls: {
      rejectUnauthorized: false // Set to true in production if you have valid SSL
    }
  })


  return transporter
}

/**
 * Send email using your SMTP server
 */
async function sendEmailViaSMTP(to, subject, html) {
  const mailTransporter = getTransporter()

  if (!mailTransporter) {
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const info = await mailTransporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: html
    })


    return { success: true, data: { messageId: info.messageId } }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get sign-up confirmation email template
 */
function getSignUpConfirmationTemplate(userName, email) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${SITE_NAME}!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to ${SITE_NAME}!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${userName || 'there'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for joining ${SITE_NAME}! We're thrilled to have you on board.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Account Email:</strong> ${email}</p>
      <p style="margin: 10px 0;"><strong>Account Created:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Your account has been successfully created. You can now start your learning journey and explore all the amazing content we have to offer!</p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="margin: 5px 0; color: white; font-size: 18px;"><strong>Ready to get started?</strong></p>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${SITE_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <p style="font-size: 14px; color: #666; margin-bottom: 10px;"><strong>What's next?</strong></p>
      <ul style="font-size: 14px; color: #666; padding-left: 20px;">
        <li>Explore our courses and lessons</li>
        <li>Complete your profile</li>
        <li>Start earning XP and leveling up</li>
        <li>Join our community</li>
      </ul>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message from ${SITE_NAME}. If you have any questions, please contact our support team.</p>
  </div>
</body>
</html>
  `
}

/**
 * Send sign-up confirmation email
 */
async function sendSignUpConfirmation(email, userName) {
  const html = getSignUpConfirmationTemplate(userName, email)
  const subject = `🎉 Welcome to ${SITE_NAME}!`
  
  return await sendEmailViaSMTP(email, subject, html)
}

module.exports = {
  sendSignUpConfirmation,
  sendEmailViaSMTP
}
