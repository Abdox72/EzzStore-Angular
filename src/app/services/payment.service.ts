import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createPaymentIntent(paymentRequest: PaymentRequest): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${this.baseUrl}/create-payment-intent`, paymentRequest);
  }

  confirmPayment(paymentIntentId: string, paymentMethodId: string): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(`${this.baseUrl}/confirm-payment`, {
      paymentIntentId,
      paymentMethodId
    });
  }

  getPaymentHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history`);
  }

  refundPayment(paymentIntentId: string, amount?: number): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(`${this.baseUrl}/refund`, {
      paymentIntentId,
      amount
    });
  }
} 