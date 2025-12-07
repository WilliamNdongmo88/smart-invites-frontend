import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

interface NewLink {
  type: string;
  used_limit_count: number | null;
}

@Component({
  selector: 'app-link-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'add-link-modal.html',
  styleUrl: 'add-link-modal.scss'
})
export class AddLinkModalComponent {
  @Output() linkAdded = new EventEmitter<NewLink>();
  @Output() closed = new EventEmitter<void>();

  newLink: NewLink = {
    type: '',
    used_limit_count: null,
  };

  onSubmit(form?: NgForm) {
    // Validation simple
    if (!this.newLink.type || !this.newLink.used_limit_count) return;

    // Envoi de l’événemen
    this.linkAdded.emit({
      type: this.newLink.type,
      used_limit_count: this.newLink.used_limit_count
    });

    // Reset du formulaire Angular si fourni
    if (form) {
      form.resetForm();
    } else {
      this.resetForm();
    }
  }

  closeModal() {
    this.closed.emit();
  }

  resetForm() {
    this.newLink = {
      type: '',
      used_limit_count: null
    };
  }
}
