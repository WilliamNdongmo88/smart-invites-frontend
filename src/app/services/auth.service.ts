import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { NotificationService } from './notification.service';
import { EventService } from './event.service';
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  plan: string
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

interface CustomJwtPayload {
  sub: string;
  role: string;
  email?: string;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string | undefined;
  private isProd = environment.production;

  //Pour décoder le token
  private user: CustomJwtPayload | null = null;

  // Etat de connexion global
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private userCache$?: Observable<any>;
  private refresh$ = new Subject<void>();

  constructor(
    private http: HttpClient, 
    private notificationService: NotificationService,
    private eventService: EventService
  ) {
    if (this.isProd) {
      this.apiUrl = environment.apiUrlProd+'/auth';
    } else {
      this.apiUrl = environment.apiUrlDev+'/auth';
    }
    //Rechargement des infos du user dès l’initialisation du service
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('currentUser');

    if (!token || !userStr || userStr === 'undefined') {
      return;
    }

    try {
      const user = JSON.parse(userStr);
      this.decodeToken(token);
      this.currentUserSubject.next(user);
    } catch (e) {
      console.error('[loadUserFromStorage] JSON invalide', e);
      localStorage.removeItem('currentUser');
    }
  }

  private decodeToken(token: string): CustomJwtPayload | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;

      const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(base64Url.length + (4 - base64Url.length % 4) % 4, '=');

      const payload = JSON.parse(atob(base64));

      this.user = payload;
      console.log('[decodeToken] this.user', this.user);

      return payload;
    } catch (e) {
      console.error('Erreur décodage token', e);
      this.user = null;
      return null;
    }
  }

  getUserInfoForfait(organizerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user-info/${organizerId}`);
      // .pipe(
      //   tap(response => {
      //     console.log('✅ Info plan utilisateur', response);
      //     this.handleAuthResponse(response);
      //   }),
      //   catchError(this.handleError)
      // );
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
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        console.log('###[login] response :: ', response);
        this.handleAuthResponse(response);
        this.loadUserFromStorage();
        this.notificationService.clearNotificationsCache();
        this.eventService.clearCache();
      }),
      catchError(error => {
        // ✅ Extraire le message d'erreur du backend
        const errorMessage = error.error?.error || error.error?.message || error.message || 'Une erreur est survenue';
        console.error('Login error:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  loginWithGoogle(tokenId: string) {
    console.log('Google token received in AuthService:', tokenId);
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { tokenId }).pipe(
      tap(response => {
        console.log('###[loginWithGoogle] response :: ', response);
        this.handleAuthResponse(response);
        this.loadUserFromStorage();
        this.notificationService.clearNotificationsCache();
        this.eventService.clearCache();
      }),
      catchError(this.handleError)
    );
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
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

  updatePassword(userId: number, data: any): Observable<any> {
    console.log('data :: ', data);
    return this.http.post(`${this.apiUrl}/update-password/${userId}`, data);
  }

  deleteAccount(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-account/${userId}`);
  }

  logout(): any {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.user=null // Pour forcer valid a false
    this.isAuthenticatedSubject.next(false);// notifie le composant (Header)
    console.log("---Déconnection---");
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUser(){
    return this.user;
  }

  isAuthenticated(): Observable<boolean> {
    console.log("user::", this.user);
    const valid = !!this.user && !this.isTokenExpired();

    if (valid) {
      this.isAuthenticatedSubject.next(true);
      return of(true);
    }

    return this.refreshToken().pipe(
      map(() => {
        const refreshedValid = !!this.user && !this.isTokenExpired();
        this.isAuthenticatedSubject.next(refreshedValid);
        return refreshedValid;
      }),
      catchError(() => {
        this.isAuthenticatedSubject.next(false);
        return of(false);
      })
    );
  }

  public isTokenExpired(): boolean {
    if (!this.user?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return this.user.exp < now;
  }

  private handleAuthResponse(response: AuthResponse): void {
    // console.log("[handleAuthResponse] response :: ", response);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  refreshToken(): Observable<any> {
    console.log('[AuthService] Tentative de rafraîchissement du token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      return this.http.post<any>(this.apiUrl  + '/refresh-token', { refreshToken }).pipe(
        tap(response => {
          // Mettre à jour le token et le refresh token dans le localStorage
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.user = this.decodeToken(response.accessToken);
        }),
        map(() => true),
        catchError(error => {
          console.error('[AuthService] Échec du rafraîchissement du token:', error);
          this.logout();
          return throwError(() => error);
        })
      );
    } else {
      console.warn('[AuthService] Aucun refresh token disponible, impossible de rafraîchir le token');
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }
  }

  getMe(): Observable<any> {
    return this.refresh$.pipe(
      startWith(void 0),
      switchMap(() => {
        if (!this.userCache$) {
          console.log('USER API CALL');
          const headers = this.getAuthHeaders();

          this.userCache$ = this.http
            .get<any>(`${this.apiUrl}/me`, { headers })
            .pipe(shareReplay(1));
        }
        console.log('CACHE USER CALL');
        return this.userCache$;
      })
    );
  }

  getAllUsers(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/users`, { headers });
  }

  updateProfile(userId: number, data: any): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http
    .put<Event>(`${this.apiUrl}/${userId}`, data, { headers })
    .pipe(
      tap(() => this.clearCache()),
    );
  }

  clearCache() {
    this.userCache$ = undefined;
  }

  contactUs(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contact-us`, data);
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