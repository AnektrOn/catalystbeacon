// Sign Up Email Template - Version Corrigée pour N8N
// Copiez ce code dans un Function Node après le Switch Node (branche "new-user")

const emailData = $input.item.json;
const siteUrl = $env.SITE_URL || 'https://app.humancatalystbeacon.com';
const siteName = $env.SITE_NAME || 'The Human Catalyst University';

// Construire le HTML avec concaténation pour éviter les problèmes de template literals
const html = '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Your Journey Begins</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Rajdhani:wght@300;400;500;600&display=swap" rel="stylesheet">' +
    '<style>' +
        'body { margin: 0; padding: 0; background-color: #050508; color: #e0e0e0; font-family: "Rajdhani", Arial, sans-serif; -webkit-font-smoothing: antialiased; }' +
        'table { border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; }' +
        'img { border: 0; display: block; max-width: 100%; height: auto; }' +
        'a { text-decoration: none; color: #a5f3fc; }' +
        '@media only screen and (max-width: 600px) {' +
            'table[width="600"] { width: 100% !important; max-width: 100% !important; }' +
            'td[style*="padding: 0 50px"] { padding: 0 20px !important; }' +
            'td[style*="padding: 40px 0"] { padding: 20px 0 !important; }' +
            'td[style*="padding: 40px 0 20px 0"] { padding: 30px 0 15px 0 !important; }' +
            'h1 { font-size: 28px !important; line-height: 1.3 !important; }' +
            'p { font-size: 16px !important; line-height: 1.6 !important; }' +
            'table[class="btn-table"] { width: 100% !important; }' +
            'a[class="btn-link"] { width: 100% !important; max-width: 100% !important; display: block !important; text-align: center !important; padding: 14px 20px !important; font-size: 14px !important; box-sizing: border-box !important; }' +
            'table[class="feature-stack"] { width: 100% !important; max-width: 100% !important; display: block !important; margin-bottom: 20px !important; }' +
            'td[style*="padding: 10px 40px"] { padding: 10px 20px !important; }' +
            'td[align="center"][valign="top"] { display: block !important; width: 100% !important; }' +
            'div[style*="font-size: 28px"] { font-size: 24px !important; }' +
            'div[style*="font-size: 36px"] { font-size: 28px !important; }' +
        '}' +
    '</style>' +
