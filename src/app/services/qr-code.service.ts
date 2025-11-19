import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {
  private apiUrl: string | undefined;
  private isProd = environment.production;

  constructor(private http: HttpClient) { 
    // Définir l'URL de l'API selon l'environnement
    if (this.isProd) {
      this.apiUrl = environment.apiUrlProd;
    } else {
      this.apiUrl = environment.apiUrlDev;
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  generateQRCode(id: number): Observable<any>{
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/invitation/generate/${id}`, { headers });
  }

  generateSeveralQRCode(idList: number[]): Observable<any>{
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/invitation/generate-several`, idList, { headers });
  }

  viewQrCode(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/invitation/qrcode/view/${id}`, { headers });
  }

  downloadQrCode(guestId: number, qrUrl: string) {
    if (!qrUrl) {
      console.error("QR Code URL manquante !");
      return;
    }

    const downloadUrl = `${this.apiUrl}/invitation/download/${guestId}?url=${encodeURIComponent(qrUrl)}`;
    console.log("Download URL:", downloadUrl);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `qr-code-invitation-${guestId}.png`;
    link.click();
  }
}