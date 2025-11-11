import { Component, inject, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';
import { SelectComponent, SelectOption } from '../../../../../shared/components/select/select';
import { ParametricasService } from '../../../../../shared/services/parametricas.service';
import { TipoUnidad } from '../../../../../core/models/parametricas.model';

export interface ChipData {
  chip: string;
  tipoPredio: string;
  tipoUnidad: TipoUnidad;
}

@Component({
  selector: 'app-form-chip',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, SelectComponent],
  templateUrl: './form-chip.html',
  styleUrls: ['./form-chip.css'],
})
export class FormChipComponent implements OnInit {
  @Output() consultar = new EventEmitter<ChipData>();
  @Output() volver = new EventEmitter<void>();

  private parametricasService = inject(ParametricasService);

  chipControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(30),
  ]);

  codigoTipoUnidadControl = new FormControl('', [Validators.required]);

  opcionesTipoUnidad = signal<SelectOption[]>([]);

  tiposUnidad = signal<TipoUnidad[]>([]);

  isFormValid = computed(() => {
    return this.chipControl.valid && this.codigoTipoUnidadControl.valid;
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
    if (this.chipControl.invalid || this.codigoTipoUnidadControl.invalid) {
      this.chipControl.markAsTouched();
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
      chip: this.chipControl.value!,
      tipoPredio: codigoSeleccionado, // Solo el código "AP"
      tipoUnidad: tipoUnidadCompleto, // Objeto completo { codigoUnidad: "AP", descripcionUnidad: "APARTAMENTO" }
    });
  }

  onVolver(): void {
    this.volver.emit();
  }
}
