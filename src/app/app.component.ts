import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FloatingFeedbackBtnComponent } from "./components/floating-feedback-btn/floating-feedback-btn.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FloatingFeedbackBtnComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
      <app-floating-feedback-btn></app-floating-feedback-btn>
    </main>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 60px);
    }
  `]
})
export class AppComponent {
  title = 'Smart Invite - Wedding Management Platform';
}
