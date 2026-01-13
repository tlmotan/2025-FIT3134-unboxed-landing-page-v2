import { Component, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { SupabaseService } from '../supabase.service';

declare const lucide: any;

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements AfterViewInit {
  title = 'My Angular App';
  email = '';
  clickMessage = '';
  isSubmitting = false;
  isSuccess = false;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngAfterViewInit() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  async onSubmit() {
    if (!this.email || !this.email.includes('@') || this.isSubmitting) {
      this.clickMessage = '⚠️ Please enter a valid email address';
      return;
    }

    this.isSubmitting = true;
    this.isSuccess = false;
    this.clickMessage = '';
    this.cdr.detectChanges();
    console.log('State updated:', { isSubmitting: this.isSubmitting, clickMessage: this.clickMessage });


    try {
      const result = await this.supabaseService.addEmailToWaitlist(this.email);
      console.log('Email saved successfully:', result);
      
      // Run state updates inside Angular zone
      this.ngZone.run(() => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.clickMessage = '✅ Thanks for joining! Check your email for confirmation.';
        this.email = ''; // Clear the input
        this.cdr.detectChanges();
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        this.ngZone.run(() => {
          this.isSuccess = false;
          this.cdr.detectChanges();
        });
      }, 3000);
    } catch (error: any) {
      console.error('Error saving email:', error);
      let errorMessage = '❌ Something went wrong. Please try again.';

      if (error?.code === '23505' || error?.message?.includes('duplicate key') || error?.message?.includes('unique constraint')) {
        errorMessage = '❌ This email is already registered. Try a different one!';
      } else if (error?.message?.includes('invalid email')) {
        errorMessage = '❌ Please enter a valid email address.';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = '❌ Network error. Please check your connection and try again.';
      } else if (error?.code === '42501' || error?.message?.includes('permission denied')) {
        errorMessage = '❌ Database permission error. Please contact support.';
      }

      // Update state in Angular zone
      this.ngZone.run(() => {
        this.clickMessage = errorMessage;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      });
    }
  }
}
