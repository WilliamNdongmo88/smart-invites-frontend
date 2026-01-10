import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { CreateEventRequest, EventService } from '../../services/event.service';
import { SpinnerComponent } from "../../components/spinner/spinner";
import { CommunicationService } from '../../services/share.service';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent],
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit{
  currentStep = signal(1);
  errorMessage : string ='';
  isLoading = false;
  showWeddingNames = false;
  showEngagementNames = false;
  showAnniversaryNames = false;
  showBirthdayNames = false;
  showAnother = false;
  showWeddingCivilLocation = false;
  showWeddingReligiousLocation = false;

  eventData = {
    title: '',
    date: '',
    time: '',
    banquetTime: '',
    civilLocation: '',
    location: '',
    religiousLocation: '',
    religiousTime: '',
    description: '',
    totalGuests: 0,
    budget: 0,
    type: '',
    eventNameConcerned1: '',
    eventNameConcerned2: '',
    allowDietaryRestrictions: true,
    showWeddingReligiousLocation: false,
    allowPlusOne: true,
  };
  organizerId: number | undefined;
  currentUser: User | null = null;

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const datas = [];
    const eventDatas : CreateEventRequest = {
      organizerId: this.organizerId,
      title: this.eventData.title,
      description: this.eventData.description,
      eventDate: this.eventData.date+' '+ this.eventData.time+':00',
      banquetTime: this.eventData.banquetTime,
      religiousLocation: this.eventData.religiousLocation,
      religiousTime: this.eventData.religiousTime,
      eventCivilLocation: this.eventData.civilLocation,
      eventLocation: this.eventData.location,
      maxGuests: this.eventData.totalGuests,
      hasPlusOne: this.eventData.allowPlusOne,
      budget: this.eventData.budget,
      type: this.eventData.type,
      eventNameConcerned1: this.eventData.eventNameConcerned1 || '',
      eventNameConcerned2: this.eventData.eventNameConcerned2 || '',
      footRestriction: this.eventData.allowDietaryRestrictions,
      showWeddingReligiousLocation: this.eventData.showWeddingReligiousLocation,
      status: 'active'
    }
    datas.push(eventDatas);
    console.log('Event created:', datas);
    this.isLoading = true;
    this.eventService.createEvent(datas).subscribe(
      (response) => {
        console.log("Response :: ", response)
        this.isLoading = false;
        this.triggerBAction();
        this.router.navigate(['/evenements']);//dashboard
      },
      (error) => {
        this.isLoading = false;
        console.error('❌ Erreur de creation :', error.message.split(':')[4]);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    );
  }

  toggleReligiousCeremony() {
    this.eventData.showWeddingReligiousLocation = this.showWeddingReligiousLocation;
    if (!this.showWeddingReligiousLocation) {
      this.eventData.religiousLocation = '';
      this.eventData.religiousTime = '';
    }
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

  showSelection() {
    console.log('Type d’événement sélectionné :', this.eventData.type);
    if(this.eventData.type == 'wedding'){
      this.showWeddingCivilLocation = true;
    }else{
      this.showWeddingCivilLocation = false;
    }
  }

  getEventTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      wedding: 'Mariage',
      engagement: 'Fiançailles',
      anniversary: 'Anniversaire de Mariage',
      birthday: 'Anniversaire',
      other: 'Autre',
    };
    return types[type] || 'Non spécifié';
  }

  triggerBAction() {
    this.communicationService.triggerSenderAction('refresh');
  }
}

