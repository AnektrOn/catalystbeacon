/**
 * N8N Email Templates
 * 
 * Copy-paste these Function Node codes into your N8N workflows
 * Each template receives emailData from the webhook and returns { to, subject, html }
 */

// ============================================
// 1. SIGN UP EMAIL TEMPLATE (HC Beacon - Ethereal Design)
// ============================================
const signUpTemplate = `
// Sign Up Email Template
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst Beacon';

const html = \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Journey Begins</title>
    <!-- Fonts matching the widget: Cinzel and Rajdhani -->
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        /* Reset & Base */
        body { margin: 0; padding: 0; background-color: #050508; color: #e0e0e0; font-family: 'Rajdhani', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; display: block; max-width: 100%; }
        a { text-decoration: none; color: #a5f3fc; }
        
        /* Mobile Styles */
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 20px !important; }
            .header-text { font-size: 28px !important; }
            .body-text { font-size: 16px !important; line-height: 1.6 !important; }
            .btn-table { width: 100% !important; }
            .btn-link { width: 100% !important; display: block !important; text-align: center !important; }
            .feature-stack { display: block !important; width: 100% !important; padding-bottom: 20px !important; }
        }
    </style>
</head>
<body style="background-color: #050508; margin: 0; padding: 0;">

    <!-- Preheader Text -->
    <div style="display: none; max-height: 0px; overflow: hidden; color: #050508;">
        The path to mastery has opened. Take your first step into the void.
    </div>

    <!-- Main Container Background (Dark Void, No Image) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #050508;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                
                <!-- Email Content Wrapper (Matching Ethereal Card Design) -->
                <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0e; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);">
                    
                    <!-- Top Ethereal Accent (Cyan to Violet Gradient) -->
                    <tr>
                        <td style="height: 2px; background: linear-gradient(90deg, #050508, #a5f3fc, #a78bfa, #050508); font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                    <!-- Header / Logo -->
                    <tr>
                        <td align="center" style="padding: 40px 0 20px 0;">
                            <!-- Logo Text -->
                            <div style="font-family: 'Cinzel', serif; font-size: 28px; font-weight: 600; letter-spacing: 4px; color: #ffffff; text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);">
                                HC <span style="color: #a5f3fc; text-shadow: 0 0 10px rgba(165, 243, 252, 0.5);">BEACON</span>
                            </div>
                            <div style="font-family: 'Rajdhani', sans-serif; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 3px; margin-top: 8px;">
                                The Catalyst Path
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 0 50px 30px 50px;">
                            <h1 class="header-text" style="font-family: 'Cinzel', serif; color: #ffffff; font-size: 36px; font-weight: 400; margin: 0 0 25px 0; text-transform: uppercase; letter-spacing: 1px; text-align: center; line-height: 1.2;">
                                The Path <br/><span style="color: #a78bfa; text-shadow: 0 0 20px rgba(167, 139, 250, 0.4);">Is Open</span>.
                            </h1>
                            
                            <p class="body-text" style="font-family: 'Rajdhani', Arial, sans-serif; color: #e0e0e0; font-size: 18px; line-height: 1.6; margin-bottom: 20px; text-align: left; font-weight: 400;">
                                Greetings, <strong>\${emailData.userName || 'there'}</strong>.
                            </p>
                            
                            <p class="body-text" style="font-family: 'Rajdhani', Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: left; font-weight: 400;">
                                You have taken the first step on a journey of transcendence. While the world sleeps in routine, you have chosen to awaken your potential and seek mastery.
                            </p>

                            <p class="body-text" style="font-family: 'Rajdhani', Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 40px; text-align: left; font-weight: 400;">
                                Your sanctuary is ready. We have prepared your <strong>Personal Roadmap</strong> to guide you through the initial stages of wisdom.
                            </p>

                            <!-- CTA Button (Ethereal Style) -->
                            <table class="btn-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center">
                                        <!-- VML Hack for Outlook button -->
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="\${siteUrl}/dashboard" style="height:54px;v-text-anchor:middle;width:240px;" arcsize="50%" stroke="f" fillcolor="#0a0a0e">
                                        <w:anchorlock/>
                                        <v:stroke color="#a5f3fc" weight="1px"/>
                                        <center>
                                        <![endif]-->
                                            <a href="\${siteUrl}/dashboard" class="btn-link" style="display: inline-block; padding: 16px 40px; background-color: rgba(165, 243, 252, 0.05); border: 1px solid rgba(165, 243, 252, 0.3); color: #a5f3fc; font-family: 'Cinzel', serif; font-weight: 600; font-size: 16px; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">
                                                Enter the Sanctuary
                                            </a>
                                        <!--[if mso]>
                                        </center>
                                        </v:roundrect>
                                        <![endif]-->
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td align="center" style="padding: 20px 50px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); height: 1px;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Features Grid (Icons matching Ethereal Stats Cards) -->
                    <tr>
                        <td style="padding: 10px 40px 50px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" valign="top">
                                        <!-- Column 1: Resonance -->
                                        <table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 10px;">
                                                    <div style="color: #fb923c; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(251, 146, 60, 0.4);">✦</div>
                                                    <div style="font-family: 'Cinzel', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Resonance</div>
                                                    <div style="font-family: 'Rajdhani', Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Build your harmonic streak.</div>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Column 2: Roadmap -->
                                        <table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 10px;">
                                                    <div style="color: #a5f3fc; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">◈</div>
                                                    <div style="font-family: 'Cinzel', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Roadmap</div>
                                                    <div style="font-family: 'Rajdhani', Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Your path to evolution.</div>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Column 3: Toolbox -->
                                        <table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 10px;">
                                                    <div style="color: #a78bfa; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(167, 139, 250, 0.4);">❖</div>
                                                    <div style="font-family: 'Cinzel', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Toolbox</div>
                                                    <div style="font-family: 'Rajdhani', Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Your personal archive.</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: rgba(255, 255, 255, 0.02); padding: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="color: #6b7280; font-size: 11px; font-family: 'Rajdhani', Arial, sans-serif; line-height: 1.6; text-transform: uppercase; letter-spacing: 1px;">
                                        <p style="margin: 0 0 10px 0;">HC Beacon &copy; 2024. The Awakening.</p>
                                        <p style="margin: 0;">
                                            <a href="\${siteUrl}/unsubscribe?email=\${emailData.email}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &nbsp;•&nbsp; 
                                            <a href="\${siteUrl}/support" style="color: #6b7280; text-decoration: underline;">Guide</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                
                <!-- Bottom Spacer & Address -->
                <div style="height: 40px;"></div>
                <div style="color: #4b5563; font-size: 10px; font-family: 'Rajdhani', Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase;">
                    Sent with Intention
                </div>

            </td>
        </tr>
    </table>

</body>
</html>\`;

return {
  json: {
    to: emailData.email,
    subject: \`The Path Is Open. Your Journey Begins.\`,
    html: html
  }
};
`;

