import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  status: 'upcoming' | 'ongoing' | 'past';
  totalGuests: number;
  confirmedGuests: number;
  userResponse?: 'confirmed' | 'pending' | 'declined';
  description: string;
  organizer: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'invitation' | 'reminder' | 'update' | 'info';
  date: string;
  read: boolean;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'user-accueil.component.html',
  styleUrl: 'user-accueil.component.scss'
})
export class UserAccueilComponent {
  userName = 'Sophie';
  activeTab = signal<'upcoming' | 'all' | 'past'>('upcoming');
  showNotifications = signal(false);
  searchTerm = '';
  filterStatus = '';
  filteredEvents: Event[] = [];

  events: Event[] = [
    {
      id: '1',
      title: 'Mariage de Sophie et Pierre',
      date: '2025-06-15',
      time: '14:00',
      location: 'Château de Versailles, Île-de-France',
      status: 'upcoming',
      totalGuests: 150,
      confirmedGuests: 98,
      userResponse: 'confirmed',
      description: 'Un magnifique mariage en plein air',
      organizer: 'Marie Dupont',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=300&fit=crop',
    },
    {
      id: '2',
      title: 'Fiançailles de Jean et Marie',
      date: '2025-04-20',
      time: '18:00',
      location: 'Restaurant Le Bernardin, Paris',
      status: 'upcoming',
      totalGuests: 80,
      confirmedGuests: 65,
      userResponse: 'pending',
      description: 'Soirée de fiançailles',
      organizer: 'Jean Dupont',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=300&fit=crop',
    },
    {
      id: '3',
      title: 'Anniversaire de Pierre',
      date: '2025-03-10',
      time: '20:00',
      location: 'Loft de Brooklyn, New York',
      status: 'upcoming',
      totalGuests: 50,
      confirmedGuests: 35,
      userResponse: 'declined',
      description: 'Fête d\'anniversaire',
      organizer: 'Pierre Martin',
    },
    {
      id: '4',
      title: 'Mariage de Claire et Thomas',
      date: '2024-12-01',
      time: '15:00',
      location: 'Chapelle du Château, Bourgogne',
      status: 'past',
      totalGuests: 120,
      confirmedGuests: 115,
      userResponse: 'confirmed',
      description: 'Un merveilleux mariage',
      organizer: 'Claire Leclerc',
      image: 'https://images.unsplash.com/photo-1465056836643-15cea6cebb14?w=500&h=300&fit=crop',
    },
  ];

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

  get upcomingEventsCount(): number {
    return this.events.filter(e => e.status === 'upcoming').length;
  }

  get confirmedCount(): number {
    return this.events.filter(e => e.userResponse === 'confirmed').length;
  }

  get pendingCount(): number {
    return this.events.filter(e => e.userResponse === 'pending').length;
  }

  get declinedCount(): number {
    return this.events.filter(e => e.userResponse === 'declined').length;
  }

  get unreadNotifications(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  constructor(private router: Router) {
    this.filterEvents();
  }

  filterEvents() {
    let filtered = this.events;

    // Filter by tab
    if (this.activeTab() === 'upcoming') {
      filtered = filtered.filter(e => e.status === 'upcoming');
    } else if (this.activeTab() === 'past') {
      filtered = filtered.filter(e => e.status === 'past');
    }

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by response status
    if (this.filterStatus) {
      filtered = filtered.filter(e => e.userResponse === this.filterStatus);
    }

    this.filteredEvents = filtered;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'À venir';
      case 'ongoing':
        return 'En cours';
      case 'past':
        return 'Passé';
      default:
        return status;
    }
  }

  getResponseLabel(response: string): string {
    switch (response) {
      case 'confirmed':
        return '✓ Confirmé';
      case 'pending':
        return '⏳ En attente';
      case 'declined':
        return '✕ Refusé';
      default:
        return response;
    }
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

  openNotifications() {
    this.showNotifications.set(true);
  }

  closeNotifications() {
    this.showNotifications.set(false);
  }

  markAsRead(notification: Notification) {
    notification.read = true;
  }

  respondToEvent(event: Event) {
    this.router.navigate(['/event-detail', event.id]);
  }

  shareEvent(event: Event) {
    const text = `Vous êtes invité à: ${event.title} - ${this.formatDate(event.date)} à ${event.time}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: text,
      });
    } else {
      alert('Événement: ' + text);
    }
  }
}