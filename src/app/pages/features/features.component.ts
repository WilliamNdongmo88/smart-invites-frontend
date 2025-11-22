import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'features.component.html',
  styleUrl: 'features.component.scss'
})
export class FeaturesComponent {
  constructor(private router: Router){}

  goToRgisterPage(){
    this.router.navigate(['/signup']);
  }

  goToContactPage(){
    this.router.navigate(['/contact']);
  }
}

