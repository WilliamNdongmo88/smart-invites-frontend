import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-floating-feedback-btn',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './floating-feedback-btn.component.html',
  styleUrls: ['./floating-feedback-btn.component.scss']
})
export class FloatingFeedbackBtnComponent implements OnInit {
  showTooltip = false;

  constructor() {}

  ngOnInit() {}
}
