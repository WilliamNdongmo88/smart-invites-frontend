import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type ForgotPasswordStep = 'email' | 'verification' | 'reset' | 'success';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  currentStep = signal<ForgotPasswordStep>('email');
  email = '';
  verificationCode = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  loading = false;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordStrength = signal<'weak' | 'medium' | 'strong'>('weak');

  constructor(
    private router: Router, 
    private authService: AuthService) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  submitEmail() {
    if (this.email && this.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailRegex.test(this.email)) {
        const data = {email: this.email}
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
        email: this.email,
        code: this.verificationCode,
        isActive: false
      }
      this.loading = true;
      this.authService.checkCode(data).subscribe({
          next: (response) => {
            console.log('Code de vérification envoyé', response);
            this.currentStep.set('reset');
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

  submitNewPassword() {
    if (this.newPassword && this.confirmPassword && this.newPassword === this.confirmPassword) {
      const data = {
        email: this.email,
        newpassword: this.newPassword
      }
      console.log('data', data);
      this.loading = true;
      this.authService.resetpassword(data).subscribe({
          next: (response) => {
            console.log('Mot de passe réinitialisé avec succès', response);
            this.currentStep.set('success');
            this.errorMessage = '';
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
            console.error('❌ Erreur lors de la réinitialisé du mot de passe :', error);
            this.errorMessage = error.error.error;
          }
        });
    }else{
      console.error("❌ Erreur sur l'un des mot de passe renseigné");
      this.errorMessage = "Erreur sur l'un des mot de passe renseigné";
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(value => !value);
  }

  checkPasswordStrength() {
    const password = this.newPassword;
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

  resendCode() {
    alert('✉️ Code de vérification renvoyé !');
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}

