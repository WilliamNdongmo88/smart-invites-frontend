import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { GuestService } from '../../services/guest.service';
import { CommunicationService } from '../../services/share.service';

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'confirmed' | 'pending' | 'declined';
  dietaryRestrictions?: string;
  plusOne?: boolean;
  responseDate?: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
}

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'declined';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit{
  searchTerm = '';
  // filterStatus = signal<'all' | 'confirmed' | 'pending' | 'declined'>('all');
  filteredGuests: Guest[] = [];
  eventId: number | undefined;
  guestId: number | undefined;
  currentUser: User | null = null;
  errorMessage: string = '';

  filterStatus = signal<FilterStatus>('all');

  filters: { label: string; value: FilterStatus }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Confirmés', value: 'confirmed' },
    { label: 'En attente', value: 'pending' },
    { label: 'Refusés', value: 'declined' },
  ];

  event: Event = {
    id: 0,
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    totalGuests: 0,
    confirmedGuests: 0,
    pendingGuests: 0,
    declinedGuests: 0
  };
  // event: Event = {
  //   id: '1',
  //   title: 'Mariage de Sophie et Pierre',
  //   date: '2025-06-15',
  //   time: '18:00',
  //   location: 'Château de Versailles, Île-de-France',
  //   description: 'Nous avons le plaisir de vous inviter à célébrer notre mariage. Ce sera une journée inoubliable remplie de joie, d\'amour et de moments précieux en compagnie de nos proches.',
  //   totalGuests: 150,
  //   confirmedGuests: 98,
  //   pendingGuests: 35,
  //   declinedGuests: 17,
  // };

  guests: Guest[] = [
    // {
    //   id: '1',
    //   name: 'Jean Dupont',
    //   email: 'jean.dupont@email.com',
    //   status: 'confirmed',
    //   dietaryRestrictions: 'Végétarien',
    //   plusOne: true,
    //   responseDate: '2025-01-10',
    // },
    // {
    //   id: '2',
    //   name: 'Marie Martin',
    //   email: 'marie.martin@email.com',
    //   status: 'pending',
    //   plusOne: false,
    // },
    // {
    //   id: '3',
    //   name: 'Pierre Bernard',
    //   email: 'pierre.bernard@email.com',
    //   status: 'declined',
    //   responseDate: '2025-01-08',
    // },
    // {
    //   id: '4',
    //   name: 'Sophie Leclerc',
    //   email: 'sophie.leclerc@email.com',
    //   status: 'confirmed',
    //   dietaryRestrictions: 'Sans gluten',
    //   plusOne: false,
    //   responseDate: '2025-01-12',
    // },
    // {
    //   id: '5',
    //   name: 'Thomas Moreau',
    //   email: 'thomas.moreau@email.com',
    //   status: 'pending',
    //   plusOne: true,
    // },
    // {
    //   id: '6',
    //   name: 'Isabelle Rousseau',
    //   email: 'isabelle.rousseau@email.com',
    //   status: 'confirmed',
    //   dietaryRestrictions: 'Vegan',
    //   plusOne: false,
    //   responseDate: '2025-01-11',
    // },
    // {
    //   id: '7',
    //   name: 'Marc Dubois',
    //   email: 'marc.dubois@email.com',
    //   status: 'declined',
    //   responseDate: '2025-01-09',
    // },
    // {
    //   id: '8',
    //   name: 'Claire Fontaine',
    //   email: 'claire.fontaine@email.com',
    //   status: 'confirmed',
    //   plusOne: true,
    //   responseDate: '2025-01-13',
    // },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private eventService: EventService,
    private guestService: GuestService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(){
    const result = this.route.snapshot.paramMap.get('eventId') || '';
    this.eventId = Number(result);
    this.getOneEvent();
    this.getGuestsByEvent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getOneEvent(){
    if (this.eventId) {
      // console.log("eventId :: ",this.eventId);
      this.eventService.getEventById(this.eventId).subscribe(
        (response) => {
          // console.log("Response :: ", response.event[0]);
          const res = response.event[0];
          const time = res.event_date.split('T')[1].split(':00')[0];
          this.event = {
              id: res.event_id,
              title: res.title,
              date: res.event_date.split('T')[0],     //"2025-12-05T13:30:00.000Z"
              time: time,
              location: res.event_location,
              description: res.description,
              totalGuests: res.max_guests,
              confirmedGuests: res.confirmed_count,
              pendingGuests: res.pending_count,
              declinedGuests: res.declined_count     
          };
          // console.log("this.events :: ", this.event);
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
  };

  getGuestsByEvent(){
    if (this.eventId) {
      // console.log("eventId :: ",this.eventId);
      this.guestService.getGuestsForEvent(this.eventId).subscribe(
        (response) => {
          // console.log("Response :: ", response.guests);
          response.guests.map(res => {
            const uper = res.rsvp_status
            const data = {
                id: String(res.id),
                name: res.full_name,
                email: res.email,
                phoneNumber: res.phone_number,  
                status: uper.toLowerCase() as 'confirmed' | 'pending' | 'declined',
                dietaryRestrictions: res.notes,
                plusOne: res.has_plus_one ? true : false,
                responseDate: "2025-11-04"//res.response_date.split('T')[0],
            };
            this.guests.push(data);
            return data;
          });
          // console.log(" this.guests :: ",  this.guests);
          // this.loading = false;
          this.filterGuests();
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

  filterGuests() {
    this.filteredGuests = this.guests.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.filterStatus() === 'all' || guest.status === this.filterStatus();
      return matchesSearch && matchesStatus;
    });
    console.log("this.filteredGuests  :: ", this.filteredGuests );
  }

  setFilterStatus(status: 'all' | 'confirmed' | 'pending' | 'declined') {
    this.filterStatus.set(status);
    this.filterGuests();
  }

  getStatusCount(status: string): number {
    if (status === 'all') return this.guests.length;
    return this.guests.filter(g => g.status === status).length;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'confirmed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'declined':
        return '✕';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'declined':
        return 'Refusé';
      default:
        return status;
    }
  }

  getFilterLabel(status: string): string {
    switch (status) {
      case 'all':
        return 'Tous';
      case 'confirmed':
        return 'Confirmés';
      case 'pending':
        return 'En attente';
      case 'declined':
        return 'Refusés';
      default:
        return status;
    }
  }

  getPercentage(count: number): number {
    return Math.round((count / this.event.totalGuests) * 100);
  }

  getResponseRate(): number {
    const responded = this.event.confirmedGuests + this.event.declinedGuests;
    return Math.round((responded / this.event.totalGuests) * 100);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  sendInvitations() {
    alert('✉️ Invitations envoyées avec succès !');
  }

  sendReminder() {
    alert('📧 Rappel envoyé aux invités en attente !');
  }

  shareEvent() {
    alert('🔗 Lien de partage copié dans le presse-papiers !');
  }

  editEvent() {
    alert('✏️ Édition de l\'événement...');
  }

  deleteEvent() {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      alert('🗑️ Événement supprimé !');
    }
  }

  editGuest(guest: Guest) {
    alert(`✏️ Édition de ${guest.name}...`);
  }

  exportList() {
    alert('📥 Export de la liste en cours...');
  }

  shareLink() {
    alert('🔗 Lien partagé !');
  }

  exportCSV() {
    alert('📊 Export CSV en cours...');
  }

  exportPDF() {
    alert('📄 Export PDF en cours...');
  }

  exportExcel() {
    alert('📈 Export Excel en cours...');
  }

  navigateToInvitePage(){
    console.log("eventId ::: ",this.eventId);
    console.log("---Events---- ::: ",this.event);
    this.send(this.event.title)
    this.router.navigate(['/events', this.event.id, 'guests']);
  }
  send(message: any) {
    this.communicationService.sendMessage(message);
    //this.message = ""; // reset
  }
}

