import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PaymentModalComponent } from "../../components/payment-modal/payment-modal.component";
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { CommunicationService } from '../../services/share.service';
import { NavigationService } from '../../services/navigationService ';
import { PaymentService } from '../../services/payment.service';

type BillingCycle = 'monthly' | 'yearly';

interface PricingPlan {
  name: string;
  price: number;
  monthlyPrice: number; 
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

interface PaymentProof {
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  base64: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, PaymentModalComponent, RouterLink],
  templateUrl: 'pricing.component.html',
  styleUrl: 'pricing.component.scss'
})
export class PricingComponent implements OnInit{

  billingCycle: BillingCycle = 'monthly';
  isPaymentModalOpen = false;
  selectedPlan: PricingPlan | null = null;
  currentUser: User | null = null;
  isAuthenticated = false;
  private authSub!: Subscription;


  pricingPlans: PricingPlan[] = [
    {
      name: 'Gratuit',
      price: 0,
      monthlyPrice: 0,
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
      price: 10000,
      monthlyPrice: 10.000,
      period: '/mois',
      description: 'Pour les événements réguliers',
      popular: true,
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
    // {
    //   name: 'Professionnel',
    //   price: 29,
    //   period: '/mois',
    //   description: 'Pour les événements réguliers',
    //   popular: true,
    //   features: [
    //     'Événements illimités',
    //     'Jusqu\'à 500 invités',
    //     'Import CSV/Excel',
    //     'Restrictions alimentaires',
    //     'Rapports avancés',
    //     'Support prioritaire',
    //     'Personnalisation',
    //     'Intégrations',
    //   ],
    // },
    // {
    //   name: 'Entreprise',
    //   price: 99,
    //   period: '/mois',
    //   description: 'Pour les grandes organisations',
    //   features: [
    //     'Événements illimités',
    //     'Invités illimités',
    //     'API personnalisée',
    //     'Intégrations personnalisées',
    //     'Support dédié 24/7',
    //     'Formation personnalisée',
    //     'Sauvegardes quotidiennes',
    //     'Rapports personnalisés',
    //   ],
    // },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private paymentService: PaymentService,
    private navigationService: NavigationService,
    private communicationService: CommunicationService
  ){}

  ngOnInit(): void {
    this.authSub = this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
      console.log('[PricingComponent] isAuthenticated ? ', this.isAuthenticated);
    });
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log("---this.currentUser :: ", this.currentUser)
    });
  }

  /** Toggle facturation */
  setBillingCycle(cycle: BillingCycle): void {
    this.billingCycle = cycle;
    this.updatePrices();
  }

  /** Recalcul des prix */
  private updatePrices(): void {
    this.pricingPlans = this.pricingPlans.map(plan => {
      if (plan.price === 0) {
        return {
          ...plan,
          price: 0,
          period: 'Pour toujours'
        };
      }

      if (this.billingCycle === 'yearly') {
        const yearlyPrice = Math.round(plan.price * 12 * 0.8);
        return {
          ...plan,
          price: yearlyPrice,
          period: '/an'
        };
      }

      return {
        ...plan,
        price: plan.price,
        period: '/mois'
      };
    });
  }

  /** Action bouton Commencer */
  startPlan(plan: PricingPlan): void {
    console.log('Plan choisi :', plan.name, this.billingCycle);
    console.log('isAuthenticated: ', this.isAuthenticated);

    // 1️⃣ Plan gratuit
    if (plan.name === 'Gratuit') {
      if (this.isAuthenticated) {
        this.router.navigate(['/evenements']);
      } else {
        this.router.navigate(['/'],);
      }
      return;
    }

    // 2️⃣ Plan payant + utilisateur connecté
    if (this.isAuthenticated) {
      this.selectedPlan = plan;
      this.isPaymentModalOpen = true;
      return;
    }

    // 3️⃣ Plan payant + utilisateur non connecté
    this.router.navigate(
      ['/login'],
      { queryParams: { returnUrl: '/evenements' } }
    );

    this.communicationService.triggerSenderAction(this.isAuthenticated);
  }

  retour(){
    console.log('isAuthenticated:', this.isAuthenticated);

    if (!this.isAuthenticated) {
      this.router.navigateByUrl(this.navigationService.back());
      return;
    }

    // Si déjà connecté
    // this.router.navigate(['/evenements']);
    this.router.navigateByUrl(this.navigationService.back());
  }

  initStep(){
    console.log("")
  }
  closePaymentModal(): void {
    this.isPaymentModalOpen = false;
  }

  onPaymentSubmitted(proof: PaymentProof): void {
    console.log('Preuve de paiement reçue:', proof);
    const formData = new FormData();
    const blob = this.base64ToBlob(proof.base64);
    formData.append('file', blob, proof.fileName);
    const userData = {
      userId: this.currentUser?.id,
      selectedPlan: this.selectedPlan
    }
    formData.append('userData', JSON.stringify(userData));
    console.log('FILE Firebase URL :', formData.get('file'));
    console.log('USERDATA :', formData.get('userData'));
    // Envoyer au backend
    this.paymentService.submitPayment(formData).subscribe(
      (response) => {
          console.log("Response :: ", response)
          // this.triggerBAction();
          //this.router.navigate(['/evenements']);
        },
        (error:any) => {
          console.error('❌ Erreur de creation :', error);
          console.log("Message :: ", error.error.error);
        }
    );
  }

  private base64ToBlob(base64: string): Blob {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
  }

}

