import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ValorYaStepperService, ValorYaStep } from '../../services/valor-ya-stepper.service';
import { ValorYaStateService } from '../../services/valor-ya-state.service';
import { ParametricasService } from '../../../../shared/services/parametricas.service';
import { SolicitudDatosComplementariosService } from '../../../../shared/services/solicitud-datos-complementarios.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { InputComponent } from '../../../../shared/components/input/input';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';

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
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);
  private parametricasService = inject(ParametricasService);
  private solicitudDatosService = inject(SolicitudDatosComplementariosService);
  private notificationService = inject(NotificationService);

  complementForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  opcionesTipoUnidad = signal<SelectOption[]>([]);

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.SOLICITUD);
    this.initForm();
    this.loadTiposPredio();
    this.loadTipoUnidadFromStorage();
  }

  loadTipoUnidadFromStorage(): void {
    const tipoUnidadEnMemoria = this.stateService.tipoUnidadSeleccionada();
    if (tipoUnidadEnMemoria) {
      this.complementForm.patchValue({
        tipoPredio: tipoUnidadEnMemoria.codigoUnidad,
      });
    }
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
      this.opcionesTipoUnidad.set(options);
    });
  }

  onVolver(): void {
    this.router.navigate(['/valor-ya/seleccionar']);
  }

  onConsultarMCM(): void {
    if (this.complementForm.valid || this.complementForm.get('tipoPredio')?.disabled) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const predioData = this.stateService.predioData()!;

      const tipoUnidadSeleccionada = this.stateService.tipoUnidadSeleccionada();
      const formValues = this.complementForm.getRawValue();

      let tipoPredioFinal = formValues.tipoPredio;
      if (tipoUnidadSeleccionada) {
        tipoPredioFinal = tipoUnidadSeleccionada.descripcionUnidad;
      } else if (formValues.tipoPredio === 'ot') {
        tipoPredioFinal = formValues.otroTipoPredio;
      }

      const datosUsuario = {
        tipoPredio: tipoPredioFinal,
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

      this.solicitudDatosService
        .enviarSolicitudDatos({
          loteId: predioData.loteid!,
          datosEndpoint: predioData,
          datosUsuario,
          tipoUnidad: tipoPredioFinal,
        })
        .subscribe({
          next: (datosGuardados) => {
            this.stateService.setDatosComplementarios(datosGuardados);
            this.isLoading.set(false);
            this.notificationService.success('Datos enviados correctamente por correo electrónico');
            this.stepperService.setStep(ValorYaStep.RESPUESTA);
            this.router.navigate(['/valor-ya/seleccionar']);
          },
          error: (error) => {
            this.notificationService.error(`Error al enviar correo: ${error.message}`);
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
