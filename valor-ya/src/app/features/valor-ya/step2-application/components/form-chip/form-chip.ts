import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
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
    if (this.chipControl.invalid || this.tipoPredioControl.invalid) {
      this.chipControl.markAsTouched();
      this.tipoPredioControl.markAsTouched();
      return;
    }

    const codigoSeleccionado = this.tipoPredioControl.value!;
    const tipoUnidadCompleto = this.tiposUnidadCompletos().find(
      (t) => t.codigoUnidad === codigoSeleccionado
    )!;

    this.consultar.emit({
      chip: this.chipControl.value!,
      tipoPredio: codigoSeleccionado,
      tipoUnidad: tipoUnidadCompleto,
    });
  }

  onVolver(): void {
    this.volver.emit();
  }
}
