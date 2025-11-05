import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  status: string;
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
  hasPlusOne: boolean;
  footRestriction: boolean;
  status: string;
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

  getEvents(organizerId: number): Observable<{ events: Event[] }> {
    return this.http.get<{ events: Event[] }>(`${this.apiUrl}/event/organizer/${organizerId}`);
  }

  getEventById(eventId: number): Observable<{ event: Event[] }> {
    console.log("eventId :: ",eventId);
    return this.http.get<{ event: Event[] }>(`${this.apiUrl}/event/${eventId}`);
  }

  createEvent(request: CreateEventRequest): Observable<any> {
    console.log('Creating event with data:', request);
    return this.http.post<any>(`${this.apiUrl}/event/create-event`, request);
  }

  updateEvent(eventId: number, request: Partial<CreateEventRequest>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${eventId}`, request);
  }

  updateEventStatus(eventId: number, status: string): Observable<Event> {
    return this.http.patch<Event>(
      `${this.apiUrl}/${eventId}/status`,
      {},
      { params: { status } }
    );
  }

  /**
   * Delete event
   */
  deleteEvent(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}`);
  }
}