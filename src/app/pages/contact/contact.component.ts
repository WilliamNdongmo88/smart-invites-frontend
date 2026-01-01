import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterDetailComponent } from "../../components/footer/footer.component";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterDetailComponent],
  templateUrl: 'contact.component.html',
  styleUrl: 'contact.component.scss'
})
export class ContactComponent {
  submitSuccess = signal(false);
  submitError = signal(false);
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

  constructor(private authservice: AuthService){}

  onSubmit() {
    console.log('Form submitted:', this.formData);
    this.authservice.contactUs(this.formData).subscribe(
      (response) => {
        console.log("Response :: ", response);
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
      },
      (error) => {
        console.error('❌ Erreur de recupération :', error.message.split(':')[4]);
        console.log("Message :: ", error.message);
        this.submitError.set(true);
        setTimeout(() => {
          this.formData = {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
            newsletter: false,
          };
          this.submitError.set(false);
        }, 3000);
      }
    );
  }
}

