import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { CreateEventRequest, EventService } from '../../services/event.service';
import { SpinnerComponent } from "../../components/spinner/spinner";

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent],
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit{
  currentStep = signal(1);
  errorMessage : string ='';
  isLoading = false

  eventData = {
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    totalGuests: 0,
    budget: 0,
    type: '',
    allowDietaryRestrictions: true,
    allowPlusOne: true,
  };
  organizerId: number | undefined;
  currentUser: User | null = null;

  constructor(
    private router: Router, 
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.organizerId = user?.id 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  onSubmit() {
    const datas = [];
    const eventDatas : CreateEventRequest = {
      organizerId: this.organizerId,
      title: this.eventData.title,
      description: this.eventData.description,
      eventDate: this.eventData.date+' '+ this.eventData.time+':00',
      eventLocation: this.eventData.location,
      maxGuests: this.eventData.totalGuests,
      hasPlusOne: this.eventData.allowPlusOne,
      footRestriction: this.eventData.allowDietaryRestrictions,
      status: 'PLANNED'
    }
    datas.push(eventDatas);
    console.log('Event created:', datas);
    this.isLoading = true;
    this.eventService.createEvent(datas).subscribe(
      (response) => {
        console.log("Response :: ", response)
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.isLoading = false;
        console.error('❌ Erreur de creation :', error.message.split(':')[4]);
        console.log("Message :: ", error.message);
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    );
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getEventTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      wedding: 'Mariage',
      engagement: 'Fiançailles',
      anniversary: 'Anniversaire de Mariage',
      birthday: 'Anniversaire',
      other: 'Autre',
    };
    return types[type] || 'Non spécifié';
  }
}

