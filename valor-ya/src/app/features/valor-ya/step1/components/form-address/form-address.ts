import { Component, computed, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { InputComponent } from '../../../../../shared/components/ui/input/input';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button';

export interface AddressData {
  direccion: string;
}

@Component({
  selector: 'app-form-address',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './form-address.html',
  styleUrls: ['./form-address.css'],
})
export class FormAddressComponent {
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
