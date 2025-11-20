import { Component, signal, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ScanResult {
  success: boolean;
  guestId?: string;
  guestName?: string;
  eventName?: string;
  message: string;
}

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'qr-scanner.component.html',
  styleUrl: 'qr-scanner.component.scss'
})
export class QRScannerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  cameraActive = signal(false);
  autoCapture = signal(true);
  soundEnabled = signal(true);
  manualCode = '';
  scanResult = signal<ScanResult | null>(null);
  scannedCount = signal(0);
  successCount = signal(0);
  errorCount = signal(0);

  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialiser le composant
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      video.play();

      this.cameraActive.set(true);

      // Commencer le scan
      this.scanQRCode();
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      alert('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.cameraActive.set(false);
  }

  scanQRCode() {
    if (!this.cameraActive()) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simuler la détection d'un code QR
    // En production, utiliser une bibliothèque comme jsQR ou ZXing
    if (this.autoCapture() && Math.random() > 0.95) {
      this.processQRCode('QR_CODE_123456');
    }

    this.animationFrameId = requestAnimationFrame(() => this.scanQRCode());
  }

  captureFrame() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simuler la détection d'un code QR à partir de la capture
    this.processQRCode('QR_CODE_' + Math.random().toString(36).substr(2, 9));
  }

  processQRCode(qrCode: string) {
    this.scannedCount.update(count => count + 1);

    // Simuler la validation du code QR
    const isValid = qrCode.startsWith('QR_CODE_');

    if (isValid) {
      this.successCount.update(count => count + 1);
      this.scanResult.set({
        success: true,
        guestId: qrCode,
        guestName: 'Jean Dupont',
        eventName: 'Mariage de Sophie et Pierre',
        message: 'Code QR validé avec succès !',
      });

      if (this.soundEnabled()) {
        this.playSuccessSound();
      }

      this.stopCamera();
    } else {
      this.errorCount.update(count => count + 1);
      this.scanResult.set({
        success: false,
        message: 'Code QR invalide ou non reconnu',
      });

      if (this.soundEnabled()) {
        this.playErrorSound();
      }
    }
  }

  processManualCode() {
    if (!this.manualCode.trim()) {
      alert('Veuillez entrer un code');
      return;
    }

    this.processQRCode(this.manualCode);
    this.manualCode = '';
  }

  resetScanner() {
    this.scanResult.set(null);
    this.startCamera();
  }

    toggleAutoCapture(event: Event) {
        const target = event.target as HTMLInputElement;
        this.autoCapture.set(target.checked);
    }

  toggleSound() {
    // Mise à jour du signal
    alert('Mise à jour du signal');
  }

  playSuccessSound() {
    // Créer et jouer un son de succès
    const audioContext = new (window as any).AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.set(800);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  playErrorSound() {
    // Créer et jouer un son d'erreur
    const audioContext = new (window as any).AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 300;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}

