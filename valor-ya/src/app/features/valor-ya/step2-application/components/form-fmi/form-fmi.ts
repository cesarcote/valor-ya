import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';
import { SelectComponent, SelectOption } from '../../../../../shared/components/select/select';
import { ParametricasService } from '../../../../../shared/services/parametricas.service';

export interface FmiData {
  zona: string;
  matricula: string;
  tipoPredio: string;
}

@Component({
  selector: 'app-form-fmi',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, SelectComponent],
  templateUrl: './form-fmi.html',
  styleUrls: ['./form-fmi.css'],
})
export class FormFmiComponent implements OnInit {
  @Output() consultar = new EventEmitter<FmiData>();
  @Output() volver = new EventEmitter<void>();

  private parametricasService = inject(ParametricasService);

  zonaControl = new FormControl('', [Validators.required]);
  matriculaControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  tipoPredioControl = new FormControl('', [Validators.required]);

  tiposPredio = signal<SelectOption[]>([]);

  zonas: SelectOption[] = [
    { value: '50C', label: '50C-Bogota Zona Centro' },
    { value: '50S', label: '50S-Bogotá Zona Sur' },
    { value: '50N', label: '50N-Bogotá Zona Norte' },
  ];

  ngOnInit(): void {
    this.loadTiposPredio();
  }

  loadTiposPredio(): void {
    this.parametricasService.consultarTiposUnidad().subscribe({
      next: (tipos) => {
        const options: SelectOption[] = tipos.map((tipo) => ({
          value: tipo.codigoUnidad.toLowerCase(),
          label: tipo.descripcionUnidad,
        }));
        this.tiposPredio.set(options);
      },
      error: (error) => {
        console.error('Error al conectar al endpoint /parametricas/tipos-unidad:', error);
        // Fallback to hardcoded
        this.tiposPredio.set([
          { value: 'ap', label: 'APARTAMENTO' },
          { value: 'bg', label: 'BODEGA' },
          { value: 'ca', label: 'CASA' },
          { value: 'dp', label: 'DEPÓSITO' },
          { value: 'gj', label: 'GARAJE' },
          { value: 'lc', label: 'LOCAL' },
          { value: 'of', label: 'OFICINA' },
          { value: 'ot', label: 'Otro' },
        ]);
      },
    });
  }

  onConsultar(): void {
    if (
      this.zonaControl.invalid ||
      this.matriculaControl.invalid ||
      this.tipoPredioControl.invalid
    ) {
      this.zonaControl.markAsTouched();
      this.matriculaControl.markAsTouched();
      this.tipoPredioControl.markAsTouched();
      return;
    }

    this.consultar.emit({
      zona: this.zonaControl.value!,
      matricula: this.matriculaControl.value!,
      tipoPredio: this.tipoPredioControl.value!,
    });
  }

  onVolver(): void {
    this.volver.emit();
  }
}
