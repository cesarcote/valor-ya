import { Component, computed, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { InputComponent } from '../../../../../shared/components/ui/input/input';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button';
import { SelectComponent, SelectOption } from '../../../../../shared/components/ui/select/select';

export interface FmiData {
  zona: string;
  matricula: string;
}

@Component({
  selector: 'app-test-form-fmi',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, SelectComponent],
  templateUrl: './form-fmi.html',
  styleUrls: ['./form-fmi.css'],
})
export class TestFormFmiComponent {
  @Output() consultar = new EventEmitter<FmiData>();

  zonaControl = new FormControl('', [Validators.required]);
  matriculaControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  private readonly zonaStatus = toSignal(this.zonaControl.statusChanges, { initialValue: 'INVALID' });
  private readonly matriculaStatus = toSignal(this.matriculaControl.statusChanges, {
    initialValue: 'INVALID',
  });

  isFormValid = computed(() => {
    return this.zonaStatus() === 'VALID' && this.matriculaStatus() === 'VALID';
  });

  zonas: SelectOption[] = [
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
}
