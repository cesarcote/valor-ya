import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import {
  ReporteValorYaRequest,
} from '../../core/models/reporte-valor-ya.model';
import { currentEnvironment } from '../../../environments/environment.qa';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = currentEnvironment.baseUrl;

  generarReporteValorYa(data: ReporteValorYaRequest): Observable<Blob> {
    const url = `${this.API_BASE_URL}/api/reportes/valorya-completo/pdf`;

    console.log('🚀 [Reporte Service] Generando reporte ValorYa completo');
    console.log('📦 [Reporte Service] Datos:', data);

    return this.http.post(url, data, { responseType: 'blob' }).pipe(
      timeout(60000), // 1 minuto para generación de PDF
      catchError((error) => {
        console.error('❌ [Reporte Service] Error generando reporte:', error);
        throw error;
      })
    );
  }

  /**
   * Genera datos mock para el reporte usando información del state
   */
  generarDatosMockReporte(chip: string, tipoPredio: string): ReporteValorYaRequest {
    return {
      chip: chip,
      zona: '6893015154321',
      tipoPredio: tipoPredio,
      valorYa: '$450,000,000',
      limiteInferior: '$400,000,000',
      limiteSuperior: '$500,000,000',
      valorYaM2: '$5,500,000',
      limiteInferiorM2: '$5,000,000',
      limiteSuperiorM2: '$6,000,000',
      ofertasUtilizadas: '25',
      coeficienteVariacion: '15.2%',
    };
  }

  /**
   * Método de conveniencia para generar reporte usando datos del state service
   * Ejemplo de uso:
   *
   * constructor(
   *   private reporteService: ReporteService,
   *   private stateService: ValorYaStateService
   * ) {}
   *
   * generarReporte() {
   *   const predioData = this.stateService.predioData();
   *   const tipoPredio = this.stateService.tipoUnidadSeleccionada()?.descripcionUnidad;
   *
   *   if (predioData?.chip && tipoPredio) {
   *     const datos = this.reporteService.generarDatosMockReporte(predioData.chip, tipoPredio);
   *
   *     this.reporteService.generarReporteValorYa(datos).subscribe({
   *       next: (blob) => {
   *         // Descargar el PDF directamente
   *         const url = window.URL.createObjectURL(blob);
   *         const a = document.createElement('a');
   *         a.href = url;
   *         a.download = 'avaluo.pdf';
   *         a.click();
   *         window.URL.revokeObjectURL(url);
   *       },
   *       error: (error) => {
   *         console.error('Error generando reporte:', error);
   *       }
   *     });
   *   }
   * }
   */
}
