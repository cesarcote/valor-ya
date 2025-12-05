import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { currentEnvironment } from '../../../../environments/environment';
import { PaymentRequest, PaymentResponse, PaymentConfiguration } from '../models/payment.model';

export type AppModule = 'valor-ya' | 'test' | 'avaluos-en-garantia';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = currentEnvironment.baseUrl + '/api';
  private readonly frontendUrl = globalThis.location?.origin ?? '';

  initiatePayment(
    paymentData: Omit<PaymentRequest, 'configuration'>,
    module: AppModule = 'valor-ya'
  ): Observable<PaymentResponse> {
    const configuration = this.buildConfiguration(module);

    const request: PaymentRequest = {
      ...paymentData,
      configuration,
    };

    return this.http.post<PaymentResponse>(`${this.apiUrl}/paymentez/crear-link-pago`, request);
  }

  private buildConfiguration(module: AppModule): PaymentConfiguration {
    const baseUrl = `${this.frontendUrl}/${module}`;

    return {
      partial_payment: true,
      expiration_days: 1,
      allowed_payment_methods: ['All', 'Cash', 'BankTransfer', 'Card', 'Qr'],
      success_url: `${baseUrl}/pago-status/success`,
      failure_url: `${baseUrl}/pago-status/failure`,
      pending_url: `${baseUrl}/pago-status/pending`,
      review_url: `${baseUrl}/pago-status/review`,
    };
  }

  getPaymentUrl(response: PaymentResponse): string | null {
    return response.data?.payment?.payment_url || null;
  }

  getPaymentQR(response: PaymentResponse): string | null {
    return response.data?.payment?.payment_qr || null;
  }

  getOrderId(response: PaymentResponse): string | null {
    return response.data?.order?.id || null;
  }

  generateReference(prefix: string = 'TXN'): string {
    return `${prefix}${Date.now()}`;
  }
}
