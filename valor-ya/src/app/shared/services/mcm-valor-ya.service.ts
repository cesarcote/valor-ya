import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { MCMValorYAResultado } from '../../core/models/mcm-valor-ya.model';
import { currentEnvironment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MCMValorYaService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = currentEnvironment.baseUrl;

  procesarChip(chip: string): Observable<MCMValorYAResultado> {
    // Usar URL relativa para que el proxy la intercepté en desarrollo
    const url = `/api/procesar-chips/chip-unico`;
    const body = { chip };

    console.log('🚀 [MCM Service] Llamando a:', url);
    console.log('📦 [MCM Service] Body:', body);

    return this.http.post<MCMValorYAResultado>(url, body).pipe(
      timeout(3000), // Aumentar timeout a 2 minutos para peticiones muy pesadas
      catchError((error) => {
        console.error('❌ [MCM Service] Error en procesarChip:', error);
        throw error;
      })
    );
  }

  descargarAvaluo(chip: string): Observable<Blob> {
    const url = `${this.API_BASE_URL}/descargar-avaluo/${chip}`;

    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error al descargar el avalúo:', error);
        throw error;
      })
    );
  }
}
