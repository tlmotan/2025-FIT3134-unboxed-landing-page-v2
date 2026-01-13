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
    return data;
  }
}