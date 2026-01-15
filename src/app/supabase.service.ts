import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async addEmailToWaitlist(email: string) {
    // Restrict to Gmail addresses
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      throw new Error('Only Gmail addresses are accepted.');
    }

    const { data, error } = await this.supabase
      .from('email_signups')
      .insert([{ email, created_at: new Date() }])
      .select();

    if (error) throw error;

    // Then, send confirmation email (fire and forget)
    this.sendConfirmationEmail(email).catch(err => {
      console.error('❌ Background email sending failed:', err);
    });

    // Return data immediately so UI updates


    return data;
  }

  private async sendConfirmationEmail(email: string): Promise<void> {
    try {
      console.log('📧 Attempting to send email to:', email);

      const response = await fetch('https://two025-fit3134-unboxed-landing-page-v2.onrender.com/api/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📬 Email API response status:', response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('📛 Email API error response:', errorBody);

        let errorMessage;
        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.error || errorJson.details || errorBody;
        } catch {
          errorMessage = errorBody;
        }

        throw new Error(errorMessage || `Failed to send email with status ${response.status}`);
      }

      // Read and log success response
      const successBody = await response.json();
      console.log('📨 Email API success response:', successBody);

    } catch (error) {
      console.error('🔥 Error in sendConfirmationEmail:', error);
      throw error;
    }
  }

  async getWaitlistCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('email_signups')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return count || 0;
  }
}