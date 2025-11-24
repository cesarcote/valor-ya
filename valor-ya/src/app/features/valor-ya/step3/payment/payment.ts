import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ValorYaStateService } from '../../services/valor-ya-state.service';
import { MCMValorYaService } from '../../services/mcm-valor-ya.service';
import { ValorYaStepperService, ValorYaStep } from '../../services/valor-ya-stepper.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { PaymentUser, PaymentOrder } from '../../../../core/models/payment.model';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { InputComponent } from '../../../../shared/components/input/input';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';

@Component({
  selector: 'app-payment',
  imports: [
    StepperComponent,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ValoryaDescription,
    ModalComponent,
    ContainerContentComponent,
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
  private paymentService = inject(PaymentService);

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
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
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

      const formData = this.facturacionForm.value;

      const paymentData: { user: PaymentUser; order: PaymentOrder } = {
        user: {
          id: formData.numeroDocumento,
          email: formData.email,
          name: formData.nombre,
          last_name: formData.apellidos,
        },
        order: {
          dev_reference: this.paymentService.generateReference('VALOR_YA'),
          description: 'COMPRA EN LINEA DE PRODUCTOS DIGITALES UAECD',
          amount: 30000,
          installments_type: 0,
          currency: 'COP',
        },
      };

      this.paymentService.initiatePayment(paymentData, 'valor-ya').subscribe({
        next: (response) => {
          console.log('Respuesta del pago:', response);

          if (response.success) {
            const paymentUrl = this.paymentService.getPaymentUrl(response);

            if (paymentUrl) {
              // Guardar contexto de pago en localStorage
              const paymentContext = {
                chip: this.stateService.predioData()?.chip,
                dev_reference: paymentData.order.dev_reference,
              };
              localStorage.setItem('valor-ya-payment-context', JSON.stringify(paymentContext));

              window.location.href = paymentUrl;
            }
          }

          this.isSubmitting.set(false);
        },
        error: (error) => {
          console.error('Error al procesar el pago:', error);
          this.errorMessage.set('Error al procesar el pago. Intente nuevamente.');
          this.isSubmitting.set(false);
        },
      });
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

  get nombreControl() {
    return this.facturacionForm.get('nombre') as FormControl;
  }

  get apellidosControl() {
    return this.facturacionForm.get('apellidos') as FormControl;
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
