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

    // 1. Sign up the user in Supabase Auth to trigger the "Confirm Your Signup" email
    // We use a random password since this is just for the waitlist verification flow
    const { error: authError } = await this.supabase.auth.signUp({
      email,
      password: 'Waitlist-' + Math.random().toString(36).slice(2) + '!',
    });

    if (authError) throw authError;

    // 2. Insert into the public waitlist table for the counter and record
    const { data, error } = await this.supabase
      .from('email_signups')
      .insert([{ email, created_at: new Date() }])
      .select();

    if (error) throw error;

    return data;
  }

  async getWaitlistCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('email_signups')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    console.log(count)
    return count || 0;
  }
}