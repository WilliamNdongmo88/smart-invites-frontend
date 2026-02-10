import { Component, signal, OnInit, PipeTransform, Pipe } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CreateEventRequest, EventService } from '../../services/event.service';
import { N } from '@angular/cdk/keycodes';
import { SpinnerComponent } from "../../components/spinner/spinner";
import { ErrorModalComponent } from "../../components/error-modal/error-modal";
import { ConfirmDeleteModalComponent } from "../../components/confirm-delete-modal/confirm-delete-modal";
import { CommunicationService } from '../../services/share.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationService } from '../../services/navigationService ';

interface InvitationData {
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

  pdfUrl?: string;
  hasInvitationModelCard?: boolean;
  logoUrl?: string;
  heartIconUrl?: string;
}

interface Event {
  id: string;
  organizerId?: number;
  title: string;
  date: string;
  time: string;
  banquetTime: string;
  religiousLocation: string,
  religiousTime: string,
  civilLocation: string;
  location: string;
  description: string;
  totalGuests: number;
  budget?: number;
  type: string;
  eventNameConcerned1?: string;
  eventNameConcerned2?: string;
  allowDietaryRestrictions?: boolean;
  showWeddingReligiousLocation?: boolean;
  allowPlusOne?: boolean;
  status: 'planned' | 'active' | 'completed' | 'canceled';
  createdAt?: string;
  updatedAt?: string;
}
@Pipe({ name: 'safe', standalone: true })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, FormsModule, 
    SpinnerComponent, ErrorModalComponent, 
    ConfirmDeleteModalComponent, SafePipe],
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
  newFile = false;
  showWeddingCivilLocation = false;
  showWeddingReligiousLocation = false;
  hasInvitationModelCard = false;
  isDefaultPdfUrl = false;
  defaultPdfUrl = 'pdfs/default_invitation_card.pdf';
  selectedPdfFile: File | null = null; // Pour stocker le fichier réel
  pdfModelUrl: string | null = null;   // Pour l'aperçu (base64)

  originalEventData: Event = {
      id: '',
      title: '',
      date: '',
      time: '',
      banquetTime: '',
      religiousLocation: '',
      religiousTime: '',
      civilLocation: '',
      location: '',
      description: '',
      totalGuests: 0,
      type: '',
      budget: 0,
      eventNameConcerned1: '',
      eventNameConcerned2: '',
      allowDietaryRestrictions: true,
      showWeddingReligiousLocation: false,
      allowPlusOne: true,
      status: 'planned'
  };
  eventData: Event = { ...this.originalEventData };

  invitationData: InvitationData = {
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

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private navigationService: NavigationService,
    private communicationService: CommunicationService,
    private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.eventId = Number(params['eventId']);
      console.log('Édition de l\'événement avec ID :', this.eventId);
      // Charger l'événement depuis le backend
      this.loadEvent();
      this.loadEventInvitationNote();
    });
  }

  loadEvent() {
    this.eventService.getEventById(this.eventId).subscribe(
    (response) => {
        console.log("#Response :: ", response);
        const res = response[0];

        if (!res?.event_date) {
          console.error('event_date manquant');
          return;
        }

        const eventDate = new Date(res.event_date);

        if (isNaN(eventDate.getTime())) {
          console.error('Format de date invalide:', res.event_date);
          return;
        }

        const date = eventDate.toISOString().split('T')[0];

        const time = eventDate.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        });

        if(res.type=='wedding'){
          this.showWeddingCivilLocation = true;
        }else{
          this.showWeddingCivilLocation = false;
        }
        const banquetTime1 = res.banquet_time.split(":")[0] 
        const banquetTime2 = res.banquet_time.split(":")[1].split(':')[0];
        const banquetTime = banquetTime1+':'+banquetTime2;
        this.originalEventData = {
            id: Number(res.event_id).toString(),
            organizerId: res.organizer_id,
            title: res.title,
            date: date,
            time: time,
            banquetTime: banquetTime,
            religiousLocation: res.religious_location,
            religiousTime: res.religious_time.split(":00")[0],
            civilLocation: res.event_civil_location,
            location: res.event_location,
            description: res.description,
            totalGuests: res.max_guests,
            budget: res.budget,
            type: res.type,
            allowDietaryRestrictions: res.foot_restriction,
            showWeddingReligiousLocation: res.show_wedding_religious_location,
            eventNameConcerned1: res.event_name_concerned1,
            eventNameConcerned2: res.event_name_concerned2,
            allowPlusOne: res.has_plus_one,
            status: res.status as 'planned' | 'active' | 'completed' | 'canceled',
            createdAt: res.createdAt,
            updatedAt: res.updatedAt,
        };
        this.eventData = { ...this.originalEventData };
        console.log("#this.eventData :: ", this.eventData);
    },
    (error) => {
        // this.loading = false;
        console.error('❌ Erreur de recupération :', error);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
    }
    );
  }

  loadEventInvitationNote() {
    this.eventService.getEventInvitNote(this.eventId).subscribe(
    (response) => {
        console.log("#Response :: ", response);
        this.invitationData = {
          title: response.title ?? this.invitationData.title,
          mainMessage: response.main_message ?? this.invitationData.mainMessage,
          sousMainMessage:response.sous_main_message ?? this.invitationData.sousMainMessage,
          eventTheme: response.event_theme ?? this.invitationData.eventTheme,
          priorityColors: response.priority_colors ?? this.invitationData.priorityColors,
          qrInstructions: response.qr_instructions ?? this.invitationData.qrInstructions,
          dressCodeMessage: response.dress_code_message ?? this.invitationData.dressCodeMessage,
          thanksMessage1: response.thanks_message1 ?? this.invitationData.thanksMessage1,
          closingMessage: response.closing_message ?? this.invitationData.closingMessage,
          titleColor: response.title_color ?? this.invitationData.titleColor,
          topBandColor: response.top_band_color ?? this.invitationData.topBandColor,
          bottomBandColor: response.bottom_band_color ?? this.invitationData.bottomBandColor,
          textColor: response.text_color ?? this.invitationData.textColor,
          pdfUrl: response.pdf_url ?? null,
          hasInvitationModelCard: response.has_invitation_model_card ?? false,
          logoUrl: response.logo_url ?? this.invitationData.logoUrl,
          heartIconUrl: response.heart_icon_url ?? this.invitationData.heartIconUrl,
        };
        this.hasInvitationModelCard = response.has_invitation_model_card;
        this.isDefaultPdfUrl = response.pdf_url ? true : false;
        console.log("# response.pdf_url :: ", response.pdf_url);
        // console.log("# this.isDefaultPdfUrl :: ", this.isDefaultPdfUrl);
        // console.log("#this.invitationData :: ", this.invitationData);
        // console.log("#this.hasInvitationModelCard :: ", this.hasInvitationModelCard);
    },
    (error) => {
        // this.loading = false;
        console.error('❌ Erreur de recupération :', error);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
    }
    );
  }

  isStepValid(step: number, form: NgForm): boolean {
    if (step === 1) {
      // 🟢 SI le modèle PDF est importé → on ignore les validations
      if (this.hasInvitationModelCard) {
        return true;
      }

      // 🔴 SINON → validations normales
      return !!(
        this.eventData.title &&
        this.eventData.type &&
        this.eventData.date &&
        this.eventData.time &&
        this.eventData.location &&
        this.eventData.banquetTime
      );
    }else if (step === 2) {
      return !!(
        this.eventData.eventNameConcerned1 &&
        this.eventData.eventNameConcerned2 &&
        this.eventData.totalGuests
      );
    }

    return true;
  }

  markStepFieldsAsTouched(form: NgForm) {
    Object.entries(form.controls).forEach(([name, control]) => {
      control.markAsTouched();

      if (control.invalid) {
        console.warn(`❌ Champ invalide: ${name}`, {
          value: control.value,
          errors: control.errors
        });
      }
    });
  }


  nextStep(form: NgForm) {
    if (this.currentStep() < 5) {
      console.log('this.currentStep():', this.currentStep()+1);
      // console.log('this.eventData:', this.eventData);
      // console.log("this.invitationData: ", this.invitationData);
      console.log("this.isDefaultPdfUrl: ", this.isDefaultPdfUrl);
      console.log("hasInvitationModelCard: ", this.invitationData.hasInvitationModelCard);
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
      if(this.currentStep()+1 === 4 && 
        this.invitationData.hasInvitationModelCard && !this.isDefaultPdfUrl &&
        !this.selectedPdfFile){
          this.triggerError();
          this.errorMessage = "Veuillez sélectionner votre modèle PDF."; 
          this.currentStep.update(step => step);
          return;
      }
      if (!this.isStepValid(this.currentStep(), form)) {
        console.log("Form: ", form.controls);
        this.markStepFieldsAsTouched(form);
        return;
      }
      this.currentStep.update(step => step + 1);
    }
  }

  changeStep(form: NgForm, step: number) {
    if (step < 5) {
      console.log("Step: ", step);
      // console.log('this.eventData:', this.eventData);
      // console.log("this.invitationData: ", this.invitationData);
      console.log("this.isDefaultPdfUrl: ", this.isDefaultPdfUrl);
      console.log("hasInvitationModelCard: ", this.hasInvitationModelCard);
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
      if(step === 4 && this.hasInvitationModelCard && !this.isDefaultPdfUrl && !this.selectedPdfFile){
          this.triggerError();
          this.errorMessage = "Veuillez sélectionner votre modèle PDF."; 
          this.currentStep.update(step => step);
          return;
      }
      if (!this.isStepValid(this.currentStep(), form)) {
        console.log("Form: ", form.controls);
        this.markStepFieldsAsTouched(form);
        return;
      }
      this.currentStep.set(step);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  onSubmit() {
    if (this.selectedPdfFile) {
      const formData = new FormData();
      // 'pdfFile' est la clé que le backend utilisera pour récupérer le fichier
      formData.append('file', this.selectedPdfFile, this.selectedPdfFile.name);
      //console.log('pdfModelUrl :', this.pdfModelUrl);

      const eventDatas : CreateEventRequest = {
        organizerId: this.eventData.organizerId,
        title: this.eventData.title,
        description: this.invitationData.mainMessage,
        eventDate: this.eventData.date+' '+ this.eventData.time+':00',
        banquetTime: this.eventData.banquetTime,
        religiousLocation: this.eventData.religiousLocation,
        religiousTime: this.eventData.religiousTime,
        eventCivilLocation: this.eventData.civilLocation,
        eventLocation: this.eventData.location,
        type: this.eventData.type,
        budget: this.eventData.budget,
        eventNameConcerned1: this.eventData.eventNameConcerned1,
        eventNameConcerned2: this.eventData.eventNameConcerned2,
        maxGuests: this.eventData.totalGuests,
        hasPlusOne: this.eventData.allowPlusOne,
        footRestriction: this.eventData.allowDietaryRestrictions || false,
        showWeddingReligiousLocation: this.eventData.showWeddingReligiousLocation,
        status: this.eventData.status,
      }
      const eventInvitationNote = {
        eventId: this.eventData.id,
        invTitle: null,
        mainMessage: null,
        eventTheme: null,
        priorityColors: null,
        qrInstructions: null,
        dressCodeMessage: null,
        thanksMessage1: null,
        sousMainMessage: null,
        closingMessage: null,
        titleColor: null,
        topBandColor: null,
        bottomBandColor: null,
        textColor: null,
        pdfUrl: this.invitationData.pdfUrl,
        logoUrl: null,
        heartIconUrl: null,
        hasInvitationModelCard: this.invitationData.hasInvitationModelCard,
      }

      formData.append('eventDatas', JSON.stringify(eventDatas));
      formData.append('eventInvitationNote', JSON.stringify(eventInvitationNote));
      // console.log('PDF Firebase URL :', formData.get('pdfFile'));
      // console.log('eventDatas :', formData.get('eventDatas'));
      // console.log('eventInvitationNote :', formData.get('eventInvitationNote'));
      this.isLoading = true;
      this.eventService.updateEventWihtFile(Number(this.eventData.id), formData).subscribe(
        (response) => {
          console.log("Response :: ", response)
          this.isLoading = false;
          this.triggerBAction();
          this.loadEventInvitationNote();
          this.router.navigate(['/evenements']);
        },
        (error) => {
          this.isLoading = false;
          console.error('❌ Erreur de creation :', error);
          console.log("Message :: ", error.message);
          this.errorMessage = error.message || 'Erreur de connexion';
        }
      );
    }else{
      // console.log('Event Time:', this.eventData.date+' '+ this.eventData.time+':00');
      const eventDatas : CreateEventRequest = {
          organizerId: this.eventData.organizerId,
          title: this.eventData.title,
          description: this.invitationData.mainMessage,
          eventDate: this.eventData.date+' '+ this.eventData.time+':00',
          banquetTime: this.eventData.banquetTime,
          religiousLocation: this.eventData.religiousLocation,
          religiousTime: this.eventData.religiousTime,
          eventCivilLocation: this.eventData.civilLocation,
          eventLocation: this.eventData.location,
          type: this.eventData.type,
          budget: this.eventData.budget,
          eventNameConcerned1: this.eventData.eventNameConcerned1,
          eventNameConcerned2: this.eventData.eventNameConcerned2,
          maxGuests: this.eventData.totalGuests,
          hasPlusOne: this.eventData.allowPlusOne,
          footRestriction: this.eventData.allowDietaryRestrictions || false,
          showWeddingReligiousLocation: this.eventData.showWeddingReligiousLocation,
          status: this.eventData.status,
      }

      const eventInvitationNote = {
        eventId: this.eventData.id,
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
        pdfUrl: this.invitationData.pdfUrl,
        logoUrl: this.invitationData.logoUrl,
        heartIconUrl: this.invitationData.heartIconUrl,
        hasInvitationModelCard: this.invitationData.hasInvitationModelCard,
      }
      
      const data = {
        eventDatas: eventDatas,
        eventInvitationNote: eventInvitationNote
      }
      console.log('Event updated:', data);
      this.isLoading = true;
      this.eventService.updateEvent(Number(this.eventData.id), data).subscribe(
        (response) => {
          console.log("Response :: ", response);
          this.isLoading = false;
          this.triggerBAction();
          this.loadEventInvitationNote();
          this.router.navigate(['/evenements']);
        },
        (error) => {
          this.isLoading = false;
          console.error('❌ Erreur de creation :', error.message.split(':')[4]);
          console.log("Message :: ", error.message);
          this.errorMessage = error.message || 'Erreur de connexion';
        }
      );
    }
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file: File = input.files[0];

    if (file.type === 'application/pdf') {
      this.selectedPdfFile = file;
      //console.log('Fichier PDF sélectionné :', this.selectedPdfFile);

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.pdfModelUrl = e.target?.result as string;
        //console.log('Fichier PDF sélectionné :', this.pdfModelUrl);
      };
      reader.readAsDataURL(file);
      this.newFile = !this.newFile;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Veuillez sélectionner un fichier PDF valide.');
    }
  }

  toggleReligiousCeremony() {
    // console.log("[Avant] this.eventData.showWeddingReligiousLocation: ", this.eventData.showWeddingReligiousLocation);
    if (!this.showWeddingReligiousLocation) {
      this.eventData.religiousLocation = '';
      this.eventData.religiousTime = '';
    }
  }
  toggleInvitationModelCard(){
    console.log("[toggleInvitationModelCard] hasInvitationModelCard: ", this.invitationData.hasInvitationModelCard);
  }
  get currentPdfUrl(): string {
    if (this.newFile && this.pdfModelUrl) {
      return this.pdfModelUrl;
    }
    //console.log("this.defaultPdfUrl: ", this.defaultPdfUrl);
    return this.invitationData.pdfUrl ?? this.defaultPdfUrl;
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
    // console.log('Type d’événement sélectionné :', this.eventData.type);
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
            this.triggerBAction();
            this.router.navigate(['/evenements']);
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

  triggerBAction() {
    // console.log("AddEventComponent → Je demande à DashboardCmp d’exécuter une action !");
    this.communicationService.triggerSenderAction('refresh');
  }

  removePdfModel() {
    this.pdfModelUrl = null;
    this.selectedPdfFile = null;
    this.newFile = false;
  }

  resetForm() {
    // this.syncEventToInvitation();
    this.invitationData.mainMessage = "C'est avec un immense bonheur que nous vous invitons à célébrer notre union. Votre présence à nos côtés rendra cette journée inoubliable.";
    this.invitationData.eventTheme = 'CHIC ET GLAMOUR';
    this.invitationData.priorityColors = 'Bleu, Blanc, Rouge, Noir';
    this.invitationData.titleColor = '#b58b63';
    this.invitationData.topBandColor = '#0055A4';
    this.invitationData.bottomBandColor = '#EF4135';
  }

  navigaToEvents(){
    this.router.navigateByUrl(this.navigationService.back());
  }
}

