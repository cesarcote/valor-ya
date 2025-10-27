import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PredioData } from '../../core/models/predio-data.model';
import { currentEnvironment } from '../../../environments/environment';

// Interfaz para la respuesta de la API del catastro
interface CatastroApiResponse {
  success: boolean;
  message: string;
  data: {
    infoConsultaPredio: {
      chip: string;
      loteid: string;
    };
    infoGeografica: {
      areaPoligono: number;
      longitudPoligono: number;
      coordenadasPoligono: number[][][];
    };
    infoAdicional: {
      municipio: string;
      localidad: string;
      barrio: string;
      direccion: string;
      tipoPredio: string;
      estrato: string;
      areaConstruidaPrivada: string;
      edad: string;
    };
  };
  error: any;
}

@Injectable({
  providedIn: 'root',
})
export class PredioService {
  constructor(private http: HttpClient) {}

  consultarPorDireccion(direccion: string): Observable<PredioData> {
    console.log('🔍 Consultando dirección:', direccion);

    const params = new HttpParams()
      .set('Opcion', '2')
      .set('Identificador', direccion)
      .set('f', 'pjson');

    const url = `${currentEnvironment.baseUrl}/catastro/consultar`;

    return this.http.get<CatastroApiResponse>(url, { params }).pipe(
      map((response: CatastroApiResponse) => {
        if (response.success && response.data && response.data.infoAdicional) {
          const infoAdicional = response.data.infoAdicional;
          const infoConsulta = response.data.infoConsultaPredio;

          const predioData: PredioData = {
            mensaje: response.message || 'Consulta realizada exitosamente',
            chip: infoConsulta?.chip || '',
            loteid: infoConsulta?.loteid || '',
            direccion: infoAdicional.direccion || direccion,
            municipio: infoAdicional.municipio || '',
            localidad: infoAdicional.localidad || '',
            barrio: infoAdicional.barrio || '',
            tipoPredio: infoAdicional.tipoPredio || '',
            estrato: infoAdicional.estrato || '',
            areaConstruida: (infoAdicional.areaConstruidaPrivada || '0') + ' m²',
            edad: infoAdicional.edad || '',
            coordenadas: {
              lat: 4.6482837,
              lng: -74.0645468,
            },
          };

          return predioData;
        } else {
          throw new Error('La respuesta no contiene los datos esperados');
        }
      }),
      catchError((error: any) => {
        throw new Error(`No se encontraron datos para la dirección: ${direccion}`);
      })
    );
  }

  consultarPorChip(chip: string): Observable<PredioData> {
    console.log('🔍 Consultando CHIP:', chip);

    const params = new HttpParams()
      .set('Opcion', '3')
      .set('Identificador', chip)
      .set('f', 'pjson');

    const url = `${currentEnvironment.baseUrl}/catastro/consultar`;

    return this.http.get<CatastroApiResponse>(url, { params }).pipe(
      map((response: CatastroApiResponse) => {
        console.log('✅ Respuesta exitosa de la API');

        if (response.success && response.data && response.data.infoAdicional) {
          const infoAdicional = response.data.infoAdicional;
          const infoConsulta = response.data.infoConsultaPredio;

          const predioData: PredioData = {
            mensaje: response.message || 'Consulta realizada exitosamente',
            chip: infoConsulta?.chip || chip,
            loteid: infoConsulta?.loteid || '',
            direccion: infoAdicional.direccion || '',
            municipio: infoAdicional.municipio || '',
            localidad: infoAdicional.localidad || '',
            barrio: infoAdicional.barrio || '',
            tipoPredio: infoAdicional.tipoPredio || '',
            estrato: infoAdicional.estrato || '',
            areaConstruida: (infoAdicional.areaConstruidaPrivada || '0') + ' m²',
            edad: infoAdicional.edad || '',
            coordenadas: {
              lat: 4.6482837,
              lng: -74.0645468,
            },
          };

          console.log('🏠 Predio procesado exitosamente');
          return predioData;
        } else {
          console.error('❌ Estructura de respuesta inesperada');
          throw new Error('La respuesta no contiene los datos esperados');
        }
      }),
      catchError((error: any) => {
        console.error('🚨 Error en consulta:', error.status, error.message);
        throw new Error(`No se encontraron datos para el CHIP: ${chip}`);
      })
    );
  }

  consultarPorLoteId(loteId: string): Observable<PredioData> {
    console.log('🔍 Consultando LOTEID:', loteId);

    const url = `${currentEnvironment.baseUrl}/predio-info/${loteId}`;

    return this.http.get<CatastroApiResponse>(url).pipe(
      map((response: CatastroApiResponse) => {
        console.log('✅ Respuesta exitosa de la API');

        if (response.success && response.data && response.data.infoAdicional) {
          const infoAdicional = response.data.infoAdicional;
          const infoConsulta = response.data.infoConsultaPredio;

          const predioData: PredioData = {
            mensaje: response.message || 'Consulta realizada exitosamente',
            chip: infoConsulta?.chip || '',
            loteid: infoConsulta?.loteid || loteId,
            direccion: infoAdicional.direccion || '',
            municipio: infoAdicional.municipio || '',
            localidad: infoAdicional.localidad || '',
            barrio: infoAdicional.barrio || '',
            tipoPredio: infoAdicional.tipoPredio || '',
            estrato: infoAdicional.estrato || '',
            areaConstruida: (infoAdicional.areaConstruidaPrivada || '0') + ' m²',
            edad: infoAdicional.edad || '',
            coordenadas: {
              lat: 4.6482837,
              lng: -74.0645468,
            },
          };

          console.log('🏠 Predio procesado exitosamente');
          return predioData;
        } else {
          console.error('❌ Estructura de respuesta inesperada');
          throw new Error('La respuesta no contiene los datos esperados');
        }
      }),
      catchError((error: any) => {
        console.error('🚨 Error en consulta:', error.status, error.message);
        throw new Error(`No se encontraron datos para el LOTEID: ${loteId}`);
      })
    );
  }
}
