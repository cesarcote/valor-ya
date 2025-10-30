import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';
import { SelectComponent, SelectOption } from '../../../../../shared/components/select/select';
import { ParametricasService } from '../../../../../shared/services/parametricas.service';
import { TipoUnidad } from '../../../../../core/models/parametricas.model';

export interface AddressData {
  direccion: string;
  tipoPredio: string;
  tipoUnidad: TipoUnidad;
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
  tiposUnidadCompletos = signal<TipoUnidad[]>([]);

  ngOnInit(): void {
    this.loadTiposPredio();
  }

  loadTiposPredio(): void {
    this.parametricasService.consultarTiposUnidad().subscribe((tipos) => {
      this.tiposUnidadCompletos.set(tipos);
      const options: SelectOption[] = tipos.map((tipo) => ({
        value: tipo.codigoUnidad,
        label: tipo.descripcionUnidad,
      }));
      this.tiposPredio.set(options);
    });
  }

  onConsultar(): void {
    if (this.direccionControl.invalid || this.tipoPredioControl.invalid) {
      this.direccionControl.markAsTouched();
      this.tipoPredioControl.markAsTouched();
      return;
    }

    const codigoSeleccionado = this.tipoPredioControl.value!;
    const tipoUnidadCompleto = this.tiposUnidadCompletos().find(
      (t) => t.codigoUnidad === codigoSeleccionado
    )!;

    this.consultar.emit({
      direccion: this.direccionControl.value!,
      tipoPredio: codigoSeleccionado,
      tipoUnidad: tipoUnidadCompleto,
    });
  }

  onVolver(): void {
    this.volver.emit();
  }
}
