import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatastroResponse } from '../models/catastro-response.model';

@Injectable({
  providedIn: 'root',
})
export class CatastroService {
  private http = inject(HttpClient);
  private baseUrl = 'https://serviciosgis.catastrobogota.gov.co/otrosservicios/rest/services/Cartografia/Construcciones/MapServer/exts/CalcularAreaCons/consultaSIIC';

  buscarPorDireccion(direccion: string): Observable<CatastroResponse> {
    const url = `${this.baseUrl}?Opcion=2&Identificador=${encodeURIComponent(direccion)}&f=pjson`;
    return this.http.get<CatastroResponse>(url);
  }

  buscarPorChip(chip: string): Observable<CatastroResponse> {
    const url = `${this.baseUrl}?Opcion=3&Identificador=${encodeURIComponent(chip)}&f=pjson`;
    return this.http.get<CatastroResponse>(url);
  }
}
