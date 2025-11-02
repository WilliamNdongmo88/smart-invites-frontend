import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Guest {
  id?: number;
  eventId: number;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  rsvpStatus?: string;
  hasPlusOne?: boolean;
  plusOneName?: string;
  notes?: string;
}

export interface Invitation {
  id: number;
  guestId: number;
  token: string;
  qrCodeUrl: string;
  status: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
} )
export class GuestService {
  private apiUrl = `${environment.apiUrl}/guests`;

  constructor(private http: HttpClient ) { }

  addGuest(guest: Guest): Observable<Guest> {
    console.log('Adding guest with data: ', guest);
    return this.http.post<Guest>(this.apiUrl, guest );
  }

  getGuestsForEvent(eventId: number): Observable<Guest[]> {
    return this.http.get<Guest[]>(`${this.apiUrl}/event/${eventId}` );
  }

  getGuestById(guestId: number): Observable<Guest> {
    return this.http.get<Guest>(`${this.apiUrl}/${guestId}` );
  }

  updateGuest(guestId: number, guest: Partial<Guest>): Observable<Guest> {
    return this.http.put<Guest>(`${this.apiUrl}/${guestId}`, guest );
  }

  deleteGuest(guestId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${guestId}` );
  }

  // Méthode pour créer une invitation pour un invité existant
  createInvitation(invitation: Invitation): Observable<Invitation> {
    return this.http.post<Invitation>(`${environment.apiUrl}/invitations/generate`, invitation );
  }

  // Méthode pour récupérer les invitations d'un invité
//   getInvitationsByGuestId(guestId: number): Observable<Invitation[]> {
//     return this.http.get<Invitation[]>(`${environment.apiUrl}/invitations/guest/${guestId}` );
//   }
  getInvitationsByGuestId(guestId: number): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${environment.apiUrl}/invitations/guest/${guestId}` );
  }

  // Méthode pour révoquer une invitation
  revokeInvitation(invitationId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/invitations/${invitationId}` );
  }
}
