import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface InvitationData {
  // Informations de l'événement
  eventName: string;
  eventType: 'wedding' | 'engagement' | 'birthday' | 'anniversary' | 'other';
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventCivilLocation?: string;
  religiousLocation?: string;
  religiousTime?: string;
  banquetTime?: string;
  showWeddingReligiousLocation: boolean;

  // Personnes concernées
  nameConcerned1: string;
  nameConcerned2: string;

  // Contenu personnalisé
  mainTitle: string;
  subtitle: string;
  mainMessage: string;
  closingMessage: string;

  // Couleurs et design
  titleColor: string;
  accentColor: string;
  topBandColor: string;
  bottomBandColor: string;

  // Logo et images
  logoUrl?: string;
  heartIconUrl?: string;
}

@Component({
  selector: 'app-invitation-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="invitation-editor">
      <!-- Header -->
      <div class="editor-header">
        <div class="container">
          <a routerLink="/dashboard" class="back-link">← Retour</a>
          <h1>Éditeur de Carte d'Invitation</h1>
          <p>Créez une carte d'invitation personnalisée</p>
        </div>
      </div>

      <!-- Main content -->
      <div class="container py-12">
        <div class="editor-wrapper">
          <!-- Form Section -->
          <div class="editor-form">
            <div class="form-card">
              <h2>Informations de l'événement</h2>

              <div class="form-section">
                <h3>📅 Détails de l'événement</h3>

                <div class="form-group">
                  <label>Nom de l'événement *</label>
                  <input
                    type="text"
                    [(ngModel)]="invitationData.eventName"
                    placeholder="Ex: Mariage de Sophie et Pierre"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Type d'événement *</label>
                  <select [(ngModel)]="invitationData.eventType" class="form-select">
                    <option value="wedding">Mariage</option>
                    <option value="engagement">Fiançailles</option>
                    <option value="birthday">Anniversaire</option>
                    <option value="anniversary">Anniversaire de mariage</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      [(ngModel)]="invitationData.eventDate"
                      class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label>Heure *</label>
                    <input
                      type="time"
                      [(ngModel)]="invitationData.eventTime"
                      class="form-input"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Lieu principal *</label>
                  <input
                    type="text"
                    [(ngModel)]="invitationData.eventLocation"
                    placeholder="Ex: Château de Versailles"
                    class="form-input"
                  />
                </div>

                <!-- Affichage conditionnel pour les mariages -->
                <div *ngIf="invitationData.eventType === 'wedding'" class="wedding-options">
                  <div class="form-group">
                    <label>Lieu de la cérémonie civile</label>
                    <input
                      type="text"
                      [(ngModel)]="invitationData.eventCivilLocation"
                      placeholder="Ex: Mairie de Paris"
                      class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        [(ngModel)]="invitationData.showWeddingReligiousLocation"
                      />
                      <span>Afficher la cérémonie religieuse</span>
                    </label>
                  </div>

                  <div *ngIf="invitationData.showWeddingReligiousLocation" class="conditional-fields">
                    <div class="form-group">
                      <label>Lieu de la cérémonie religieuse</label>
                      <input
                        type="text"
                        [(ngModel)]="invitationData.religiousLocation"
                        placeholder="Ex: Cathédrale Notre-Dame"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label>Heure de la cérémonie religieuse</label>
                      <input
                        type="time"
                        [(ngModel)]="invitationData.religiousTime"
                        class="form-input"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Heure de la réception</label>
                    <input
                      type="time"
                      [(ngModel)]="invitationData.banquetTime"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>👥 Personnes concernées</h3>

                <div class="form-row">
                  <div class="form-group">
                    <label>Première personne *</label>
                    <input
                      type="text"
                      [(ngModel)]="invitationData.nameConcerned1"
                      placeholder="Ex: Sophie"
                      class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label>Deuxième personne *</label>
                    <input
                      type="text"
                      [(ngModel)]="invitationData.nameConcerned2"
                      placeholder="Ex: Pierre"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>✍️ Contenu personnalisé</h3>

                <div class="form-group">
                  <label>Titre principal</label>
                  <input
                    type="text"
                    [(ngModel)]="invitationData.mainTitle"
                    placeholder="Ex: Célébrons l'Amour"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Sous-titre</label>
                  <input
                    type="text"
                    [(ngModel)]="invitationData.subtitle"
                    placeholder="Ex: Nous avons la joie de vous convier à notre mariage"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Message principal</label>
                  <textarea
                    [(ngModel)]="invitationData.mainMessage"
                    class="form-textarea"
                    placeholder="Ex: C'est avec un immense bonheur que nous vous invitons..."
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Message de fermeture</label>
                  <textarea
                    [(ngModel)]="invitationData.closingMessage"
                    class="form-textarea"
                    placeholder="Ex: Votre présence illuminera ce jour si spécial pour nous."
                  ></textarea>
                </div>
              </div>

              <div class="form-section">
                <h3>🎨 Couleurs et design</h3>

                <div class="form-row">
                  <div class="form-group">
                    <label>Couleur du titre</label>
                    <div class="color-input-group">
                      <input
                        type="color"
                        [(ngModel)]="invitationData.titleColor"
                        class="color-input"
                      />
                      <input
                        type="text"
                        [(ngModel)]="invitationData.titleColor"
                        class="form-input"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Couleur d'accent</label>
                    <div class="color-input-group">
                      <input
                        type="color"
                        [(ngModel)]="invitationData.accentColor"
                        class="color-input"
                      />
                      <input
                        type="text"
                        [(ngModel)]="invitationData.accentColor"
                        class="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Couleur de la bande supérieure</label>
                    <div class="color-input-group">
                      <input
                        type="color"
                        [(ngModel)]="invitationData.topBandColor"
                        class="color-input"
                      />
                      <input
                        type="text"
                        [(ngModel)]="invitationData.topBandColor"
                        class="form-input"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Couleur de la bande inférieure</label>
                    <div class="color-input-group">
                      <input
                        type="color"
                        [(ngModel)]="invitationData.bottomBandColor"
                        class="color-input"
                      />
                      <input
                        type="text"
                        [(ngModel)]="invitationData.bottomBandColor"
                        class="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>🖼️ Images et logos</h3>

                <div class="form-group">
                  <label>URL du logo</label>
                  <input
                    type="url"
                    [(ngModel)]="invitationData.logoUrl"
                    placeholder="https://..."
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>URL de l'icône cœur</label>
                  <input
                    type="url"
                    [(ngModel)]="invitationData.heartIconUrl"
                    placeholder="https://..."
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-actions">
                <button class="btn btn-primary" (click)="generatePreview()">
                  👁️ Aperçu
                </button>
                <button class="btn btn-outline" (click)="resetForm()">
                  ↺ Réinitialiser
                </button>
                <button class="btn btn-primary" (click)="generatePDF()">
                  📥 Télécharger PDF
                </button>
              </div>
            </div>
          </div>

          <!-- Preview Section -->
          <div class="editor-preview">
            <div class="preview-card">
              <h2>Aperçu de la carte</h2>

              <div class="preview-container">
                <!-- Top band -->
                <div class="preview-top-band" [style.background-color]="invitationData.topBandColor"></div>

                <!-- Content -->
                <div class="preview-content">
                  <!-- Logo -->
                  <div class="preview-logo" *ngIf="invitationData.logoUrl">
                    <img [src]="invitationData.logoUrl" alt="Logo" />
                  </div>

                  <!-- Title -->
                  <h1 class="preview-title" [style.color]="invitationData.titleColor">
                    {{ invitationData.mainTitle }}
                  </h1>

                  <!-- Subtitle -->
                  <p class="preview-subtitle">{{ invitationData.subtitle }}</p>

                  <!-- Guest greeting -->
                  <p class="preview-greeting">
                    Cher/Chère {{ invitationData.nameConcerned1 }} et {{ invitationData.nameConcerned2 }},
                  </p>

                  <!-- Main message -->
                  <p class="preview-message">{{ invitationData.mainMessage }}</p>

                  <!-- Event details -->
                  <div class="preview-event-details" *ngIf="invitationData.eventType === 'wedding'">
                    <h3>Programme de la journée</h3>
                    <p>
                      <strong>Mariage civil</strong><br />
                      {{ formatDate(invitationData.eventDate) }} à {{ invitationData.eventTime }}<br />
                      {{ invitationData.eventCivilLocation }}
                    </p>

                    <p *ngIf="invitationData.showWeddingReligiousLocation">
                      <strong>Cérémonie Religieuse</strong><br />
                      {{ invitationData.religiousTime }}<br />
                      {{ invitationData.religiousLocation }}
                    </p>

                    <p>
                      <strong>Réception nuptiale</strong><br />
                      À partir de {{ invitationData.banquetTime }}<br />
                      {{ invitationData.eventLocation }}
                    </p>
                  </div>

                  <!-- Closing message -->
                  <p class="preview-closing">{{ invitationData.closingMessage }}</p>

                  <!-- Signature -->
                  <p class="preview-signature" [style.color]="invitationData.titleColor">
                    {{ invitationData.nameConcerned1 }} & {{ invitationData.nameConcerned2 }}
                  </p>

                  <!-- Heart icon -->
                  <div class="preview-heart" *ngIf="invitationData.heartIconUrl">
                    <img [src]="invitationData.heartIconUrl" alt="Heart" />
                  </div>
                </div>

                <!-- Bottom band -->
                <div class="preview-bottom-band" [style.background-color]="invitationData.bottomBandColor"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invitation-editor {
      min-height: 100vh;
      background-color: #FFFFFF;
    }

    .editor-header {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
      border-bottom: 1px solid #E0E0E0;
      padding: 2rem 0;
    }

    .back-link {
      display: inline-block;
      color: #D4AF37;
      text-decoration: none;
      margin-bottom: 1rem;
      transition: color 0.3s ease;

      &:hover {
        color: darken(#D4AF37, 10%);
      }
    }

    .editor-header h1 {
      margin-bottom: 0.25rem;
    }

    .editor-header p {
      color: #666666;
    }

    .editor-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .editor-form,
    .editor-preview {
      display: flex;
      flex-direction: column;
    }

    .form-card,
    .preview-card {
      background-color: #FFFFFF;
      border: 1px solid #E0E0E0;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .form-card h2,
    .preview-card h2 {
      margin-bottom: 1.5rem;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #E0E0E0;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
    }

    .form-section h3 {
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      color: #1A1A1A;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-input,
    .form-select,
    .form-textarea {
      padding: 0.75rem 1rem;
      border: 1px solid #E0E0E0;
      border-radius: 0.5rem;
      font-family: 'Lato', sans-serif;
      font-size: 0.875rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #D4AF37;
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
      }
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: normal;

      input {
        cursor: pointer;
      }
    }

    .conditional-fields {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #F5F5F5;
      border-radius: 0.5rem;
    }

    .color-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .color-input {
      width: 50px;
      height: 40px;
      border: 1px solid #E0E0E0;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .color-input-group .form-input {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .form-actions .btn {
      flex: 1;
    }

    .preview-container {
      background: linear-gradient(135deg, #FAFAF8 0%, #FFFFFF 100%);
      border: 1px solid #E0E0E0;
      border-radius: 0.75rem;
      overflow: hidden;
      aspect-ratio: 5 / 7;
      display: flex;
      flex-direction: column;
    }

    .preview-top-band {
      height: 30px;
      background-color: #0055A4;
    }

    .preview-content {
      flex: 1;
      padding: 2rem 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .preview-logo {
      margin-bottom: 1rem;

      img {
        max-width: 80px;
        height: auto;
      }
    }

    .preview-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0.5rem 0;
      color: #b58b63;
    }

    .preview-subtitle {
      font-size: 0.85rem;
      color: #777;
      margin: 0.5rem 0;
      font-style: italic;
    }

    .preview-greeting {
      font-size: 0.85rem;
      color: #333;
      margin: 0.75rem 0;
      font-style: italic;
    }

    .preview-message {
      font-size: 0.8rem;
      color: #444;
      margin: 1rem 0;
      line-height: 1.5;
    }

    .preview-event-details {
      font-size: 0.75rem;
      color: #555;
      margin: 1rem 0;
      text-align: center;

      h3 {
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0.5rem 0;
        line-height: 1.4;
      }
    }

    .preview-closing {
      font-size: 0.8rem;
      color: #888;
      margin: 0.75rem 0;
      font-style: italic;
    }

    .preview-signature {
      font-size: 0.9rem;
      font-weight: bold;
      margin: 0.75rem 0;
      color: #b58b63;
    }

    .preview-heart {
      margin-top: 0.5rem;

      img {
        max-width: 20px;
        height: auto;
      }
    }

    .preview-bottom-band {
      height: 30px;
      background-color: #EF4135;
    }

    .wedding-options {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #F5F5F5;
      border-radius: 0.5rem;
    }

    @media (max-width: 1024px) {
      .editor-wrapper {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .preview-container {
        aspect-ratio: auto;
        height: 600px;
      }
    }
  `]
})
export class InvitationEditorComponent implements OnInit {
  invitationData: InvitationData = {
    eventName: 'Mariage de Sophie et Pierre',
    eventType: 'wedding',
    eventDate: '2025-06-15',
    eventTime: '14:00',
    eventLocation: 'Château de Versailles',
    eventCivilLocation: 'Mairie de Paris',
    religiousLocation: 'Cathédrale Notre-Dame',
    religiousTime: '15:30',
    banquetTime: '19:00',
    showWeddingReligiousLocation: true,
    nameConcerned1: 'Sophie',
    nameConcerned2: 'Pierre',
    mainTitle: 'Célébrons l\'Amour',
    subtitle: 'Nous avons la joie de vous convier à notre mariage',
    mainMessage: 'C\'est avec un immense bonheur que nous vous invitons à célébrer notre union entourés de nos familles et amis, lors d\'une journée inoubliable.',
    closingMessage: 'Votre présence illuminera ce jour si spécial pour nous.',
    titleColor: '#b58b63',
    accentColor: '#D4AF37',
    topBandColor: '#0055A4',
    bottomBandColor: '#EF4135',
    logoUrl: 'https://via.placeholder.com/100',
    heartIconUrl: 'https://via.placeholder.com/20',
  };

  constructor() {}

  ngOnInit() {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  generatePreview() {
    console.log('Aperçu généré:', this.invitationData);
    // Scroll vers l'aperçu
    document.querySelector('.editor-preview')?.scrollIntoView({ behavior: 'smooth' });
  }

  generatePDF() {
    console.log('PDF généré:', this.invitationData);
    alert('Génération du PDF en cours...');
    // Appeler le service backend pour générer le PDF
  }

  resetForm() {
    this.invitationData = {
      eventName: '',
      eventType: 'wedding',
      eventDate: '',
      eventTime: '',
      eventLocation: '',
      eventCivilLocation: '',
      religiousLocation: '',
      religiousTime: '',
      banquetTime: '',
      showWeddingReligiousLocation: false,
      nameConcerned1: '',
      nameConcerned2: '',
      mainTitle: 'Célébrons l\'Amour',
      subtitle: '',
      mainMessage: '',
      closingMessage: '',
      titleColor: '#b58b63',
      accentColor: '#D4AF37',
      topBandColor: '#0055A4',
      bottomBandColor: '#EF4135',
      logoUrl: '',
      heartIconUrl: '',
    };
  }
}
