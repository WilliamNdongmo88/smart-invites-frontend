import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { GuestService } from '../../services/guest.service';
import { SpinnerComponent } from "../../components/spinner/spinner";
import { ConfirmDeleteModalComponent } from "../../components/confirm-delete-modal/confirm-delete-modal";
import { QrCodeService } from '../../services/qr-code.service';
import { ErrorModalComponent } from "../../components/error-modal/error-modal";
import { CommunicationService } from '../../services/share.service';
import { FooterDetailComponent } from "../../components/footer/footer.component";

interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'confirmed' | 'pending' | 'declined' | 'present';
  footRestriction?: boolean;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  plusOneName?: string;
  plusOneDietaryRestrictions?: string;
  responseDate?: string;
  responseTime?: string;
  qrCodeGenerated?: boolean;
  qrCodeUrl?: string;
  notes?: string;
  invitationSentDate?: string;
}

@Component({
  selector: 'app-guest-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, ConfirmDeleteModalComponent, ErrorModalComponent, FooterDetailComponent],
  templateUrl:'guest-detail.component.html',
  styleUrl: 'guest-detail.component.scss'
})
export class GuestDetailComponent implements OnInit{
  guestId: number = 0;
  eventId: number = 0;
  isLoading: boolean = false;
  loading: boolean = false;
  errorMessage: string = "";
  modalAction: string | undefined;
  warningMessage: string = "";
  showDeleteModal = false;
  showErrorModal = false;

  guest: Guest = {
    id: 1,
    name: 'Will',
    email: 'will@email.com',
    phone: '+237 6 52 34 56 78',
    status: 'confirmed',
    dietaryRestrictions: 'Végétarien',
    plusOne: true,
    responseDate: '2025-01-10',
    qrCodeGenerated: true,
    qrCodeUrl: '',
    notes: 'Ami de longue date, très important pour nous',
    invitationSentDate: '2024-12-20',
  };

  constructor(
    private route: ActivatedRoute,
    private guestService: GuestService,
    private qrCodeService: QrCodeService,
    private communicationService: CommunicationService,
    private router: Router) {}

  ngOnInit(): void {
    const result = this.route.snapshot.paramMap.get('guestId') || '';
    this.guestId = Number(result);
    this.getGuest();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.getStatusLabel('pending');
    console.log("Invité depuis :: ", this.daysAgo('2025-12-17'));
    console.log("Temps de réponse :: ", this.daysBetween('2025-12-17', '2025-12-25'));
  }

