import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';
import { Maintenance, MaintenanceService } from '../../services/maintenance.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { EventService } from '../../services/event.service';

// Interfaces
interface UserManager {
  id: number;
  email: string;
  name: string;
  role: string;
  plan: string
}

interface User {
  id: number;
  name: string;
  email: string;
  eventsCreated: number;
  plan: 'gratuit' | 'professionnel' | 'entreprise';
  lastLogin: string;
  createdAt: string;
  isBlocked: boolean;
  totalGuests: number;
  userPaymentProof?: string
  expirationDate?: string
}

interface Event {
  id: number;
  organizerId: number;
  title: string;
  type: string;
  guestCount: number;
  stage: string;
  date: string;
  time: string;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
}

interface Guest {
  id: number;
  eventId: number;
  name: string;
  email: string;
  status: 'confirmed' | 'pending' | 'declined';
  qrCodeGenerated: boolean;
  qrCodeUrl?: string;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit {
  activeTab = 'users';

  showAddUserModal = false;

  newUser = {
    name: '',
    email: ''
  };

  // Pagination
  currentPage = 1;
  pageSize = 6;


  // Modèle pour le type d'export
  exportType: 'users' | 'events' | 'logs' = 'users';

  users: User[] = [];

  events: Event[] = [];

  guests: Guest[] = [];

  // Filters
  userSearch = '';
  userPlanFilter = '';
  guestStatusFilter = '';
  isSubscriber = false;
  loading = false;
  showDetail = false;
  errorMessage = '';
  userManager: UserManager | null = null;
  isMobile!: Observable<boolean>;
  userId: number = 0;

  // Selected items
  selectedUser: User | null = null;
  selectedUserEvents: Event[] = [];
  selectedEvent: Event | null = null;
  selectedEventGuests: Guest[] = [];
  selectedGuest: Guest | null = null;

  tabs = [
    { id: 'users', label: '👤 Utilisateurs' },
    { id: 'guests', label: '🎫 Invités' },
    { id: 'maintenance', label: '🛠️ Parametre' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private paymentService: PaymentService,
    private breakpointObserver: BreakpointObserver,
    private maintenanceService: MaintenanceService 
  ) {}

  ngOnInit() {
    // On écoute l’état d’authentification
    this.authService.currentUser$.subscribe(user => {
      this.userManager = user;
      console.log("---this.userManager :: ", this.userManager)
    });
    this.getUsers(this.userManager?.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.isMobile = this.breakpointObserver.observe(['(max-width: 1024px)']).pipe(map(res => res.matches));
  }

  getUsers(id?: number) {
    if(!id) return;
    this.authService.getAllUsersLinkedToManager(id).subscribe({
      next: (res: any) => {
        console.log('[getUsers]:', res);
        const response = [];
        for (const data of res.users) {
          let expirationDate = '';
          if(data.userPaymentProofCreatedAt) expirationDate = this.addOneMonthAndFormat(data.userPaymentProofCreatedAt)
          const res = {
            id: data.id,
            name: data.name,
            email: data.email,
            eventsCreated: data.eventsCreated,
            plan: data.plan,
            lastLogin: data.last_login_at,
            createdAt: data.created_at,
            isBlocked: data.isBlocked,
            totalGuests: data.totalGuests,
            userPaymentProof: data.userPaymentProof,
            expirationDate: expirationDate
          }
          response.push(res);
        }
        this.users = response;
        this.getAllEvent(res.events);
        this.getAllGuests(res.guests);
        console.log('[getUsers]:', this.users);
      },
      error: err => console.error(err)
    });
  }

  getAllEvent(events: any){
    console.log("getAllEvent Response :: ", events);
    events.map((elt:any) => {
      const h = elt.banquet_time.split(':')[0];
      const m = elt.banquet_time.split(':')[1].split(':')[0];
      const data = {
        id: elt.event_id,
        organizerId: elt.organizerId,
        title: elt.title,
        type: elt.type,
        guestCount: elt.max_guests,
        stage: elt.status =='active' ? 'published': 'draft',
        date: elt.event_date.split('T')[0],
        time: h+':'+m,
        confirmedGuests: elt.confirmed_count,
        pendingGuests: elt.pending_count,
        declinedGuests: elt.declined_count,
      }
      this.events.push(data);
    });
    // console.log("this.events :: ", this.events);
  }

  getAllGuests(guests: any){
    console.log("getAllGuests Response :: ", guests);
    guests.map((elt:any) => {
      const data = {
        id: elt.id,
        eventId: elt.event_id,
        name: elt.full_name,
        email: elt.email,
        status: elt.rsvp_status,
        qrCodeGenerated: elt.qr_code_url ? true : false,
        qrCodeUrl: elt.qr_code_url,
        dietaryRestrictions: elt.dietary_restrictions,
        plusOne: elt.has_plus_one,
        selected: false,
      }
      this.guests.push(data);
    });
    // console.log("this.guests :: ", this.guests);
  }

  addOneMonthAndFormat(dateString: string): string {
    const date = new Date(dateString);

    // ➕ Ajouter 1 mois
    date.setMonth(date.getMonth() + 1);

    // 🇫🇷 Format en français
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }


  navigateToEventList(): void {
    this.router.navigate(['/event-scan-list'])
  }

  changeUserPlan(user: User, bool: boolean) {
    let confirmation = false;
    let cancelation = false;

    if(bool) confirmation = confirm(
      "Vous êtes sur le point d'activer le plan Professionnel de cet utilisateur. Continuer ?"
    );
    if(!bool) cancelation = confirm(
      "Vous êtes sur le point d'annuler le plan Professionnel de cet utilisateur. Continuer ?"
    );

    if (confirmation && bool) {
      const data = { plan: 'professionnel'};
      this.paymentService.changeUserPlan(Number(user.id), data).subscribe({
        next: (data) => {
          console.log('[changeUserPlan]:', data);
          this.getUsers();
        },
        error: err => console.error(err)
      });
    } else if (cancelation && !bool){
      const data = { plan: 'gratuit'};
      this.paymentService.changeUserPlan(Number(user.id), data).subscribe({
        next: (data) => {
          console.log('[changeUserPlan]:', data);
          this.getUsers();
        },
        error: err => console.error(err)
      });
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  // USER METHODS
  getFilteredUsers(): User[] {
    return this.users.filter(u =>
      (u.name.toLowerCase().includes(this.userSearch.toLowerCase()) ||
       u.email.toLowerCase().includes(this.userSearch.toLowerCase())) &&
      (!this.userPlanFilter || u.plan === this.userPlanFilter)
    );
  }

  viewUserEvents(user: User) {
    this.showDetail = false;
    this.selectedUser = user;
    this.selectedUserEvents = this.events.filter(e => e.organizerId === user.id);
    // console.log("selectedUserEvents: ", this.selectedUserEvents);
    this.activeTab = 'events';
  }

  toggleBlockUser(user: User) {
    user.isBlocked = !user.isBlocked;
    const data = {
      email: user.email,
      isBlocked: user.isBlocked
    }
    this.authService.updateUserStatus(data).subscribe({
      next: (res: any) => {
        console.log('[getUsers]:', res);
        console.log(`Utilisateur ${user.isBlocked ? 'bloqué' : 'débloqué'}`);
      },
      error: (err) => {
        console.error('[getUsers][ERROR]:', err);
      },
      complete: () => {
        console.log('[getUsers] completed');
      }
    });
  }

  // EVENT METHODS
  viewEventGuests(event: Event) {
    this.selectedEvent = event;
    console.log("guests: ", this.guests);
    this.selectedEventGuests = this.guests.filter(g => g.eventId === event.id);
    this.activeTab = 'guests';
  }

  deleteEvent(event: Event) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${event.title} ?`)) {
      this.events = this.events.filter(e => e.id !== event.id);
      console.log('Événement supprimé');
    }
  }

  // GUEST METHODS
  getFilteredEventGuests(): Guest[] {
    return this.selectedEventGuests.filter(g =>
      !this.guestStatusFilter || g.status === this.guestStatusFilter
    );
  }

  viewQRCode(guest: Guest) {
    this.selectedGuest = guest;
  }

  viewUserDetails(user: User) {
    this.selectedUser = user;
    this.showDetail = true;
    console.log("User: ", this.selectedUser);
  }

  deleteGuest(guest: Guest) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${guest.name} ?`)) {
      this.selectedEventGuests = this.selectedEventGuests.filter(g => g.id !== guest.id);
      console.log('Invité supprimé');
    }
  }

  deleteQRCode(guest: Guest) {
    guest.qrCodeGenerated = false;
    guest.qrCodeUrl = undefined;
    this.selectedGuest = null;
    console.log('QR Code supprimé');
  }

  toggleSelectAllGuests(event: any) {
    const isChecked = event.target.checked;
    this.selectedEventGuests.forEach(g => g.selected = isChecked);
  }

  deleteSelectedGuests() {
    const selectedGuests = this.selectedEventGuests.filter(g => g.selected);
    if (selectedGuests.length > 0 && confirm(`Supprimer ${selectedGuests.length} invité(s) ?`)) {
      this.selectedEventGuests = this.selectedEventGuests.filter(g => !g.selected);
      console.log('Invités supprimés');
    }
  }

  deleteSelectedQRCodes() {
    const selectedGuests = this.selectedEventGuests.filter(g => g.selected && g.qrCodeGenerated);
    if (selectedGuests.length > 0 && confirm(`Supprimer ${selectedGuests.length} QR Code(s) ?`)) {
      selectedGuests.forEach(g => {
        g.qrCodeGenerated = false;
        g.qrCodeUrl = undefined;
      });
      console.log('QR Codes supprimés');
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  openAddUserModal() {
    this.showAddUserModal = true;
  }

  addUser() {
    console.log('Nouvel utilisateur:', this.newUser);
    const data = {
      name: this.newUser.name,
      email: this.newUser.email,
      managerId: this.userManager?.id,
      acceptTerms: true
    };
    
    this.loading = true;
    this.authService.addUserLinkedToManager(data).subscribe({
      next: (datas: any[]) => {
        console.log('[getAllUsers ]:', datas);
        this.closeAddUserModal();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error: ', err);
        if (err.status === 400) {
          this.errorMessage = err.error.message || 'Une erreur est survenue lors de l\'ajout de l\'utilisateur.';
        }
      }
    });
    this.getUsers();
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.newUser = { name: '', email: '' };
  }

  // PAGINATION LOGIC
  getPaginatedData(data: any[]): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  }

  getTotalPages(data: any[]): number {
    return Math.ceil(data.length / this.pageSize);
  }

  changePage(page: number) {
    this.currentPage = page;
  }
}
