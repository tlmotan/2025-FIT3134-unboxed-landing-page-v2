const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Email addresses to send to
const emailList = [
"ethanlimdc@gmail.com",
"theoverking02@gmail.com",
"johndevadhas525@gmail.com",
"andeeznutz003@gmail.com",
"sinjingzhao2005@gmail.com",
"thegrimreaperino420@gmail.com",
"cidkagenoumann@gmail.com",
"mczj0757@gmail.com",
"tjake995@gmail.com",
"descomanicon@gmail.com",
"rahil.mutum03@gmail.com",
"marcuslwo2006@gmail.com",
"menstrualbicycle@gmail.com",
"jinghnglim@gmail.com",
"jared.lim234@gmail.com",
"jeremiahboey3@gmail.com",
"caydenchoo@gmail.com,",
"shermanlowch@gmail.com",
"eejiao12@gmail.com",
"praavin2754@gmail.com",
"yanbinngg027@gmail.com",
"kenzo.yannfeng@gmail.com",
"kayrou.wong@gmail.com",
"ryanyuwen@gmail.com",
"gbaaronlam@gmail.com",
"studiofunnies@gmail.com",
"joanneyoussel@gmail.com",
"hackerlim88@gmail.com",
"charmainelxuen@gmail.com",
];

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

async function sendBulkEmails() {
  console.log('🚀 Starting bulk email send...');
  console.log(`📧 Sending to ${emailList.length} recipients\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const email of emailList) {
    try {
      const mailOptions = {
        from: `"unboxd. Team" <${process.env.GMAIL_ACCOUNT}>`,
        to: email,
        subject: "Welcome to unboxd. - You're on the Waitlist! 🎉",
        html: emailHTML,
        text: `Welcome to unboxd.!\n\nThank you for joining our waitlist! You're one step closer to completing your PopMart collection with hassle-free swaps and smart matching.\n\nAs one of our first 100 members, you'll get free premium features for life once we launch!\n\nStay tuned for updates!\n\nBest regards,\nThe unboxd. Team`
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${email} (${info.messageId})`);
      successCount++;

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to send to ${email}:`, error.message);
      failureCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully sent: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📧 Total: ${emailList.length}`);
}

// Run the bulk send
sendBulkEmails()
  .then(() => {
    console.log('\n✨ Bulk email send complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