  getGuest(){
    if (this.guestId) {
      this.loading = true;
      this.guestService.getGuestById(Number(this.guestId)).subscribe(
        (response) => {
          console.log("[getGuest]response :: ", response);
          const res = response;

          if (!res?.eventDate) {
            console.error('event_date manquant');
            return;
          }

          const eventDate = new Date(res.eventDate);

          if (isNaN(eventDate.getTime())) {
            console.error('Format de date invalide:', res.eventDate);
            return;
          }

          const date = eventDate.toISOString().split('T')[0];

          const time = eventDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
          });
          this.eventId = response.eventId;
            this.guest = {
              id: response.guest_id,
              name: response.full_name,
              email: response.email,
              phone: response.phone_number,
              status: response.rsvp_status,
              dietaryRestrictions: response.dietary_restrictions,
              plusOne: response.has_plus_one,
              plusOneName: response.plus_one_name,
              footRestriction: response.eventFootRestriction,
              plusOneDietaryRestrictions: response.plus_one_name_diet_restr,
              responseDate: date,
              responseTime: time,
              qrCodeGenerated: response.qrCodeUrl ? true : false,
              qrCodeUrl: response.qrCodeUrl,
              notes: response.notes,
              invitationSentDate: response.invitation_sent_date?.split('T')[0] || '',
            };
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          console.error('❌ [getGuestById] Erreur :', error.message);
          console.log("Message :: ", error.message);
          this.errorMessage = error.message || 'Erreur de connexion';
        }
      );
    }
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

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  daysAgo(date: string | undefined): number {
    if (!date) return 0;
    const today = new Date();
    const inviteDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - inviteDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  daysBetween(date1: string | undefined, date2: string | undefined): number {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  editGuest() {
    this.send('personal');
    this.router.navigate(['/events', this.eventId, 'guests', this.guestId, 'edit']);
  }
  send(message: any) {
    this.communicationService.sendMessage(message);
  }

  deleteGuest() {
    this.isLoading = true;
    this.guestService.deleteGuest(this.guestId, this.eventId).subscribe(
      (response) => {
        console.log("response :: ", response);
        this.isLoading = false;
        this.backToGuestList();
      },
      (error) => {
        this.isLoading = false;
        console.error('❌ [deleteGuest] Erreur :', error.message);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    );
  }

  openDeleteModal(modalAction?: string) {
    this.modalAction = modalAction;

    if(modalAction=='delete'){
      this.warningMessage = "Êtes-vous sûr de vouloir supprimer cet invité ?";
      this.showDeleteModal = true;
    }
  }

  confirmDelete() {
    if(this.modalAction=='delete'){
      this.deleteGuest();
    }
    this.closeModal();
  }

  closeModal() {
    this.showDeleteModal = false;
  }

  resendInvitation() {
    //alert(`✉️ Invitation renvoyée à ${this.guest.name}`);
    this.loading = true;
    console.log("[resendInvitation] guest :: ", this.guest);
    if(this.guest.qrCodeUrl == null){
      this.triggerError();
      this.errorMessage = "✉️ L'invitation n'a pas encore été envoyée à cet invité.";
      this.loading = false;
    }else if(this.guest.status != 'pending'){
      this.triggerError();
      this.errorMessage = "✉️ Le status de l'invité doit être en attente.";
      this.loading = false;
    }else if(this.guest.status == 'pending'){
      this.guestService.sendReminderMail([this.guest.id]).subscribe(
      (response) => {
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('❌ [sendReminderMail] Erreur :', error.message);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    );
    }
  }

  markAsConfirmed() {
    this.guestService.updateRsvpStatusGuest(this.guestId, 'confirmed').subscribe(
      (response) => {
        console.log("response :: ", response);
        if (!response?.updated_at) {
          console.error('event_date manquant');
          return;
        }
        const updatedAt = new Date(response.updated_at);
        if (isNaN(updatedAt.getTime())) {
          console.error('Format de date invalide:', response.updated_at);
          return;
        }
        const date = updatedAt.toISOString().split('T')[0];
        const time = updatedAt.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        });
        
        this.guest.status = response.rsvp_status;
        this.guest.responseDate = date;
        this.guest.responseTime = time;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('❌ [updateRsvpStatusGuest] Erreur :', error.message);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';}
    );
    //alert(`✓ ${this.guest.name} marqué comme confirmé`);
  }

  markAsPending() {
    this.guestService.updateRsvpStatusGuest(this.guestId, 'pending').subscribe(
      (response) => {
        console.log("response :: ", response);
        if (!response?.updated_at) {
          console.error('event_date manquant');
          return;
        }
        const updatedAt = new Date(response.updated_at);
        if (isNaN(updatedAt.getTime())) {
          console.error('Format de date invalide:', response.updated_at);
          return;
        }
        const date = updatedAt.toISOString().split('T')[0];
        const time = updatedAt.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        });
        this.guest.status = response.rsvp_status;
        this.guest.responseDate = date;
        this.guest.responseTime = time;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('❌ [updateRsvpStatusGuest] Erreur :', error.message);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';}
    );
    //alert(`✓ ${this.guest.name} marqué comme confirmé`);
  }

  markAsDeclined() {
    this.guestService.updateRsvpStatusGuest(this.guestId, 'declined').subscribe(
      (response) => {
        console.log("response :: ", response);
        if (!response?.updated_at) {
          console.error('event_date manquant');
          return;
        }
        const updatedAt = new Date(response.updated_at);
        if (isNaN(updatedAt.getTime())) {
          console.error('Format de date invalide:', response.updated_at);
          return;
        }
        const date = updatedAt.toISOString().split('T')[0];
        const time = updatedAt.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        });
        this.guest.status = response.rsvp_status;
        this.guest.responseDate = date;
        this.guest.responseTime = time;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('❌ [updateRsvpStatusGuest] Erreur :', error.message);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';}
    );
    //alert(`✕ ${this.guest.name} marqué comme refusé`);
  }

  // editOptions() {
  //   alert(`✏️ Modification des options pour ${this.guest.name}...`);
  // }

  addNotes() {
    this.send('notes');
    this.router.navigate(['/events', this.eventId, 'guests', this.guestId, 'edit']);
  }

  generateQRCode() {
    this.loading = true;
    this.qrCodeService.generateQRCode(this.guestId).subscribe(
      (response) => {
        console.log("###response :: ", response);
        if(Number(this.guest.id) == this.guestId){
            this.guest.qrCodeGenerated = true;
            this.guest.qrCodeUrl = response.qrUrl
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('❌ [generateQRCode] Erreur :', error.message);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    );
  }

  downloadQRCode() {
    if (!this.guest.qrCodeUrl) {
      this.triggerError();
      this.errorMessage = "Le QR code n'est pas disponible pour cet invité.";
      return;
    }

    this.qrCodeService.downloadQrCode(this.guest.id, this.guest.qrCodeUrl);
  }

  sendFileQRCode() {
    this.loading = true;
    if(this.guest.status == 'confirmed'){
      this.guestService.sendFileQrCode(this.guestId).subscribe(
        (response) => {
          console.log("###response :: ", response);
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          console.error('❌ [sendFileQrCode] Erreur :', error.message);
          console.log("Message :: ", error.message);
          this.errorMessage = error.message || 'Erreur de connexion';
        }
      );
    }else{
      this.triggerError();
      this.errorMessage = "L'invité n'a pas encore confirmé sa présence.";
    }
  }

  sendMessage() {
    alert(`💬 Envoi d'un message à ${this.guest.name}...`);
  }

  callGuest() {
    alert(`📞 Appel de ${this.guest.name}...`);
  }

  sendEmail() {
    alert(`✉️ Envoi d'un email à ${this.guest.email}...`);
  }

  shareInvitation() {
    alert(`🔗 Partage de l'invitation avec ${this.guest.name}...`);
  }

  backToGuestList(){
    this.router.navigate(['/events', this.eventId, 'guests']);
  }

  // Logique error-modal
  triggerError() {
    this.showErrorModal = true;
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.loading = false;
  }
}
