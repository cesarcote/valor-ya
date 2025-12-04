import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { ReporteValorYaRequest } from '../../core/models/reporte-valor-ya.model';
import { CalcularValorYaResponse } from '../../core/models/mcm-valor-ya.model';
import { PredioData } from '../../core/models/predio-data.model';
import { currentEnvironment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE_URL = currentEnvironment.baseUrl;

  generarReporteValorYa(data: ReporteValorYaRequest): Observable<Blob> {
    const url = `${this.API_BASE_URL}/api/reportes/valorya-completo/pdf`;

    return this.http.post(url, data, { responseType: 'blob' }).pipe(
      timeout(60000),
      catchError((error) => {
        console.error('❌ [Reporte Service] Error generando reporte:', error);
        throw error;
      })
    );
  }

  /**
   * Genera datos para el reporte usando la respuesta de calcularValorYa y datos del predio
   */
  generarDatosReporte(
    predioData: PredioData,
    valorYaResponse: CalcularValorYaResponse
  ): ReporteValorYaRequest {
    const data = valorYaResponse.data;

    if (!data) {
      throw new Error('No hay datos de ValorYa disponibles');
    }

    return {
      chip: data.CHIP || predioData.chip || '',
      zona: data.ZONA || 'ZONA_MOCK',
      tipoPredio: predioData.tipoPredio || 'OTRO',
      valorYa: String(data.VALOR_YA || 0),
      limiteInferior: String(data.LIMITE_INFERIOR || 0),
      limiteSuperior: String(data.LIMITE_SUPERIOR || 0),
      valorYaM2: String(data.VALORYA_M2 || 0),
      limiteInferiorM2: String(data.LIMITE_INFERIOR_M2 || 0),
      limiteSuperiorM2: String(data.LIMITE_SUPERIOR_M2 || 0),
      ofertasUtilizadas: String(data.ofertas_utilizadas || 0),
      coeficienteVariacion: String(data.CV || 0),
    };
  }
}
