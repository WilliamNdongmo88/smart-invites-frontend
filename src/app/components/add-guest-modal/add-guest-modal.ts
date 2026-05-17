import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { ConfirmDeleteModalComponent } from "../confirm-delete-modal/confirm-delete-modal";

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
  imports: [CommonModule, FormsModule, ConfirmDeleteModalComponent],
  templateUrl: `add-guest-modal.html`,
  styleUrl: 'add-guest-modal.scss'
})
export class AddGuestModalComponent implements OnInit {
  @Output() guestAdded = new EventEmitter<NewGuest>();
  @Output() closed = new EventEmitter<void>();

  newGuest: NewGuest = {
    name: '',
    email: '',
    phone: '',
    plusOne: false,
  };

  showAlerteModal = false;
  warningMessage: string = "";

  currentUser: User | null = null;
  pollingInterval: any;

  constructor(private authService: AuthService,) { }

  ngOnInit(): void {
    // this.authService.currentUser$.subscribe(user => {
    //   this.currentUser = user;
    // });

    // Polling toutes les 15 secondes pour les mises à jour
    this.pollingInterval = setInterval(() => {
      //console.log("⏱️ Polling pour les mises à jour...");
      this.loadCurrentUserData();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadCurrentUserData() {
    this.authService.getMe().subscribe({
      next: (data) => {
        //console.log("🔄 Données utilisateur mises à jour :", data)
        this.currentUser = data;
      }
    });
  }

  onSubmit() {
    if (this.newGuest.name && this.newGuest.email) {
      //console.log("---User plan :: ", this.currentUser?.plan)
      if(this.currentUser?.plan == "gratuit"){
        this.showAlerteModal = true;
      }else if(this.currentUser?.plan == "professionnel"){
        this.guestAdded.emit(this.newGuest);
        this.resetForm();
      }
    }
  }

  confirmAlert() {
    this.showAlerteModal = false;
    this.guestAdded.emit(this.newGuest);
    this.resetForm();
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

