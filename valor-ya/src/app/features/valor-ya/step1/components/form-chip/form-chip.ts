import { Component, inject, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { InputComponent } from '../../../../../shared/components/input/input';
import { ButtonComponent } from '../../../../../shared/components/button/button';

export interface ChipData {
  chip: string;
}

@Component({
  selector: 'app-form-chip',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './form-chip.html',
  styleUrls: ['./form-chip.css'],
})
export class FormChipComponent implements OnInit {
  @Output() consultar = new EventEmitter<ChipData>();

  chipControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(30),
  ]);

  private chipStatus = toSignal(this.chipControl.statusChanges, { initialValue: 'INVALID' });

  isFormValid = computed(() => {
    return this.chipStatus() === 'VALID';
  });

  ngOnInit(): void {}

  onConsultar(): void {
    if (this.chipControl.invalid) {
      this.chipControl.markAsTouched();
      return;
    }

    this.consultar.emit({
      chip: this.chipControl.value!,
    });
  }
}
