import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  DatosComplementarios,
  DatosComplementariosRequest,
} from '../models/datos-complementarios.model';
import { PredioData } from '../models/predio-data.model';
import { currentEnvironment } from '../../../../environments/environment';

export interface DatosUsuario {
  tipoPredio?: string;
  numeroHabitaciones?: number;
  numeroBanos?: number;
  areaConstruida?: number;
  edad?: string;
  estrato?: number;
  numeroAscensores?: number;
  numeroParqueaderos?: number;
  numeroDepositos?: number;
}

export interface SolicitudDatosOptions {
  loteId: string;
  datosEndpoint?: PredioData;
  datosUsuario?: DatosUsuario;
  tipoUnidad?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitudDatosComplementariosService {
  private readonly http = inject(HttpClient);

  enviarSolicitudDatos(options: SolicitudDatosOptions): Observable<DatosComplementarios> {
    const payload = this.construirPayload(options);
    return this.enviarEmailConPlantilla(payload);
  }

  private enviarEmailConPlantilla(
    payload: DatosComplementariosRequest
  ): Observable<DatosComplementarios> {
    const emailRequest = {
      destinatario: 'test.valorya@yopmail.com',
      asunto: 'Información de Predio - ValorYa',
      template: 'datos-predio',
      datos: {
        tipoPredio: payload.tipoPredio || 'N/A',
        numHabitaciones: payload.numeroHabitaciones?.toString() || 'N/A',
        numBanos: payload.numeroBanos?.toString() || 'N/A',
        areaConstruida: payload.areaConstruida?.toString() || 'N/A',
        edadPredio: payload.edad || 'N/A',
        estrato: payload.estrato?.toString() || 'N/A',
      },
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const apiUrl = `${currentEnvironment.baseUrl}/emails/test-plantilla-personalizada`;

    return this.http.post<any>(apiUrl, emailRequest, { headers, timeout: 60000 }).pipe(
      map((response) => {
        if (response?.success) {
          return {
            ...payload,
            id: Math.floor(Math.random() * 1000),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as DatosComplementarios;
        } else {
          throw new Error(response.message || 'Error al enviar el correo');
        }
      }),
      catchError((error: any) => {
        console.error('Error en enviarEmailConPlantilla:', error);
        throw new Error(`Error al enviar email: ${error.message || 'Error desconocido'}`);
      })
    );
  }

  private construirPayload(options: SolicitudDatosOptions): DatosComplementariosRequest {
    const { loteId, datosEndpoint, datosUsuario, tipoUnidad } = options;

    const datosDesdeEndpoint = datosEndpoint ? this.extraerDatosDePredio(datosEndpoint) : {};

    const datosDesdeUsuario = datosUsuario || {};

    const payload: DatosComplementariosRequest = {
      loteId,
      ...datosDesdeEndpoint,
      ...datosDesdeUsuario,
    };

    if (tipoUnidad) {
      payload.tipoPredio = tipoUnidad;
    }

    return this.limpiarPayload(payload);
  }

  private extraerDatosDePredio(predio: PredioData): Partial<DatosComplementariosRequest> {
    return {
      areaConstruida: predio.areaConstruida ? Number.parseFloat(predio.areaConstruida) : undefined,
      estrato: predio.estrato ? Number.parseInt(predio.estrato) : undefined,
      edad: predio.edad || undefined,
      tipoPredio: predio.tipoPredio || undefined,
    };
  }

  private limpiarPayload(payload: DatosComplementariosRequest): DatosComplementariosRequest {
    const cleaned: any = { loteId: payload.loteId };

    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}
