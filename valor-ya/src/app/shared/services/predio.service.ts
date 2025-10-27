import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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

  constructor(private http: HttpClient) { }

  consultarPorDireccion(direccion: string): Observable<PredioData> {
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
            direccion: infoAdicional.direccion || direccion, // Usar la dirección de búsqueda si la API no la retorna
            municipio: infoAdicional.municipio || '',
            localidad: infoAdicional.localidad || '',
            barrio: infoAdicional.barrio || '',
            tipoPredio: infoAdicional.tipoPredio || '',
            estrato: infoAdicional.estrato || '',
            areaConstruida: (infoAdicional.areaConstruidaPrivada || '0') + ' m²',
            edad: infoAdicional.edad || '',
            coordenadas: {
              lat: 4.6482837,
              lng: -74.0645468
            }
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
            chip: infoConsulta?.chip || chip, // Usar el chip de búsqueda como fallback
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
              lng: -74.0645468
            }
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
        
        // En lugar de datos mock, lanzar el error para que el componente lo maneje
        throw new Error(`No se encontraron datos para el CHIP: ${chip}`);
      })
    );
  }

  consultarPorFMI(zona: string, matricula: string): Observable<PredioData> {
    return of({
      mensaje: `Ya ubicamos tu predio para el cálculo de Valor Ya: ${zona} - ${matricula}`,
      direccion: 'Carrera 15 #32-45',
      municipio: 'Bogotá D.C.',
      localidad: 'Engativá',
      barrio: 'Código y nombre del sector catastral.',
      tipoPredio: 'Agrupaciones de Uso2.',
      estrato: 'código estrato.',
      areaConstruida: 'área construida del predio.',
      edad: 'Rango de edad entre -3 años y +3 años de antigüedad.',
      coordenadas: { lat: 4.711, lng: -74.0721 },
    });
  }
}
