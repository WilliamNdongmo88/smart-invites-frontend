import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { map, Observable, Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommunicationService } from '../../services/share.service';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'invitation' | 'reminder' | 'update' | 'info';
  date: string;
  read: boolean;
}
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
  })
export class HeaderComponent implements OnInit {
  showNotifications = signal(false);
  isAuthenticated = false;
  isShowHeader = true;
  isScanning = false;
  currentUser: User | null = null;
  private authSub!: Subscription;
  isMobile!: Observable<boolean>;
  eventId: number = 0;

  notifications: Notification[] = [
    {
      id: '1',
      title: 'Nouvelle invitation',
      message: 'Vous avez reçu une invitation pour le mariage de Sophie et Pierre',
      type: 'invitation',
      date: '2025-01-15',
      read: false,
    },
    {
      id: '2',
      title: 'Rappel',
      message: 'N\'oubliez pas de répondre à l\'invitation des fiançailles de Jean et Marie',
      type: 'reminder',
      date: '2025-01-10',
      read: false,
    },
    {
      id: '3',
      title: 'Mise à jour d\'événement',
      message: 'Les détails du mariage de Sophie et Pierre ont été mis à jour',
      type: 'update',
      date: '2025-01-08',
      read: true,
    },
    {
      id: '4',
      title: 'Information',
      message: 'Merci d\'avoir confirmé votre présence au mariage de Claire et Thomas',
      type: 'info',
      date: '2024-12-20',
      read: true,
    },
  ];

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

  get unreadNotifications(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'invitation':
        return '📧';
      case 'reminder':
        return '🔔';
      case 'update':
        return '📝';
      case 'info':
        return 'ℹ️';
      default:
        return '📬';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  markAsRead(notification: Notification) {
    notification.read = true;
  }

  openNotifications() {
    this.showNotifications.set(true);
  }

  closeNotifications() {
    this.showNotifications.set(false);
  }
}

