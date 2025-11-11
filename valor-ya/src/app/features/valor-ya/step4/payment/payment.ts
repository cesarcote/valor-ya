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
    this.stepperService.setStep(ValorYaStep.RESPUESTA);
    this.initForm();

    // Verificar disponibilidad del cálculo antes de mostrar el formulario
    const predioData = this.stateService.predioData();
    if (!predioData?.chip) {
      this.showModal.set(true);
      this.modalTitle.set('Advertencia');
      this.modalMessage.set('No se encontró información del predio. Regrese al inicio.');
      this.modalIconType.set('warning');
      this.modalButtonText.set('Aceptar');
      return;
    }

    this.apiService.procesarChip(predioData.chip).subscribe({
      next: (response) => {
        if (response.status !== 'success') {
          this.showModal.set(true);
          this.modalTitle.set('Advertencia');
          this.modalMessage.set(
            'El cálculo del avalúo no está disponible en este momento. Por favor, intente más tarde.'
          );
          this.modalIconType.set('warning');
          this.modalButtonText.set('Aceptar');
        } else {
          // Solo mostrar modal de éxito si todo está bien
          this.showModal.set(true);
          this.modalTitle.set('¡Avalúo Procesado Exitosamente!');
          this.modalMessage.set('Complete los datos de facturación para continuar');
          this.modalIconType.set('success');
          this.modalButtonText.set('Continuar');
        }
      },
      error: (error) => {
        this.showModal.set(true);
        this.modalTitle.set('Error');
        this.modalMessage.set(
          'Error al verificar la disponibilidad del cálculo. El servicio no está disponible.'
        );
        this.modalIconType.set('error');
        this.modalButtonText.set('Aceptar');
      },
    });
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
      this.errorMessage.set(null); // Limpiar mensaje de error anterior
      console.log('Datos de facturación:', this.facturacionForm.value);

      // Guardar datos de facturación en el servicio de estado
      const facturacionData = this.facturacionForm.value;

      // Simular proceso de pago
      setTimeout(() => {
        console.log('Pago procesado exitosamente');

        // Obtener el chip del predioData
        const predioData = this.stateService.predioData();
        if (!predioData?.chip) {
          console.error('No se encontró el chip del predio');
          this.isSubmitting.set(false);
          this.errorMessage.set(
            'No se encontró información del predio. Por favor, regrese e intente nuevamente.'
          );
          return;
        }

        // Llamar a la API para procesar el chip
        this.apiService.procesarChip(predioData.chip).subscribe({
          next: (response) => {
            console.log('Respuesta de la API:', response);
            // Guardar la respuesta en el state service
            this.stateService.setValorYaResponse(response);
            this.isSubmitting.set(false);
            // Redirigir a la pantalla de respuesta
            this.router.navigate(['/valor-ya/respuesta']);
          },
          error: (error) => {
            console.error('Error al procesar el chip:', error);
            this.isSubmitting.set(false);
            this.errorMessage.set(
              'Error al procesar la solicitud. El servicio no está disponible en este momento. Por favor, intente nuevamente más tarde.'
            );
          },
        });
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

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/valor-ya/seleccionar']);
  }

  onVolverInicio(): void {
    this.onNuevaConsulta();
  }

  onCloseModal(): void {
    // Si el modal es de error/warning, redirigir al inicio
    if (this.modalIconType() !== 'success') {
      this.router.navigate(['/valor-ya/seleccionar']);
    } else {
      // Si es de éxito, solo cerrar el modal
      this.showModal.set(false);
    }
  }

  // Getters para los controles del formulario
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
