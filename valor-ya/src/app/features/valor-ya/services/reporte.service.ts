import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { ReporteValorYaRequest } from '../../../core/models/reporte-valor-ya.model';
import { currentEnvironment } from '../../../../environments/environment';

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
}
