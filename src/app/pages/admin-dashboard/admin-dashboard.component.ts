import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';

// Interfaces
interface Visitor {
  id: string;
  ipAddress: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  visitDate: string;
  pageVisited: string;
  duration: number; // en secondes
}

interface User {
  id: string;
  name: string;
  email: string;
  eventsCreated: number;
  plan: 'gratuit' | 'professionnel' | 'entreprise';
  lastLogin: string;
  createdAt: string;
  isBlocked: boolean;
  totalGuests: number;
}

interface Event {
  id: string;
  title: string;
  type: string;
  guestCount: number;
  stage: 'draft' | 'published' | 'completed' | 'cancelled';
  date: string;
  time: string;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'confirmed' | 'pending' | 'declined';
  qrCodeGenerated: boolean;
  qrCodeUrl?: string;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  selected?: boolean;
}

interface Feedback {
  id: string;
  userId: string;
  email: string;
  rating: number;
  category: string;
  title: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  adminNotes?: string;
  isSubscriber: 'subscribed' | 'unsbscribed';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'feedback';

  // Data
  feedbacks: Feedback[] = [];

  visitors: Visitor[] = [
    {
      id: '1',
      ipAddress: '192.168.1.1',
      country: 'France',
      city: 'Paris',
      device: 'Desktop',
      browser: 'Chrome',
      visitDate: '2025-01-15',
      pageVisited: '/home',
      duration: 300,
    },
    {
      id: '2',
      ipAddress: '10.0.0.1',
      country: 'France',
      city: 'Lyon',
      device: 'Mobile',
      browser: 'Safari',
      visitDate: '2025-01-15',
      pageVisited: '/pricing',
      duration: 120,
    },
  ];

  users: User[] = [
    {
      id: '1',
      name: 'Sophie Martin',
      email: 'sophie@example.com',
      eventsCreated: 3,
      plan: 'professionnel',
      lastLogin: '2025-01-15',
      createdAt: '2024-12-01',
      isBlocked: false,
      totalGuests: 150,
    },
    {
      id: '2',
      name: 'Pierre Dupont',
      email: 'pierre@example.com',
      eventsCreated: 1,
      plan: 'gratuit',
      lastLogin: '2025-01-10',
      createdAt: '2025-01-01',
      isBlocked: false,
      totalGuests: 30,
    },
  ];

  events: Event[] = [
    {
      id: '1',
      title: 'Mariage de Sophie et Pierre',
      type: 'Mariage',
      guestCount: 150,
      stage: 'published',
      date: '2025-06-15',
      time: '14:00',
      confirmedGuests: 120,
      pendingGuests: 20,
      declinedGuests: 10,
    },
  ];

