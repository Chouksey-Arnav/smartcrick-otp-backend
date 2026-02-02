const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  // CORS Headers - Allow requests from any origin
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get email and OTP from request body
  const { email, otp } = req.body;
  
  // Validate inputs
  if (!email || !otp) {
    console.error('❌ Missing email or OTP');
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format:', email);
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Log attempt (for debugging)
  console.log('📧 Sending OTP to:', email);
  console.log('🔢 OTP Code:', otp);
  console.log('🔑 API Key present:', !!process.env.RESEND_API_KEY);
  
  try {
    // Send email using Resend
    const data = await resend.emails.send({
      from: 'Smart Crick AI <onboarding@resend.dev>',
      to: [email],
      subject: '🏏 Your Smart Crick AI Verification Code',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Smart Crick AI - Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; padding: 0; color: #ffffff; font-size: 32px; font-weight: 900; line-height: 1.2;">
                🏏 Smart Crick AI
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; padding: 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                Verify Your Email
              </h2>
              <p style="margin: 0 0 24px 0; padding: 0; color: #6b7280; font-size: 16px; line-height: 24px;">
                Welcome to Smart Crick AI! Use this verification code to complete your registration and start training like a champion.
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 32px; text-align: center;">
                    <p style="margin: 0 0 8px 0; padding: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      YOUR VERIFICATION CODE
                    </p>
                    <h1 style="margin: 0; padding: 0; color: #10b981; font-size: 48px; font-weight: 900; letter-spacing: 8px; line-height: 1.2;">
                      ${otp}
                    </h1>
                    <p style="margin: 8px 0 0 0; padding: 0; color: #9ca3af; font-size: 14px;">
                      Valid for 5 minutes
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; padding: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                If you didn't request this code, you can safely ignore this email. Someone might have entered your email address by mistake.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; padding: 0; color: #9ca3af; font-size: 14px; line-height: 20px;">
                © 2024 Smart Crick AI. Train like a champion.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', data.id);
    
    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      messageId: data.id
    });
    
  } catch (error) {
    console.error('❌ Failed to send email');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to send OTP',
      details: error.message
    });
  }
};
