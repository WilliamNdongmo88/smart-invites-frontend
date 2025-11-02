import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from "@angular/material/icon";
import { CommunicationService } from '../../services/share.service';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(private router: Router) {}
  
  events: Event[] = [
    {
      id: 1,
      title: 'Mariage de Sophie et Pierre',
      date: '2025-06-15',
      location: 'Château de Versailles',
      totalGuests: 150,
      confirmedGuests: 98,
      pendingGuests: 35,
      declinedGuests: 17,
    },
    {
      id: 2,
      title: 'Mariage de Marie et Jean',
      date: '2025-08-22',
      location: 'Domaine de Montfort',
      totalGuests: 120,
      confirmedGuests: 85,
      pendingGuests: 25,
      declinedGuests: 10,
    },
  ];

  getTotalGuests(): number {
    return this.events.reduce((sum, e) => sum + e.totalGuests, 0);
  }

  getTotalConfirmed(): number {
    return this.events.reduce((sum, e) => sum + e.confirmedGuests, 0);
  }

  getTotalPending(): number {
    return this.events.reduce((sum, e) => sum + e.pendingGuests, 0);
  }

  getResponseRate(event: Event): number {
    const responded = event.confirmedGuests + event.declinedGuests;
    return Math.round((responded / event.totalGuests) * 100);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  openEventDialog(){
    this.router.navigate(['/add-event']);
  }

  navigateToEventDetails(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }

  navigateToInvitePage(){
    this.router.navigate(['/guests']);
  }
}

