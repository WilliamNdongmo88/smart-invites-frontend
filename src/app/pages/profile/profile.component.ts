import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface UserProfile {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
  gender?: string;
  language: string;
  timezone: string;
  createdAt: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  weeklyDigest: boolean;
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
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    avatar: 'https://via.placeholder.com/120',
    bio: 'Passionné par l\'organisation d\'événements',
    location: 'Paris, France',
    website: 'https://example.com',
    birthDate: '1990-05-15',
    gender: 'male',
    language: 'fr',
    timezone: 'Europe/Paris',
    createdAt: '2023-01-15',
  };

  notificationPrefs: NotificationPreferences = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    eventReminders: true,
    weeklyDigest: true,
    marketingEmails: false,
  };

  privacySettings: PrivacySettings = {
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    allowMessages: true,
    allowEventInvites: true,
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Charger les données du profil depuis le backend
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
