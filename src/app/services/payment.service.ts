import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl: string | undefined;
  private isProd = environment.production;
    constructor(private http: HttpClient) { 
        if (this.isProd) {
        this.apiUrl = environment.apiUrlProd;
        } else {
        this.apiUrl = environment.apiUrlDev;
        }
    }

    submitPayment(formData: any): Observable<any> {
      console.log('Données de paiement: ', formData);
      return this.http.post<any>(`${this.apiUrl}/file/payment/proof`, formData);
    }
}