  guests: Guest[] = [
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      status: 'confirmed',
      qrCodeGenerated: true,
      qrCodeUrl: 'https://via.placeholder.com/200',
      dietaryRestrictions: 'Végétarien',
      plusOne: true,
      selected: false,
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie@example.com',
      status: 'pending',
      qrCodeGenerated: false,
      dietaryRestrictions: '',
      plusOne: false,
      selected: false,
    },
  ];

  // Filters
  feedbackSearch = '';
  feedbackStatusFilter = '';
  visitorSearch = '';
  userSearch = '';
  userPlanFilter = '';
  guestStatusFilter = '';
  isSubscriber = false;

  // Selected items
  selectedFeedback: Feedback | null = null;
  selectedUser: User | null = null;
  selectedUserEvents: Event[] = [];
  selectedEvent: Event | null = null;
  selectedEventGuests: Guest[] = [];
  selectedGuest: Guest | null = null;

  tabs = [
    { id: 'feedback', label: '💬 Retours d\'Impression' },
    { id: 'visitors', label: '👥 Visiteurs' },
    { id: 'users', label: '👤 Utilisateurs' },
    { id: 'guests', label: '🎫 Invités' },
  ];

  constructor(
    private feedbackService: FeedbackService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadRecentFeedback();
  }

  // FEEDBACK METHODS
  getFilteredFeedback(): Feedback[] {
    return this.feedbacks.filter(f =>
      (f.title.toLowerCase().includes(this.feedbackSearch.toLowerCase()) ||
       f.email.toLowerCase().includes(this.feedbackSearch.toLowerCase())) &&
      (!this.feedbackStatusFilter || f.status === this.feedbackStatusFilter)
    );
  }

  loadRecentFeedback() {
    this.feedbackService.getRecentFeedback().subscribe({
      next: datas => {
        // console.log('Feedbacks récents chargés:', datas);
        const feedbacks: Feedback[] = [];
        const userEmails: { email: string }[] = [];
        for (const data of datas) {
          const userData: Feedback = {
            id: data.id,
            userId: data.userId,
            email: data.email,
            rating: data.rating,
            category: data.category,
            title: data.title,
            message: data.message,
            status: data.status,
            createdAt: data.created_at.split('T')[0],
            isSubscriber: 'unsbscribed'
          };
          feedbacks.push(userData);
          userEmails.push({ email: data.email });
        }
        this.feedbacks = feedbacks;
        // console.log('Feedbacks récents formatés:', this.feedbacks);
        this.getAllUsers(userEmails);
      },
      error: err => console.error(err)
    });
  }

  viewFeedbackDetails(feedback: Feedback) {
    this.selectedFeedback = feedback;
  }

  updateFeedbackStatus(feedback: Feedback) {
    console.log('Statut mis à jour:', feedback);
    const data = {
        status: feedback.status
    }
    this.feedbackService.putRecentFeedback(feedback.id, data).subscribe({
      next: data => {
        console.log('Feedbacks récents rechargés après mise à jour du statut:', data);
        this.loadRecentFeedback();
      },
      error: err => console.error(err)
    });
  }

getAllUsers(dataEmails: any) {
  this.feedbackService.getAllUsers(dataEmails).subscribe({
    next: (datas: any[]) => {
      console.log('[allUsers]:', datas);

      // 1️⃣ Extraire les emails abonnés
      const subscriberEmails = new Set(datas);

      // 2️⃣ Marquer chaque feedback
      this.feedbacks = this.feedbacks.map(feedback => ({
        ...feedback,
        isSubscriber: subscriberEmails.has(feedback.email)
            ? 'subscribed'
            : 'unsbscribed'
     }));

      console.log('[feedbacks enriched]:', this.feedbacks);
    },
    error: err => console.error(err)
  });
}


  saveFeedbackNotes() {
    console.log('Notes enregistrées');
    alert('Notes enregistrées avec succès');
  }

  // VISITOR METHODS
  getFilteredVisitors(): Visitor[] {
    return this.visitors.filter(v =>
      v.country.toLowerCase().includes(this.visitorSearch.toLowerCase()) ||
      v.city.toLowerCase().includes(this.visitorSearch.toLowerCase()) ||
      v.ipAddress.includes(this.visitorSearch)
    );
  }

  getUniqueCountries(): string[] {
    return [...new Set(this.visitors.map(v => v.country))];
  }

  getUniqueDevices(): string[] {
    return [...new Set(this.visitors.map(v => v.device))];
  }

  getUniqueBrowsers(): string[] {
    return [...new Set(this.visitors.map(v => v.browser))];
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
    this.selectedUser = user;
    this.selectedUserEvents = this.events.filter(e => e.id === user.id); // À adapter selon votre structure
    this.activeTab = 'users';
  }

  toggleBlockUser(user: User) {
    user.isBlocked = !user.isBlocked;
    console.log(`Utilisateur ${user.isBlocked ? 'bloqué' : 'débloqué'}`);
  }

  deleteUser(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      console.log('Utilisateur supprimé');
    }
  }

  // EVENT METHODS
  viewEventGuests(event: Event) {
    this.selectedEvent = event;
    this.selectedEventGuests = this.guests;
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
}
