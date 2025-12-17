import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EventService } from '../../services/event.service';

interface NewLink {
  mode?: string;
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
export class AddLinkModalComponent implements OnInit{
  @Output() linkAdded = new EventEmitter<NewLink>();
  @Output() closed = new EventEmitter<void>();
  @Output() resetLinks = new EventEmitter<void>();
  @Input() mode: 'create' | 'edit' | 'partage' = 'create';
  @Input() link: any;
  @Input() event: any;

  newLink: NewLink = {
    type: '',
    used_limit_count: null,
  };

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    console.log("[AddLinkModalComponent] mode : ", this.mode);
    console.log("[AddLinkModalComponent] link : ", this.link);
  }

  onSubmit(form?: NgForm) {
    // Validation simple
    if (!this.newLink.type || !this.newLink.used_limit_count) return;

    // Envoi de l’événemen
    this.linkAdded.emit({
      mode: this.mode,
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

  openEditLinkModal(mode: 'create' | 'edit' | 'partage') {
    this.mode = mode;
    this.eventService.getLinkById(this.link.id).subscribe(
      (responses) => {
        console.log("[openEditLinkModal] Responses :: ", responses);
        for (const response of responses) {
          if(response.id==this.link.id){
            this.newLink = {
              type: response.type,
              used_limit_count: response.limit_count
            };
          }
        }
      },
      (error) => {
        console.error('❌ Erreur :', error.message);
      }
    );
  }

  shareEventLinkHandle(){
    this.shareEventLink(this.event, this.link);
    this.closeModal();
  }
  shareEventLink(event: any, link: any) {
    console.log("link:: ", link);

    const message =
      `Vous êtes invité au : ${event.title}\n` +
      `📅 Date : ${this.formatDate(event.date)}\n` +
      `⏰ Heure : ${event.time}\n\n` +
      `Veuillez cliquer sur le lien ci-dessous pour confirmer votre présence :\n` +
      `${link.value}`;

    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: message,
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

  closeModal() {
    this.closed.emit();
  }

  resetForm() {
    this.newLink = {
      type: '',
      used_limit_count: null
    };
  }

  deleteLinkHandle(){
    this.eventService.deleteLink(this.link.id).subscribe(
      (responses) => {
        console.log("[deleteLinkHandle] Responses :: ", responses);
        this.resetLinks.emit();
        this.closeModal();
      },
      (error) => {
        console.error('❌ Erreur :', error.message);
      }
    );
  }
}
