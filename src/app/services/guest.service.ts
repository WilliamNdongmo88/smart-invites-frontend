import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
  guestHasPlusOneAutoriseByAdmin: boolean;
  guestHasPlusOne: boolean;
  plusOneName: string;
  eventTitle: string;
  description: string;
  eventHasPlusOne: boolean;
  footRestriction: boolean;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  emailOrganizer: string;
}

@Injectable({
  providedIn: 'root'
} )
export class GuestService {
    private apiUrl: string | undefined;
    private isProd = environment.production;
  
    private guestsCache = new Map<number, { expiresAt: number, data: Guests[] }>();
    private cacheTTL = 5 * 60 * 1000; // 5 minutes

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

  addGuestFromGenerateLink(guest: any): Observable<any> {
    console.log("guest :: ",guest);
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/guest/add-guest-from-link`, guest, { headers })
  }

  getGuests(): Observable<{ guests: Guests[] }> {
    return this.http.get<{ guests: Guests[] }>(`${this.apiUrl}/guest/all-guests`);
  }

  getEventByGuest(guestId: number): Observable<Event> {
    console.log("guestId :: ",guestId);
    return this.http.get<Event>(`${this.apiUrl}/guest/${guestId}/event/`);
  }
  // getEventByGuest(guestId: number): Observable<Event> {
  //   const cacheEntry = this.guestsCache.get(guestId);

  //   // Vérifier si le cache est valide
  //   if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
  //     return of(cacheEntry.data);
  //   }

  //   // Sinon → fetch et stocke
  //   return this.http
  //   .get<Event>(`${this.apiUrl}/guest/${guestId}/event/`)
  //   .pipe(
  //     tap(response => {
  //       this.guestsCache.set(guestId, {
  //         expiresAt: Date.now() + this.cacheTTL,
  //         data: response
  //       });
  //     })
  //   );
  // }

  getGuestsForEvent(eventId: number): Observable<{ guests: Guests[] }> {
    console.log("eventId :: ",eventId);
    return this.http.get<{ guests: Guests[] }>(`${this.apiUrl}/guest/event/${eventId}`);
  }
  // getGuestsForEvent(eventId: number): Observable<{ guests: Guests[] }> {
  //   const cacheEntry = this.guestsCache.get(eventId);

  //   // Vérifier si le cache est valide
  //   if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
  //     return of({ guests: cacheEntry.data });
  //   }

  //   // Sinon → fetch et stocke
  //   return this.http
  //   .get<{ guests: Guests[] }>(`${this.apiUrl}/guest/event/${eventId}`)
  //   .pipe(
  //     tap(response => {
  //       this.guestsCache.set(eventId, {
  //         expiresAt: Date.now() + this.cacheTTL,
  //         data: response.guests
  //       });
  //     })
  //   );
  // }

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

  sendFileQrCode(guestId: any): Observable<any> {
    console.log("guestId :: ",guestId);
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/guest/${guestId}/send-file`, { headers })
  }
}
function tap(arg0: (response: any) => void): import("rxjs").OperatorFunction<Event[], Event[]> {
  throw new Error('Function not implemented.');
}

