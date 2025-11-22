import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'pricing.component.html',
  styleUrl: 'pricing.component.scss'
})
export class PricingComponent {
  pricingPlans: PricingPlan[] = [
    {
      name: 'Gratuit',
      price: 0,
      period: 'Pour toujours',
      description: 'Parfait pour commencer',
      features: [
        '1 événement',
        'Jusqu\'à 50 invités',
        'Codes QR',
        'Gestion basique des invités',
        'Support par email',
      ],
    },
    {
      name: 'Professionnel',
      price: 29,
      period: '/mois',
      description: 'Pour les événements réguliers',
      popular: true,
      features: [
        'Événements illimités',
        'Jusqu\'à 500 invités',
        'Import CSV/Excel',
        'Restrictions alimentaires',
        'Rapports avancés',
        'Support prioritaire',
        'Personnalisation',
        'Intégrations',
      ],
    },
    {
      name: 'Entreprise',
      price: 99,
      period: '/mois',
      description: 'Pour les grandes organisations',
      features: [
        'Événements illimités',
        'Invités illimités',
        'API personnalisée',
        'Intégrations personnalisées',
        'Support dédié 24/7',
        'Formation personnalisée',
        'Sauvegardes quotidiennes',
        'Rapports personnalisés',
      ],
    },
  ];
}

