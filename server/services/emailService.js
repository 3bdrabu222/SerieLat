import nodemailer from 'nodemailer';

// Create Brevo (SendinBlue) transporter
const createTransporter = () => {
  const transporter = nodemailer.createTransporter({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_EMAIL,
      pass: process.env.BREVO_SMTP_KEY
    }
  });
  return transporter;
};

// Generate 4-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SerieLat" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: 'Verify Your Email - SerieLat',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              text-align: center;
            }
            .content {
              background: white;
              border-radius: 8px;
              padding: 30px;
              margin-top: 20px;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              margin: 20px 0;
              padding: 15px;
              background: #f7f7f7;
              border-radius: 8px;
              display: inline-block;
            }
            .header {
              color: white;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              color: #e74c3c;
              font-size: 14px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">📺 Welcome to SerieLat!</div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for registering with SerieLat. To complete your registration, please verify your email address.</p>
              
              <p>Your verification code is:</p>
              <div class="code">${code}</div>
              
              <p>Enter this code on the verification page to activate your account.</p>
              
              <div class="warning">
                ⚠️ This code will expire in 10 minutes.
              </div>
              
              <div class="footer">
                <p>If you didn't create an account with SerieLat, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} SerieLat. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SerieLat" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: 'Welcome to SerieLat! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              text-align: center;
            }
            .content {
              background: white;
              border-radius: 8px;
              padding: 30px;
              margin-top: 20px;
            }
            .header {
              color: white;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">🎉 Welcome to SerieLat!</div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Your email has been successfully verified!</p>
              <p>You can now enjoy unlimited access to thousands of TV series and movies.</p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
                Start Watching Now
              </a>
              
              <p>Thank you for joining our community!</p>
              <p>&copy; ${new Date().getFullYear()} SerieLat. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error, welcome email is not critical
  }
};
