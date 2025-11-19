import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  DatosComplementarios,
  DatosComplementariosRequest,
  DatosComplementariosResponse,
} from '../../core/models/datos-complementarios.model';
import { currentEnvironment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatosComplementariosService {
  private readonly apiUrl = `${currentEnvironment.baseUrl}/emails/html`;

  constructor(private http: HttpClient) {}

  /**
   * Envía los datos complementarios por correo electrónico para simular el registro
   * @param datos Datos complementarios a enviar
   * @returns Observable con los datos "guardados" (mock)
   */
  enviarDatosPorCorreo(datos: DatosComplementariosRequest): Observable<DatosComplementarios> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const contenidoHtml = this.generarContenidoHtml(datos);

    const emailRequest = {
      para: 'ccote@catastrobogota.gov.co',
      asunto: `Nuevos Datos Complementarios - Lote: ${datos.loteId}`,
      contenidoHtml: contenidoHtml,
    };

    return this.http
      .post<any>(this.apiUrl, emailRequest, {
        headers,
        timeout: 60000,
      })
      .pipe(
        map((response) => {
          if (response && response.success) {
            return {
              ...datos,
              id: Math.floor(Math.random() * 1000),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as DatosComplementarios;
          } else {
            throw new Error(response.message || 'Error al enviar el correo');
          }
        }),
        catchError((error: any) => {
          console.error('Error en enviarDatosPorCorreo:', error);
          throw new Error(
            `Error al enviar datos por correo: ${error.message || 'Error desconocido'}`
          );
        })
      );
  }

  private generarContenidoHtml(datos: DatosComplementariosRequest): string {
    let html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #0056b3;">Nuevos Datos Complementarios Registrados</h2>
        <p>Se han recibido los siguientes datos para el predio con Lote ID: <strong>${datos.loteId}</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Campo</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Valor</th>
          </tr>
    `;

    const campos: { [key: string]: any } = {
      'Tipo de Predio': datos.tipoPredio,
      'Número de Habitaciones': datos.numeroHabitaciones,
      'Número de Baños': datos.numeroBanos,
      'Área Construida': datos.areaConstruida,
      Edad: datos.edad,
      Estrato: datos.estrato,
      'Número de Ascensores': datos.numeroAscensores,
      'Número de Parqueaderos': datos.numeroParqueaderos,
      'Número de Depósitos': datos.numeroDepositos,
    };

    for (const [key, value] of Object.entries(campos)) {
      if (value !== undefined && value !== null) {
        html += `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${key}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${value}</td>
          </tr>
        `;
      }
    }

    html += `
        </table>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">Este es un correo generado automáticamente por el sistema Valor Ya.</p>
      </div>
    `;

    return html;
  }
}
