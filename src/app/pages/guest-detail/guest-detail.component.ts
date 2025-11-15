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
  notes?: string;
  invitationSentDate?: string;
}

@Component({
  selector: 'app-guest-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl:'guest-detail.component.html',
  styleUrl: 'guest-detail.component.scss'
})
export class GuestDetailComponent {
  guest: Guest = {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    status: 'confirmed',
    dietaryRestrictions: 'Végétarien',
    plusOne: true,
    responseDate: '2025-01-10',
    qrCodeGenerated: true,
    qrCodeUrl: '',
    notes: 'Ami de longue date, très important pour nous',
    invitationSentDate: '2024-12-20',
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

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
    alert(`✏️ Édition de ${this.guest.name}...`);
  }

  deleteGuest() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.guest.name} ?`)) {
      alert(`🗑️ ${this.guest.name} a été supprimé`);
      this.router.navigate(['/guests']);
    }
  }

  resendInvitation() {
    alert(`✉️ Invitation renvoyée à ${this.guest.name}`);
  }

  markAsConfirmed() {
    this.guest.status = 'confirmed';
    this.guest.responseDate = new Date().toISOString().split('T')[0];
    alert(`✓ ${this.guest.name} marqué comme confirmé`);
  }

  markAsDeclined() {
    this.guest.status = 'declined';
    this.guest.responseDate = new Date().toISOString().split('T')[0];
    alert(`✕ ${this.guest.name} marqué comme refusé`);
  }

  editOptions() {
    alert(`✏️ Modification des options pour ${this.guest.name}...`);
  }

  addNotes() {
    alert(`📝 Ajout de notes pour ${this.guest.name}...`);
  }

  generateQRCode() {
    alert('✨ Génération du QR Code en cours...');
    this.guest.qrCodeGenerated = true;
    this.guest.qrCodeUrl = '';
  }

  downloadQRCode() {
    alert('📥 Téléchargement du QR Code...');
  }

  printQRCode() {
    alert('🖨️ Impression du QR Code...');
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
}

