import { Component, inject, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs';

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

  codigoTipoUnidadControl = new FormControl('', [Validators.required]);

  opcionesTipoUnidad = signal<SelectOption[]>([]);

  tiposUnidad = signal<TipoUnidad[]>([]);

  direccionValid = toSignal(
    this.direccionControl.statusChanges.pipe(
      startWith(this.direccionControl.status),
      map(() => this.direccionControl.valid)
    ),
    { initialValue: false }
  );

  codigoTipoUnidadValid = toSignal(
    this.codigoTipoUnidadControl.statusChanges.pipe(
      startWith(this.codigoTipoUnidadControl.status),
      map(() => this.codigoTipoUnidadControl.valid)
    ),
    { initialValue: false }
  );

  isFormValid = computed(() => {
    return this.direccionValid() && this.codigoTipoUnidadValid();
  });

  ngOnInit(): void {
    this.loadTiposPredio();
  }

  loadTiposPredio(): void {
    this.parametricasService.consultarTiposUnidad().subscribe((tipos) => {
      // Guardar objetos completos
      this.tiposUnidad.set(tipos);

      // Crear opciones para el dropdown
      const options: SelectOption[] = tipos.map((tipo) => ({
        value: tipo.codigoUnidad, // "AP"
        label: tipo.descripcionUnidad, // "APARTAMENTO"
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

    // El usuario seleccionó un código (ej: "AP")
    const codigoSeleccionado = this.codigoTipoUnidadControl.value!;

    // Buscar el objeto completo que corresponde a ese código
    const tipoUnidadCompleto = this.tiposUnidad().find(
      (tipo) => tipo.codigoUnidad === codigoSeleccionado
    )!;

    this.consultar.emit({
      direccion: this.direccionControl.value!,
      tipoPredio: codigoSeleccionado, // Solo el código "AP"
      tipoUnidad: tipoUnidadCompleto, // Objeto completo { codigoUnidad: "AP", descripcionUnidad: "APARTAMENTO" }
    });
  }

  onVolver(): void {
    this.volver.emit();
  }
}
