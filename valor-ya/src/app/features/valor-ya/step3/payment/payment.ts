import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ValorYaStateService } from '../../../../core/services/valor-ya-state.service';
import { MCMValorYaService } from '../../../../shared/services/mcm-valor-ya.service';
import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../../core/services/valor-ya-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { InputComponent } from '../../../../shared/components/input/input';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-payment',
  imports: [
    StepperComponent,
    ButtonComponent,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ValoryaDescription,
    ModalComponent,
  ],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
})
export class PaymentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);
  private apiService = inject(MCMValorYaService);

  facturacionForm!: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  showModal = signal(false);
  modalMessage = signal('');
  modalTitle = signal('Advertencia');
  modalIconType = signal<'success' | 'warning' | 'error'>('warning');
  modalButtonText = signal('Aceptar');

  tiposDocumento: SelectOption[] = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' },
  ];

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.PROCESO);
    this.initForm();

    const predioData = this.stateService.predioData();
    if (!predioData?.chip) {
      this.showModal.set(true);
      this.modalTitle.set('Advertencia');
      this.modalMessage.set('No se encontró información del predio. Regrese al inicio.');
      this.modalIconType.set('warning');
      this.modalButtonText.set('Aceptar');
      return;
    }
  }

  initForm(): void {
    this.facturacionForm = this.fb.group({
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.minLength(5)]],
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.minLength(7)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmitFacturacion(): void {
    if (this.facturacionForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      console.log('Datos de facturación:', this.facturacionForm.value);

      const facturacionData = this.facturacionForm.value;

      setTimeout(() => {
        console.log('Pago procesado exitosamente');

        const predioData = this.stateService.predioData();
        if (!predioData?.chip) {
          console.error('No se encontró el chip del predio');
          this.isSubmitting.set(false);
          this.errorMessage.set(
            'No se encontró información del predio. Por favor, regrese e intente nuevamente.'
          );
          return;
        }

        this.isSubmitting.set(false);
        this.router.navigate(['/valor-ya/respuesta']);
      }, 2000);
    } else {
      this.errorMessage.set('Por favor, complete todos los campos requeridos correctamente.');
      Object.keys(this.facturacionForm.controls).forEach((key) => {
        const control = this.facturacionForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  onVolver(): void {
    this.router.navigate(['/valor-ya/solicitud']);
  }

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/valor-ya/seleccionar']);
  }

  onVolverInicio(): void {
    this.onNuevaConsulta();
  }

  onCloseModal(): void {
    if (this.modalIconType() !== 'success') {
      this.router.navigate(['/valor-ya/seleccionar']);
    } else {
      this.showModal.set(false);
    }
  }

  get tipoDocumentoControl() {
    return this.facturacionForm.get('tipoDocumento') as FormControl;
  }

  get numeroDocumentoControl() {
    return this.facturacionForm.get('numeroDocumento') as FormControl;
  }

  get nombreCompletoControl() {
    return this.facturacionForm.get('nombreCompleto') as FormControl;
  }

  get direccionControl() {
    return this.facturacionForm.get('direccion') as FormControl;
  }

  get ciudadControl() {
    return this.facturacionForm.get('ciudad') as FormControl;
  }

  get telefonoControl() {
    return this.facturacionForm.get('telefono') as FormControl;
  }

  get emailControl() {
    return this.facturacionForm.get('email') as FormControl;
  }
}
