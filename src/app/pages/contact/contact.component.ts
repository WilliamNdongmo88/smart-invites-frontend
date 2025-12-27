import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterDetailComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterDetailComponent],
  templateUrl: 'contact.component.html',
  styleUrl: 'contact.component.scss'
})
export class ContactComponent {
  submitSuccess = signal(false);
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false,
  };
  telephone: string = '+237 655002318';
  addressMail: string = 'williamndongmo899@gmail.com';

  onSubmit() {
    console.log('Form submitted:', this.formData);
    this.submitSuccess.set(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        newsletter: false,
      };
      this.submitSuccess.set(false);
    }, 3000);
  }
}

