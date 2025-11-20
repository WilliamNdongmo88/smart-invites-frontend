import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InvitationComponent } from './pages/invitation/invitation.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { AddEventComponent } from './pages/add-event/add-event.component';
import { GuestListComponent } from './pages/guests/guest-list.component';
import { GuestDetailComponent } from './pages/guest-detail/guest-detail.component';
import { EditEventComponent } from './pages/edit-event/edit-event.component';
import { EditGuestComponent } from './pages/edit-guest/edit-guest.component';
import { QRScannerComponent } from './pages/qr-scanner/qr-scanner.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },  
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-event',
    component: AddEventComponent,
  },
  {
    path: 'events/edit-event/:eventId',
    component: EditEventComponent,
  },
  {
    path: 'events/:eventId',
    component: EventDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'invitations/:token',
    component: InvitationComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'events/:eventId/guests',
    component: GuestListComponent,
  },
  {
    path: 'events/:eventId/guests/:guestId',
    component: GuestDetailComponent,
  },
  {
    path: 'events/:eventId/guests/:guestId/edit',
    component: EditGuestComponent,
  },
  {
    path: 'qr-scanner',
    component: QRScannerComponent,
  },
  // {
  //   path: '/404',
  //   component: NotFoundComponent,
  // },
  {
    path: '**',
    redirectTo: '',
  },
];