import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { CreateEventRequest, EventService } from '../../services/event.service';
import { SpinnerComponent } from "../../components/spinner/spinner";
import { CommunicationService } from '../../services/share.service';

interface InvitationData {
  // Informations de l'événement
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventCivilLocation: string;
  religiousLocation?: string;
  religiousTime?: string;
  showReligiousCeremony: boolean;
  banquetTime: string;

  // Personnes concernées
  nameConcerned1: string;
  nameConcerned2: string;

  // Contenu personnalisé
  title: string;
  mainMessage: string;
  eventTheme: string;
  priorityColors: string;
  qrInstructions: string;
  dressCodeMessage: string;
  thanksMessage1: string;
  sousMainMessage: string;
  closingMessage: string;

  // Couleurs et design
  titleColor: string;
  topBandColor: string;
  bottomBandColor: string;
  textColor: string;

  // Logo et images
  logoUrl?: string;
  heartIconUrl?: string;
}

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

    invitationData: InvitationData = {
    eventName: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventCivilLocation: '',
    religiousLocation: '',
    religiousTime: '',
    showReligiousCeremony: false,
    banquetTime: '',
    nameConcerned1: '',
    nameConcerned2: '',
    title: "L'ETTRE D'INVITATION",
    mainMessage: "C'est avec un immense bonheur que nous vous invitons à célébrer notre union. Votre présence à nos côtés rendra cette journée inoubliable.",
    eventTheme: 'CHIC ET GLAMOUR',
    priorityColors: 'Bleu, Blanc, Rouge, Noir',
    qrInstructions: 'Prière de vous présenter uniquement avec votre code QR pour faciliter votre accueil.',
    dressCodeMessage: 'Merci de respecter les couleurs vestimentaires choisies.',
    thanksMessage1: 'Merci pour votre compréhension.',
    sousMainMessage: "Mini réception à la sortie de la mairie directement après la célébration de l'union par Mr le Maire.",
    closingMessage: 'Votre présence illuminera ce jour si spécial pour nous.',
    titleColor: '#b58b63',
    topBandColor: '#0055A4',
    bottomBandColor: '#EF4135',
    textColor: '#444444',
    logoUrl: 'img/logo.png',
    heartIconUrl: 'img/heart.png'
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
    if (this.currentStep() < 5) {
      console.log('this.eventData:', this.eventData);
      console.log("this.invitationData: ", this.invitationData)
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
      this.syncEventToInvitation();
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
      this.syncEventToInvitation();
    }
  }

  private syncEventToInvitation() {
    this.invitationData.eventName = this.eventData.title;
    this.invitationData.eventDate = this.eventData.date;
    this.invitationData.eventTime = this.eventData.time;
    this.invitationData.eventLocation = this.eventData.location;
    this.invitationData.eventCivilLocation = this.eventData.civilLocation;
    this.invitationData.banquetTime = this.eventData.banquetTime;
    this.invitationData.religiousLocation = this.eventData.religiousLocation;
    this.invitationData.religiousTime = this.eventData.religiousTime;
    this.invitationData.showReligiousCeremony = this.eventData.showWeddingReligiousLocation;
    this.invitationData.nameConcerned1 = this.eventData.eventNameConcerned1;
    this.invitationData.nameConcerned2 = this.eventData.eventNameConcerned2;
  }

  onSubmit() {
    const datas = [];
    const eventDatas : CreateEventRequest = {
      organizerId: this.organizerId,
      title: this.eventData.title,
      description: this.invitationData.mainMessage,
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

    const eventInvitationNote = {
      invTitle: this.invitationData.title,
      mainMessage: this.invitationData.mainMessage,
      eventTheme: this.invitationData.eventTheme,
      priorityColors: this.invitationData.priorityColors,
      qrInstructions: this.invitationData.qrInstructions,
      dressCodeMessage: this.invitationData.dressCodeMessage,
      thanksMessage1: this.invitationData.thanksMessage1,
      sousMainMessage: this.invitationData.sousMainMessage,
      closingMessage: this.invitationData.closingMessage,
      titleColor: this.invitationData.titleColor,
      topBandColor: this.invitationData.topBandColor,
      bottomBandColor: this.invitationData.bottomBandColor,
      textColor: this.invitationData.textColor,
      logoUrl: this.invitationData.logoUrl,
      heartIconUrl: this.invitationData.heartIconUrl,
    }
    
    datas.push(eventDatas);
    const data = {
      eventDatas: datas,
      eventInvitationNote: eventInvitationNote
    }
    console.log('Event created:', data);
    this.isLoading = true;
    this.eventService.createEvent(data).subscribe(
      (response) => {
        console.log("Response :: ", response)
        this.isLoading = false;
        this.triggerBAction();
        this.router.navigate(['/evenements']);//dashboard
      },
      (error) => {
        this.isLoading = false;
        console.error('❌ Erreur de creation :', error);
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

    // Invitation Editor Methods
  generatePDF() {
    console.log('Génération du PDF avec les données:', this.invitationData);
    // Logique de génération PDF (à implémenter selon les besoins du projet)
  }

  resetForm() {
    this.syncEventToInvitation();
    this.invitationData.mainMessage = "C'est avec un immense bonheur que nous vous invitons à célébrer notre union. Votre présence à nos côtés rendra cette journée inoubliable.";
    this.invitationData.eventTheme = 'CHIC ET GLAMOUR';
    this.invitationData.priorityColors = 'Bleu, Blanc, Rouge, Noir';
    this.invitationData.titleColor = '#b58b63';
    this.invitationData.topBandColor = '#0055A4';
    this.invitationData.bottomBandColor = '#EF4135';
  }
}

