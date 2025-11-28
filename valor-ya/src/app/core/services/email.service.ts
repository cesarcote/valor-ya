import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { currentEnvironment } from '../../../environments/environment';

export interface EmailTemplateRequest {
  destinatario: string;
  asunto: string;
  template: string;
  datos: Record<string, any>;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly apiUrl = `${currentEnvironment.baseUrl}/emails/test-plantilla-personalizada`;

  constructor(private http: HttpClient) {}

  /**
   * Envía un email usando una plantilla personalizada
   * @param request Datos del email con plantilla
   * @returns Observable con la respuesta del envío
   */
  enviarEmailConPlantilla(request: EmailTemplateRequest): Observable<EmailResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<EmailResponse>(this.apiUrl, request, {
      headers,
      timeout: 60000,
    });
  }
}
