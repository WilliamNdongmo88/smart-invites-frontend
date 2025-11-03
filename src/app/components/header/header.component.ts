import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { CommunicationService } from '../../services/share.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
  })
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  isShowHeader = true;
  currentUser: User | null = null;
  private authSub!: Subscription;

  constructor(private router: Router, 
              private authService: AuthService) {}

  mobileMenuOpen = signal(false);

  ngOnInit() {
    // On écoute l’état d’authentification
    this.authSub = this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
      console.log('Header rafraîchi - Connecté =', status);
    });
    this.authService.currentUser$.subscribe(user => {
      console.log("---user---: ", user)
      this.currentUser = user;
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}

