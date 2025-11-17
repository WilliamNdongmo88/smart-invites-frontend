import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CreateEventRequest, EventService } from '../../services/event.service';
import { N } from '@angular/cdk/keycodes';
import { SpinnerComponent } from "../../components/spinner/spinner";
import { ErrorModalComponent } from "../../components/error-modal/error-modal";
import { ConfirmDeleteModalComponent } from "../../components/confirm-delete-modal/confirm-delete-modal";

interface Event {
  id: string;
  organizerId?: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  totalGuests: number;
  budget?: string;
  type: string;
  eventNameConcerned1?: string;
  eventNameConcerned2?: string;
  allowDietaryRestrictions?: boolean;
  allowPlusOne?: boolean;
  status: 'planned' | 'active' | 'completed' | 'canceled';
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent, ErrorModalComponent, ConfirmDeleteModalComponent],
  templateUrl: 'edit-event.component.html',
  styleUrl: 'edit-event.component.scss'
})
export class EditEventComponent implements OnInit {
  currentStep = signal(1);
  eventId: number = 0;
  errorMessage: string = '';
  isLoading: boolean = false;
  showErrorModal = false;
  showDeleteModal = false;
  modalAction: string | undefined;
  warningMessage: string = "";
  showWeddingNames = false;
  showEngagementNames = false;
  showAnniversaryNames = false;
  showBirthdayNames = false;
  showAnother = false;

  originalEventData: Event = {
      id: '',
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      totalGuests: 0,
      type: '',
      budget: '',
      eventNameConcerned1: '',
      eventNameConcerned2: '',
      allowDietaryRestrictions: true,
      allowPlusOne: true,
      status: 'planned'
  };

  eventData: Event = { ...this.originalEventData };

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.eventId = Number(params['eventId']);
      console.log('Édition de l\'événement avec ID :', this.eventId);
      // Charger l'événement depuis le backend
      this.loadEvent();
    });
  }

  loadEvent() {
    this.eventService.getEventById(this.eventId).subscribe(
    (response) => {
        console.log("Response :: ", response[0]);
        const res = response[0];
        const time = res.event_date.split('T')[1].split(':')[0]+':'+res.event_date.split('T')[1].split(':')[1]
        this.originalEventData = {
            id: Number(res.event_id).toString(),
            organizerId: res.organizer_id,
            title: res.title,
            date: res.event_date.split('T')[0],
            time: time,
            location: res.event_location,
            description: res.description,
            totalGuests: res.max_guests,
            budget: res.budget,
            type: res.type,
            allowDietaryRestrictions: res.foot_restriction,
            eventNameConcerned1: res.event_name_concerned1,
            eventNameConcerned2: res.event_name_concerned2,
            allowPlusOne: res.has_plus_one,
            status: res.status as 'planned' | 'active' | 'completed' | 'canceled',
            createdAt: res.createdAt,
            updatedAt: res.updatedAt,
        };
        this.eventData = { ...this.originalEventData };
        console.log("this.eventData :: ", this.eventData);
    },
    (error) => {
        // this.loading = false;
        console.error('❌ Erreur de recupération :', error.message.split(':')[4]);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
    }
    );
    
  }

  nextStep() {
    if (this.currentStep() < 3) {
      console.log('this.eventData:', this.eventData);
      if (this.eventData.type=='wedding') {
        this.showWeddingNames = true;
        this.showEngagementNames = false;
        this.showAnniversaryNames = false;
        this.showBirthdayNames = false;
        this.showAnother = false;
      }
      if (this.eventData.type=='engagement') {
        this.showEngagementNames = true;
        this.showWeddingNames = false;
        this.showAnniversaryNames = false;
        this.showBirthdayNames = false;
        this.showAnother = false;
      }
      if (this.eventData.type=='anniversary') {
        this.showAnniversaryNames = true;
        this.showWeddingNames = false;
        this.showEngagementNames = false;
        this.showBirthdayNames = false;
        this.showAnother = false;
      }
      if (this.eventData.type=='birthday') {
        this.showBirthdayNames = true;
        this.showWeddingNames = false;
        this.showEngagementNames = false;
        this.showAnniversaryNames = false;
        this.showAnother = false;
      }
      if (this.eventData.type=='other') {
        this.showAnother = true;
        this.showWeddingNames = false;
        this.showEngagementNames = false;
        this.showAnniversaryNames = false;
        this.showBirthdayNames = false;
      }
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  onSubmit() {
    console.log('Event Time:', this.eventData.date+' '+ this.eventData.time+':00');
    const eventDatas : CreateEventRequest = {
        organizerId: this.eventData.organizerId,
        title: this.eventData.title,
        description: this.eventData.description,
        eventDate: this.eventData.date+' '+ this.eventData.time+':00',
        eventLocation: this.eventData.location,
        maxGuests: this.eventData.totalGuests,
        hasPlusOne: this.eventData.allowPlusOne,
        footRestriction: this.eventData.allowDietaryRestrictions,
        status: this.eventData.status,
    }
    console.log('Event updated:', eventDatas);
    this.isLoading = true;
    this.eventService.updateEvent(Number(this.eventData.id), eventDatas).subscribe(
      (response) => {
        console.log("Response :: ", response);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.isLoading = false;
        console.error('❌ Erreur de creation :', error.message.split(':')[4]);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    );
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getEventTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      wedding: 'Mariage',
      engagement: 'Fiançailles',
      anniversary: 'Anniversaire',
      birthday: 'Anniversaire',
      other: 'Autre',
    };
    return types[type] || 'Non spécifié';
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      planned: 'Prévu',
      active: 'Actif',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return statuses[status] || status;
  }

  getChanges(): Array<{ field: string; newValue: string }> {
    const changes: Array<{ field: string; newValue: string }> = [];

    if (this.eventData.title !== this.originalEventData.title) {
      changes.push({ field: 'Titre', newValue: this.eventData.title });
    }
    if (this.eventData.date !== this.originalEventData.date) {
      changes.push({ field: 'Date', newValue: this.formatDate(this.eventData.date) });
    }
    if (this.eventData.time !== this.originalEventData.time) {
      changes.push({ field: 'Heure', newValue: this.eventData.time });
    }
    if (this.eventData.location !== this.originalEventData.location) {
      changes.push({ field: 'Lieu', newValue: this.eventData.location });
    }
    if (this.eventData.totalGuests !== this.originalEventData.totalGuests) {
      changes.push({ field: 'Nombre d\'invités', newValue: String(this.eventData.totalGuests) });
    }
    if (this.eventData.budget !== this.originalEventData.budget) {
      changes.push({ field: 'Budget', newValue: `${this.eventData.budget}€` });
    }
    if (this.eventData.status !== this.originalEventData.status) {
      changes.push({ field: 'Statut', newValue: this.getStatusLabel(this.eventData.status) });
    }

    return changes;
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
            // afficher le message venant du backend
            console.log("error.error.error :: ", error.error.error); 
            this.triggerError();
            this.errorMessage = error.error.error; 
            console.warn(this.errorMessage);
            } else {
            this.errorMessage = "Une erreur est survenue.";
            }
        }
    );
  }

  confirmDelete() {
    this.deleteEvent()
    this.closeModal();
  }

  closeModal() {
    this.showDeleteModal = false;
  }

  // Logique error-modal
  triggerError() {
    this.showErrorModal = true;
  }

  closeErrorModal() {
    this.showErrorModal = false;
  }
}

