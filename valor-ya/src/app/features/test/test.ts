import { Component, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
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
  private cd = inject(ChangeDetectorRef);

  direccion = 'KR 119B 73B 15';
  responseForm1: CatastroResponse | null = null;
  loadingForm1 = false;
  errorForm1 = '';

  chip = 'AAA0228WRAW';
  responseForm2: CatastroResponse | null = null;
  loadingForm2 = false;
  errorForm2 = '';

  buscarPorDireccion(): void {
    this.loadingForm1 = true;
    this.errorForm1 = '';
    this.responseForm1 = null;

    this.catastroService.buscarPorDireccion(this.direccion).subscribe({
      next: (response) => {
        this.responseForm1 = response;
        this.loadingForm1 = false;

        if (response.LOTEID) {
          this.mapComponent.ubicarLotePorCodigo(response.LOTEID);
        }

        this.cd.detectChanges();
      },
      error: (error) => {
        this.errorForm1 = `Error: ${error.message}`;
        this.loadingForm1 = false;
        this.cd.detectChanges();
      },
    });
  }

  buscarPorChip(): void {
    this.loadingForm2 = true;
    this.errorForm2 = '';
    this.responseForm2 = null;

    this.catastroService.buscarPorChip(this.chip).subscribe({
      next: (response) => {
        this.responseForm2 = response;
        this.loadingForm2 = false;

        if (response.LOTEID) {
          this.mapComponent.ubicarLotePorCodigo(response.LOTEID);
        }

        this.cd.detectChanges();
      },
      error: (error) => {
        this.errorForm2 = `Error: ${error.message}`;
        this.loadingForm2 = false;
        this.cd.detectChanges();
      },
    });
  }
}
