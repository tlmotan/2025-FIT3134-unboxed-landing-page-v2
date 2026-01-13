import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';

export const routes: Routes = [
{ path: '', redirectTo: 'landing-page', pathMatch: 'full' },
{ path: 'landing-page', component: LandingPage },
];
