import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  DatosComplementarios,
  DatosComplementariosRequest,
  DatosComplementariosResponse
} from '../../core/models/datos-complementarios.model';
import { currentEnvironment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatosComplementariosService {
  private readonly apiUrl = `${currentEnvironment.baseUrl}/datos-complementarios`;

  constructor(private http: HttpClient) {}

  /**
   * Registra nuevos datos complementarios para un predio
   * @param datos Datos complementarios a registrar
   * @returns Observable con la respuesta del servidor
   */
  registrarDatos(datos: DatosComplementariosRequest): Observable<DatosComplementarios> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<DatosComplementariosResponse>(this.apiUrl, datos, { headers }).pipe(
      map((response: DatosComplementariosResponse) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Error al registrar los datos complementarios');
        }
      }),
      catchError((error: any) => {
        console.error('Error en registrarDatos:', error);
        throw new Error(`Error al registrar datos complementarios: ${error.message || 'Error desconocido'}`);
      })
    );
  }

  /**
   * Obtiene datos complementarios por Lote ID
   * @param loteId Lote ID del predio
   * @returns Observable con los datos complementarios
   */
  obtenerPorLoteId(loteId: string): Observable<DatosComplementarios> {
    return this.http.get<DatosComplementariosResponse>(`${this.apiUrl}/${loteId}`).pipe(
      map((response: DatosComplementariosResponse) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'No se encontraron datos complementarios');
        }
      }),
      catchError((error: any) => {
        console.error('Error en obtenerPorLoteId:', error);
        throw new Error(`Error al obtener datos complementarios: ${error.message || 'Error desconocido'}`);
      })
    );
  }

  /**
   * Actualiza datos complementarios existentes
   * @param id ID del registro a actualizar
   * @param datos Datos a actualizar
   * @returns Observable con los datos actualizados
   */
  actualizarDatos(id: number, datos: Partial<DatosComplementariosRequest>): Observable<DatosComplementarios> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<DatosComplementariosResponse>(`${this.apiUrl}/${id}`, datos, { headers }).pipe(
      map((response: DatosComplementariosResponse) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Error al actualizar los datos complementarios');
        }
      }),
      catchError((error: any) => {
        console.error('Error en actualizarDatos:', error);
        throw new Error(`Error al actualizar datos complementarios: ${error.message || 'Error desconocido'}`);
      })
    );
  }

  /**
   * Elimina datos complementarios por ID
   * @param id ID del registro a eliminar
   * @returns Observable con la confirmación
   */
  eliminarDatos(id: number): Observable<boolean> {
    return this.http.delete<DatosComplementariosResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response: DatosComplementariosResponse) => {
        if (response.success) {
          return true;
        } else {
          throw new Error(response.message || 'Error al eliminar los datos complementarios');
        }
      }),
      catchError((error: any) => {
        console.error('Error en eliminarDatos:', error);
        throw new Error(`Error al eliminar datos complementarios: ${error.message || 'Error desconocido'}`);
      })
    );
  }

  /**
   * Obtiene todos los datos complementarios (con paginación opcional)
   * @param page Página (opcional)
   * @param limit Límite por página (opcional)
   * @returns Observable con la lista de datos complementarios
   */
  obtenerTodos(page?: number, limit?: number): Observable<DatosComplementarios[]> {
    let url = this.apiUrl;
    const params: string[] = [];

    if (page) params.push(`page=${page}`);
    if (limit) params.push(`limit=${limit}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<{success: boolean, data: DatosComplementarios[], message?: string}>(url).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Error al obtener los datos complementarios');
        }
      }),
      catchError((error: any) => {
        console.error('Error en obtenerTodos:', error);
        throw new Error(`Error al obtener datos complementarios: ${error.message || 'Error desconocido'}`);
      })
    );
  }
}
