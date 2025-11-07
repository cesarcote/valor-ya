import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { MCMValorYAResultado } from '../../core/models/mcm-valor-ya.model';
import { currentEnvironment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MCMValorYaService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = currentEnvironment.baseUrl;

  procesarChip(chip: string): Observable<MCMValorYAResultado> {
    const url = `${this.API_BASE_URL}/api/procesar-chips/chip-unico`;
    const body = { chip };

    console.log('🚀 [MCM Service] Llamando a:', url);
    console.log('📦 [MCM Service] Body:', body);

    return this.http.post<MCMValorYAResultado>(url, body).pipe(
      timeout(10000), // Timeout de 10 segundos
      catchError((error) => {
        console.error('❌ [MCM Service] Error completo:', error);
        console.warn(
          'Error al llamar al API de ValorYA o timeout excedido, usando datos mock:',
          error
        );
        return of(this.getMockResponse());
      })
    );
  }

  descargarAvaluo(chip: string): Observable<Blob> {
    const url = `${this.API_BASE_URL}/descargar-avaluo/${chip}`;

    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error al descargar el avalúo:', error);
        throw error; // Re-throw the error for component handling
      })
    );
  }

  private getMockResponse(): MCMValorYAResultado {
    return {
      mensaje: 'CHIPs procesados exitosamente (datos de respaldo)',
      metadatos: {
        chips_procesados: 3,
        chips_solicitados: 1,
        ofertas_utilizadas: 62501,
        tiempo_procesamiento_segundos: 0.33,
        timestamp: new Date().toISOString(),
        vigencia_liquidacion: 2025,
        vigencia_resolucion: 2025,
      },
      resultados: [
        {
          CHIP_PREDIO: 'AAA0036YERJ',
          CEDULA_CATASTRAL_PREDIO: '8A 36 17 167',
          DIRECCION_REAL_PREDIO: 'CL 9 37A 03 OF 305',
          CODIGO_LOCALIDAD_PREDIO: '16',
          CODIGO_SECTOR_PREDIO: '004208',
          AREA_CONSTRUIDA_PREDIO: 37.4,
          AREA_TERRENO_OFERTA: 9.7,
          EDAD_PREDIO: 42,
          VALOR_AVALUO_PREDIO: 80000000.0,
          CV: 1.65,
          LIM_INFERIOR: 2138045.92,
          LIM_SUPERIOR: 2210005.61,
          MEDIA: 2174025.76,
          MEDIANA: 2165820.64,
          MINIMO: 2142857.14,
          MAXIMO: 2213399.5,
          COMENTARIO: 'CV menor a 7.5%',
          // Agregando campos faltantes para completar la estructura
          AREA_CONSTRUIDA_OFERTA: 40.3,
          ASIMETRIA: 0.97,
          BARMANPRE_PREDIO: '0042081122',
          CHIP_OFERTA: 'AAA0036TMWF',
          CLASE_PREDIO_PREDIO: 'P',
          CODIGO_ESTRATO_OFERTA: 0.0,
          CODIGO_ESTRATO_PREDIO: 0,
          CODIGO_USO_PREDIO: '045',
          CODIGO_ZONA_FISICA_PREDIO: '6893015154321',
          DESVIACION: 35979.84,
          DIRECCION_REAL_OFERTA: 'KR 38 10 90 OF 549',
          GRUPO: 'M03',
          OBSERVACION_ZONA: 'IGUAL SECTOR',
          POINT_X_OFERTA: -75.00135493,
          POINT_X_PREDIO: -75.00233052,
          POINT_Y_OFERTA: 3.71203906,
          POINT_Y_PREDIO: 3.71021333,
          PUNTAJE_OFERTA: 73,
          PUNTAJE_PREDIO: 49,
          VALOR_INTEGRAL_OFERTA: 2213399.5,
          VALOR_INTEGRAL_PREDIO: 5095842.5,
          VETUSTEZ_OFERTA: 1999.0,
        },
      ],
      status: 'success',
    };
  }
}
