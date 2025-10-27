import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';

@Component({
  selector: 'app-form-chip',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './form-chip.html',
  styleUrls: ['./form-chip.css'],
})
export class FormChipComponent {
  @Output() consultar = new EventEmitter<string>();
  @Output() volver = new EventEmitter<void>();

  chipControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(30),
  ]);

  onConsultar(): void {
    if (this.chipControl.invalid) {
      this.chipControl.markAsTouched();
      return;
    }

    this.consultar.emit(this.chipControl.value!);
  }

  onVolver(): void {
    this.volver.emit();
  }
}
