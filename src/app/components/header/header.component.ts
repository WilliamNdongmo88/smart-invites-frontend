import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { map, Observable, Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
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
  isScanning = false;
  currentUser: User | null = null;
  private authSub!: Subscription;
  isMobile!: Observable<boolean>;
  eventId: number = 0;

  constructor(private router: Router, 
              private authService: AuthService,
              private breakpointObserver: BreakpointObserver,
              private communicationService: CommunicationService
            ) {}

  mobileMenuOpen = signal(false);

  ngOnInit() {
    this.isMobile = this.breakpointObserver.observe(['(max-width: 768px)']).pipe(map(res => res.matches));

    // On écoute l’état d’authentification
    this.authSub = this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
      //console.log('Header rafraîchi - Connecté =', status);
    });
    this.authService.currentUser$.subscribe(user => {
      console.log("---user :: ", user)
      this.currentUser = user;
    });
    this.communicationService.message$.subscribe(msg => {
      console.log("msg :: ", localStorage.getItem('variable'));
      if (msg!=null && msg!=undefined) {
        this.isScanning = true;
        this.eventId = msg;
      }else{
        this.isScanning = false;
      }
    });
  }

  navigateToAccueil() {
    this.router.navigate(['/user-accueil']);
  }

  toggleMobileMenu(force?: boolean) {
    if (force === false) {
      this.mobileMenuOpen.set(false);
      return;
    }
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
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

  scanQrCode(){
    this.send(this.eventId);
    this.router.navigate(['events',this.eventId,'qr-scanner']);
    this.mobileMenuOpen.set(false);
  }

  send(message: any) {
    this.communicationService.sendMessage(message);
  }
}

