import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { TestStepperService, TestStep } from '../../services/test-stepper.service';
import { TestStateService } from '../../services/test-state.service';
import {
  SolicitudDatosComplementariosService,
  DatosUsuario,
} from '../../../valor-ya/services/solicitud-datos-complementarios.service';
import { StepperComponent } from '../../../../shared/components/ui/stepper/stepper';
import { InputComponent } from '../../../../shared/components/ui/input/input';
import { SelectComponent, SelectOption } from '../../../../shared/components/ui/select/select';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ContainerContentComponent } from '../../../../shared/components/layout/container-content/container-content';

@Component({
  selector: 'app-complement-info',
  imports: [
    ReactiveFormsModule,
    StepperComponent,
    InputComponent,
    SelectComponent,
    ValoryaDescription,
    ContainerContentComponent,
  ],
  templateUrl: './complement-info.html',
  styleUrls: ['./complement-info.css'],
})
export class ComplementInfo implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly stepperService = inject(TestStepperService);
  public readonly stateService = inject(TestStateService);
  private readonly solicitudDatosService = inject(SolicitudDatosComplementariosService);
  readonly TIPO_PREDIO_OPTIONS: SelectOption[] = [
    { value: 'Apartamento', label: 'Apartamento' },
    { value: 'Casa', label: 'Casa' },
    { value: 'Oficina', label: 'Oficina' },
    { value: 'Local', label: 'Local' },
    { value: 'Bodega', label: 'Bodega' },
    { value: 'Terreno', label: 'Terreno' },
    { value: 'Otro', label: 'Otro' },
  ];

  complementForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.stepperService.setStep(TestStep.PROCESO);
    this.initForm();
    this.loadPredioData();
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
      if (value === 'Otro') {
        this.complementForm.get('otroTipoPredio')?.setValidators([Validators.required]);
      } else {
        this.complementForm.get('otroTipoPredio')?.clearValidators();
      }
      this.complementForm.get('otroTipoPredio')?.updateValueAndValidity();
    });
  }

  loadPredioData(): void {
    const predioData = this.stateService.predioData();
    if (predioData) {
      this.complementForm.patchValue({
        areaConstruida: predioData.areaConstruida || '',
        edad: predioData.edad || '',
        estrato: predioData.estrato || '',
      });

      if (predioData.tipoPredio) {
        const tipoPredioLower = predioData.tipoPredio.toLowerCase();
        const opcionEncontrada = this.TIPO_PREDIO_OPTIONS.find(
          (opt) =>
            opt.label.toLowerCase().includes(tipoPredioLower) ||
            tipoPredioLower.includes(opt.label.toLowerCase())
        );

        if (opcionEncontrada) {
          this.complementForm.patchValue({ tipoPredio: opcionEncontrada.value });
        } else {
          this.complementForm.patchValue({
            tipoPredio: 'Otro',
            otroTipoPredio: predioData.tipoPredio,
          });
        }
      }
    }
  }

  onVolver(): void {
    this.router.navigate(['/test/solicitud']);
  }

  onConsultarMCM(): void {
    if (!this.canSubmitForm()) {
      this.markInvalidControls();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const predioData = this.stateService.predioData()!;
    const formValues = this.complementForm.getRawValue();
    const tipoPredioFinal = this.getTipoPredioFinal(formValues);
    const datosUsuario = this.buildDatosUsuario(formValues, tipoPredioFinal);

    this.submitDatosComplementarios(predioData, datosUsuario, tipoPredioFinal);
  }

  private canSubmitForm(): boolean {
    return this.complementForm.valid || this.complementForm.get('tipoPredio')?.disabled === true;
  }

  private markInvalidControls(): void {
    Object.keys(this.complementForm.controls).forEach((key) => {
      const control = this.complementForm.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  private getTipoPredioFinal(formValues: any): string {
    let tipoPredioFinal = formValues.tipoPredio;
    if (formValues.tipoPredio === 'Otro') {
      tipoPredioFinal = formValues.otroTipoPredio;
    }
    return tipoPredioFinal;
  }

  private buildDatosUsuario(formValues: any, tipoPredioFinal: string): DatosUsuario {
    const datosUsuario: DatosUsuario = {
      tipoPredio: tipoPredioFinal,
    };

    if (formValues.numeroHabitaciones !== '') {
      datosUsuario.numeroHabitaciones = Number.parseInt(formValues.numeroHabitaciones);
    }
    if (formValues.numeroBanos !== '') {
      datosUsuario.numeroBanos = Number.parseInt(formValues.numeroBanos);
    }
    if (formValues.areaConstruida !== '') {
      datosUsuario.areaConstruida = Number.parseFloat(formValues.areaConstruida);
    }
    if (formValues.edad) {
      datosUsuario.edad = formValues.edad;
    }
    if (formValues.estrato !== '') {
      datosUsuario.estrato = Number.parseInt(formValues.estrato);
    }
    if (formValues.numeroAscensores !== '') {
      datosUsuario.numeroAscensores = Number.parseInt(formValues.numeroAscensores);
    }
    if (formValues.numeroParqueaderos !== '') {
      datosUsuario.numeroParqueaderos = Number.parseInt(formValues.numeroParqueaderos);
    }
    if (formValues.numeroDepositos !== '') {
      datosUsuario.numeroDepositos = Number.parseInt(formValues.numeroDepositos);
    }

    return datosUsuario;
  }

  private submitDatosComplementarios(
    predioData: any,
    datosUsuario: DatosUsuario,
    tipoPredioFinal: string
  ): void {
    this.solicitudDatosService
      .enviarSolicitudDatos({
        loteId: predioData.loteid!,
        datosEndpoint: predioData,
        datosUsuario,
        tipoUnidad: tipoPredioFinal,
      })
      .subscribe({
        next: (datosGuardados) => this.onSubmitSuccess(datosGuardados),
        error: (error) => this.onSubmitError(error),
      });
  }

  private onSubmitSuccess(datosGuardados: any): void {
    this.stateService.setDatosComplementarios(datosGuardados);
    this.isLoading.set(false);
    this.stepperService.setStep(TestStep.RESPUESTA);
    this.router.navigate(['/test/pago']);
  }

  private onSubmitError(error: any): void {
    this.errorMessage.set(`Error al guardar los datos: ${error.message}`);
    this.isLoading.set(false);
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
