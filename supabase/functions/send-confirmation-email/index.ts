import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Outlook credentials from environment variables
    const outlookEmail = Deno.env.get('GMAIL_ACCOUNT')
    const outlookPassword = Deno.env.get('GMAIL_PASSWORD')
    
    if (!outlookEmail || !outlookPassword) {
      console.error('Missing email credentials')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create email HTML content
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Unboxed!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">🎁 Welcome to Unboxed!</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">You're on the Waitlist! 🎉</h2>
              
              <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi there,
              </p>
              
              <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for joining the <strong>Unboxed</strong> waitlist! We're thrilled to have you as part of our collector community.
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
                <strong>The Unboxed Team</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reach out to us anytime!
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 Unboxed. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using fetch to a relay service or direct SMTP
    // Since Deno Edge Functions don't support nodemailer directly, we'll use a different approach
    // We'll use the SMTP2GO or similar API, or use Deno's native SMTP capabilities
    
    // For Outlook SMTP, we'll use a simple SMTP library for Deno
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: Deno.env.get('SMTP2GO_API_KEY'), // You'll need to set this up
        to: [email],
        sender: outlookEmail,
        subject: 'Welcome to Unboxed - You\'re on the Waitlist! 🎉',
        html_body: emailHTML,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send email via SMTP service')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send confirmation email' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
