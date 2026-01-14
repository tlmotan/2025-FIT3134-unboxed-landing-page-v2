// Test script to verify email sending functionality
// Run with: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Testing Email Configuration...\n');

// Verify environment variables
console.log('📋 Checking environment variables:');
console.log(`   GMAIL_ACCOUNT: ${process.env.GMAIL_ACCOUNT ? '✅ Set' : '❌ Not set'}`);
console.log(`   GMAIL_PASSWORD: ${process.env.GMAIL_PASSWORD ? '✅ Set' : '❌ Not set'}`);

if (!process.env.GMAIL_ACCOUNT || !process.env.GMAIL_PASSWORD) {
  console.error('\n❌ Error: Missing environment variables');
  console.log('Please create a .env file with your Outlook credentials');
  process.exit(1);
}

console.log('\n🔧 Creating SMTP transporter...');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

console.log('✅ Transporter created\n');
console.log('🔍 Verifying SMTP connection...');

transporter.verify(async (error, success) => {
  if (error) {
    console.error('❌ SMTP Verification Failed:', error.message);
    console.log('\nPossible solutions:');
    
    // Check for specific error codes
    if (error.message.includes('SmtpClientAuthentication is disabled')) {
      console.log('⚠️  SMTP is DISABLED for your Outlook account!\n');
      console.log('📖 See TROUBLESHOOTING_SMTP.md for detailed fix');
      console.log('\nQuick Fix Options:');
      console.log('1. Enable SMTP in Outlook:');
      console.log('   → https://outlook.live.com/mail/0/options/mail/sync');
      console.log('   → Enable "Let devices and apps use POP"');
      console.log('   → Wait 5-10 minutes\n');
      console.log('2. Create App Password (Recommended):');
      console.log('   → https://account.microsoft.com/security');
      console.log('   → Create app password');
      console.log('   → Update .env file with app password');
    } else {
      console.log('1. Check your email and password are correct');
      console.log('2. If using 2FA, use an app-specific password');
      console.log('3. Enable SMTP access in your Outlook account');
      console.log('4. Create app password at: https://account.microsoft.com/security');
    }
    process.exit(1);
  }

  console.log('✅ SMTP Connection Verified!\n');
  console.log('📧 Sending test email...');

  const testEmail = {
    from: `"Unboxed Team" <${process.env.GMAIL_ACCOUNT}>`,
    to: process.env.GMAIL_ACCOUNT, // Send to yourself
    subject: '🧪 Test Email - Unboxed Waitlist Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #764ba2;">✅ Email Test Successful!</h1>
        <p>If you're seeing this email, your Outlook SMTP configuration is working correctly.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>SMTP Host: smtp.office365.com</li>
          <li>Port: 587</li>
          <li>Email: ${process.env.GMAIL_ACCOUNT}</li>
        </ul>
        <p>You're all set to send waitlist confirmation emails! 🎉</p>
      </div>
    `,
    text: 'Email Test Successful! Your Outlook SMTP configuration is working correctly.'
  };

  try {
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Sent to: ${process.env.GMAIL_ACCOUNT}`);
    console.log('\n🎉 Email system is working correctly!');
    console.log('\nCheck your inbox (and spam folder) for the test email.');
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    process.exit(1);
  }
});
