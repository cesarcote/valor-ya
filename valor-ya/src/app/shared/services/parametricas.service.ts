import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TipoUnidad, TiposUnidadResponse } from '../../core/models/parametricas.model';
import { currentEnvironment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ParametricasService {
  private readonly apiUrl = `${currentEnvironment.baseUrl}/parametricas`;

  constructor(private http: HttpClient) {}

  /**
   * Consulta los tipos de unidad disponibles
   * @returns Observable con la lista de tipos de unidad
   */
  consultarTiposUnidad(): Observable<TipoUnidad[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const fallbackData: TipoUnidad[] = [
      { codigoUnidad: 'AP', descripcionUnidad: 'APARTAMENTO' },
      { codigoUnidad: 'BG', descripcionUnidad: 'BODEGA' },
      { codigoUnidad: 'CA', descripcionUnidad: 'CASA' },
      { codigoUnidad: 'DP', descripcionUnidad: 'DEPÓSITO' },
      { codigoUnidad: 'GJ', descripcionUnidad: 'GARAJE' },
      { codigoUnidad: 'LC', descripcionUnidad: 'LOCAL' },
      { codigoUnidad: 'OF', descripcionUnidad: 'OFICINA' },
      { codigoUnidad: 'OT', descripcionUnidad: 'Otro' },
    ];

    return this.http.get<TiposUnidadResponse>(`${this.apiUrl}/tipos-unidad`, { headers }).pipe(
      map((response: TiposUnidadResponse) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          console.warn('API returned unsuccessful response, using fallback data');
          return fallbackData;
        }
      }),
      catchError((error: any) => {
        console.error('Error al conectar al endpoint /parametricas/tipos-unidad:', error);
        console.log('Usando opciones por defecto debido al error');
        return of(fallbackData);
      })
    );
  }
}
