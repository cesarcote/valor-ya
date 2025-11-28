import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { MCMValorYAResultado } from '../../core/models/mcm-valor-ya.model';
import { currentEnvironment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class McmService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = currentEnvironment.baseUrl;

  procesarChip(chip: string): Observable<MCMValorYAResultado> {
    // Usar URL relativa para que el proxy la intercepté en desarrollo
    const url = `/api/procesar-chips/chip-unico`;
    const body = { chip };

    return this.http.post<MCMValorYAResultado>(url, body).pipe(
      timeout(3000),
      catchError((error) => {
        console.error('❌ [MCM Service] Error en procesarChip:', error);
        throw error;
      })
    );
  }
}
