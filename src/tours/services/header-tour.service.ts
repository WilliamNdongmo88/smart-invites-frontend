import { Injectable } from '@angular/core';
import Shepherd from 'shepherd.js';

@Injectable({
  providedIn: 'root'
})
export class HeaderTourService {

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
    ETAPE SCANNER
    ===================================
    */
    this.tour.addStep({
      id: 'scanner',

      title: 'Scanner les invitations',

      text:
        'Accédez au scanner pour lire les QR Codes des invitations. Cette fonctionnalité permet de confirmer rapidement la présence des invités et de faciliter leur accueil lors de l’événement.',

      attachTo: {
        element: '#menu-scanner',
        on: 'bottom'
      },

      showOn: () => !!document.querySelector('#menu-scanner'),

      buttons: [
        {
          text: 'Suivant',
          action: () => this.tour.complete()
        }
      ]
    });
  }

  start(): void {
    this.tour.start();
  }

  getTour(): any {
    return this.tour;
  }
}
