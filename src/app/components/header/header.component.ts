import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { map, Observable, Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommunicationService } from '../../services/share.service';
import { NotificationService } from '../../services/notification.service';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'invitation' | 'reminder' | 'update' | 'info';
  date: string;
  is_read: boolean;
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
  errorMessage = '';

  notifications: Notification[] = [];

  constructor(private router: Router, 
              private authService: AuthService,
              private breakpointObserver: BreakpointObserver,
              private notificationService: NotificationService,
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
    this.loadNotifications();
  }

  loadNotifications(){
    this.notificationService.getNotifications().subscribe({
      next: (response: any) => {
        console.log('[loadNotifications] response :: ', response);
        this.notifications = response;
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Erreur lors du chargement des notifications.';
        console.error('[loadNotifications] Erreur :', err.error.error);
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
    return this.notifications.filter(n => !n.is_read).length;
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
    notification.is_read = true;
    this.notificationService.updateNotificationReading(notification.id, notification.is_read).subscribe({
      next: (response: any) => {
        console.log('[markAsRead] response :: ', response);
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Erreur lors de la mise a jour.';
        console.error('[markAsRead] Erreur :', err.error.error);
      }
    });
  }

  markAsReadAndDelete(notification: Notification){
    notification.is_read = true;
    this.notificationService.deleteNotificationReading(notification.id).subscribe({
      next: (response: any) => {
        console.log('[markAsReadAndDelete] response :: ', response);
        this.notifications = this.notifications.filter(n => n.id != notification.id);
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Erreur lors de la mise a jour.';
        console.error('[markAsReadAndDelete] Erreur :', err.error.error);
      }
    });
  }

  openNotifications() {
    this.showNotifications.set(true);
  }

  closeNotifications() {
    this.showNotifications.set(false);
  }
}

