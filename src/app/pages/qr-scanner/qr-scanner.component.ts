import { Component, signal, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import jsQR from 'jsqr';
import { QrCodeService } from '../../services/qr-code.service';
import { GuestService } from '../../services/guest.service';
import { CommunicationService } from '../../services/share.service';
import { EventService } from '../../services/event.service';

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

  token: string = '';
  guestId: number = 0;
  eventId: number = 0;
  isValid: boolean = false;
  private isProcessing = false;
  private isScanning = false;
  datas: any[] = [];
  data = {
        eventTitle: '',
        guestName: '',
        hasPlusOne: '',
        plusOneName: ''
  };
  userConnected = {
    id: 0,
    name: '',
    email: '',
    role: ''
  };

  constructor(
    private router: Router,
    private qrcodeService: QrCodeService,
    private guestService: GuestService,
    private eventService: EventService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.userConnected = JSON.parse(localStorage.getItem('currentUser') || '');
    console.log('this.userConnected', this.userConnected);
    this.communicationService.message$.subscribe(msg => {
        if(typeof msg === 'number'){
            this.eventId = msg;
            localStorage.setItem('scanner', String(this.eventId));
            console.log("eventId 1 :::", this.eventId);
        }else{
            this.eventId = Number(localStorage.getItem('scanner'));
            console.log("eventId 2 :::", this.eventId);
        }
    });
    this.getEventAndInvitationRelated();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  getEventAndInvitationRelated(){
    this.eventService.getEventAndInvitationRelated(this.eventId).subscribe(
        (response) => {
            this.datas = response
            console.log("###this.datas :: ", this.datas);
        },
        (error) => {
            console.error('❌ [getEventAndInvitationRelated] Erreur :', error.message);
            console.log("Message :: ", error.message);
        }
    );
  }

  startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {

        this.stream = stream;

        const video = this.videoElement.nativeElement;
        video.srcObject = stream;

        // Attendre que la caméra soit prête AVANT de scanner
        video.onloadedmetadata = () => {
            console.log("Activé camera ...");
            this.cameraActive.set(true);
            video.play();
            this.isScanning = true;   // Activation du scan
            this.scanQRCode();
        };
    })
    .catch(err => {
        console.error("Erreur d'accès à la caméra:", err);
    });
 }

  stopCamera() {
    this.isScanning = false;   // Empêche toute nouvelle frame
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
    if (!this.cameraActive() || !this.isScanning) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
        this.animationFrameId = requestAnimationFrame(() => this.scanQRCode());
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

    if (qrCode?.data) {
        console.log('QR détecté:', qrCode.data);

        this.isScanning = false;              // Stop immédiat de la boucle
        cancelAnimationFrame(this.animationFrameId!);

        this.processQRCode(qrCode.data);      // Un seul appel
        return;                               
    }

    this.animationFrameId = requestAnimationFrame(() => this.scanQRCode());
  }

  captureFrame() {
    console.log("Manuel...")
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simuler la détection d'un code QR à partir de la capture
    this.processQRCode('QR_CODE_' + Math.random().toString(36).substr(2, 9));
  }

  processQRCode(qrCode: string) {
    this.scannedCount.update(count => count + 1);

    console.log("qrcode:: ", qrCode);
    this.guestId = Number(qrCode.split('view/')[1].split(':')[0]);
    this.token = qrCode.split('view/')[1].split(':')[1]+':'+qrCode.split('view/')[1].split(':')[2];
    console.log("this.guestId:: ", this.guestId);
    console.log("this.token:: ", this.token);
    this.qrcodeService.viewPdfs(qrCode).subscribe(
    (response) => {
        console.log("###response :: ", response);
        this.addCheckIn();
    },
    (error) => {
        console.error('❌ [viewPdfs] Erreur :', error.message);
        console.error('❌ [viewPdfs] Error :', error.error.error);

        if (this.soundEnabled()) this.playErrorSound();
        this.errorCount.update(count => count + 1);
        this.scanResult.set({
            success: false,
            message: 'Code QR invalide ou non reconnu',
        });
        }
    );
  }

  addCheckIn(){
    const now = new Date().toISOString();
    const checkinTime = now.split('.')[0].replace('T', ' ');
    const data = {
        eventId: 0,
        guestId: 0,
        invitationId: 0,
        token: '',
        scannedBy: '',
        scanStatus: 'VALID',
        checkinTime: checkinTime
    };
    for (const elt of this.datas) {
        if(elt.guestId == this.guestId){
            data.eventId = elt.eventId;
            data.guestId = elt.guestId;
            data.token = this.token;
            data.invitationId = elt.invitationId;
            data.scannedBy = this.userConnected.name;
            this.data.eventTitle = elt.title;
            this.data.guestName = elt.guestName;
            this.data.hasPlusOne = elt.hasPlusOne;
            this.data.plusOneName = elt.plusOneName;
        }
    }
    console.log('data:: ', data);
    this.qrcodeService.addCheckIn(data).subscribe(
    (response) => {
        //console.log("###response :: ", response);
        this.successCount.update(count => count + 1);

        this.isValid = true;

        // 🎉 Son + message + stop caméra (comme avant)
        if (this.soundEnabled()) this.playSuccessSound();

        this.scanResult.set({
            success: true,
            guestName: this.data.hasPlusOne ? this.data.guestName+' et '+this.data.plusOneName : this.data.guestName,
            eventName: this.data.eventTitle,
            message: 'Code QR validé avec succès !'
        });
    },
    (error) => {
        console.error('❌ [getGuestById] Erreur :', error.message);
        this.isValid = false;

        if (this.soundEnabled()) this.playErrorSound();
        this.errorCount.update(count => count + 1);
        if(error.message.includes('409 Conflict'))console.warn(error.error.error);
        this.scanResult.set({
            success: false,
            message: error.error.error ? error.error.error : 'Code QR invalide ou non reconnu',
        });
    });
  }

//   getGuestConcerned(){
//     this.guestService.getGuestById(this.guestId).subscribe(
//     (response) => {
//         //console.log("###response :: ", response);
//         this.successCount.update(count => count + 1);

//         this.isValid = true;

//         // 🎉 Son + message + stop caméra (comme avant)
//         if (this.soundEnabled()) this.playSuccessSound();

//         this.scanResult.set({
//             success: true,
//             guestName: response.has_plus_one ? response.full_name+' et '+response.plus_one_name : response.full_name,
//             eventName: response.eventTitle,
//             message: 'Code QR validé avec succès !'
//         });
//     },
//     (error) => {
//         console.error('❌ [getGuestById] Erreur :', error.message);
//         this.isValid = false;

//         if (this.soundEnabled()) this.playErrorSound();
//         this.errorCount.update(count => count + 1);
//         this.scanResult.set({
//             success: false,
//             message: 'Code QR invalide ou non reconnu',
//         });
//     });
//   }

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
    console.log('Mise à jour du signal');
    this.soundEnabled.set(false);
  }

  private playSuccessSound() {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";

        // ✔️ Bonne API
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.5, audioContext.currentTime + 0.01);

        oscillator.start();

        oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
        console.error("Erreur audio :", e);
    }
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

  backToEvent(){
    this.router.navigate(['/events', this.eventId]);
  }
}

