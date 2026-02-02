const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    console.error('❌ Missing email or OTP');
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format:', email);
    return res.status(400).json({ error: 'Invalid email format' });
  }

  console.log('📧 Sending OTP to:', email);
  console.log('🔢 OTP Code:', otp);
  console.log('🔑 API Key present:', !!process.env.RESEND_API_KEY);
  
  try {
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
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
        <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold;">🏏 Smart Crick AI</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px;">Verify Your Email</h2>
        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 24px;">
          Welcome to Smart Crick AI! Use this code to complete your registration.
        </p>
        <table style="width: 100%; margin: 32px 0;">
          <tr>
            <td style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">YOUR VERIFICATION CODE</p>
              <h1 style="margin: 0; color: #10b981; font-size: 48px; font-weight: 900; letter-spacing: 8px;">${otp}</h1>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">Valid for 5 minutes</p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; color: #9ca3af; font-size: 14px;">© 2024 Smart Crick AI</p>
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
    console.error('Error:', error.message);
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to send OTP',
      details: error.message
    });
  }
};
