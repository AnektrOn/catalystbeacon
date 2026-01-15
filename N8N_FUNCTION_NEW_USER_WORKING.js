// Sign Up Email Template - Version Fonctionnelle pour N8N
// Copiez ce code dans un Function Node après le Switch Node (branche "new-user")

const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://app.humancatalystbeacon.com';

// Extraire les variables
const userName = emailData.userName || 'there';
const userEmail = emailData.email || 'unknown@example.com';

// Construire le HTML par parties pour éviter les erreurs
const htmlParts = [];

htmlParts.push('<!DOCTYPE html>');
htmlParts.push('<html lang="en">');
htmlParts.push('<head>');
htmlParts.push('<meta charset="UTF-8">');
htmlParts.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
htmlParts.push('<title>Your Journey Begins</title>');
htmlParts.push('<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600&display=swap" rel="stylesheet">');
htmlParts.push('<style>');
htmlParts.push('body { margin: 0; padding: 0; background-color: #050508; color: #e0e0e0; font-family: "Rajdhani", Arial, sans-serif; }');
htmlParts.push('table { border-spacing: 0; border-collapse: collapse; }');
htmlParts.push('a { text-decoration: none; color: #a5f3fc; }');
htmlParts.push('@media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }');
htmlParts.push('</style>');
htmlParts.push('</head>');
htmlParts.push('<body style="background-color: #050508; margin: 0; padding: 0;">');
htmlParts.push('<div style="display: none; max-height: 0px; overflow: hidden; color: #050508;">The path to mastery has opened. Take your first step into the void.</div>');
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #050508;">');
htmlParts.push('<tr><td align="center" style="padding: 40px 0;">');
htmlParts.push('<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0e; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);">');
htmlParts.push('<tr><td style="height: 2px; background: linear-gradient(90deg, #050508, #a5f3fc, #a78bfa, #050508); font-size: 0; line-height: 0;">&nbsp;</td></tr>');
htmlParts.push('<tr><td align="center" style="padding: 40px 0 20px 0;">');
htmlParts.push('<div style="font-family: "Cinzel", serif; font-size: 28px; font-weight: 600; letter-spacing: 4px; color: #ffffff; text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);">');
htmlParts.push('HC <span style="color: #a5f3fc; text-shadow: 0 0 10px rgba(165, 243, 252, 0.5);">BEACON</span>');
htmlParts.push('</div>');
htmlParts.push('<div style="font-family: "Rajdhani", sans-serif; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 3px; margin-top: 8px;">The Catalyst Path</div>');
htmlParts.push('</td></tr>');
htmlParts.push('<tr><td style="padding: 0 50px 30px 50px;">');
htmlParts.push('<h1 style="font-family: "Cinzel", serif; color: #ffffff; font-size: 36px; font-weight: 400; margin: 0 0 25px 0; text-transform: uppercase; letter-spacing: 1px; text-align: center; line-height: 1.2;">');
htmlParts.push('The Path <br/><span style="color: #a78bfa; text-shadow: 0 0 20px rgba(167, 139, 250, 0.4);">Is Open</span>.');
htmlParts.push('</h1>');
htmlParts.push('<p style="font-family: "Rajdhani", Arial, sans-serif; color: #e0e0e0; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">');
htmlParts.push('Greetings, <strong>' + userName + '</strong>.');
htmlParts.push('</p>');
htmlParts.push('<p style="font-family: "Rajdhani", Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">');
htmlParts.push('You have taken the first step on a journey of transcendence. While the world sleeps in routine, you have chosen to awaken your potential and seek mastery.');
htmlParts.push('</p>');
htmlParts.push('<p style="font-family: "Rajdhani", Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 40px;">');
htmlParts.push('Your sanctuary is ready. We have prepared your <strong>Personal Roadmap</strong> to guide you through the initial stages of wisdom.');
htmlParts.push('</p>');
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0">');
htmlParts.push('<tr><td align="center">');
htmlParts.push('<a href="' + siteUrl + '/dashboard" style="display: inline-block; padding: 16px 40px; background-color: rgba(165, 243, 252, 0.05); border: 1px solid rgba(165, 243, 252, 0.3); color: #a5f3fc; font-family: "Cinzel", serif; font-weight: 600; font-size: 16px; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">');
htmlParts.push('Enter the Sanctuary');
htmlParts.push('</a>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('</td></tr>');
htmlParts.push('<tr><td align="center" style="padding: 20px 50px;">');
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0">');
htmlParts.push('<tr><td style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); height: 1px;"></td></tr>');
htmlParts.push('</table>');
htmlParts.push('</td></tr>');
htmlParts.push('<tr><td style="padding: 10px 40px 50px 40px;">');
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0">');
htmlParts.push('<tr><td align="center" valign="top">');
htmlParts.push('<table width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">');
htmlParts.push('<tr><td align="center" style="padding: 10px;">');
htmlParts.push('<div style="color: #fb923c; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(251, 146, 60, 0.4);">✦</div>');
htmlParts.push('<div style="font-family: "Cinzel", serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Resonance</div>');
htmlParts.push('<div style="font-family: "Rajdhani", Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Build your harmonic streak.</div>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('<table width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">');
htmlParts.push('<tr><td align="center" style="padding: 10px;">');
htmlParts.push('<div style="color: #a5f3fc; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">◈</div>');
htmlParts.push('<div style="font-family: "Cinzel", serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Roadmap</div>');
htmlParts.push('<div style="font-family: "Rajdhani", Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Your path to evolution.</div>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('<table width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">');
htmlParts.push('<tr><td align="center" style="padding: 10px;">');
htmlParts.push('<div style="color: #a78bfa; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(167, 139, 250, 0.4);">❖</div>');
htmlParts.push('<div style="font-family: "Cinzel", serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Toolbox</div>');
htmlParts.push('<div style="font-family: "Rajdhani", Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Your personal archive.</div>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('</td></tr>');
htmlParts.push('</table>');
htmlParts.push('</td></tr>');
htmlParts.push('<tr><td style="background-color: rgba(255, 255, 255, 0.02); padding: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05);">');
htmlParts.push('<table width="100%" cellpadding="0" cellspacing="0" border="0">');
htmlParts.push('<tr><td align="center" style="color: #6b7280; font-size: 11px; font-family: "Rajdhani", Arial, sans-serif; line-height: 1.6; text-transform: uppercase; letter-spacing: 1px;">');
htmlParts.push('<p style="margin: 0 0 10px 0;">HC Beacon &copy; 2024. The Awakening.</p>');
htmlParts.push('<p style="margin: 0;">');
htmlParts.push('<a href="' + siteUrl + '/unsubscribe?email=' + encodeURIComponent(userEmail) + '" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &nbsp;•&nbsp; ');
htmlParts.push('<a href="' + siteUrl + '/support" style="color: #6b7280; text-decoration: underline;">Guide</a>');
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
    subject: 'The Path Is Open. Your Journey Begins.',
    html: html
  }
};
