import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DatosComplementariosService } from './datos-complementarios.service';
import {
  DatosComplementarios,
  DatosComplementariosRequest,
} from '../../core/models/datos-complementarios.model';
import { PredioData } from '../../core/models/predio-data.model';

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
  private datosComplementariosService = inject(DatosComplementariosService);

  enviarSolicitudDatos(options: SolicitudDatosOptions): Observable<DatosComplementarios> {
    const payload = this.construirPayload(options);
    return this.datosComplementariosService.enviarDatosPorCorreo(payload);
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
      areaConstruida: predio.areaConstruida ? parseFloat(predio.areaConstruida) : undefined,
      estrato: predio.estrato ? parseInt(predio.estrato) : undefined,
      edad: predio.edad || undefined,
      tipoPredio: predio.tipoPredio || undefined,
    };
  }

  private limpiarPayload(payload: DatosComplementariosRequest): DatosComplementariosRequest {
    const cleaned: any = { loteId: payload.loteId };

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    });

    return cleaned;
  }
}
