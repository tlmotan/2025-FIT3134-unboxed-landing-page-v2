import { Component, AfterViewInit, ChangeDetectorRef, NgZone, ElementRef, ViewChild, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
export class LandingPage implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container', { static: false }) containerRef!: ElementRef<HTMLDivElement>;

  title = 'My Angular App';
  email = '';
  clickMessage = '';
  isSubmitting = false;
  isSuccess = false;

  // Animation State
  private context!: CanvasRenderingContext2D;
  private frames: HTMLImageElement[] = [];
  private frameCount = 296;
  private currentFrameIndex = 0;
  private isLoading = true;
  private loadingProgress = 0;
  private prefersReducedMotion = false;
  private isBrowser: boolean;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  async ngAfterViewInit() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    if (this.isBrowser && !this.prefersReducedMotion) {
      await this.initAnimation();
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
    }
  }

  private async initAnimation() {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    this.context = canvas.getContext('2d', { alpha: false })!;
    
    this.onResize();
    window.addEventListener('resize', this.onResize);

    await this.preloadFrames();
    
    this.isLoading = false;
    this.cdr.detectChanges();

    // Initial draw
    this.renderFrame(0);

    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  private async preloadFrames() {
    const promises = [];
    for (let i = 1; i <= this.frameCount; i++) {
      const img = new Image();
      const framePath = `frames/frame_${i.toString().padStart(4, '0')}.png`;
      
      const promise = new Promise<void>((resolve) => {
        img.onload = () => {
          this.loadingProgress = Math.floor((i / this.frameCount) * 100);
          this.cdr.detectChanges();
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load frame: ${framePath}`);
          resolve();
        };
      });
      
      img.src = framePath;
      this.frames.push(img);
      promises.push(promise);
    }

    await Promise.all(promises);
  }

  private onResize = () => {
    if (!this.isBrowser || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.renderFrame(this.currentFrameIndex);
  };

  private onScroll = () => {
    if (!this.isBrowser) return;
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(this.updateFrame);
    });
  };

  private updateFrame = () => {
    if (!this.containerRef || !this.isBrowser) return;
    
    const container = this.containerRef.nativeElement;
    const rect = container.getBoundingClientRect();
    
    // Calculate scroll percentage within the hero section
    const scrollEnd = rect.height - window.innerHeight;
    const scrollTop = window.scrollY;

    const scrollFraction = Math.max(0, Math.min(1, scrollTop / scrollEnd));
    const frameIndex = Math.min(
      this.frameCount - 1,
      Math.floor(scrollFraction * this.frameCount)
    );

    if (frameIndex !== this.currentFrameIndex) {
      this.currentFrameIndex = frameIndex;
      this.renderFrame(frameIndex);
    }
  };

  private renderFrame(index: number) {
    if (!this.frames[index] || !this.context) return;

    const img = this.frames[index];
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.context;

    // Fill background with page color
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image with "cover" behavior
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
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

    try {
      const result = await this.supabaseService.addEmailToWaitlist(this.email);
      
      this.ngZone.run(() => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.clickMessage = '✅ Thanks for joining! Check your email for confirmation.';
        this.email = '';
        this.cdr.detectChanges();
      });
      
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
      }

      this.ngZone.run(() => {
        this.clickMessage = errorMessage;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      });
    }
  }

  // Getter for template
  get showLoader() { return this.isLoading && !this.prefersReducedMotion; }
  get progress() { return this.loadingProgress; }
}
