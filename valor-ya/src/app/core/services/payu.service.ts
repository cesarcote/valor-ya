import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { currentEnvironment } from '../../../environments/environment.dev';

interface PayUUserData {
  id: string;
  email: string;
  name: string;
  last_name: string;
}

interface PayUOrderData {
  dev_reference: string;
  description: string;
  amount: number;
  installments_type: number;
  currency: string;
}

interface PayUConfiguration {
  partial_payment: boolean;
  expiration_days: number;
  allowed_payment_methods: string[];
  success_url: string;
  failure_url: string;
  pending_url: string;
  review_url: string;
}

export interface PayUPaymentRequest {
  user: PayUUserData;
  order: PayUOrderData;
  configuration: PayUConfiguration;
}

export interface PayUPaymentResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  reference?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PayUService {
  private http = inject(HttpClient);

  // URL base de tu API que se comunica con PayU
  private apiUrl = currentEnvironment.baseUrl + '/api';

  // URL base de tu frontend para construir las URLs de retorno
  private frontendUrl = window.location.origin;

  /**
   * Crea una solicitud de pago en PayU
   * @param paymentData Datos del usuario y orden
   * @returns Observable con la respuesta de PayU
   */
  createPayment(
    paymentData: Omit<PayUPaymentRequest, 'configuration'>
  ): Observable<PayUPaymentResponse> {
    const configuration: PayUConfiguration = this.buildConfiguration();

    const fullRequest: PayUPaymentRequest = {
      ...paymentData,
      configuration,
    };

    // Este endpoint debe estar en tu backend (Spring Boot)
    return this.http.post<PayUPaymentResponse>(`${this.apiUrl}/payments/create`, fullRequest);
  }

  /**
   * Construye las URLs de configuración para PayU
   * Estas URLs serán llamadas por PayU después del pago
   */
  private buildConfiguration(): PayUConfiguration {
    return {
      partial_payment: true,
      expiration_days: 1,
      allowed_payment_methods: ['All', 'Cash', 'BankTransfer', 'Card', 'Qr'],
      success_url: `${this.frontendUrl}/valor-ya/pago-status/success`,
      failure_url: `${this.frontendUrl}/valor-ya/pago-status/failure`,
      pending_url: `${this.frontendUrl}/valor-ya/pago-status/pending`,
      review_url: `${this.frontendUrl}/valor-ya/pago-status/review`,
    };
  }

  /**
   * Verifica el estado de una transacción
   * @param transactionId ID de la transacción
   */
  verifyTransaction(transactionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments/verify/${transactionId}`);
  }

  /**
   * Valida la firma de PayU (debe hacerse en el backend por seguridad)
   * @param params Parámetros recibidos de PayU
   */
  validateSignature(params: Record<string, any>): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/payments/validate-signature`, params);
  }
}
