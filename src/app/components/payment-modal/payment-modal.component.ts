import { Component, Input, Output, EventEmitter, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
}

interface PaymentProof {
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  base64: string;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'payment-modal.component.html',
  styleUrl: 'payment-modal.component.scss'
})
export class PaymentModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() selectedPlan: PricingPlan | null = null;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() paymentSubmitted = new EventEmitter<PaymentProof>();

  currentStep = signal(1);
  isDragOver = false;
  paymentProof: PaymentProof | null = null;
  uploadError = '';

  copiedOrange = false;
  copiedMtn = false;
  
  mail = "support@smartinvite.com";
  owner = {
    name: 'WILLIAM NDONGMO',
    iban: '4531 0200 6868 1301',
    orangeMoneyNumber: '+237655002318',
    mtnMoneyNumber: '+237682933424',
    mailto: "mailto:williamndongmo899@gmail.com"
  }

  ngOnChanges() {
    // Reset form when modal opens
    console.log("this.isOpen: ", this.isOpen);
    if (this.isOpen) {
      this.currentStep.set(1);
      this.paymentProof = null;
      this.uploadError = '';
    }
    console.log("this.currentStep: ", this.currentStep());
  }

  closeModal() {
    this.closeEvent.emit();
  }

  nextStep() {
    console.log("this.currentStep: ", this.currentStep() + 1);
    if (this.currentStep() === 2) {
        this.paymentSubmitted.emit(this.paymentProof!);
    }

    this.currentStep.update(step => step + 1);
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      if (text === this.owner.orangeMoneyNumber) {
        this.copiedOrange = true;
        setTimeout(() => (this.copiedOrange = false), 2000);
      } else {
        this.copiedMtn = true;
        setTimeout(() => (this.copiedMtn = false), 2000);
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave() {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  processFile(file: File) {
    // Validation
    const maxSize = 5 * 1024 * 1024; // 5 MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      this.uploadError = 'Format non accepté. Veuillez utiliser JPG, PNG ou PDF.';
      return;
    }

    if (file.size > maxSize) {
      this.uploadError = 'Le fichier est trop volumineux. Taille maximale : 5 MB.';
      return;
    }

    this.uploadError = '';

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      this.paymentProof = {
        fileName: file.name,
        fileSize: this.formatFileSize(file.size),
        fileType: file.type,
        uploadedAt: new Date().toLocaleString(),
        base64: e.target?.result as string,
      };
    };
    reader.readAsDataURL(file);
  }

  removeFile() {
    this.paymentProof = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
