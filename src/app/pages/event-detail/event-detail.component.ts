import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { GuestService } from '../../services/guest.service';
import { CommunicationService } from '../../services/share.service';
import { AddGuestModalComponent } from "../../components/add-guest-modal/add-guest-modal";
import { ErrorModalComponent } from "../../components/error-modal/error-modal";
import { ImportGuestsModalComponent } from "../../components/import-guests-modal/import-guests-modal";
import { SpinnerComponent } from "../../components/spinner/spinner";
import { ConfirmDeleteModalComponent } from "../../components/confirm-delete-modal/confirm-delete-modal";
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'confirmed' | 'pending' | 'declined';
  dietaryRestrictions?: string;
  plusOnedietaryRestrictions?: string;
  plusOne?: boolean;
  plusOneName?: string;
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
  imports: [CommonModule, FormsModule, RouterLink, AddGuestModalComponent, ErrorModalComponent, ImportGuestsModalComponent, SpinnerComponent, ConfirmDeleteModalComponent],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit{
  showAddGuestModal = signal(false);
  showImportModal = signal(false);
  searchTerm = '';
  filteredGuests: Guest[] = [];
  eventId: number | undefined;
  guestId: number | undefined;
  currentUser: User | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;
  showErrorModal = false;
  showDeleteModal = false;
  modalAction: string | undefined;
  warningMessage: string = "";

  itemsPerPage = 6;
  currentPage = 1;

  isMobile!: Observable<boolean>;
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

  guests: Guest[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private eventService: EventService,
    private guestService: GuestService,
    private breakpointObserver: BreakpointObserver,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(){
    const result = this.route.snapshot.paramMap.get('eventId') || '';
    this.eventId = Number(result);
    this.getOneEvent();
    this.getGuestsByEvent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.sendEventIdToHeaderComponent(this.eventId);
    this.isMobile = this.breakpointObserver.observe(['(max-width: 768px)']).pipe(map(res => res.matches));
    console.log("this.isMobile::", this.isMobile)
  }

  getOneEvent(){
    if (this.eventId) {
      // console.log("eventId :: ",this.eventId);
      this.eventService.getEventById(this.eventId).subscribe(
        (response) => {
          // console.log("Response :: ", response.event[0]);
          const res = response[0];
          const time = res.event_date.split('T')[1].split(':')[0]+':'+res.event_date.split('T')[1].split(':')[1]
          this.event = {
              id: res.event_id,
              title: res.title,
              date: res.event_date.split('T')[0],
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
      this.isLoading = true;
      this.guestService.getGuestsForEvent(this.eventId).subscribe(
        (response) => {
          console.log("Response :: ", response.guests);
          response.guests.map(res => {
            const uper = res.rsvp_status
            const data = {
                id: String(res.guest_id),
                name: res.full_name,
                email: res.email,
                phoneNumber: res.phone_number,  
                status: uper.toLowerCase() as 'confirmed' | 'pending' | 'declined',
                dietaryRestrictions: res.dietary_restrictions,
                plusOnedietaryRestrictions: res.plus_one_name_diet_restr,
                plusOne: res.has_plus_one ? true : false,
                plusOneName: res.plus_one_name,
                responseDate: res.response_date.split('T')[0],
            };
            this.guests.push(data);
            return data;
          });
          // console.log(" this.guests :: ",  this.guests);
          this.isLoading = false;
          this.filterGuests();
        },
        (error) => {
          this.isLoading = false;
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
    this.send(this.event.title)
    this.router.navigate(['/events', this.event.id, 'guests']);
  }

  sendReminder() {
    this.send(this.event.title)
    this.router.navigate(['/events', this.event.id, 'guests']);
  }

  shareEvent() {
    alert('🔗 Lien de partage copié dans le presse-papiers !');
  }

  editEvent() {
    //alert('✏️ Édition de l\'événement...');
    this.router.navigate(['/events/edit-event', this.event.id]);
  }

  openDeleteModal(modalAction?: string) {
    this.modalAction = modalAction;

    if(modalAction=='delete'){
      this.warningMessage = "Êtes-vous sûr de vouloir supprimer cet événement ?";
      this.showDeleteModal = true;
    }
  }

  deleteEvent() {
    this.isLoading = false;
    this.eventService.deleteEvent(Number(this.eventId)).subscribe(
      (response) => {
        console.log("[deleteEvent] response :: ", response);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.isLoading = false;
        if (error.status === 409) {
          this.errorMessage = error.error.error;
          this.triggerError();
          this.errorMessage = this.errorMessage;
          console.warn(this.errorMessage);
        } else {
          this.errorMessage = "Une erreur est survenue.";
        }
      }
    );
  }

  onGuestAdded(newGuest: any) {
    const datas = [{
        eventId: this.eventId,
        fullName: newGuest.name,
        email: newGuest.email,
        phoneNumber: newGuest.phone,
        rsvpStatus: "PENDING",
        hasPlusOne: newGuest.plusOne
      }];
        
      this.isLoading = true;
      this.guestService.addGuest(datas).subscribe(
      (response) => {
        console.log("Response :: ", response.guests);
        this.isLoading = false;
        this.getGuestsByEvent();
        this.closeAddGuestModal();
      },
      (error) => {
        this.isLoading = false;
        console.error('❌ Erreur :', error.message.split(':')[1]);
        if(error.message.includes("409 Conflict")){
          this.triggerError();
          this.errorMessage = "Vous essayez d'enregistrer un invités qui existe déjà";
          console.log("Message :: ", this.errorMessage);
        }  
      }
    );
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

  sendEventIdToHeaderComponent(eventId: number){
    this.send(eventId);
  }
  navigateToInvitePage(){
    this.send(this.event.title)
    this.router.navigate(['/events', this.event.id, 'guests']);
  }
  send(message: any) {
    console.log("message::", message)
    this.communicationService.sendMessage(message);
    //this.message = ""; // reset
  }

  openAddGuestModal() {
    this.showAddGuestModal.set(true);
  }

  closeAddGuestModal() {
    this.showAddGuestModal.set(false);
  }

  openImportModal() {
    this.showImportModal.set(true);
  }

  closeImportModal() {
    this.showImportModal.set(false);
  }

  // Logique error-modal
  triggerError() {
    this.showErrorModal = true;
  }

  closeErrorModal() {
    this.showErrorModal = false;
  }

  confirmDelete() {
    this.deleteEvent()
    this.closeModal();
  }

  closeModal() {
    this.showDeleteModal = false;
  }

  // Logique pagination 
  get totalPages() {
    return Math.ceil(this.filteredGuests.length / this.itemsPerPage);
  }

  totalPagesArray() {
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
  }

  paginatedGuests() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredGuests.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
}

