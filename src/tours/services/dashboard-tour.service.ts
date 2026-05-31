import { Injectable } from '@angular/core';
import Shepherd from 'shepherd.js';

@Injectable({
  providedIn: 'root'
})
export class DashboardTourService {

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

    this.tour.addStep({
      id: 'create-event',
      title: 'Créer un événement',
      text: 'Cliquez ici pour créer votre premier événement.',
      attachTo: {
        element: '#btn-create',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Suivant',
          action: () => this.tour.next()
        }
      ]
    });

    this.tour.addStep({
      id: 'stats',
      title: 'Statistiques',
      text: 'Cette section affiche les statistiques globales de vos événements.',
      attachTo: {
        element: '#stats-section',
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

    this.tour.addStep({
      id: 'events',
      title: 'Liste des événements',
      text: 'Retrouvez ici tous vos événements et cliquez sur l’un d’eux pour en consulter les détails.',
      attachTo: {
        element: '#events-list',
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
