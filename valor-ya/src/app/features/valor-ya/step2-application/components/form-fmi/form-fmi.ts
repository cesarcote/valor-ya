import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';

export interface FmiData {
  zona: string;
  matricula: string;
}

@Component({
  selector: 'app-form-fmi',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './form-fmi.html',
  styleUrls: ['./form-fmi.css'],
})
export class FormFmiComponent {
  @Output() consultar = new EventEmitter<FmiData>();
  @Output() volver = new EventEmitter<void>();

  zonaControl = new FormControl('', [Validators.required]);
  matriculaControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  zonas = [
    { value: '50C', label: '50C-Bogota Zona Centro' },
    { value: '50S', label: '50S-Bogotá Zona Sur' },
    { value: '50N', label: '50N-Bogotá Zona Norte' },
  ];

  onConsultar(): void {
    if (this.zonaControl.invalid || this.matriculaControl.invalid) {
      this.zonaControl.markAsTouched();
      this.matriculaControl.markAsTouched();
      return;
    }

    this.consultar.emit({
      zona: this.zonaControl.value!,
      matricula: this.matriculaControl.value!,
    });
  }

  onVolver(): void {
    this.volver.emit();
  }
}
