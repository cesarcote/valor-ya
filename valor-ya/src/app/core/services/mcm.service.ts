import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { MCMValorYAResultado } from '../../features/valor-ya/models/mcm-valor-ya.model';
import { currentEnvironment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class McmService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE_URL = currentEnvironment.baseUrl;

  procesarChip(chip: string): Observable<MCMValorYAResultado> {
    const url = `${this.API_BASE_URL}/api/procesar-chips/chip-unico`;
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
