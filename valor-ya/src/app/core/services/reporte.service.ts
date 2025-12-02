import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { ReporteValorYaRequest } from '../../core/models/reporte-valor-ya.model';
import { MCMValorYAResultado } from '../../core/models/mcm-valor-ya.model';
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
   * Genera datos para el reporte usando la respuesta real del API MCM
   */
  generarDatosReporte(
    chip: string,
    tipoPredio: string,
    mcmResponse: MCMValorYAResultado
  ): ReporteValorYaRequest {
    const resultado = mcmResponse.resultados?.[0];
    const metadatos = mcmResponse.metadatos;

    if (!resultado) {
      throw new Error('No hay resultados disponibles del MCM');
    }

    return {
      chip: chip,
      zona: resultado.CODIGO_ZONA_FISICA_PREDIO || '',
      tipoPredio: tipoPredio,
      valorYa: String(resultado.VALOR_INTEGRAL_PREDIO || 0),
      limiteInferior: String(resultado.LIM_INFERIOR || 0),
      limiteSuperior: String(resultado.LIM_SUPERIOR || 0),
      valorYaM2: String(resultado.AREA_CONSTRUIDA_PREDIO || 0),
      limiteInferiorM2: String(resultado.AREA_CONSTRUIDA_PREDIO || 0),
      limiteSuperiorM2: String(resultado.AREA_CONSTRUIDA_PREDIO || 0),
      ofertasUtilizadas: String(metadatos?.ofertas_utilizadas || mcmResponse.resultados.length),
      coeficienteVariacion: String(resultado.CV || 0),
    };
  }
}
