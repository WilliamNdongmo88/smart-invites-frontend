import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage: string | null = null;
  rememberMe = false;
  showPassword = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService) {
      window.scrollTo({ top: 0, behavior: 'smooth' });}

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  // gestion de la soumission du formulaire
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      // Marque tous les champs comme "touchés" pour déclencher l’affichage des erreurs
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    // Si valide, exécute ta logique d’authentification
    console.log('Formulaire valide :', form.value);
    this.loading = true;
    const loginRequest = {
      email: form.value.email,
      password: form.value.password,
      rememberMe: this.rememberMe
    };
    this.authService.login(loginRequest).subscribe(
      (response) => {
        console.log("Message :: ", response.message)
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.loading = false;
        console.error('❌ Erreur de connexion :', error.message.split(':')[4]);
        console.log("Message :: ", error.message.split(':')[4])
        if (error.message.includes('429 Too Many Requests')) {
          this.errorMessage = 'Trop de tentatives de connexion. Réessayez plus tard.';
        }
        // this.errorMessage = error.message || 'Erreur de connexion';
      }
    );
  }

  loginWithGoogle() {
    alert('🔵 Connexion avec Google...');
  }

  loginWithFacebook() {
    alert('📘 Connexion avec Facebook...');
  }
}

