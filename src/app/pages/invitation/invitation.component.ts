import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QrCodeGenerationResponse } from '../../models/qrcode.interface';
import { QrCodeService } from '../../services/qr-code.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GuestService } from '../../services/guest.service';
import { Event } from '../../services/guest.service';

type ResponseType = 'confirmed' | 'declined' | null;

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss']
})
export class InvitationComponent implements OnInit{
  generatedQrCode: QrCodeGenerationResponse | null = null;
  response = signal<ResponseType>(null);
  dietaryRestrictions = '';
  plusOneName = '';
  plusOneNameDietRestr = '';
  token = '';
  guestId : number = 0;
  url = ''
  plusOne = false;
  loading = false;
  isValidating = true;
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
    eventLocation: ''
  };

  constructor(
      private qrCodeService: QrCodeService,
      private guestService: GuestService,
      private route: ActivatedRoute
        ) {}

  ngOnInit(): void {
      const result = this.route.snapshot.paramMap.get('token') || '';
      this.token = result;
      console.log("Token reçu :: ", result);
      this.guestId = Number(result.split(':')[0]);
      this.getQrCodeImageUrl();
      this.getEventByGuest();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
  }

  getQrCodeImageUrl() {
    if (this.token && this.guestId) {
      this.qrCodeService.viewQrCode(this.guestId).subscribe({
        next: (response: any) => {
          // console.log('response :: ', response);
          this.url = response.qrCodeUrl; 
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
            this.concernedEvent = response.eventTitle.split('de')[1];
            const responseDate = response.eventDate;
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
              eventDate: response.eventDate.split('T')[0],
              eventTime: responseDate.split('T')[1].split(':')[0]+':'+responseDate.split('T')[1].split(':')[1],
              eventLocation: response.eventLocation
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
    console.log("Valeur actuelle du champ :", this.plusOneName);
    if (this.plusOneName.trim().length > 0) {
      this.isValidating = false; 
      this.errorMessage = '';
    } else {
      this.isValidating = true;
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
    console.log("guestHasPlusOne :: ", this.data.guestHasPlusOne);
    console.log("eventHasPlusOne :: ", this.data.eventHasPlusOne);
    console.log("guestHasPlusOneAutoriseByAdmin :: ", this.data.guestHasPlusOneAutoriseByAdmin);
    if(this.data.guestHasPlusOne == true ||
       (this.data.guestHasPlusOneAutoriseByAdmin == true && this.data.eventHasPlusOne == true)){
      this.additionalInfo = 'additional-info';
    }
  }
}