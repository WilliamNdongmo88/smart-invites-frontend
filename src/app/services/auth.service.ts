import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string | undefined;
  private isProd = environment.production;

  // Etat de connexion global
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.isProd) {
      this.apiUrl = environment.apiUrlProd+'/auth';
    } else {
      this.apiUrl = environment.apiUrlDev+'/auth';
    }
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    console.log('Registering user with request:', request);
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => {
          console.log('✅ Utilisateur inscrit', response);
          this.handleAuthResponse(response);
        }),
        catchError(this.handleError)
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    console.log('### request :: ', request);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        this.handleAuthResponse(response);
        this.isAuthenticatedSubject.next(true); // notifie le composant (Header)
      }),
      catchError(this.handleError)
    );
  }


  sendResetEmail(data: any): Observable<any> {
    console.log("data : ", data);
    return this.http.post(`${this.apiUrl}/forgot-password`, data);
  }

  checkCode(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-code`, data);
  }

  resetpassword(data: any): Observable<any> {
    console.log('data :: ', data);
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  logout(): any {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleAuthResponse(response: AuthResponse): void {
    console.log("response :: ", response);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }


  /**
   * Centralized error handling
   */
    private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue.';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client ou réseau
      errorMessage = `Erreur réseau : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de se connecter au serveur.';
          break;
        case 400:
          errorMessage = 'Requête invalide. Email déjà existant.';
          break;
        case 401:
          errorMessage = 'Identifiants incorrects.';
          break;
        case 403:
          errorMessage = 'Accès refusé.';
          break;
        case 409:
          errorMessage = 'Email déjà utilisé.';
          break
        case 500:
          errorMessage = 'Erreur interne du serveur.';
          break;
        default:
          errorMessage = `Erreur inattendue (${error.status}): ${error.message}`;
      }
    }
    //  Affiche tout le contenu de l’erreur dans la console
    console.error('🛑 Erreur HTTP détectée :', {
      status: error.status,
      statusText: error.statusText,
      message: errorMessage,
      backendMessage: error.error?.message || error.message
    });
    return throwError(() => new Error(errorMessage));
  }
}