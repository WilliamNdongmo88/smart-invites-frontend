import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Observable } from "rxjs/internal/Observable";
import { catchError, map, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean>  {
    console.log('AuthGuard: Checking authentication :', this.authService.isAuthenticated());
    console.log('AuthGuard: isTokenExpired :', this.authService.isTokenExpired());
    return this.authService.isAuthenticated().pipe(
      map(authenticated => {
        if (authenticated) {//&& this.authService.isAdminOrManager()
          console.log('AdminGuard: Authentifié et Admin/Manager');
          return true;
        } else {
          console.log('AdminGuard: Non authentifié ou pas Admin/Manager, redirection vers accueil');
          this.router.navigate(['/']);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return false;
        }
      }),
      catchError(() => {
        console.log('AdminGuard: Erreur d\'authentification, redirection vers /');
        this.router.navigate(['/']);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return of(false);
      })
    );
  }
}