import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environment/environment';

export interface Event {
  event_id: number;
  organizerId: number;
  title: string;
  description: string;
  event_date: string;
  event_location: string;
  max_guests: number;
  type: string;
  budget?: number;
  status: string;
  event_name_concerned1?: string;
  event_name_concerned2?: string;
  organizer_id?: number
  foot_restriction?: boolean
  has_plus_one?: boolean
  confirmed_count: number;
  pending_count: number;
  declined_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  organizerId?: number;
  title: string;
  description: string;
  eventDate: string;
  eventLocation: string;
  maxGuests: number;
  hasPlusOne?: boolean;
  footRestriction?: boolean;
  status: string;
  budget?: number;
  type?: string;
  eventNameConcerned1?: string;
  eventNameConcerned2?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl: string | undefined;
  private isProd = environment.production;

  private eventsCache = new Map<number, { expiresAt: number, data: Event[] }>();
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

  getEvents(organizerId: number): Observable<{ events: Event[] }> {
    const cacheEntry = this.eventsCache.get(organizerId);

    // Vérifier si le cache est valide
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return of({ events: cacheEntry.data });
    }

    // Sinon → fetch et stocke
    return this.http
    .get<{ events: Event[] }>(`${this.apiUrl}/event/organizer/${organizerId}`)
    .pipe(
      tap(response => {
        this.eventsCache.set(organizerId, {
          expiresAt: Date.now() + this.cacheTTL,
          data: response.events
        });
      })
    );
  }

  // getEventById(eventId: number): Observable<Event[]> {
  //   console.log("eventId :: ",eventId);
  //   return this.http.get<Event[]>(`${this.apiUrl}/event/${eventId}`);
  // }
  getEventById(eventId: number): Observable<Event[]> {
    const cacheEntry = this.eventsCache.get(eventId);

    // Vérifier si le cache est valide
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return of(cacheEntry.data);
    }

    // Sinon → fetch et stocke
    return this.http
    .get<Event[]>(`${this.apiUrl}/event/${eventId}`)
    .pipe(
      tap(response => {
        this.eventsCache.set(eventId, {
          expiresAt: Date.now() + this.cacheTTL,
          data: response
        });
      })
    );
  }

  // getEventAndInvitationRelated(eventId: number): Observable<Event[]> {
  //   const headers = this.getAuthHeaders();
  //   return this.http.get<Event[]>(`${this.apiUrl}/event/${eventId}/invitation`, {headers});
  // }
  getEventAndInvitationRelated(eventId: number): Observable<Event[]> {
    const cacheEntry = this.eventsCache.get(eventId);

    // Vérifier si le cache est valide
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return of(cacheEntry.data);
    }

    // Sinon → fetch et stocke
    return this.http
    .get<Event[]>(`${this.apiUrl}/event/${eventId}/invitation`)
    .pipe(
      tap(response => {
        this.eventsCache.set(eventId, {
          expiresAt: Date.now() + this.cacheTTL,
          data: response
        });
      })
    );
  }

  createEvent(request: CreateEventRequest[]): Observable<any> {
    console.log('Creating event with data:', request);
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/event/create-event`, request, { headers });
  }

  updateEvent(eventId: number, request: Partial<CreateEventRequest>): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.put<Event>(`${this.apiUrl}/event/${eventId}`, request, { headers });
  }

  updateEventStatus(eventId: number, status: string): Observable<Event> {
    return this.http.patch<Event>(
      `${this.apiUrl}/${eventId}/status`,
      {},
      { params: { status } }
    );
  }
  
  deleteEvent(eventId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/event/${eventId}`, { headers });
  }

  addLink(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/link/add-link`, data, { headers })
  }

  getLink(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/link/get-links`, { headers })
  }
}