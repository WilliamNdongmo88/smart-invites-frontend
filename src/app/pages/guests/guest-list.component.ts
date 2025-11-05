import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { User } from '../../services/auth.service';
import { GuestService } from '../../services/guest.service';
import { CommunicationService } from '../../services/share.service';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'confirmed' | 'pending' | 'declined';
  dietaryRestrictions?: string;
  plusOne?: boolean;
  responseDate?: string;
  qrCodeGenerated?: boolean;
  qrCodeUrl?: string;
}

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'declined';

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: `guest-list.component.html`,
  styleUrl: 'guest-list.component.scss',
})
export class GuestListComponent implements OnInit{
  searchTerm = '';
  // filterStatus = signal<'all' | 'confirmed' | 'pending' | 'declined'>('all');
  selectedGuest = signal<Guest | null>(null);
  filteredGuests: Guest[] = [];
  eventId: number | undefined;
  guestId: number | undefined;
  currentUser: User | null = null;
  errorMessage: string = '';
  eventTitle: string = '';

  filterStatus = signal<FilterStatus>('all');
  filters: { label: string; value: FilterStatus }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Confirmés', value: 'confirmed' },
    { label: 'En attente', value: 'pending' },
    { label: 'Refusés', value: 'declined' },
  ];

  guests: Guest[] = [
    // {
    //   id: '1',
    //   name: 'Jean Dupont',
    //   email: 'jean.dupont@email.com',
    //   phone: '+33 6 12 34 56 78',
    //   status: 'confirmed',
    //   dietaryRestrictions: 'Végétarien',
    //   plusOne: true,
    //   responseDate: '2025-01-10',
    //   qrCodeGenerated: true,
    //   qrCodeUrl: 'https://storage.googleapis.com/solsolutionpdf.firebasestorage.app/qrcodes/1:374bb0d8-796e-4ada-adcd-b5e7b05fdcee.png',
    // }
  ];

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private guestService: GuestService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    const result = this.route.snapshot.paramMap.get('eventId') || '';
    this.eventId = Number(result);
    this.getGuestsByEvent();
    this.communicationService.message$.subscribe(msg => {
      this.eventTitle = msg;
    });
  }

  get totalGuests(): number {
    return this.guests.length;
  }

  get confirmedCount(): number {
    return this.guests.filter(g => g.status === 'confirmed').length;
  }

  get pendingCount(): number {
    return this.guests.filter(g => g.status === 'pending').length;
  }

  get declinedCount(): number {
    return this.guests.filter(g => g.status === 'declined').length;
  }

  getGuestsByEvent(){
    if (this.eventId) {
      this.guestService.getGuestsForEvent(this.eventId).subscribe(
        (response) => {
          console.log("Response :: ", response.guests);
          response.guests.map(res => {
            const uper = res.rsvp_status
            const data = {
                id: String(res.id),
                eventId: res.event_id,
                name: res.full_name,
                email: res.email,
                phone: res.phone_number,  
                status: uper.toLowerCase() as 'confirmed' | 'pending' | 'declined',
                dietaryRestrictions: res.notes,
                plusOne: res.has_plus_one ? true : false,
                responseDate: res.response_date.split('T')[0],
                qrCodeGenerated: res.qr_code_url ? true : false,
                qrCodeUrl: res.qr_code_url
            };
            this.guests.push(data);
            return data;
          });
          //console.log(" this.guests :: ",  this.guests);
          // this.loading = false;
          this.filterGuests();
        },
        (error) => {
          // this.loading = false;
          console.error('❌ Erreur de recupération :', error.message.split(':')[4]);
          console.log("Message :: ", error.message);
          this.errorMessage = error.message || 'Erreur de connexion';
        }
      );
    }
  }

  filterGuests() {
    this.filteredGuests = this.guests.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (guest.phone && guest.phone.includes(this.searchTerm));
      const matchesStatus = this.filterStatus() === 'all' || guest.status === this.filterStatus();
      return matchesSearch && matchesStatus;
    });
  }

  setFilterStatus(status: 'all' | 'confirmed' | 'pending' | 'declined') {
    this.filterStatus.set(status);
    this.filterGuests();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'confirmed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'declined':
        return '✕';
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
      default:
        return status;
    }
  }

  getStatusCount(status: string): number {
    if (status === 'all') return this.guests.length;
    return this.guests.filter(g => g.status === status).length;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  viewGuestDetails(guest: Guest) {
    this.selectedGuest.set(guest);
  }

  closeGuestDetails() {
    this.selectedGuest.set(null);
  }

  editGuest(guest: Guest) {
    alert(`✏️ Édition de ${guest.name}...`);
  }

  editGuestFromModal() {
    if (this.selectedGuest()) {
      alert(`✏️ Édition de ${this.selectedGuest.name}...`);
    }
  }

  deleteGuest(guest: Guest) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${guest.name} ?`)) {
      this.guests = this.guests.filter(g => g.id !== guest.id);
      this.filterGuests();
      alert(`🗑️ ${guest.name} a été supprimé`);
    }
  }

  generateQRCode() {
    alert('✨ Génération du QR Code en cours...');
    if (this.selectedGuest()) {
      this.selectedGuest.update(guest => guest ? { ...guest, qrCodeGenerated: true } : guest);
      this.selectedGuest.update(guest => guest ? { ...guest, qrCodeUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="white" width="200" height="200"/%3E%3Crect fill="black" x="10" y="10" width="180" height="180" opacity="0.1"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" font-size="20" fill="black"%3EQR Code%3C/text%3E%3C/svg%3E' } : guest);
    }
  }

  downloadQRCode() {
    alert('📥 Téléchargement du QR Code...');
  }

  inviteNewGuests() {
    alert('✉️ Inviter de nouveaux invités...');
  }

  exportGuests() {
    alert('📥 Export des invités...');
  }

  navigateToEventPage(){
    this.router.navigate(['/events', this.eventId]);
  }
}

