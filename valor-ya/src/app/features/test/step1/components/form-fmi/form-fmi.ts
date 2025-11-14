import { Component, inject, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

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
  selector: 'app-test-form-fmi',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, SelectComponent],
  templateUrl: './form-fmi.html',
  styleUrls: ['./form-fmi.css'],
})
export class TestFormFmiComponent implements OnInit {
  @Output() consultar = new EventEmitter<FmiData>();

  private parametricasService = inject(ParametricasService);

  zonaControl = new FormControl('', [Validators.required]);
  matriculaControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  codigoTipoUnidadControl = new FormControl('', [Validators.required]);

  opcionesTipoUnidad = signal<SelectOption[]>([]);

  tiposUnidad = signal<TipoUnidad[]>([]);

  // Convertir statusChanges a signals
  private zonaStatus = toSignal(this.zonaControl.statusChanges, { initialValue: 'INVALID' });
  private matriculaStatus = toSignal(this.matriculaControl.statusChanges, {
    initialValue: 'INVALID',
  });
  private tipoUnidadStatus = toSignal(this.codigoTipoUnidadControl.statusChanges, {
    initialValue: 'INVALID',
  });

  isFormValid = computed(() => {
    return (
      this.zonaStatus() === 'VALID' &&
      this.matriculaStatus() === 'VALID' &&
      this.tipoUnidadStatus() === 'VALID'
    );
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
      this.tiposUnidad.set(tipos);

      const options: SelectOption[] = tipos.map((tipo) => ({
        value: tipo.codigoUnidad,
        label: tipo.descripcionUnidad,
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

    const codigoSeleccionado = this.codigoTipoUnidadControl.value!;

    const tipoUnidadCompleto = this.tiposUnidad().find(
      (tipo) => tipo.codigoUnidad === codigoSeleccionado
    )!;

    this.consultar.emit({
      zona: this.zonaControl.value!,
      matricula: this.matriculaControl.value!,
      tipoPredio: codigoSeleccionado,
      tipoUnidad: tipoUnidadCompleto,
    });
  }
}
