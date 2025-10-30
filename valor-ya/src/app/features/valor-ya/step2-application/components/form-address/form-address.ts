import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';
import { SelectComponent, SelectOption } from '../../../../../shared/components/select/select';
import { ParametricasService } from '../../../../../shared/services/parametricas.service';

export interface AddressData {
  direccion: string;
  tipoPredio: string;
}

@Component({
  selector: 'app-form-address',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, SelectComponent],
  templateUrl: './form-address.html',
  styleUrls: ['./form-address.css'],
})
export class FormAddressComponent implements OnInit {
  @Output() consultar = new EventEmitter<AddressData>();
  @Output() volver = new EventEmitter<void>();

  private parametricasService = inject(ParametricasService);

  direccionControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  tipoPredioControl = new FormControl('', [Validators.required]);

  tiposPredio = signal<SelectOption[]>([]);

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
    if (this.direccionControl.invalid || this.tipoPredioControl.invalid) {
      this.direccionControl.markAsTouched();
      this.tipoPredioControl.markAsTouched();
      return;
    }

    this.consultar.emit({
      direccion: this.direccionControl.value!,
      tipoPredio: this.tipoPredioControl.value!,
    });
  }

  onVolver(): void {
    this.volver.emit();
  }
}
