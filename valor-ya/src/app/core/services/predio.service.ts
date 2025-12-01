import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PredioData } from '../../core/models/predio-data.model';
import { currentEnvironment } from '../../../environments/environment';
import { CatastroResponse } from '../../core/models/catastro-response.model';

@Injectable({
  providedIn: 'root',
})
export class PredioService {
  private readonly DEFAULT_COORDINATES = {
    lat: 4.6482837,
    lng: -74.0645468,
  };

  constructor(private readonly http: HttpClient) {}

  private mapCatastroResponseToPredioData(
    response: CatastroResponse,
    valorBusqueda?: string,
    tipoBusqueda?: 'chip' | 'direccion'
  ): PredioData {
    const { data, message } = response;
    const { infoAdicional, infoConsultaPredio, infoGeografica } = data!;

    return {
      mensaje: message || 'Consulta realizada exitosamente',
      chip: infoConsultaPredio?.chip || (tipoBusqueda === 'chip' ? valorBusqueda : '') || '',
      loteid: infoConsultaPredio?.loteid || '',
      direccion:
        infoAdicional.direccion || (tipoBusqueda === 'direccion' ? valorBusqueda : '') || '',
      municipio: infoAdicional.municipio || '',
      localidad: infoAdicional.localidad || '',
      barrio: infoAdicional.barrio || '',
      tipoPredio: infoAdicional.tipoPredio || '',
      estrato: infoAdicional.estrato || '',
      areaConstruida: infoAdicional.areaConstruidaPrivada || '0',
      edad: infoAdicional.edad || '',
      coordenadas: this.DEFAULT_COORDINATES,
      coordenadasPoligono: infoGeografica?.coordenadasPoligono,
      areaPoligono: infoGeografica?.areaPoligono,
      longitudPoligono: infoGeografica?.longitudPoligono,
      ph: infoAdicional.ph,
      nph: infoAdicional.nph,
      codigoManzana: infoAdicional.codigoManzana,
      codigoPredio: infoAdicional.codigoPredio,
      codigoBarrio: infoAdicional.codigoBarrio,
    };
  }

  consultarPorDireccion(direccion: string): Observable<PredioData> {
    const params = new HttpParams()
      .set('Opcion', '2')
      .set('Identificador', direccion)
      .set('f', 'pjson');

    const url = `${currentEnvironment.baseUrl}/catastro/consultar`;

    return this.http.get<CatastroResponse>(url, { params }).pipe(
      map((response: CatastroResponse) => {
        if (response.success && response.data?.infoAdicional) {
          return this.mapCatastroResponseToPredioData(response, direccion, 'direccion');
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
    const params = new HttpParams().set('Opcion', '3').set('Identificador', chip).set('f', 'pjson');

    const url = `${currentEnvironment.baseUrl}/catastro/consultar`;

    return this.http.get<CatastroResponse>(url, { params }).pipe(
      map((response: CatastroResponse) => {
        if (response.success && response.data?.infoAdicional) {
          return this.mapCatastroResponseToPredioData(response, chip, 'chip');
        } else {
          console.error('❌ Estructura de respuesta inesperada');
          throw new Error('La respuesta no contiene los datos esperados');
        }
      }),
      catchError((error: any) => {
        console.error('Error en consulta:', error.status, error.message);
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
      areaConstruida: 'área construida privada del predio.',
      edad: 'Rango de edad entre -3 años y +3 años de antigüedad.',
      coordenadas: { lat: 4.711, lng: -74.0721 },
    });
  }
}
