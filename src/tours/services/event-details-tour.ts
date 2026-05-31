import { Injectable } from '@angular/core';
import Shepherd from 'shepherd.js';

@Injectable({
  providedIn: 'root'
})
export class EventDetailTourService {

  private tour!: any;

  initTour(): void {

    this.tour = new Shepherd.Tour({
      useModalOverlay: true,

      defaultStepOptions: {

        cancelIcon: {
          enabled: true
        },

        scrollTo: {
          behavior: 'smooth',
          block: 'center'
        },

        classes: 'smart-tour-step'
      }
    });

    /*
    ==========================
    ETAPE 1
    ==========================
    */

    this.tour.addStep({
      id: 'event-header',
      title: 'Votre événement',
      text:
        'Cette page vous permet de gérer entièrement votre événement, les invitations et le suivi des réponses.',
      attachTo: {
        element: '#event-header-guide',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Suivant',
          action: () => this.tour.next()
        }
      ]
    });

    /*
    ==========================
    ETAPE 2
    ==========================
    */

    this.tour.addStep({
      id: 'event-details',
      title: 'Détails de l’événement',
      text:
        'Retrouvez ici toutes les informations importantes : date, lieux, horaires et message d’invitation.',
      attachTo: {
        element: '#event-details-card',
        on: 'right'
      },
      buttons: [
        {
          text: 'Précédent',
          action: () => this.tour.back()
        },
        {
          text: 'Suivant',
          action: () => this.tour.next()
        }
      ]
    });

    /*
    ==========================
    ETAPE 3
    ==========================
    */
    this.tour.addStep({
      id: 'manage-guests',
      title: 'Gestion des invités',
      text:
        'Cliquez ici pour accéder à la gestion complète des invités et envoyer les invitations.',
      attachTo: {
        element: '#manage-guests-btn',
        on: 'top'
      },
      buttons: [
        {
          text: 'Précédent',
          action: () => this.tour.back()
        },
        {
          text: 'Suivant',
          action: () => this.tour.next()
        }
      ]
    });

    /*
    ==========================
    ETAPE 3
    ==========================
    */
    this.tour.addStep({
      id: 'manage-links',
      title: 'Liens d’invitation',
      text:
        'Générez des liens d’invitation personnalisés pour votre événement. Vous pourrez ensuite les partager facilement via WhatsApp, Email ou tout autre canal afin de permettre à vos invités de confirmer leur présence.',
      attachTo: {
        element: '#manage-links-btn',
        on: 'top'
      },
      buttons: [
        {
          text: 'Précédent',
          action: () => this.tour.back()
        },
        {
          text: 'Suivant',
          action: () => this.tour.next()
        }
      ]
    });

    /*
    ==========================
    ETAPE 4
    ==========================
    */
    this.tour.addStep({
      id: 'quick-actions',
      title: 'Actions rapides',
      text:
        'Ajoutez rapidement des invités ou importez une liste complète depuis un fichier.',
      attachTo: {
        element: '#quick-actions-card',
        on: 'left'
      },
      buttons: [
        {
          text: 'Précédent',
          action: () => this.tour.back()
        },
        {
          text: 'Suivant',
          action: () => this.tour.next()
        }
      ]
    });

    /*
    ==========================
    ETAPE 5
    ==========================
    */
    this.tour.addStep({
      id: 'invitation-links',
      title: 'Liens d’invitation',
      text:
        'Partagez vos invitations grâce aux liens générés automatiquement pour vos invités.',
      attachTo: {
        element: '#invitation-links-card',
        on: 'left'
      },

      buttons: [
        {
          text: 'Précédent',
          action: () => this.tour.back()
        },
        {
          text: 'Suivant',
          action: () => this.tour.next()
        }
      ]
    });

    /*
    ==========================
    ETAPE 6
    ==========================
    */
    this.tour.addStep({
      id: 'guest-list',
      title: 'Liste des invités',
      text:
        'Consultez les invités, recherchez un participant, filtrez les réponses et exportez vos données.',
      attachTo: {
        element: '#guests-list-card',
        on: 'top'
      },
      buttons: [
        {
          text: 'Précédent',
          action: () => this.tour.back()
        },
        {
          text: 'Suivant',
          action: () => this.tour.next()
        }
      ]
    });

    /*
    ==========================
    ETAPE 7
    ==========================
    */
    this.tour.addStep({
      id: 'stats',
      title: 'Statistiques',
      text:
        'Suivez en temps réel les confirmations, refus et le taux de réponse de vos invités.',
      attachTo: {
        element: '#stats-summary-card',
        on: 'left'
      },
      buttons: [
        {
          text: 'Précédent',
          action: () => this.tour.back()
        },
        {
          text: 'Terminer',
          action: () => this.tour.complete()
        }
      ]
    });

  }

  start(): void {
    this.tour.start();
  }
}
