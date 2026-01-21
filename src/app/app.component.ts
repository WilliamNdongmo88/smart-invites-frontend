import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FloatingFeedbackBtnComponent } from "./components/floating-feedback-btn/floating-feedback-btn.component";
import { FooterDetailComponent } from "./components/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FloatingFeedbackBtnComponent, FooterDetailComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
      <app-floating-feedback-btn></app-floating-feedback-btn>
      
      <!-- Affichage conditionnel du footer -->
      <app-footer *ngIf="showFooter"></app-footer>
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
  showFooter = true;

  // Liste des routes où le footer doit être masqué
  private hiddenFooterRoutes = [
    '/'
  ];

  constructor(private router: Router) {
    // Écouter les changements de navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        //console.log('[AuthGuard] URL changée :', url);
        if(url.startsWith("/")){
          this.showFooter = !this.hiddenFooterRoutes.includes(url);
          console.log('Footer visible:', this.showFooter);
        }
      }
    });
  }
}