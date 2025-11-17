import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuestService } from '../../services/guest.service';
import { SpinnerComponent } from "../../components/spinner/spinner";

interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'confirmed' | 'pending' | 'declined';
  dietaryRestrictions?: string;
  plusOne?: boolean;
  plusOneInfo?: {
    name?: string;
    dietaryRestrictions?: string;
  };
  responseDate?: string;
  notes?: string;
  invitationSentDate?: string;
  qrCodeGenerated?: boolean;
  qrCodeUrl?: string;
}

@Component({
  selector: 'app-edit-guest',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: 'edit-guest.component.html',
  styleUrl: 'edit-guest.component.scss'
})
export class EditGuestComponent implements OnInit {
  activeTab = signal<'personal' | 'response' | 'plusone' | 'notes'>('personal');
  guestId: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  eventId: number = 0;

  originalGuestData: Guest = {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    status: 'confirmed',
    dietaryRestrictions: 'Végétarien',
    plusOne: true,
    plusOneInfo: {
      name: 'Marie Dupont',
      dietaryRestrictions: 'Sans gluten',
    },
    responseDate: '2025-01-10',
    notes: 'Ami de longue date, très important pour nous',
    invitationSentDate: '2024-12-20',
    qrCodeGenerated: true,
    qrCodeUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="white" width="200" height="200"/%3E%3Crect fill="black" x="10" y="10" width="180" height="180" opacity="0.1"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" font-size="20" fill="black"%3EQR Code%3C/text%3E%3C/svg%3E',
  };

  guestData: Guest = { ...this.originalGuestData };

  constructor(
    private route: ActivatedRoute,
    private guestService: GuestService, 
    private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.guestId = Number(params['guestId']);
      this.loadGuest();
    });
  }

  loadGuest() {
    this.isLoading = true;
    this.guestService.getGuestById(Number(this.guestId)).subscribe(
    (response) => {
        console.log("###response :: ", response);
        this.eventId = response.eventId;
        this.originalGuestData = {
            id: Number(response.guest_id),
            name: response.full_name,
            email: response.email,
            phone: response.phone_number,
            status: response.rsvp_status as 'confirmed' | 'pending' | 'declined' || 'pending',
            dietaryRestrictions: response.dietary_restrictions,
            plusOne: response.has_plus_one,
            plusOneInfo: {
            name: response.plus_one_name,
            dietaryRestrictions: response.plus_one_name_diet_restr,
            },
            responseDate: response.response_date.split('T')[0],
            notes: response.notes,
            invitationSentDate: response.invitationSentDate.split('T')[0],
            qrCodeGenerated: response.qrCodeUrl ? true : false,
            qrCodeUrl: response.qrCodeUrl,
        };
        this.guestData = JSON.parse(JSON.stringify(this.originalGuestData));
        if (!this.guestData.plusOneInfo) {
        this.guestData.plusOneInfo = {};
        }
        this.isLoading = false;
    },
    (error) => {
        this.isLoading = false;
        console.error('❌ [getGuestById] Erreur :', error.message);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
    }
    );
  }

  onSubmit() {
    console.log('Guest updated:', this.guestData);
    const data = {
        eventId: this.eventId,
        fullName: this.guestData.name,
        email: this.guestData.email,
        phoneNumber: this.guestData.phone,
        rsvpStatus: this.guestData.status,
        dietaryRestrictions: this.guestData.dietaryRestrictions,
        hasPlusOne: this.guestData.plusOne,
        plusOneName: this.guestData.plusOneInfo?.name,
        plusOneNameDietRestr: this.guestData.plusOneInfo?.dietaryRestrictions,
        notes: this.guestData.notes
    }
    console.log('data :: ', data);
    this.isLoading = true;
    this.guestService.updateGuest(this.guestId, data).subscribe({
        next: (response: any) => {
          console.log('response :: ', response);
          this.isLoading = false;
          this.router.navigate(['/events', this.eventId, 'guests', this.guestId]);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Erreur :', err);
        }
      });
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

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getChanges(): Array<{ field: string; newValue: string }> {
    const changes: Array<{ field: string; newValue: string }> = [];

    if (this.guestData.name !== this.originalGuestData.name) {
      changes.push({ field: 'Nom', newValue: this.guestData.name });
    }
    if (this.guestData.email !== this.originalGuestData.email) {
      changes.push({ field: 'Email', newValue: this.guestData.email });
    }
    if (this.guestData.phone !== this.originalGuestData.phone) {
      changes.push({ field: 'Téléphone', newValue: this.guestData.phone || 'Non spécifié' });
    }
    if (this.guestData.status !== this.originalGuestData.status) {
      changes.push({ field: 'Statut', newValue: this.getStatusLabel(this.guestData.status) });
    }
    if (this.guestData.dietaryRestrictions !== this.originalGuestData.dietaryRestrictions) {
      changes.push({ field: 'Restrictions', newValue: this.guestData.dietaryRestrictions || 'Aucune' });
    }
    if (this.guestData.plusOne !== this.originalGuestData.plusOne) {
      changes.push({ field: '+1 autorisé', newValue: this.guestData.plusOne ? 'Oui' : 'Non' });
    }
    if (this.guestData.notes !== this.originalGuestData.notes) {
      changes.push({ field: 'Notes', newValue: this.guestData.notes || 'Aucune' });
    }

    return changes;
  }

  deleteGuest() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.guestData.name} ? Cette action est irréversible.`)) {
      alert('🗑️ Invité supprimé avec succès');
      this.router.navigate(['/guests']);
    }
  }

  gobackToGuestList() {
    this.router.navigate(['/events', this.eventId, 'guests']);
  }

  gobackToGuestDetail() {
    this.router.navigate(['/events', this.eventId, 'guests', this.guestId]);
  }
}