// ============================================
// 2. SUBSCRIPTION PURCHASED TEMPLATE
// ============================================
const subscriptionPurchasedTemplate = `
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst Beacon';
const formattedAmount = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: emailData.currency || 'USD',
}).format(emailData.amount || 0);

const html = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to \${emailData.planName}!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to \${emailData.planName}!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello \${emailData.userName || 'there'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your subscription! Your payment has been successfully processed.</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Plan:</strong> \${emailData.planName}</p>
      <p style="margin: 10px 0;"><strong>Amount:</strong> \${formattedAmount}</p>
      \${emailData.subscriptionId ? \`<p style="margin: 10px 0;"><strong>Subscription ID:</strong> \${emailData.subscriptionId}</p>\` : ''}
    </div>
    <div style="text-align: center; margin-top: 30px;">
      <a href="\${siteUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Learning</a>
    </div>
  </div>
</body>
</html>
\`;

return {
  json: {
    to: emailData.email,
    subject: \`Payment Confirmation - Welcome to \${emailData.planName || 'Plan'}!\`,
    html: html
  }
};
`;

// ============================================
// 3. LEVEL UP TEMPLATE
// ============================================
const levelUpTemplate = `
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst Beacon';

const html = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Level Up!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Level Up!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Congratulations \${emailData.userName || 'there'}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">You've reached <strong>Level \${emailData.newLevel}</strong>!</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Previous Level:</strong> \${emailData.oldLevel}</p>
      <p style="margin: 10px 0;"><strong>New Level:</strong> <span style="color: #667eea; font-weight: bold;">\${emailData.newLevel}</span></p>
      <p style="margin: 10px 0;"><strong>Total XP:</strong> \${emailData.totalXP || 0}</p>
      \${emailData.levelTitle ? \`<p style="margin: 10px 0;"><strong>Level Title:</strong> \${emailData.levelTitle}</p>\` : ''}
    </div>
    <div style="text-align: center; margin-top: 30px;">
      <a href="\${siteUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a>
    </div>
  </div>
</body>
</html>
\`;

return {
  json: {
    to: emailData.email,
    subject: \`🎉 Level Up! You're now Level \${emailData.newLevel}\`,
    html: html
  }
};
`;

