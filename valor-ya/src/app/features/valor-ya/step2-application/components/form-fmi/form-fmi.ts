import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';
import { SelectComponent, SelectOption } from '../../../../../shared/components/select/select';
import { ParametricasService } from '../../../../../shared/services/parametricas.service';
import { TipoUnidad } from '../../../../../core/models/parametricas.model';

export interface FmiData {
  zona: string;
  matricula: string;
  tipoPredio: string;
  tipoUnidad: TipoUnidad;
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
  tiposUnidadCompletos = signal<TipoUnidad[]>([]);

  zonas: SelectOption[] = [
    { value: '50C', label: '50C-Bogota Zona Centro' },
    { value: '50S', label: '50S-Bogotá Zona Sur' },
    { value: '50N', label: '50N-Bogotá Zona Norte' },
  ];

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

    const codigoSeleccionado = this.tipoPredioControl.value!;
    const tipoUnidadCompleto = this.tiposUnidadCompletos().find(
      (t) => t.codigoUnidad === codigoSeleccionado
    )!;

    this.consultar.emit({
      zona: this.zonaControl.value!,
      matricula: this.matriculaControl.value!,
      tipoPredio: codigoSeleccionado,
      tipoUnidad: tipoUnidadCompleto,
    });
  }

  onVolver(): void {
    this.volver.emit();
  }
}
