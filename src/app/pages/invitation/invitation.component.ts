import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QrCodeGenerationResponse } from '../../models/qrcode.interface';
import { QrCodeService } from '../../services/qr-code.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GuestService } from '../../services/guest.service';
import { Event } from '../../services/guest.service';
import { EventService } from '../../services/event.service';
import { MatIcon } from "@angular/material/icon";

type ResponseType = 'confirmed' | 'declined' | null;

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss']
})
export class InvitationComponent implements OnInit{
  generatedQrCode: QrCodeGenerationResponse | null = null;
  response = signal<ResponseType>(null);
  dietaryRestrictions = '';
  name = '';
  email = '';
  phone = '';
  plusOneName = '';
  plusOneNameDietRestr = '';
  token = '';
  guestId : number = 0;
  eventId : number = 0;
  url = ''
  linkType = '';
  plusOne = false;
  loading = false;
  isValidating = true;
  isFromGeneratedLink = false;
  showWeddingCivilLocation = false;
  submitted = signal(false);
  concernedEvent: string = "";
  errorMessage: string | null = null;
  additionalInfo: string = '';

  data: Event = {
    guestId: 0,
    guestName: '',
    rsvpStatus: '',
    guestHasPlusOneAutoriseByAdmin: false,
    guestHasPlusOne: false,
    plusOneName: '',
    eventTitle: '',
    description: '',
    eventHasPlusOne: false,
    footRestriction: false,
    eventDate: '',
    eventTime: '',
    banquetTime: '',
    eventCivilLocation: '',
    eventLocation: '',
    emailOrganizer: ''
  };

  constructor(
      private qrCodeService: QrCodeService,
      private guestService: GuestService,
      private eventService: EventService,
      private route: ActivatedRoute,
      private router: Router
  ) {}

