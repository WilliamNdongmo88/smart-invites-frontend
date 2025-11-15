import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NewGuest {
  name: string;
  email: string;
  phone?: string;
  dietaryRestrictions?: string;
  plusOne: boolean;
}

@Component({
  selector: 'app-add-guest-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: `add-guest-modal.html`,
  styleUrl: 'add-guest-modal.scss'
})
export class AddGuestModalComponent {
  @Output() guestAdded = new EventEmitter<NewGuest>();
  @Output() closed = new EventEmitter<void>();

  newGuest: NewGuest = {
    name: '',
    email: '',
    phone: '',
    plusOne: false,
  };

  onSubmit() {
    if (this.newGuest.name && this.newGuest.email) {
      this.guestAdded.emit(this.newGuest);
      this.resetForm();
    }
  }

  closeModal() {
    this.closed.emit();
  }

  resetForm() {
    this.newGuest = {
      name: '',
      email: '',
      phone: '',
      dietaryRestrictions: '',
      plusOne: false,
    };
  }
}

