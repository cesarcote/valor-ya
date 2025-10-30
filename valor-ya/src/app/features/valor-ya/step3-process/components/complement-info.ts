import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService } from '../../../../core/services/valor-ya-state.service';
import { ParametricasService } from '../../../../shared/services/parametricas.service';
import { DatosComplementariosService } from '../../../../shared/services/datos-complementarios.service';
import { DatosComplementariosRequest } from '../../../../core/models/datos-complementarios.model';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { InputComponent } from '../../../../shared/components/input/input';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select';

@Component({
  selector: 'app-complement-info',
  imports: [
    ReactiveFormsModule,
    StepperComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './complement-info.html',
  styleUrls: ['./complement-info.css'],
})
export class ComplementInfo implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);
  private parametricasService = inject(ParametricasService);
  private datosComplementariosService = inject(DatosComplementariosService);

  complementForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  tiposPredio = signal<SelectOption[]>([]);

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.PROCESO);
    this.initForm();
    this.loadTiposPredio();
  }

  initForm(): void {
    this.complementForm = this.fb.group({
      tipoPredio: [''],
      otroTipoPredio: [''],
      numeroHabitaciones: [''],
      numeroBanos: [''],
      areaConstruida: [''],
      edad: [''],
      estrato: [''],
      numeroAscensores: [''],
      numeroParqueaderos: [''],
      numeroDepositos: [''],
    });

    this.complementForm.get('tipoPredio')?.valueChanges.subscribe((value) => {
      if (value === 'ot') {
        this.complementForm.get('otroTipoPredio')?.setValidators([Validators.required]);
      } else {
        this.complementForm.get('otroTipoPredio')?.clearValidators();
      }
      this.complementForm.get('otroTipoPredio')?.updateValueAndValidity();
    });
  }

  loadTiposPredio(): void {
    this.parametricasService.consultarTiposUnidad().subscribe((tipos) => {
      const options: SelectOption[] = tipos.map((tipo) => ({
        value: tipo.codigoUnidad,
        label: tipo.descripcionUnidad,
      }));
      this.tiposPredio.set(options);
    });
  }

  onVolver(): void {
    this.router.navigate(['/valor-ya/proceso']);
  }

  onConsultarMCM(): void {
    if (this.complementForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const predioData = this.stateService.predioData();
      const loteid = predioData?.loteid || '';

      const formValues = this.complementForm.value;
      const datosComplementarios: DatosComplementariosRequest = {
        ...(loteid && { loteId: loteid }),
        tipoPredio:
          formValues.tipoPredio === 'ot' ? formValues.otroTipoPredio : formValues.tipoPredio,
        numeroHabitaciones:
          formValues.numeroHabitaciones !== ''
            ? parseInt(formValues.numeroHabitaciones)
            : undefined,
        numeroBanos: formValues.numeroBanos !== '' ? parseInt(formValues.numeroBanos) : undefined,
        areaConstruida:
          formValues.areaConstruida !== '' ? parseFloat(formValues.areaConstruida) : undefined,
        edad: formValues.edad?.toString() || undefined,
        estrato: formValues.estrato !== '' ? parseInt(formValues.estrato) : undefined,
        numeroAscensores:
          formValues.numeroAscensores !== '' ? parseInt(formValues.numeroAscensores) : undefined,
        numeroParqueaderos:
          formValues.numeroParqueaderos !== ''
            ? parseInt(formValues.numeroParqueaderos)
            : undefined,
        numeroDepositos:
          formValues.numeroDepositos !== '' ? parseInt(formValues.numeroDepositos) : undefined,
      };

      this.datosComplementariosService.registrarDatos(datosComplementarios).subscribe({
        next: (datosGuardados) => {
          this.stateService.setDatosComplementarios(datosGuardados);
          this.isLoading.set(false);
          this.stepperService.setStep(ValorYaStep.RESPUESTA);
          this.router.navigate(['/valor-ya/respuesta']);
        },
        error: (error) => {
          this.errorMessage.set(`Error al guardar los datos: ${error.message}`);
          this.isLoading.set(false);
        },
      });
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