// ============================================
// 4. LESSON COMPLETED TEMPLATE
// ============================================
const lessonCompletedTemplate = `
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst Beacon';

const html = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lesson Completed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Lesson Completed!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Great job, \${emailData.userName || 'there'}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">You've successfully completed:</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #333;">\${emailData.lessonTitle || 'Lesson'}</h2>
      <p style="margin: 10px 0; color: #666;">\${emailData.courseName || 'Course'}</p>
    </div>
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="margin: 5px 0; color: white; font-size: 18px;"><strong>+\${emailData.xpEarned || 0} XP Earned!</strong></p>
      <p style="margin: 5px 0; color: white; font-size: 14px;">Total XP: \${emailData.totalXP || 0}</p>
    </div>
    <div style="text-align: center; margin-top: 30px;">
      <a href="\${emailData.nextLessonUrl || siteUrl + '/dashboard'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Continue Learning</a>
    </div>
  </div>
</body>
</html>
\`;

return {
  json: {
    to: emailData.email,
    subject: \`🎉 Lesson Completed: \${emailData.lessonTitle || 'Lesson'}\`,
    html: html
  }
};
`;

// ============================================
// 5. ACHIEVEMENT UNLOCKED TEMPLATE
// ============================================
const achievementUnlockedTemplate = `
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst Beacon';

const html = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Achievement Unlocked!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🏆 Achievement Unlocked!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Congratulations \${emailData.userName || 'there'}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">You've unlocked a new achievement:</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      \${emailData.badgeImageUrl ? \`<img src="\${emailData.badgeImageUrl}" alt="Badge" style="max-width: 150px; margin-bottom: 15px;">\` : ''}
      <h2 style="margin: 10px 0; color: #333;">\${emailData.badgeTitle || 'Achievement'}</h2>
      <p style="margin: 10px 0; color: #666;">\${emailData.badgeDescription || ''}</p>
      <p style="margin: 10px 0; color: #667eea; font-weight: bold;">+\${emailData.xpReward || 0} XP</p>
    </div>
    <div style="text-align: center; margin-top: 30px;">
      <a href="\${siteUrl}/achievements" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View All Achievements</a>
    </div>
  </div>
</body>
</html>
\`;

return {
  json: {
    to: emailData.email,
    subject: \`🏆 Achievement Unlocked: \${emailData.badgeTitle || 'Achievement'}\`,
    html: html
  }
};
`;

// ============================================
// 6. SUBSCRIPTION CANCELLED TEMPLATE
// ============================================
const subscriptionCancelledTemplate = `
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst Beacon';

const html = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Subscription Cancelled</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Subscription Cancelled</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello \${emailData.userName || 'there'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">We're sorry to see you go. Your \${emailData.planName || 'Subscription'} has been cancelled.</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Plan:</strong> \${emailData.planName || 'Subscription'}</p>
      <p style="margin: 10px 0;"><strong>Cancellation Date:</strong> \${emailData.cancellationDate || new Date().toLocaleDateString()}</p>
      \${emailData.accessUntil ? \`<p style="margin: 10px 0;"><strong>Access Until:</strong> \${emailData.accessUntil}</p>\` : ''}
    </div>
    <p style="font-size: 16px; margin-bottom: 20px;">Your subscription will remain active until the end of your current billing period.</p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="\${emailData.reactivateUrl || siteUrl + '/pricing'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reactivate Subscription</a>
    </div>
  </div>
</body>
</html>
\`;

return {
  json: {
    to: emailData.email,
    subject: '⚠️ Subscription Cancelled',
    html: html
  }
};
`;

// ============================================
// 7. ROLE CHANGE TEMPLATE
// ============================================
const roleChangeTemplate = `
const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst Beacon';

const html = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Role Updated</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔄 Role Updated</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello \${emailData.userName || 'there'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Your account role has been updated.</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Previous Role:</strong> \${emailData.oldRole || 'Free'}</p>
      <p style="margin: 10px 0;"><strong>New Role:</strong> <span style="color: #667eea; font-weight: bold;">\${emailData.newRole || 'Free'}</span></p>
    </div>
    <p style="font-size: 16px; margin-bottom: 20px;">You now have access to all \${emailData.newRole || 'Free'} features. Enjoy your enhanced experience!</p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="\${siteUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
    </div>
  </div>
</body>
</html>
\`;

return {
  json: {
    to: emailData.email,
    subject: '🔄 Your Account Role Has Been Updated',
    html: html
  }
};
`;

// Export all templates
module.exports = {
  signUpTemplate,
  subscriptionPurchasedTemplate,
  levelUpTemplate,
  lessonCompletedTemplate,
  achievementUnlockedTemplate,
  subscriptionCancelledTemplate,
  roleChangeTemplate
};
