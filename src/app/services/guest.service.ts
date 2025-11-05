import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

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
export interface Guests{
  id: string,
  event_id: number;
  full_name: string
  email: string
  phone_number: string
  rsvp_status: string
  has_plus_one: boolean
  plus_one_name: string
  notes: string
  response_date: string
  qr_code_url: string
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
    private apiUrl: string | undefined;
    private isProd = environment.production;
  
    constructor(private http: HttpClient) { 
      if (this.isProd) {
        this.apiUrl = environment.apiUrlProd;
      } else {
        this.apiUrl = environment.apiUrlDev;
      }
    }

  addGuest(guest: Guest): Observable<Guest> {
    console.log('Adding guest with data: ', guest);
    return this.http.post<Guest>(`${this.apiUrl}`, guest );
  }

  getGuests(): Observable<{ guests: Guests[] }> {
    return this.http.get<{ guests: Guests[] }>(`${this.apiUrl}/guest/all-guests`);
  }

  getGuestsForEvent(eventId: number): Observable<{ guests: Guests[] }> {
    console.log("eventId :: ",eventId);
    return this.http.get<{ guests: Guests[] }>(`${this.apiUrl}/guest/event/${eventId}`);
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
    return this.http.post<Invitation>(`${this.apiUrl}/invitations/generate`, invitation );
  }

  // Méthode pour récupérer les invitations d'un invité
//   getInvitationsByGuestId(guestId: number): Observable<Invitation[]> {
//     return this.http.get<Invitation[]>(`${this.apiUrl}/invitations/guest/${guestId}` );
//   }
  getInvitationsByGuestId(guestId: number): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.apiUrl}/invitations/guest/${guestId}` );
  }

  // Méthode pour révoquer une invitation
  revokeInvitation(invitationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/invitations/${invitationId}` );
  }
}
