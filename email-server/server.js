const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Define allowed origins (combining Localhost + Environment Variables)
const allowedOrigins = [
  'http://localhost:4200', // Always allow local Angular dev
  'http://localhost:3000', // Optional: local SSR
];

// Add origins from environment variable (e.g., your Vercel URL)
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
  allowedOrigins.push(...envOrigins);
}

console.log('✅ CORS allowed origins:', allowedOrigins);

// 2. Use the dynamic configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));

app.use(express.json());

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD // Must be an App Password from Google
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Configuration Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

// Warn if Gmail credentials are missing (helps catch misconfiguration on deploy)
if (!process.env.GMAIL_ACCOUNT || !process.env.GMAIL_PASSWORD) {
  console.warn('⚠️ GMAIL_ACCOUNT or GMAIL_PASSWORD is not set. Email sending will fail without valid credentials.');
}

// Endpoint to send confirmation email
app.post('/api/send-confirmation', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Email HTML template
  const emailHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to unboxd.!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">🎁 Welcome to unboxd!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">You're on the Waitlist! 🎉</h2>
            
            <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Hi there,
            </p>
            
            <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you for joining the <strong>unboxd.</strong> waitlist! We're thrilled to have you as part of our collector community.
            </p>
            
            <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
              You're one step closer to completing your PopMart collection with hassle-free swaps and smart matching.
            </p>
            
            <!-- Benefits Box -->
            <div style="background: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: 600;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                <li>You'll be among the first to know when we launch</li>
                <li>Early access to exclusive features</li>
                <li>Special perks for waitlist members</li>
                <li>Updates on our development progress</li>
              </ul>
            </div>
            
            <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
              As one of our first 100 members, you'll get <strong style="color: #764ba2;">free premium features for life</strong> once we launch! 🚀
            </p>
            
            <p style="margin: 30px 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Stay tuned for updates!
            </p>
            
            <p style="margin: 0 0 5px; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Best regards,<br>
              <strong>The unboxd. Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
              Questions? Reach out to us anytime!
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              © 2026 unboxd.. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"unboxd. Team" <${process.env.GMAIL_ACCOUNT}>`,
    to: email,
    subject: "Welcome to unboxd. - You're on the Waitlist! 🎉",
    html: emailHTML,
    text: `Welcome to unboxd.!\n\nThank you for joining our waitlist! You're one step closer to completing your PopMart collection with hassle-free swaps and smart matching.\n\nAs one of our first 100 members, you'll get free premium features for life once we launch!\n\nStay tuned for updates!\n\nBest regards,\nThe unboxd. Team`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    res.status(200).json({
      success: true,
      message: 'Confirmation email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to send confirmation email',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Email Service' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
});

module.exports = app;
