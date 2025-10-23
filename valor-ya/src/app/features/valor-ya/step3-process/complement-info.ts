import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ValorYaStepperService, ValorYaStep } from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService } from '../../../core/services/valor-ya-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';
import { InputComponent } from '../../../shared/components/input/input';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select';

@Component({
  selector: 'app-complement-info',
  imports: [ReactiveFormsModule, StepperComponent, ButtonComponent, InputComponent, SelectComponent],
  templateUrl: './complement-info.html',
  styleUrls: ['./complement-info.css'],
})
export class ComplementInfoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);

  complementForm!: FormGroup;

  tiposPredio: SelectOption[] = [
    { value: 'casa', label: 'Casa' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'local', label: 'Local Comercial' },
    { value: 'bodega', label: 'Bodega' },
    { value: 'lote', label: 'Lote' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'otro', label: 'Otro' },
  ];

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.PROCESO);
    this.initForm();
  }

  initForm(): void {
    this.complementForm = this.fb.group({
      tipoPredio: ['', Validators.required],
      otroTipoPredio: [''],
      numeroHabitaciones: ['', [Validators.required, Validators.min(0)]],
      numeroBanos: ['', [Validators.required, Validators.min(0)]],
      areaConstruida: ['', [Validators.required, Validators.min(1)]],
      edad: ['', [Validators.required, Validators.min(0)]],
      estrato: ['', [Validators.required, Validators.min(1), Validators.max(6)]],
      numeroAscensores: ['', [Validators.required, Validators.min(0)]],
      numeroParqueaderos: ['', [Validators.required, Validators.min(0)]],
      numeroDepositos: ['', [Validators.required, Validators.min(0)]],
    });

    this.complementForm.get('tipoPredio')?.valueChanges.subscribe((value) => {
      if (value === 'otro') {
        this.complementForm.get('otroTipoPredio')?.setValidators([Validators.required]);
      } else {
        this.complementForm.get('otroTipoPredio')?.clearValidators();
      }
      this.complementForm.get('otroTipoPredio')?.updateValueAndValidity();
    });
  }

  onVolver(): void {
    this.router.navigate(['/valor-ya/proceso']);
  }

  onConsultar(): void {
    if (this.complementForm.valid) {
      const complementData = this.complementForm.value;
      console.log('Datos complementarios:', complementData);
      this.stepperService.setStep(ValorYaStep.RESPUESTA);
      this.router.navigate(['/valor-ya/respuesta']);
    } else {
      Object.keys(this.complementForm.controls).forEach((key) => {
        const control = this.complementForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  get tipoPredioControl() {
    return this.complementForm.get('tipoPredio') as FormControl;
  }

  get otroTipoPredioControl() {
    return this.complementForm.get('otroTipoPredio') as FormControl;
  }

  get numeroHabitacionesControl() {
    return this.complementForm.get('numeroHabitaciones') as FormControl;
  }

  get numeroBanosControl() {
    return this.complementForm.get('numeroBanos') as FormControl;
  }

  get areaConstruidaControl() {
    return this.complementForm.get('areaConstruida') as FormControl;
  }

  get edadControl() {
    return this.complementForm.get('edad') as FormControl;
  }

  get estratoControl() {
    return this.complementForm.get('estrato') as FormControl;
  }

  get numeroAscensoresControl() {
    return this.complementForm.get('numeroAscensores') as FormControl;
  }

  get numeroParqueaderosControl() {
    return this.complementForm.get('numeroParqueaderos') as FormControl;
  }

  get numeroDepositosControl() {
    return this.complementForm.get('numeroDepositos') as FormControl;
  }
}
