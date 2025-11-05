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
    path: 'guests/:id',
    component: GuestDetailComponent,
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