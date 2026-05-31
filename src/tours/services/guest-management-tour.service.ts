import { Injectable } from '@angular/core';
import Shepherd from 'shepherd.js';

@Injectable({
  providedIn: 'root'
})
export class GuestManagementTourService {

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
    ===================================
    ETAPE 1
    ===================================
    */
    this.tour.addStep({
      id: 'guest-management',

      title: 'Gestion des invités',

      text:
        'Cette page vous permet d’ajouter, modifier, supprimer et suivre les réponses de tous vos invités.',

      attachTo: {
        element: '#guest-management-header',
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
    ===================================
    ETAPE 2
    ===================================
    */
    this.tour.addStep({
      id: 'add-guest',

      title: 'Ajouter un invité',

      text:
        'Ajoutez manuellement un nouvel invité à votre événement.',

      attachTo: {
        element: '#add-guest-btn',
        on: 'bottom'
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
    ===================================
    ETAPE 3
    ===================================
    */
    this.tour.addStep({
      id: 'import-guests',

      title: 'Importation',

      text:
        'Importez rapidement une liste complète d’invités depuis un fichier Excel ou CSV.',

      attachTo: {
        element: '#import-guests-btn',
        on: 'bottom'
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
    ===================================
    ETAPE 4
    ===================================
    */
    this.tour.addStep({
      id: 'reminder',

      title: 'Relancer les invités',

      text:
        'Envoyez un rappel automatique aux invités qui n’ont pas encore répondu à votre invitation.',

      attachTo: {
        element: '#send-reminder-btn',
        on: 'bottom'
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
    ===================================
    ETAPE 5
    ===================================
    */
    this.tour.addStep({
      id: 'search-filter',
      showOn: () => !!document.querySelector('#search-filter-section'),
      title: 'Recherche et filtres',

      text:
        'Retrouvez rapidement un invité grâce à la recherche, aux filtres et aux différents modes d’affichage.',

      attachTo: {
        element: '#search-filter-section',
        on: 'bottom'
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
    ===================================
    ETAPE 6
    ===================================
    */
    this.tour.addStep({
      id: 'guest-list',
      showOn: () => !!document.querySelector('#guests-container'),
      title: 'Personnalisez votre affichage',

      text:
        `Choisissez le mode d’affichage qui vous convient :
          la vue Grille pour une consultation visuelle rapide ou la vue Tableau pour gérer et sélectionner plusieurs invités plus facilement.`,

      attachTo: {
        element: '#guests-container',
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
    ===================================
    ETAPE 7
    ===================================
    */
    this.tour.addStep({
      id: 'bulk-send',
      showOn: () => !!document.querySelector('#bulk-send-btn'),
      title: 'Envoi d’invitations',

      text:
        'Après avoir sélectionné plusieurs invités, vous pouvez envoyer leurs invitations en une seule opération.',

      attachTo: {
        element: '#bulk-send-btn',
        on: 'bottom'
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
    ===================================
    ETAPE 8
    ===================================
    */
    this.tour.addStep({
      id: 'statistics',

      title: 'Résumé des réponses',

      text:
        'Suivez l’évolution des confirmations, refus et réponses en attente grâce à ce résumé.',

      attachTo: {
        element: '#guest-stats-footer',
        on: 'top'
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
