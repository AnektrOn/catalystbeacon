// Role Change Email Template - Design Éthéré (Dark) - Matching App Design
// Copiez ce code dans un Function Node après le Switch Node (branche "role-change")

const emailData = $input.item.json;
const siteUrl = 'https://app.humancatalystbeacon.com';
const siteName = 'The Human Catalyst Beacon';

// Extraire les variables
const userName = emailData.userName || 'there';
const userEmail = emailData.email || 'unknown@example.com';
const oldRole = emailData.oldRole || 'Free';
const newRole = emailData.newRole || 'Free';

// Construire le HTML avec concaténation (évite les erreurs N8N)
const htmlParts = [];

htmlParts.push('<!DOCTYPE html>');
htmlParts.push('<html lang="en">');
htmlParts.push('<head>');
htmlParts.push('<meta charset="UTF-8">');
htmlParts.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
htmlParts.push('<title>Ascension Complete</title>');
htmlParts.push('<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600&display=swap" rel="stylesheet">');
htmlParts.push('<style>');
htmlParts.push('body { margin: 0; padding: 0; background-color: #050508; color: #e0e0e0; font-family: "Rajdhani", Arial, sans-serif; -webkit-font-smoothing: antialiased; }');
htmlParts.push('table { border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; }');
htmlParts.push('img { border: 0; display: block; max-width: 100%; height: auto; }');
htmlParts.push('a { text-decoration: none; color: #a5f3fc; }');
htmlParts.push('@media only screen and (max-width: 600px) {');
htmlParts.push('table[width="600"] { width: 100% !important; max-width: 100% !important; }');
htmlParts.push('td[style*="padding: 0 50px"] { padding: 0 20px !important; }');
htmlParts.push('td[style*="padding: 40px 0"] { padding: 20px 0 !important; }');
htmlParts.push('td[style*="padding: 40px 0 20px 0"] { padding: 30px 0 15px 0 !important; }');
htmlParts.push('h1 { font-size: 28px !important; line-height: 1.3 !important; }');
htmlParts.push('p { font-size: 16px !important; line-height: 1.6 !important; }');
htmlParts.push('table[class="btn-table"] { width: 100% !important; }');
htmlParts.push('a[class="btn-link"] { width: 100% !important; max-width: 100% !important; display: block !important; text-align: center !important; padding: 14px 20px !important; font-size: 14px !important; box-sizing: border-box !important; }');
htmlParts.push('table[class="feature-stack"] { width: 100% !important; max-width: 100% !important; display: block !important; margin-bottom: 20px !important; }');
htmlParts.push('td[style*="padding: 10px 40px"] { padding: 10px 20px !important; }');
htmlParts.push('td[align="center"][valign="top"] { display: block !important; width: 100% !important; }');
htmlParts.push('div[style*="font-size: 28px"] { font-size: 24px !important; }');
htmlParts.push('div[style*="font-size: 36px"] { font-size: 28px !important; }');
htmlParts.push('}');
htmlParts.push('</style>');
htmlParts.push('</head>');
htmlParts.push('<body style="background-color: #050508; margin: 0; padding: 0;">');

// Preheader
htmlParts.push('<div style="display: none; max-height: 0px; overflow: hidden; color: #050508;">You have ascended. The veil has been lifted. Full access unlocked.</div>');

// Main Container
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #050508;">');
htmlParts.push('<tr><td align="center" style="padding: 40px 0;">');

// Email Content Wrapper (Ethereal Card Design)
htmlParts.push('<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0e; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);">');

// Top Ethereal Accent (Cyan to Violet Gradient)
htmlParts.push('<tr><td style="height: 2px; background: linear-gradient(90deg, #050508, #a5f3fc, #a78bfa, #050508); font-size: 0; line-height: 0;">&nbsp;</td></tr>');

// Header / Logo
htmlParts.push('<tr><td align="center" style="padding: 40px 0 20px 0;">');
htmlParts.push('<div style="font-family: "Cinzel", serif; font-size: 28px; font-weight: 600; letter-spacing: 4px; color: #ffffff; text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);">');
htmlParts.push('HC <span style="color: #a5f3fc; text-shadow: 0 0 10px rgba(165, 243, 252, 0.5);">BEACON</span>');
htmlParts.push('</div>');
htmlParts.push('<div style="font-family: "Rajdhani", sans-serif; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 3px; margin-top: 8px;">The Catalyst Path</div>');
htmlParts.push('</td></tr>');

// Body Content
htmlParts.push('<tr><td style="padding: 0 50px 30px 50px;">');

// Title
htmlParts.push('<h1 style="font-family: "Cinzel", serif; color: #ffffff; font-size: 36px; font-weight: 400; margin: 0 0 25px 0; text-transform: uppercase; letter-spacing: 1px; text-align: center; line-height: 1.2;">');
htmlParts.push('Ascension <br/><span style="color: #a78bfa; text-shadow: 0 0 20px rgba(167, 139, 250, 0.4);">Complete</span>.');
htmlParts.push('</h1>');

// Greeting
htmlParts.push('<p style="font-family: "Rajdhani", Arial, sans-serif; color: #e0e0e0; font-size: 18px; line-height: 1.6; margin-bottom: 20px; text-align: left; font-weight: 400;">');
htmlParts.push('Greetings, <strong>' + userName + '</strong>.');
htmlParts.push('</p>');

