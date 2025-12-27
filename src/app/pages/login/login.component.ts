import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare const google: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements  OnInit{
  email = '';
  password = '';
  isLoading = false;
  errorMessage: string | null = null;
  rememberMe = false;
  showPassword = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '1054058117713-j8or7mvfn32k9r2rk5issg9137bm944a.apps.googleusercontent.com',
      callback: (response: any) => this.handleCredentialResponse(response)
    });

    // Rendu du bouton
    const googleDiv = document.getElementById('googleSignInDiv');

    if (googleDiv) {
      google.accounts.id.renderButton(googleDiv, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'center',
        width: 340,
        type: 'standard'
      });
    }
  }

  handleCredentialResponse(response: any) {
    // this.loading = true;
    this.cd.detectChanges(); //Force Angular à mettre à jour l’UI

    const googleIdToken = response.credential;

    this.authService.loginWithGoogle(googleIdToken).subscribe({
      next: (result) => {
        console.log('✅ Connexion Google réussie', result);
        if (result) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Erreur d\'authentification Google :', err);
      },
      complete: () => {
        // this.loading = false;
        this.cd.detectChanges(); // MAJ l’UI quand c’est fini
      }
    });
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
    this.isLoading = true;
    const loginRequest = {
      email: form.value.email,
      password: form.value.password,
      rememberMe: this.rememberMe
    };
    this.authService.login(loginRequest).subscribe(
      (response) => {
        console.log("Message :: ", response.message)
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
        this.errorMessage = null;
      },
      (error) => {
        this.isLoading = false;
        console.error('❌ Erreur de connexion :', error.message);
        console.log("Message :: ", error.message.split(':')[4])
        if (error.message.includes('429 Too Many Requests')) {
          this.errorMessage = 'Trop de tentatives de connexion. Réessayez plus tard.';
        }else {
          this.errorMessage = error.message || 'Erreur de connexion';
        }
      }
    );
  }

  // loginWithGoogle() {
  //   alert('🔵 Connexion avec Google...');
  // }
}

