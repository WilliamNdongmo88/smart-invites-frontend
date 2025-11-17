import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  guest_id: string,
  event_id: number;
  full_name: string
  email: string
  phone_number: string
  rsvp_status: string
  has_plus_one: boolean
  dietary_restrictions: string
  plus_one_name_diet_restr: string
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

export interface Event{
  guestId: number;
  guestName: string;
  rsvpStatus: string;
  guestHasPlusOne: string;
  plusOneName: string;
  eventTitle: string;
  description: string;
  eventHasPlusOne: string;
  footRestriction: boolean;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
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

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  addGuest(guests: any): Observable<any> {
    console.log("guests :: ",guests);
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/guest/add-guest`, guests, { headers })
  }

  getGuests(): Observable<{ guests: Guests[] }> {
    return this.http.get<{ guests: Guests[] }>(`${this.apiUrl}/guest/all-guests`);
  }

  getEventByGuest(guestId: number): Observable<Event> {
    console.log("guestId :: ",guestId);
    return this.http.get<Event>(`${this.apiUrl}/guest/${guestId}/event/`);
  }

  getGuestsForEvent(eventId: number): Observable<{ guests: Guests[] }> {
    console.log("eventId :: ",eventId);
    return this.http.get<{ guests: Guests[] }>(`${this.apiUrl}/guest/event/${eventId}`);
  }

  getGuestById(guestId: number): Observable<any> {
    console.log("guestId :: ", guestId);
    return this.http.get<any>(`${this.apiUrl}/guest/${guestId}` );
  }

  updateGuest(guestId: number, guest: any): Observable<Guest> {
    return this.http.put<Guest>(`${this.apiUrl}/guest/${guestId}`, guest );
  }

  updateRsvpStatusGuest(guestId: number, rsvpStatus: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/guest/rsvp/${guestId}`, {rsvpStatus} );
  }

  deleteGuest(guestId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/guest/${guestId}`, { headers });
  }

  deleteSeveralGuests(guestIdList: number[]): Observable<void> {
    const headers = this.getAuthHeaders();
    console.log("### guestIdList :: ", guestIdList);
    return this.http.post<void>(`${this.apiUrl}/guest/delete`, guestIdList, {headers});
  }


  // Méthode pour créer une invitation pour un invité existant
  createInvitation(invitation: Invitation): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.apiUrl}/invitations/generate`, invitation );
  }

  getInvitationsByGuestId(guestId: number): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.apiUrl}/invitations/guest/${guestId}` );
  }

  // Méthode pour révoquer une invitation
  revokeInvitation(guestId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/invitation/delete/${guestId}` );
  }

  sendReminderMail(guestIList: any): Observable<any> {
    console.log("guestIList :: ",guestIList);
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/guest/reminde-mail`, guestIList, { headers })
  }
}
