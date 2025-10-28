import { Component, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';

import { MapComponent } from '../../shared/components/map/map';
import { CatastroService } from '../../core/services/catastro.service';
import { CatastroResponse } from '../../core/models/catastro-response.model';

@Component({
  selector: 'app-test',
  imports: [FormsModule, CommonModule, MapComponent],
  templateUrl: './test.html',
  styleUrls: ['./test.css'],
})
export class TestComponent {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  private catastroService = inject(CatastroService);

  direccion = 'KR 119B 73B 15';
  responseForm1 = signal<CatastroResponse | null>(null);
  loadingForm1 = signal(false);
  errorForm1 = signal('');

  chip = 'AAA0228WRAW';
  responseForm2 = signal<CatastroResponse | null>(null);
  loadingForm2 = signal(false);
  errorForm2 = signal('');

  mockResponse = signal<CatastroResponse | null>(null);
  loadingMock = signal(false);

  buscarPorDireccion(): void {
    this.loadingForm1.set(true);
    this.errorForm1.set('');
    this.responseForm1.set(null);

    this.catastroService.buscarPorDireccion(this.direccion).subscribe({
      next: (response) => {
        this.responseForm1.set(response);
        this.loadingForm1.set(false);
      },
      error: (error) => {
        this.errorForm1.set(`Error: ${error.message}`);
        this.loadingForm1.set(false);
      },
    });
  }

  buscarPorChip(): void {
    this.loadingForm2.set(true);
    this.errorForm2.set('');
    this.responseForm2.set(null);

    this.catastroService.buscarPorChip(this.chip).subscribe({
      next: (response) => {
        this.responseForm2.set(response);
        this.loadingForm2.set(false);
      },
      error: (error) => {
        this.errorForm2.set(`Error: ${error.message}`);
        this.loadingForm2.set(false);
      },
    });
  }

  buscarMockCompleto(): void {
    this.loadingMock.set(true);
    this.mockResponse.set(null);

    this.getMockResponse().subscribe({
      next: (response) => {
        this.mockResponse.set(response);
        this.loadingMock.set(false);
      },
      error: () => {
        this.loadingMock.set(false);
      },
    });
  }

  private getMockResponse(): Observable<CatastroResponse> {
    const mockResponse: CatastroResponse = {
      success: true,
      message: 'Consulta catastral realizada exitosamente',
      data: {
        infoGeografica: {
          areaPoligono: 451.58018913,
          longitudPoligono: 90.1995572949003,
          coordenadasPoligono: [
            [
              [-74.13142385200001, 4.718488246999982],
              [-74.13149593100002, 4.718488249000018],
              [-74.13149593000003, 4.718528927000023],
              [-74.13144637599999, 4.718528925999976],
              [-74.13142385100002, 4.718528924999987],
              [-74.131396822, 4.7185289239999975],
              [-74.131396822, 4.718488246999982],
              [-74.13142385200001, 4.718488246999982],
            ],
          ],
        },
        infoConsultaPredio: {
          chip: 'AAA0228WRAW',
          loteid: '008213033003',
        },
        infoAdicional: {
          municipio: 'Bogotá D.C.',
          localidad: 'Suba',
          barrio: 'Costa Azul',
          direccion: 'KR 119B 73B 15',
          tipoPredio: 'Residencial',
          estrato: '3',
          areaConstruidaPrivada: '120',
          edad: '10-20',
        },
      },
      error: null,
    };

    return of(mockResponse);
  }
}
