import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from "@angular/material/icon";
import { EventService } from '../../services/event.service';
import { AuthService, User } from '../../services/auth.service';
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
  organizerId: number | undefined;
  currentUser: User | null = null;
  errorMessage: string = '';

  events: Event[] = [];

  constructor(
    private router: Router, 
    private eventService: EventService,
    private authService: AuthService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.organizerId = user?.id 
    });
    this.getAllEvent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getAllEvent(){
    if (this.organizerId) {
      this.eventService.getEvents(this.organizerId).subscribe(
        (response) => {
          // console.log("Response :: ", response.events);
          response.events.map(elt => {
            const data = {
              id: elt.event_id,
              title: elt.title,
              date: elt.event_date.split('T')[0],     //"2025-12-05T13:30:00.000Z"
              location: elt.event_location,
              totalGuests: elt.max_guests,
              confirmedGuests: elt.confirmed_count,
              pendingGuests: elt.pending_count,
              declinedGuests: elt.declined_count     
            }
            this.events.push(data);
            return data;
          });
          // console.log("this.events :: ", this.events);
          // this.loading = false;
        },
        (error) => {
          // this.loading = false;
          console.error('❌ Erreur de recupération :', error.message.split(':')[4]);
          console.log("Message :: ", error.message);
          this.errorMessage = error.message || 'Erreur de connexion';
        }
      );
    }
  }

  getTotalGuests(): number {
    return this.events.reduce((sum, e) => sum + Number(e.totalGuests), 0);
  }

  getTotalConfirmed(): number {
    return this.events.reduce((sum, e) => sum + Number(e.confirmedGuests), 0);
  }

  getTotalPending(): number {
    //console.log("TOTAL pendingGuests:: ",this.events.reduce((sum, e) => sum + Number(e.pendingGuests), 0));
    return this.events.reduce((sum, e) => sum + Number(e.pendingGuests), 0);
  }

  getResponseRate(event: Event): number {
    const responded = event.confirmedGuests + event.declinedGuests;
    return Math.round((responded / Number(event.totalGuests)) * 100);
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

  editEvent(eventId: number) {
    //alert('✏️ Édition de l\'événement...');
    this.router.navigate(['/events/edit-event', eventId]);
  }

  navigateToInvitePage(eventId: number){
    console.log("eventId ::: ",eventId);
    console.log("---Events---- ::: ",this.events[eventId-1]);
    this.send(this.events[eventId-1].title)
    this.router.navigate(['/events', eventId, 'guests']);
  }
  send(message: any) {
    this.communicationService.sendMessage(message);
    //this.message = ""; // reset
  }
}

