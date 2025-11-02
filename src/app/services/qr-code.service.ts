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

  viewQrCode(id: number): Observable<any> {
    const userToken = localStorage.getItem('accessToken'); // JWT stocké
    const headers = new HttpHeaders({
      Authorization: `Bearer ${userToken}`
    });

    return this.http.get(`${this.apiUrl}/invitation/qrcode/view/${id}`, { headers });
  }
}