import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, Header, Footer],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  onSubmit() {
    
  }
}
