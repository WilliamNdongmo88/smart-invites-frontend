import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmDeleteModalComponent } from "../../components/confirm-delete-modal/confirm-delete-modal";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  attendanceNotifications: boolean;
  thankNotifications: boolean;
  eventReminders: boolean;
  marketingEmails: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
  allowEventInvites: boolean;
}

interface PasswordData {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDeleteModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  activeTab = 'personal';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;
  showDeleteModal = false;
  warningMessage: string = "";
  modalAction: string | undefined;
  originalUserProfile!: UserProfile;
  userId!: number;

  passwordData: PasswordData  = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  tabs = [
    { id: 'personal', label: 'Informations', icon: '👤' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    // { id: 'privacy', label: 'Confidentialité', icon: '🔐' },
    { id: 'account', label: 'Compte', icon: '⚙️' },
  ];

  userProfile: UserProfile = {
    id: 'user_123456',
    fullName: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    avatar: 'https://via.placeholder.com/120',
    bio: 'Passionné par l\'organisation d\'événements',
    createdAt: '2023-01-15',
  };

  notificationPrefs: NotificationPreferences = {
    emailNotifications: true,
    attendanceNotifications: false,
    thankNotifications: true,
    eventReminders: true,
    marketingEmails: false,
  };

  privacySettings: PrivacySettings = {
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    allowMessages: true,
    allowEventInvites: true,
  };

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.getUserProfile();
  }

  getUserProfile() {
    this.authService.getMe().subscribe(
      (response) => {
        console.log("[getUserProfile] Response :: ", response);
        this.userId = response.id;
        this.userProfile = {
          id: 'user_'+response.id,
          fullName: response.name,
          email: response.email,
          phone: response.phone,
          avatar: response.avatar,
          bio: response.bio || 'Passionné par l\'organisation d\'événements',
          createdAt: response.created_at,
        };
        this.notificationPrefs = {
          emailNotifications: response.email_notifications,
          attendanceNotifications: response.attendance_notifications,
          thankNotifications: response.thank_notifications,
          eventReminders: response.event_reminders,
          marketingEmails: response.marketing_emails,
        };
        this.originalUserProfile = { ...this.userProfile };
      },
      (error) => {
        console.error('❌ Erreur de creation :', error.message.split(':')[4]);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    );
  }

  saveProfile() {
    const userId = parseInt(this.userProfile.id.replace('user_', ''), 10);
    const data = {
      name: this.userProfile.fullName,
      email: this.userProfile.email,
      phone: this.userProfile.phone,
      bio: this.userProfile.bio,
      email_notifications: this.notificationPrefs.emailNotifications,
      attendance_notifications: this.notificationPrefs.attendanceNotifications,
      thank_notifications: this.notificationPrefs.thankNotifications,
      event_reminders: this.notificationPrefs.eventReminders,
      marketing_emails: this.notificationPrefs.marketingEmails,
    };

    this.loading = true;
    this.authService.updateProfile(userId, data).subscribe(
      (response) => {
        console.log("[saveProfile] Response :: ", response);
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('❌ Erreur de creation :', error.message.split(':')[4]);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    );
  }

  // Reset formulaire
  resetForm(form: NgForm) {
    console.log('Reset form called');

    // restaurer les valeurs initiales
    this.userProfile = { ...this.originalUserProfile };

    form.resetForm(this.userProfile);
  }

  changePassword(form: NgForm): void {
    console.log('Changement de mot de passe initié');

    this.errorMessage = '';

    if (!this.passwordData.currentPassword ||
        !this.passwordData.newPassword ||
        !this.passwordData.confirmPassword) {
        this.errorMessage = 'Tous les champs sont obligatoires.';
        this.successMessage = '';
        return;
    }

    if (this.passwordData.newPassword.length < 8) {
        this.errorMessage = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
        return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.errorMessage = 'Les mots de passe ne correspondent pas.';
        return;
    }

    this.loading = true;
    const data = {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword,
    };
    console.log('Données envoyées:', data);

    this.authService.updatePassword(this.userId, data).subscribe(
      (response) => {
        console.log("[saveProfile] Response :: ", response);
        this.loading = false;
        this.successMessage = response.message || 'Mot de passe modifié avec succès.';
        this.errorMessage = '';
        form.resetForm();

        this.passwordData = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };
      },
      (error) => {
        this.loading = false;
        this.successMessage = '';
        console.error('❌ Erreur de creation :', error);
        console.log("Message :: ", error.error.error);
        this.errorMessage = error.error.error || 'Erreur de connexion';
      }
    );
  }

  openDeleteModal(modalAction?: string) {
    this.modalAction = modalAction;
    if(modalAction=='delete'){
      this.warningMessage = "Êtes-vous sûr de vouloir supprimer votre compte ?";
      this.showDeleteModal = true;
    }
  }

  deleteAccount(){
    this.loading = true;
    this.authService.deleteAccount(this.userId).subscribe(
      (response) => {
        console.log("[saveProfile] Response :: ", response);
        this.loading = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        this.authService.logout();
        this.router.navigate(['/']);
      },
      (error) => {
        this.loading = false;
        this.successMessage = '';
        console.error('❌ Erreur de creation :', error);
        console.log("Message :: ", error.error.error);
        this.errorMessage = error.error.error || 'Erreur de connexion';
      }
    );
  }

  confirmDelete() { 
    if(this.modalAction=='delete'){
      this.deleteAccount();
    }
    this.closeModal();
  }

  closeModal() {
    this.showDeleteModal = false;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
