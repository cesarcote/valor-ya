import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import {
  MCMValorYAResultado,
  ValidacionMinimoOfertasResponse,
  TestConexionResponse,
} from '../../../core/models/mcm-valor-ya.model';
import { currentEnvironment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MCMValorYaService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = currentEnvironment.baseUrl;

  procesarChip(chip: string): Observable<MCMValorYAResultado> {
    const url = `${this.API_BASE_URL}/api/procesar-chips/chip-unico`;
    const body = { chip };

    return this.http.post<MCMValorYAResultado>(url, body).pipe(
      timeout(30000), // 30 segundos - MCM puede tardar
      catchError((error) => {
        console.error('❌ [MCM Service] Error en procesarChip:', error);
        throw error;
      })
    );
  }

  descargarAvaluo(chip: string): Observable<Blob> {
    const url = `${this.API_BASE_URL}/api/descargar-avaluo/${chip}`;

    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error al descargar el avalúo:', error);
        throw error;
      })
    );
  }

  validarMinimoOfertas(chips: string[]): Observable<ValidacionMinimoOfertasResponse> {
    const url = `${this.API_BASE_URL}/api/procesar-chips/validar-minimo-ofertas`;
    const body = { chips };

    return this.http.post<ValidacionMinimoOfertasResponse>(url, body).pipe(
      timeout(5000),
      catchError((error) => {
        console.error('❌ [MCM Service] Error en validarMinimoOfertas:', error);
        throw error;
      })
    );
  }

  testConexion(): Observable<TestConexionResponse> {
    const url = `${this.API_BASE_URL}/api/procesar-chips/test-conexion`;

    return this.http.get<TestConexionResponse>(url).pipe(
      timeout(5000),
      catchError((error) => {
        console.error('❌ [MCM Service] Error en testConexion:', error);
        throw error;
      })
    );
  }
}
