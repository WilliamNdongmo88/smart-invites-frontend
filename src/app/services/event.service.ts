import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<{ events: Event[] }>(`${this.apiUrl}/event/organizer/${organizerId}`);
  }

  getEventById(eventId: number): Observable<Event[]> {
    console.log("eventId :: ",eventId);
    return this.http.get<Event[]>(`${this.apiUrl}/event/${eventId}`);
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
}