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
    const { data, error } = await this.supabase
      .from('email_signups')
      .insert([{ email, created_at: new Date() }])
      .select();

    if (error) throw error;
    // Then, send confirmation email
    try {
      await this.sendConfirmationEmail(email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't throw - email saved successfully, email sending is secondary
    }

    return data;
  }

  private async sendConfirmationEmail(email: string): Promise<void> {
    const response = await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }
  }
}