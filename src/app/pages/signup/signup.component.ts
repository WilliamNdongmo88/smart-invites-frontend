import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { CommunicationService } from '../../services/share.service';

type ActivatedAccoutStep = 'email' | 'verification' | 'success';

declare const google: any;
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements  OnInit{
  currentStep = signal<ActivatedAccoutStep>('verification');
  verificationCode = '';
  newPassword = '';
  name = '';
  email = '';
  email_confirmed = '';
  password = '';
  confirmPassword = '';
  loading = false;
  acceptTerms = false;
  showActiveAccount = false;
  isActiveAccount = false;
  subscribeNewsletter = false;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordStrength = signal<'weak' | 'medium' | 'strong'>('weak');

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private communicationService: CommunicationService
  ) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  isGoogleEnabled(): boolean {
    return this.acceptTerms;
  }

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '1054058117713-j8or7mvfn32k9r2rk5issg9137bm944a.apps.googleusercontent.com',
      callback: (response: any) => this.handleCredentialResponse(response)
    });

    // Rendu du bouton
    const googleDiv = document.getElementById('googleSignUpDiv');
    console.log('googleDiv: ', googleDiv);

    if (googleDiv) {
      google.accounts.id.renderButton(googleDiv, {
        theme: 'outline',
        size: 'large',
        text: 'signup_with',
        shape: 'rectangular',
        logo_alignment: 'center',
        width: 340,
        type: 'standard'
      });
    }

    this.communicationService.message$.subscribe(msg => {
      console.log("isActive :: ", msg);
      this.currentStep.set('email');
      this.showActiveAccount = msg;
      this.isActiveAccount = msg;
    });
  }

  handleCredentialResponse(response: any) {
    // this.loading = true;
    this.cd.detectChanges(); //Force Angular à mettre à jour l’UI

    const googleIdToken = response.credential;
    const request = { 
      tokenId: googleIdToken,
      acceptTerms: this.acceptTerms
    };
    console.log('Google request: ', request);
    this.authService.signupWithGoogle(request).subscribe({
      next: (result) => {
        console.log('✅ Connexion Google réussie', result);
        if (result) {
          this.router.navigate(['/evenements']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Erreur d’inscription :', err.message);
        this.errorMessage = err.message || 'Une erreur est survenue lors de l’inscription.';
        localStorage.clear();
      },
      complete: () => {
        // this.loading = false;
        this.cd.detectChanges(); // MAJ l’UI quand c’est fini
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(value => !value);
  }

  checkPasswordStrength() {
    const password = this.password;
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (password.length >= 8) {
      if (
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^a-zA-Z0-9]/.test(password)
      ) {
        strength = 'strong';
      } else if (
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password)
      ) {
        strength = 'medium';
      } else if (
        (/[a-z]/.test(password) && /[A-Z]/.test(password)) ||
        (/[a-z]/.test(password) && /[0-9]/.test(password)) ||
        (/[A-Z]/.test(password) && /[0-9]/.test(password))
      ) {
        strength = 'medium';
      }
    }

    this.passwordStrength.set(strength);
  }

  getPasswordStrengthPercentage(): number {
    switch (this.passwordStrength()) {
      case 'weak':
        return 33;
      case 'medium':
        return 66;
      case 'strong':
        return 100;
      default:
        return 0;
    }
  }

  getPasswordStrengthLabel(): string {
    switch (this.passwordStrength()) {
      case 'weak':
        return 'Faible';
      case 'medium':
        return 'Moyen';
      case 'strong':
        return 'Fort';
      default:
        return '';
    }
  }


  // 🚀 Soumission du formulaire
  onSubmit(form: NgForm): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (form.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage = 'Vous devez accepter les conditions d’utilisation.';
      return;
    }

    const request: RegisterRequest = {
      name: this.name,
      email: this.email,
      password: this.password,
      acceptTerms: this.acceptTerms
    };
    this.loading = true;
    this.authService.register(request).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie', response);
        console.log('✅ this.email', this.email);
        this.currentStep.set('verification');
        this.email_confirmed = this.email;
        this.showActiveAccount = true;
        // this.successMessage = 'Compte créé avec succès ! Vous pouvez vous connecter.';
        this.errorMessage = null;
        form.resetForm();
        this.loading = false;
        localStorage.clear();
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Erreur d’inscription :', err.message);
        this.errorMessage = err.message || 'Une erreur est survenue lors de l’inscription.';
        localStorage.clear();
      }
    });
  }

  submitEmail() {
    if (this.email && this.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailRegex.test(this.email)) {
        const data = {
          email: this.email,
          isActive: true
        }
        this.loading = true;
        this.authService.sendResetEmail(data).subscribe({
          next: (response) => {
            console.log('Email envoyé avec succès', response);
            this.currentStep.set('verification');
            this.errorMessage = '';
            this.loading = false;
          },
          error: (error) => {
            console.error('❌ Erreur lors de l’envoi de l’e-mail :', error);
            this.errorMessage = error.error.error;
            this.loading = false;
          }
        });
      } else {
        this.errorMessage = 'Adresse e-mail invalide.';
      }
    } else {
      this.errorMessage = 'Veuillez entrer une adresse e-mail.';
    }
  }

  submitVerificationCode() {
    if (this.verificationCode && this.verificationCode.length === 6) {
      const data = {
        email: this.isActiveAccount ? this.email : this.email_confirmed,
        code: this.verificationCode,
        isActive: true
      }
      console.log('C data: ', data);
      this.loading = true;
      this.authService.checkCode(data).subscribe({
          next: (response) => {
            console.log('Code de vérification envoyé', response);
            this.currentStep.set('success');
            this.errorMessage = '';
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
            console.error('❌ Erreur lors de la vérification du code :', error);
            this.errorMessage = 'Echec de la vérification. Réessayez plus tard.';
          }
        });
    }else{
      console.error('❌ Code invalide ou incorrect');
      this.errorMessage = 'Code invalide ou incorrect';
    }
  }

  signupWithGoogle() {
    alert('🔵 Inscription avec Google...');
  }

  signupWithFacebook() {
    alert('📘 Inscription avec Facebook...');
  }

  resendCode() {
    this.submitEmail();
    console.log('✉️ Code de vérification renvoyé !');
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}