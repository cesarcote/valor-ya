import { Component, inject, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

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

  private parametricasService = inject(ParametricasService);

  direccionControl = new FormControl('', [Validators.required, Validators.minLength(5)]);

  codigoTipoUnidadControl = new FormControl('', [Validators.required]);

  opcionesTipoUnidad = signal<SelectOption[]>([]);

  tiposUnidad = signal<TipoUnidad[]>([]);

  private direccionStatus = toSignal(this.direccionControl.statusChanges, {
    initialValue: 'INVALID',
  });
  private tipoUnidadStatus = toSignal(this.codigoTipoUnidadControl.statusChanges, {
    initialValue: 'INVALID',
  });

  isFormValid = computed(() => {
    return this.direccionStatus() === 'VALID' && this.tipoUnidadStatus() === 'VALID';
  });

  ngOnInit(): void {
    this.loadTiposPredio();
  }

  loadTiposPredio(): void {
    this.parametricasService.consultarTiposUnidad().subscribe((tipos) => {
      this.tiposUnidad.set(tipos);

      const options: SelectOption[] = tipos.map((tipo) => ({
        value: tipo.codigoUnidad,
        label: tipo.descripcionUnidad,
      }));
      this.opcionesTipoUnidad.set(options);
    });
  }

  onConsultar(): void {
    if (this.direccionControl.invalid || this.codigoTipoUnidadControl.invalid) {
      this.direccionControl.markAsTouched();
      this.codigoTipoUnidadControl.markAsTouched();
      return;
    }

    const codigoSeleccionado = this.codigoTipoUnidadControl.value!;

    const tipoUnidadCompleto = this.tiposUnidad().find(
      (tipo) => tipo.codigoUnidad === codigoSeleccionado
    )!;

    this.consultar.emit({
      direccion: this.direccionControl.value!,
      tipoPredio: codigoSeleccionado,
      tipoUnidad: tipoUnidadCompleto,
    });
  }
}
