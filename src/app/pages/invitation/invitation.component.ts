import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QrCodeGenerationResponse } from '../../models/qrcode.interface';
import { QrCodeService } from '../../services/qr-code.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  token = '';
  guestId : number = 0;
  url = ''
  plusOne = false;
  submitted = signal(false);

  constructor(private qrCodeService: QrCodeService, private route: ActivatedRoute) {}

  ngOnInit(): void {
      const result = this.route.snapshot.paramMap.get('token') || '';
      this.token = result;
      this.guestId = Number(result.split(':')[0]);
      this.getQrCodeImageUrl();
  }

  submitResponse() {
    if (!this.response() == null) {
      alert('Veuillez sélectionner une réponse');
      return;
    }
    this.submitted.set(true);
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


  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

