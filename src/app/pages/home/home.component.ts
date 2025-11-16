import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.getUser()) {
        this.authService.isAuthenticated().subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToLogin() {
    if (this.isAuthenticated) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.router.navigate(['/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}

