import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PredioData } from '../models/predio-data.model';

@Injectable({
  providedIn: 'root',
})
export class PredioService {
  consultarPorDireccion(direccion: string): Observable<PredioData> {
    return of({
      mensaje: `Ya ubicamos tu predio para el cálculo de Valor Ya: ${direccion}`,
      direccion: direccion,
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

  consultarPorChip(chip: string): Observable<PredioData> {
    return of({
      mensaje: `Ya ubicamos tu predio para el cálculo de Valor Ya: ${chip}`,
      direccion: 'Calle 25 #45-60',
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
