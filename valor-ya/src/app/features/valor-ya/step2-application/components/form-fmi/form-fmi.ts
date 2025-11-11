import { Component, inject, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs';

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

  codigoTipoUnidadControl = new FormControl('', [Validators.required]);

  opcionesTipoUnidad = signal<SelectOption[]>([]);

  tiposUnidad = signal<TipoUnidad[]>([]);

  zonaValid = toSignal(
    this.zonaControl.statusChanges.pipe(
      startWith(this.zonaControl.status),
      map(() => this.zonaControl.valid)
    ),
    { initialValue: false }
  );

  matriculaValid = toSignal(
    this.matriculaControl.statusChanges.pipe(
      startWith(this.matriculaControl.status),
      map(() => this.matriculaControl.valid)
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
    return this.zonaValid() && this.matriculaValid() && this.codigoTipoUnidadValid();
  });

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
    if (
      this.zonaControl.invalid ||
      this.matriculaControl.invalid ||
      this.codigoTipoUnidadControl.invalid
    ) {
      this.zonaControl.markAsTouched();
      this.matriculaControl.markAsTouched();
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
      zona: this.zonaControl.value!,
      matricula: this.matriculaControl.value!,
      tipoPredio: codigoSeleccionado, // Solo el código "AP"
      tipoUnidad: tipoUnidadCompleto, // Objeto completo { codigoUnidad: "AP", descripcionUnidad: "APARTAMENTO" }
    });
  }

  onVolver(): void {
    this.volver.emit();
  }
}
