import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  activeTab = 'personal';
  errorMessage : string ='';
  loading = false;
  originalUserProfile!: UserProfile;

  passwordData = {
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

  changePassword(form: NgForm) {
    if (form.invalid) return;

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.errorMessage = 'Les mots de passe ne correspondent pas';
        return;
    }

    this.loading = true;
    this.errorMessage = '';

    console.log('Mot de passe à envoyer :', this.passwordData);

    // Simulation API
    setTimeout(() => {
        this.loading = false;
        alert('✅ Mot de passe modifié avec succès');

        form.resetForm();
    }, 1500);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
