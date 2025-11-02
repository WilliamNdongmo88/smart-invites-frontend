import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Event {
  id: number;
  organizerId: number;
  title: string;
  description: string;
  eventDate: string;
  eventLocation: string;
  maxGuests: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  eventDate: string;
  eventLocation: string;
  maxGuests: number;
}

/**
 * Event Service
 * Handles event management operations
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }

  /**
   * Get all events for current user
   */
  getEvents(organizerId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/user/${organizerId}`);
  }

  /**
   * Get event by ID
   */
  getEventById(eventId: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${eventId}`);
  }

  /**
   * Create new event
   */
  createEvent(request: CreateEventRequest): Observable<Event> {
    console.log('Creating event with data:', request);
    return this.http.post<Event>(this.apiUrl, request);
  }

  /**
   * Update event
   */
  updateEvent(eventId: number, request: Partial<CreateEventRequest>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${eventId}`, request);
  }

  /**
   * Update event status
   */
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