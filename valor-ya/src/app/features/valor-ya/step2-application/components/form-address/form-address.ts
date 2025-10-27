import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';

@Component({
  selector: 'app-form-address',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './form-address.html',
  styleUrls: ['./form-address.css'],
})
export class FormAddressComponent {
  @Output() consultar = new EventEmitter<string>();
  @Output() volver = new EventEmitter<void>();

  direccionControl = new FormControl('', [Validators.required, Validators.minLength(5)]);

  onConsultar(): void {
    if (this.direccionControl.invalid) {
      this.direccionControl.markAsTouched();
      return;
    }

    this.consultar.emit(this.direccionControl.value!);
  }

  onVolver(): void {
    this.volver.emit();
  }
}
