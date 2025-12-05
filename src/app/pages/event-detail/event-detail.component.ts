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
import { FooterDetailComponent } from "../../components/footer/footer.component";
import { QrCodeService } from '../../services/qr-code.service';
import { AlertConfig, ConditionalAlertComponent } from "../../components/conditional-alert/conditional-alert.component";

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'confirmed' | 'pending' | 'declined' | 'present';
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

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'declined' | 'present';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,
    AddGuestModalComponent, ErrorModalComponent,
    ImportGuestsModalComponent, SpinnerComponent,
    ConfirmDeleteModalComponent, FooterDetailComponent,
    ConditionalAlertComponent],
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
  isScanning = true
  modalAction: string | undefined;
  warningMessage: string = "";
  rsvpStatus: string = "";

  itemsPerPage = 6;
  currentPage = 1;

  isMobile!: Observable<boolean>;
  filterStatus = signal<FilterStatus>('confirmed');

  filters: { label: string; value: FilterStatus }[] = [
    { label: 'Confirmés', value: 'confirmed' },
    { label: 'En attente', value: 'pending' },
    { label: 'Refusés', value: 'declined' },
    { label: 'Présents', value: 'present' },
  ];

    // Configuration de l'alerte conditionnelle
  alertConfig: AlertConfig = {
    condition: false,
    type: 'success',
    title: '',
    message: '',
    icon: '',
    dismissible: true,
    autoClose: false,
    duration: 5000,
  };

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
    private qrcodeService: QrCodeService,
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
    //console.log("this.isMobile::", this.isMobile)
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
            this.loadEventData();
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

  loadEventData() {
    // Simuler le chargement des données du backend
    // En production, faire un appel API
    //console.log("rsvp status :: ", this.guests);
    // Exemple 1 : Notification si RSVP confirmé
    if (this.guests[0].status === 'present') {
      this.alertConfig = {
        condition: true,
        type: 'success',
        title: '✓ Présence confirmée',
        message: 'Merci d\'avoir confirmé votre présence à cet événement !',
        icon: '✓',
        dismissible: true,
        autoClose: true,
        duration: 5000,
      };
    }

    // Exemple 2 : Notification si RSVP en attente
    if (this.guests[0].status === 'pending') {
      this.alertConfig = {
        condition: true,
        type: 'warning',
        title: '⏳ En attente de réponse',
        message: 'Veuillez confirmer ou refuser votre présence à cet événement',
        icon: '⏳',
        dismissible: true,
        autoClose: false, // Ne pas fermer automatiquement
        duration: 0,
      };
    }

    // Exemple 3 : Notification si RSVP refusé
    if (this.guests[0].status === 'declined') {
      this.alertConfig = {
        condition: true,
        type: 'error',
        title: '✕ Présence refusée',
        message: 'Vous avez refusé l\'invitation à cet événement',
        icon: '✕',
        dismissible: true,
        autoClose: true,
        duration: 5000,
      };
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

  setFilterStatus(status: 'all' | 'confirmed' | 'pending' | 'declined' | 'present') {
    this.isScanning = true;
    this.rsvpStatus = status;
    console.log("rsvpStatus:: ", this.rsvpStatus);
    if(status=='present') this.isScanning = false;
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
      case 'present':
        return '✓✓';
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
      case 'present':
        return 'Présent';
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
      case 'present':
        return 'Présent le jour j';
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

  shareEventLink(){
    console.log("Partage du lien d'invitation de l'événement");
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
    console.log("rsvpStatus:: ", this.rsvpStatus);
    const date = this.formatDate(this.event.date);
    const data = {
      event:{
        eventTitle: this.event.title,
        eventDate: date,
        eventTime: this.event.time,
        eventDateTime: this.event.date+'T'+this.event.time+':00.000Z',// 2025-11-25T01:08:00.000Z
        eventLocation: this.event.location,
        guestRsvpStatus: this.rsvpStatus
      },
      filteredGuests: this.filteredGuests
    };
    console.log("data :: ", data);
    this.qrcodeService.downloadGuestsPdf(data).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invites-present.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement PDF', err);
      }
    });
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
    //console.log("this.filteredGuests.slice :: ", this.filteredGuests.slice(startIndex, startIndex + this.itemsPerPage))
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

