import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  subscribeNewsletter = false;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordStrength = signal<'weak' | 'medium' | 'strong'>('weak');

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private router: Router, 
    private authService: AuthService) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      password: this.password
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie', response);
        this.successMessage = 'Compte créé avec succès ! Vous pouvez vous connecter.';
        this.errorMessage = null;
        form.resetForm();
      },
      error: (err) => {
        console.error('❌ Erreur d’inscription :', err.message);
        this.errorMessage = err.message || 'Une erreur est survenue lors de l’inscription.';
      }
    });
  }

  signupWithGoogle() {
    alert('🔵 Inscription avec Google...');
  }

  signupWithFacebook() {
    alert('📘 Inscription avec Facebook...');
  }
}