'</head>' +
'<body style="background-color: #050508; margin: 0; padding: 0;">' +
    '<div style="display: none; max-height: 0px; overflow: hidden; color: #050508;">The path to mastery has opened. Take your first step into the void.</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #050508;">' +
        '<tr>' +
            '<td align="center" style="padding: 40px 0;">' +
                '<table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0e; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);">' +
                    '<tr>' +
                        '<td style="height: 2px; background: linear-gradient(90deg, #050508, #a5f3fc, #a78bfa, #050508); font-size: 0; line-height: 0;">&nbsp;</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td align="center" style="padding: 40px 0 20px 0;">' +
                            '<div style="font-family: \'Cinzel\', serif; font-size: 28px; font-weight: 600; letter-spacing: 4px; color: #ffffff; text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);">' +
                                'HC <span style="color: #a5f3fc; text-shadow: 0 0 10px rgba(165, 243, 252, 0.5);">UNIVERSITY</span>' +
                            '</div>' +
                            '<div style="font-family: \'Rajdhani\', sans-serif; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 3px; margin-top: 8px;">The Catalyst Path</div>' +
                        '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td style="padding: 0 50px 30px 50px;">' +
                            '<h1 class="header-text" style="font-family: \'Cinzel\', serif; color: #ffffff; font-size: 36px; font-weight: 400; margin: 0 0 25px 0; text-transform: uppercase; letter-spacing: 1px; text-align: center; line-height: 1.2;">' +
                                'The Path <br/><span style="color: #a78bfa; text-shadow: 0 0 20px rgba(167, 139, 250, 0.4);">Is Open</span>.' +
                            '</h1>' +
                            '<p class="body-text" style="font-family: \'Rajdhani\', Arial, sans-serif; color: #e0e0e0; font-size: 18px; line-height: 1.6; margin-bottom: 20px; text-align: left; font-weight: 400;">' +
                                'Greetings, <strong>' + (emailData.userName || 'there') + '</strong>.' +
                            '</p>' +
                            '<p class="body-text" style="font-family: \'Rajdhani\', Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: left; font-weight: 400;">' +
                                'You have taken the first step on a journey of transcendence. While the world sleeps in routine, you have chosen to awaken your potential and seek mastery.' +
                            '</p>' +
                            '<p class="body-text" style="font-family: \'Rajdhani\', Arial, sans-serif; color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 40px; text-align: left; font-weight: 400;">' +
                                'Your sanctuary is ready. We have prepared your <strong>Personal Roadmap</strong> to guide you through the initial stages of wisdom.' +
                            '</p>' +
                            '<table class="btn-table" width="100%" cellpadding="0" cellspacing="0" border="0">' +
                                '<tr>' +
                                    '<td align="center">' +
                                        '<a href="' + siteUrl + '/dashboard" class="btn-link" style="display: inline-block; padding: 16px 40px; background-color: rgba(165, 243, 252, 0.05); border: 1px solid rgba(165, 243, 252, 0.3); color: #a5f3fc; font-family: \'Cinzel\', serif; font-weight: 600; font-size: 16px; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">' +
                                            'Enter the Sanctuary' +
                                        '</a>' +
                                    '</td>' +
                                '</tr>' +
                            '</table>' +
                        '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td align="center" style="padding: 20px 50px;">' +
                            '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +
                                '<tr>' +
                                    '<td style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); height: 1px;"></td>' +
                                '</tr>' +
                            '</table>' +
                        '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td style="padding: 10px 40px 50px 40px;">' +
                            '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +
                                '<tr>' +
                                    '<td align="center" valign="top">' +
                                        '<table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">' +
                                            '<tr>' +
                                                '<td align="center" style="padding: 10px;">' +
                                                    '<div style="color: #fb923c; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(251, 146, 60, 0.4);">✦</div>' +
                                                    '<div style="font-family: \'Cinzel\', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Resonance</div>' +
                                                    '<div style="font-family: \'Rajdhani\', Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Build your harmonic streak.</div>' +
                                                '</td>' +
                                            '</tr>' +
                                        '</table>' +
                                        '<table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">' +
                                            '<tr>' +
                                                '<td align="center" style="padding: 10px;">' +
                                                    '<div style="color: #a5f3fc; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(165, 243, 252, 0.4);">◈</div>' +
                                                    '<div style="font-family: \'Cinzel\', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Roadmap</div>' +
                                                    '<div style="font-family: \'Rajdhani\', Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Your path to evolution.</div>' +
                                                '</td>' +
                                            '</tr>' +
                                        '</table>' +
                                        '<table class="feature-stack" width="160" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;">' +
                                            '<tr>' +
                                                '<td align="center" style="padding: 10px;">' +
                                                    '<div style="color: #a78bfa; font-size: 24px; margin-bottom: 10px; text-shadow: 0 0 10px rgba(167, 139, 250, 0.4);">❖</div>' +
                                                    '<div style="font-family: \'Cinzel\', serif; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Toolbox</div>' +
                                                    '<div style="font-family: \'Rajdhani\', Arial, sans-serif; color: #888; font-size: 13px; line-height: 1.4; font-weight: 400;">Your personal archive.</div>' +
                                                '</td>' +
                                            '</tr>' +
                                        '</table>' +
                                    '</td>' +
                                '</tr>' +
                            '</table>' +
                        '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td style="background-color: rgba(255, 255, 255, 0.02); padding: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05);">' +
                            '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +
                                '<tr>' +
                                    '<td align="center" style="color: #6b7280; font-size: 11px; font-family: \'Rajdhani\', Arial, sans-serif; line-height: 1.6; text-transform: uppercase; letter-spacing: 1px;">' +
                                        '<p style="margin: 0 0 10px 0;">HC University &copy; 2024. The Awakening.</p>' +
                                        '<p style="margin: 0;">' +
                                            '<a href="' + siteUrl + '/unsubscribe?email=' + encodeURIComponent(emailData.email) + '" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &nbsp;•&nbsp; ' +
                                            '<a href="' + siteUrl + '/support" style="color: #6b7280; text-decoration: underline;">Guide</a>' +
                                        '</p>' +
                                    '</td>' +
                                '</tr>' +
                            '</table>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
                '<div style="height: 40px;"></div>' +
                '<div style="color: #4b5563; font-size: 10px; font-family: \'Rajdhani\', Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase;">Sent with Intention</div>' +
            '</td>' +
        '</tr>' +
    '</table>' +
'</body>' +
'</html>';

return {
  json: {
    to: emailData.email,
    from: siteName + ' <noreply@humancatalystbeacon.com>', // From Name + Email
    subject: 'The Path Is Open. Your Journey Begins.',
    html: html
  }
};
