import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { SupabaseService } from '../supabase.service';


@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  title = 'My Angular App';
  email = '';
  clickMessage = '';
  isSubmitting = false;

  constructor(private supabaseService: SupabaseService) {}

  async onSubmit() {
    if (!this.email || !this.email.includes('@')) {
      this.clickMessage = '⚠️ Please enter a valid email address';
      return;
    }

    this.isSubmitting = true;
    this.clickMessage = '';

    try {
      await this.supabaseService.addEmailToWaitlist(this.email);
      this.clickMessage = '✅ Thanks for joining! Check your email for confirmation.';
      this.email = ''; // Clear the input
    } catch (error: any) {
      console.error('Error saving email:', error);
      if (error.code === '23505') {
        this.clickMessage = '⚠️ This email is already on the waitlist!';
      } else {
        this.clickMessage = '❌ Something went wrong. Please try again.';
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}
