import { Component, computed, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';

export interface AddressData {
  direccion: string;
}

@Component({
  selector: 'app-test-form-address',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './form-address.html',
  styleUrls: ['./form-address.css'],
})
export class TestFormAddressComponent {
  @Output() consultar = new EventEmitter<AddressData>();

  direccionControl = new FormControl('', [Validators.required, Validators.minLength(5)]);

  private readonly direccionStatus = toSignal(this.direccionControl.statusChanges, {
    initialValue: 'INVALID',
  });

  isFormValid = computed(() => {
    return this.direccionStatus() === 'VALID';
  });

  onConsultar(): void {
    if (this.direccionControl.invalid) {
      this.direccionControl.markAsTouched();
      return;
    }

    this.consultar.emit({
      direccion: this.direccionControl.value!,
    });
  }
}
