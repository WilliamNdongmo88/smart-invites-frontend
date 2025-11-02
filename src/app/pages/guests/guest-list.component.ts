import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';

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

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: `guest-list.component.html`,
  styleUrl: 'guest-list.component.scss',
})
export class GuestListComponent {
  eventTitle = 'Mariage de Sophie et Pierre';
  searchTerm = '';
  filterStatus = signal<'all' | 'confirmed' | 'pending' | 'declined'>('all');
  selectedGuest = signal<Guest | null>(null);
  filteredGuests: Guest[] = [];

  guests: Guest[] = [
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      status: 'confirmed',
      dietaryRestrictions: 'Végétarien',
      plusOne: true,
      responseDate: '2025-01-10',
      qrCodeGenerated: true,
      qrCodeUrl: 'https://storage.googleapis.com/solsolutionpdf.firebasestorage.app/qrcodes/1:374bb0d8-796e-4ada-adcd-b5e7b05fdcee.png',
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      phone: '+33 7 23 45 67 89',
      status: 'pending',
      plusOne: false,
      qrCodeGenerated: false,
    },
    {
      id: '3',
      name: 'Pierre Bernard',
      email: 'pierre.bernard@email.com',
      phone: '+33 6 98 76 54 32',
      status: 'declined',
      responseDate: '2025-01-08',
      qrCodeGenerated: false,
    },
    {
      id: '4',
      name: 'Sophie Leclerc',
      email: 'sophie.leclerc@email.com',
      status: 'confirmed',
      dietaryRestrictions: 'Sans gluten',
      plusOne: false,
      responseDate: '2025-01-12',
      qrCodeGenerated: true,
      qrCodeUrl: 'https://storage.googleapis.com/solsolutionpdf.firebasestorage.app/qrcodes/2:f29ffae9-340e-4416-ac2f-5227c495af13.png',
    },
    {
      id: '5',
      name: 'Thomas Moreau',
      email: 'thomas.moreau@email.com',
      phone: '+33 7 34 56 78 90',
      status: 'pending',
      plusOne: true,
      qrCodeGenerated: false,
    },
    {
      id: '6',
      name: 'Isabelle Rousseau',
      email: 'isabelle.rousseau@email.com',
      status: 'confirmed',
      dietaryRestrictions: 'Vegan',
      plusOne: false,
      responseDate: '2025-01-11',
      qrCodeGenerated: true,
      qrCodeUrl: 'https://storage.googleapis.com/solsolutionpdf.firebasestorage.app/qrcodes/3:63bf9ac9-ad8c-4a6d-884d-641749588a49.png',
    },
    {
      id: '7',
      name: 'Marc Dubois',
      email: 'marc.dubois@email.com',
      phone: '+33 6 11 22 33 44',
      status: 'declined',
      responseDate: '2025-01-09',
      qrCodeGenerated: false,
    },
    {
      id: '8',
      name: 'Claire Fontaine',
      email: 'claire.fontaine@email.com',
      status: 'confirmed',
      plusOne: true,
      responseDate: '2025-01-13',
      qrCodeGenerated: true,
      qrCodeUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="white" width="200" height="200"/%3E%3Crect fill="black" x="10" y="10" width="180" height="180" opacity="0.1"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" font-size="20" fill="black"%3EQR Code%3C/text%3E%3C/svg%3E',
    },
  ];

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

  constructor(private route: ActivatedRoute, private router: Router) {
    this.filterGuests();
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
}