// Main Message
htmlParts.push('<p style="font-family: "Rajdhani", Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: left; font-weight: 400;">');
htmlParts.push('Your dedication to mastery has been recognized. You have successfully ascended from <strong>' + oldRole + '</strong> to <strong>' + newRole + '</strong>. The veil has been lifted.');
htmlParts.push('</p>');

htmlParts.push('<p style="font-family: "Rajdhani", Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: left; font-weight: 400;">');
htmlParts.push('The <strong>Stellar Map</strong> is now fully interactive. Every constellation of knowledge, every certificate, and every deep-dive module is open to you.');
htmlParts.push('</p>');

// Role Change Info Box
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(165, 243, 252, 0.05); border: 1px solid rgba(165, 243, 252, 0.2); border-radius: 8px; margin-bottom: 30px;">');
htmlParts.push('<tr><td style="padding: 20px;">');
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0">');
htmlParts.push('<tr><td style="padding-bottom: 10px; border-bottom: 1px solid rgba(165, 243, 252, 0.1);">');
htmlParts.push('<div style="font-family: "Cinzel", serif; color: #a5f3fc; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Previous Tier</div>');
htmlParts.push('<div style="font-family: "Rajdhani", Arial, sans-serif; color: #888; font-size: 16px;">' + oldRole + '</div>');
htmlParts.push('</td></tr>');
htmlParts.push('<tr><td style="padding-top: 10px;">');
htmlParts.push('<div style="font-family: "Cinzel", serif; color: #a78bfa; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">New Tier</div>');
htmlParts.push('<div style="font-family: "Rajdhani", Arial, sans-serif; color: #ffffff; font-size: 18px; font-weight: 500;">' + newRole + '</div>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');

// CTA Button
htmlParts.push('<table class="btn-table" width="100%" cellpadding="0" cellspacing="0" border="0">');
htmlParts.push('<tr><td align="center">');
htmlParts.push('<a href="' + siteUrl + '/dashboard" class="btn-link" style="display: inline-block; padding: 16px 40px; background-color: rgba(165, 243, 252, 0.05); border: 1px solid rgba(165, 243, 252, 0.3); color: #a5f3fc; font-family: "Cinzel", serif; font-weight: 600; font-size: 16px; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">');
htmlParts.push('Enter The Stellar Map');
htmlParts.push('</a>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('</td></tr>');

// Divider
htmlParts.push('<tr><td align="center" style="padding: 20px 50px;">');
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0">');
htmlParts.push('<tr><td style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); height: 1px;"></td></tr>');
htmlParts.push('</table>');
htmlParts.push('</td></tr>');

// Features Grid (Unlocked Items)
htmlParts.push('<tr><td style="padding: 10px 40px 50px 40px;">');
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0">');
htmlParts.push('<tr><td align="center" valign="top">');

// Feature 1: Stellar Map
htmlParts.push('<table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">');
htmlParts.push('<tr><td align="center" style="padding: 10px;">');
htmlParts.push('<div style="color: #fb923c; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(251, 146, 60, 0.4);">✦</div>');
htmlParts.push('<div style="font-family: "Cinzel", serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Stellar Map</div>');
htmlParts.push('<div style="font-family: "Rajdhani", Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Full 3D Navigation.</div>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');

// Feature 2: Library
htmlParts.push('<table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">');
htmlParts.push('<tr><td align="center" style="padding: 10px;">');
htmlParts.push('<div style="color: #a5f3fc; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">◈</div>');
htmlParts.push('<div style="font-family: "Cinzel", serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Library</div>');
htmlParts.push('<div style="font-family: "Rajdhani", Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Unlimited archives.</div>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');

// Feature 3: Diplomas
htmlParts.push('<table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">');
htmlParts.push('<tr><td align="center" style="padding: 10px;">');
htmlParts.push('<div style="color: #a78bfa; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(167, 139, 250, 0.4);">❖</div>');
htmlParts.push('<div style="font-family: "Cinzel", serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Diplomas</div>');
htmlParts.push('<div style="font-family: "Rajdhani", Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Verify your mastery.</div>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');

htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('</td></tr>');

// Footer
htmlParts.push('<tr><td style="background-color: rgba(255, 255, 255, 0.02); padding: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05);">');
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0">');
htmlParts.push('<tr><td align="center" style="color: #6b7280; font-size: 11px; font-family: "Rajdhani", Arial, sans-serif; line-height: 1.6; text-transform: uppercase; letter-spacing: 1px;">');
htmlParts.push('<p style="margin: 0 0 10px 0;">HC Beacon &copy; 2024. Plan: ' + newRole + '.</p>');
htmlParts.push('<p style="margin: 0;">');
htmlParts.push('<a href="' + siteUrl + '/settings/billing" style="color: #6b7280; text-decoration: underline;">Manage Subscription</a> &nbsp;•&nbsp; ');
htmlParts.push('<a href="' + siteUrl + '/support" style="color: #6b7280; text-decoration: underline;">Support</a>');
htmlParts.push('</p>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('</td></tr>');

htmlParts.push('</table>');
htmlParts.push('<div style="height: 40px;"></div>');
htmlParts.push('<div style="color: #4b5563; font-size: 10px; font-family: "Rajdhani", Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase;">Sent with Intention</div>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('</body>');
htmlParts.push('</html>');

const html = htmlParts.join('');

return {
  json: {
    to: userEmail,
    from: siteName + ' <noreply@humancatalystbeacon.com>',
    subject: 'Ascension Complete. Full Access Unlocked.',
    html: html
  }
};
