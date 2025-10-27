import { Component, inject, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MapComponent } from './components/map/map';
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

  buscarPorDireccion(): void {
    this.loadingForm1.set(true);
    this.errorForm1.set('');
    this.responseForm1.set(null);

    this.catastroService.buscarPorDireccion(this.direccion).subscribe({
      next: (response) => {
        this.responseForm1.set(response);
        this.loadingForm1.set(false);

        const loteid = response.LOTEID || response.data?.infoConsultaPredio?.loteid;
        if (loteid) {
          this.mapComponent.ubicarLotePorCodigo(loteid);
        }
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

        const loteid = response.LOTEID || response.data?.infoConsultaPredio?.loteid;
        if (loteid) {
          this.mapComponent.ubicarLotePorCodigo(loteid);
        }
      },
      error: (error) => {
        this.errorForm2.set(`Error: ${error.message}`);
        this.loadingForm2.set(false);
      },
    });
  }
}