  ngOnInit(): void {
      const result = this.route.snapshot.paramMap.get('token') || '';
      this.token = result;
      this.linkType = result.split(":")[1].split("-")[2];
      console.log("Token reçu :: ", result);
      this.getUser(this.token.split(':')[1]);
      if(result.includes('a11a') || result.includes('a22a')){
        this.isFromGeneratedLink = true;
        this.eventId = Number(result.split(':')[0]);
        this.getEventById();
      }else{
        this.guestId = Number(result.split(':')[0]);
        this.getEventByGuest();
      }
      this.getQrCodeImageUrl();
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getUser(token: string) {
      this.eventService.getUserByToken(token).subscribe({
        next: (response: any) => {
          console.log('[getUser] response :: ', response);
        },
        error: (error) => {
          if (error.message.includes('503 Service Unavailable') || 
                  error.message.includes('Le service est en maintenance.')) {
          this.router.navigate(['/maintenance']);
        }
        }
      });
  }

  checkResponse() {
    this.isValidating = false;
    this.errorMessage = "";
    console.log("isValidating :", this.isValidating);
  }
  submitResponse() {
    console.log("this.response():: ", this.response())
    const payload = {
      rsvpToken: this.token,
      rsvpStatus: this.response(),
      dietaryRestrictions: this.dietaryRestrictions || null,
      hasPlusOne: this.plusOne,
      plusOneName: this.plusOne ? this.plusOneName : null,
      plusOneNameDietRestr: this.plusOne ? this.plusOneNameDietRestr : null
    };
    console.log('Payload envoyé au backend :', payload);
    this.isValidating = true;
    this.loading = true;
    if(!this.isFromGeneratedLink){
      if(this.guestId==0) return;
      this.guestService.updateGuest(this.guestId, payload).subscribe({
        next: (response: any) => {
          console.log('[updateGuest] response :: ', response);
          this.loading = false;
          this.submitted.set(true);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error.error || 'Erreur lors de la soumission de votre réponse.';
          console.error('[updateGuest] Erreur :', err.error.error);
        }
      });
    }else{
      const data = {
        eventId: this.eventId,
        fullName: this.name,
        email: this.email,
        phoneNumber: this.phone,
        rsvpStatus: this.response(),
        guestHasPlusOneAutoriseByAdmin: this.linkType == 'a11a' ? false : true,
        dietaryRestrictions: this.dietaryRestrictions || null,
        hasPlusOne: this.plusOne,
        plusOneName: this.plusOne ? this.plusOneName : null,
        plusOneNameDietRestr: this.plusOne ? this.plusOneNameDietRestr : null,
        token: this.token.split(':')[1]
      };
      console.log('Data envoyé au backend :', data);
      if(this.validateForm()){
        this.guestService.addGuestFromGenerateLink(data).subscribe({
          next: (response: any) => {
            console.log('[updateGuest] response :: ', response);
            this.loading = false;
            this.submitted.set(true);
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = err.error.error || 'Erreur lors de la soumission de votre réponse.';
            console.error('[addGuest] Erreur :', err.error.error);
            console.log('[addGuest] Err :', err);
          }
        });
      }else{
        console.log('this.validateForm() ', this.validateForm());
        this.errorMessage = 'Veuillez remplir correctement tous les champs.';
        this.loading = false;
      }
    }
  }

  validateForm(): boolean {
    if (!this.name || !this.email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+?\d{6,15})$/;

    if (!emailRegex.test(this.email)) return false;
    if (this.phone && !phoneRegex.test(this.phone)) return false;

    return true;
  }

  getQrCodeImageUrl() {
    if (this.token && this.guestId || this.token && this.eventId) {
      this.qrCodeService.viewQrCode(this.token).subscribe({
        next: (response: any) => {
          console.log('###response :: ', response);
          if(response.qrCodeUrl){
            this.url = response.qrCodeUrl;
          }else{
            this.url = response.imageUrl;
          }
          
        },
        error: (err) => {
          console.error('Erreur lors du chargement du QR code :', err);
        }
      });
    }
  }

  getEventByGuest(){
    if (this.guestId) {
      this.guestService.getEventByGuest(this.guestId).subscribe({
        next: (response: any) => {
          console.log('response :: ', response);
          if(response.rsvpStatus == 'confirmed'){
            this.response.set('confirmed');
            this.submitted.set(true);
          }
          if(response.rsvpStatus == 'declined'){
            this.response.set('declined');
            this.submitted.set(true);
          }else{
            this.concernedEvent = response.event_name_concerned1 +' et '+ response.event_name_concerned2;
            if (!response?.eventDate) {
              console.error('event_date manquant');
              return;
            }
            const eventDate = new Date(response.eventDate);
            if (isNaN(eventDate.getTime())) {
              console.error('Format de date invalide:', response.eventDate);
              return;
            }
            const date = eventDate.toISOString().split('T')[0];
            const time = eventDate.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC'
            });

            if(response.type=="wedding"){
              this.showWeddingCivilLocation = true;
            }else{
              this.showWeddingCivilLocation = false;
            }

            this.data = {
              guestId: response.guestId,
              guestName: response.guestName,
              rsvpStatus: response.rsvpStatus,
              guestHasPlusOneAutoriseByAdmin: response.guestHasPlusOneAutoriseByAdmin,
              guestHasPlusOne: response.guestHasPlusOne,
              plusOneName: response.plusOneName,
              eventTitle: response.eventTitle,
              description: response.description,
              eventHasPlusOne: response.eventHasPlusOne,
              footRestriction: response.eventFootRestriction,
              eventDate: date,
              eventTime: time,
              banquetTime: response.banquetTime.split(':00')[0],
              eventCivilLocation: response.eventCivilLocation,
              eventLocation: response.eventLocation,
              emailOrganizer: response.emailOrganizer
            };
            this.changeStyle();
          }
        },
        error: (err) => {
          console.error('[getEventByGuest] Erreur :', err);
        }
      });
    }
  }

  getEventById(){
    if (this.eventId) {
      this.eventService.getEventById(this.eventId).subscribe({
        next: (response: any) => {
          console.log('response event :: ', response);
          const event = response[0];
          this.concernedEvent = response.event_name_concerned1 +' et '+ response.event_name_concerned2;
          if (!event.event_date) {
            console.error('event_date manquant');
            return;
          }
          const eventDate = new Date(event.event_date);
          if (isNaN(eventDate.getTime())) {
            console.error('Format de date invalide:', event.event_date);
            return;
          }
          const date = eventDate.toISOString().split('T')[0];
          const time = eventDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
          });

          if(event.type=="wedding"){
            this.showWeddingCivilLocation = true;
          }else{
            this.showWeddingCivilLocation = false;
          }
          
          this.data = {
            guestId: 0,
            guestName: '',
            rsvpStatus: '',
            guestHasPlusOneAutoriseByAdmin: this.linkType == 'a11a' ? false : true,
            guestHasPlusOne: false,
            plusOneName: '',
            eventTitle: event.title,
            description: event.description,
            eventHasPlusOne: event.has_plus_one,
            footRestriction: event.foot_restriction,
            eventDate: date,
            eventTime: time,
            banquetTime: event.banquet_time.split(':00')[0],
            eventCivilLocation: event.event_civil_location,
            eventLocation: event.event_location,
            emailOrganizer: event.emailOrganizer
          };
          this.changeStyle();
        },
        error: (err) => {
          console.error('[getEventById] Erreur :', err);
        }
      });
    }
  }

  boxChecked() {
    console.log("Plus one :", this.plusOne);
    if (this.plusOne) {
      this.isValidating = true;
      this.errorMessage = '';
    }else{
      this.isValidating = false;
      this.errorMessage = '';
    }
  }

  checkField() {
    console.log("isValidating :", this.isValidating);
    this.errorMessage = '';
    this.loading = false; 
    if (this.plusOneName.trim().length > 0) {
      this.isValidating = false; 
      this.errorMessage = '';
    } else if (this.name.trim().length > 0 || this.email.trim().length > 0){
      this.isValidating = false;
      this.loading = false; 
      this.errorMessage = "";
    }else{
      this.isValidating = true;
      this.loading = true; 
      this.errorMessage = "";
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  changeStyle() {
    if(this.data.guestHasPlusOne == true ||
       (this.data.guestHasPlusOneAutoriseByAdmin == true && this.data.eventHasPlusOne == true)){
      this.additionalInfo = 'additional-info';
    }
  }
}