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

    return this.http.get<TiposUnidadResponse>(`${this.apiUrl}/tipos-unidad`, { headers }).pipe(
      map((response: TiposUnidadResponse) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          console.warn('API returned unsuccessful response');
          if (response.error) {
            console.warn('API Error details:', response.error);
          }
          return [];
        }
      }),
      catchError((error: any) => {
        console.error('Error al conectar al endpoint /parametricas/tipos-unidad:', error);
        return of([]);
      })
    );
  }
}
