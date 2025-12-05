import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { TestStateService } from '../../services/test-state.service';
import { TestStepperService, TestStep } from '../../services/test-stepper.service';
import { PaymentService } from '../../../valor-ya/services/payment.service';
import { ComprasService } from '../../../valor-ya/services/compras.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { StepperComponent } from '../../../../shared/components/ui/stepper/stepper';
import { InputComponent } from '../../../../shared/components/ui/input/input';
import { SelectComponent, SelectOption } from '../../../../shared/components/ui/select/select';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { ContainerContentComponent } from '../../../../shared/components/layout/container-content/container-content';

@Component({
  selector: 'test-payment',
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
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly stepperService = inject(TestStepperService);
  public readonly stateService = inject(TestStateService);
  private readonly paymentService = inject(PaymentService);
  private readonly comprasService = inject(ComprasService);
  private readonly authService = inject(AuthService);

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
    this.stepperService.setStep(TestStep.PROCESO);
    this.initForm();
    this.autofillUserData();

    const predioData = this.stateService.predioData();
    if (!predioData?.chip) {
      this.showModal.set(true);
      this.modalTitle.set('Advertencia');
      this.modalMessage.set('No se encontró información del predio. Regrese al inicio.');
      this.modalIconType.set('warning');
      this.modalButtonText.set('Aceptar');
    }
  }

  /**
   * Autocompleta los datos del formulario con la información del usuario autenticado
   */
  private autofillUserData(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    // Mapear tipo de documento del usuario al formato del select
    const tipoDocMap: { [key: string]: string } = {
      CC: 'CC',
      CE: 'CE',
      NIT: 'NIT',
      PA: 'CE',
      TI: 'CC',
      NUIP: 'CC',
    };
    const tipoDoc = user.tipoDocumento?.codigo || '';

    this.facturacionForm.patchValue({
      tipoDocumento: tipoDocMap[tipoDoc] || tipoDoc,
      numeroDocumento: user.numeroDocumento || '',
      nombre: user.nombre || '',
      apellidos: user.apellido || '',
      direccion: user.direccionCorrespondencia || '',
      telefono: user.celular || user.telefono || '',
      email: user.email || '',
    });
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
      const predioData = this.stateService.predioData();

      if (!predioData?.chip) {
        this.errorMessage.set('No se encontró información del predio.');
        this.isSubmitting.set(false);
        return;
      }

      // PASO 1: Crear la compra
      const uuid = `UUID-${Date.now()}`;
      const fechaCompra = new Date().toISOString().split('T')[0];
      const valor = 50000;
      const productoId = 1;
      const currentYear = new Date().getFullYear();
      const radNum = Math.floor(Math.random() * 90000) + 10000;
      const user = this.authService.currentUser();

      const compraRequest = {
        usuarioId: user?.id ? Number(user.id) : 0,
        fechaCompra,
        estado: 'REGISTRADA' as const,
        uuid,
        pagoId: null,
        facturaId: null,
        enviada: 0,
        fechaEnvio: null,
        valor,
        version: 1,
        productoId,
        cantidad: 1,
        valorUnitario: valor,
        tipoFiltroProdId: null,
        valorFiltro: null,
        prodDetId1: predioData.chip,
        prodDetId2: null,
        archivoPrev: null,
        radAgno: currentYear,
        radNum: radNum,
      };

      console.log('[Payment] Paso 1: Creando compra...', compraRequest);

      this.comprasService.crearCompra(compraRequest).subscribe({
        next: (compraResponse) => {
          console.log('[Payment] Compra creada:', compraResponse);

          this.stateService.setCompraInfo(compraResponse.compraId, uuid);

          // PASO 2: Crear el pago asociado a la compra
          const numeroTx = `TX-${currentYear}-${Date.now()}`;

          const pagoRequest = {
            compraId: compraResponse.compraId,
            estado: 'PENDIENTE' as const,
            fechaInicioTx: null,
            fechaFinTx: null,
            numeroTx,
            numeroConfTx: null,
            fechaConfTx: null,
            tipoPersona: 'NATURAL',
            banco: 'BANCO UNION COLOMBIANO',
            version: 1,
            numPago: 1,
            estadoPagoProveedor: null,
            formaPagoProveedor: 'credit_card',
            codigoTxProveedor: null,
          };

          this.comprasService.crearPago(pagoRequest).subscribe({
            next: (pagoResponse) => {
              this.stateService.setPagoId(pagoResponse.pagoId);

              // PASO 3: Crear link de pago con Paymentez
              const paymentData = {
                user: {
                  id: formData.numeroDocumento,
                  email: formData.email,
                  name: formData.nombre,
                  last_name: formData.apellidos,
                },
                order: {
                  dev_reference: pagoResponse.pagoId,
                  description: 'COMPRA EN LINEA DE PRODUCTOS DIGITALES UAECD',
                  amount: valor,
                  installments_type: 0,
                  currency: 'COP',
                },
              };

              this.paymentService.initiatePayment(paymentData, 'test').subscribe({
                next: (response) => {
                  if (response.success) {
                    const paymentUrl = this.paymentService.getPaymentUrl(response);

                    if (paymentUrl) {
                      const paymentContext = {
                        chip: predioData.chip,
                        dev_reference: paymentData.order.dev_reference,
                        compraId: compraResponse.compraId,
                      };
                      localStorage.setItem('test-payment-context', JSON.stringify(paymentContext));
                      globalThis.location.href = paymentUrl;
                    }
                  }

                  this.isSubmitting.set(false);
                },
                error: (error) => {
                  console.error('[Payment] Error al generar link de pago:', error);
                  this.errorMessage.set('Error al generar el link de pago. Intente nuevamente.');
                  this.isSubmitting.set(false);
                },
              });
            },
            error: (error) => {
              console.error('[Payment] Error al crear pago:', error);
              this.errorMessage.set('Error al registrar el pago. Intente nuevamente.');
              this.isSubmitting.set(false);
            },
          });
        },
        error: (error) => {
          console.error('[Payment] Error al crear compra:', error);
          this.errorMessage.set('Error al crear la compra. Intente nuevamente.');
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
    this.router.navigate(['/test/solicitud']);
  }

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/test/seleccionar']);
  }

  onVolverInicio(): void {
    this.onNuevaConsulta();
  }

  onCloseModal(): void {
    if (this.modalIconType() === 'success') {
      this.showModal.set(false);
    } else {
      this.router.navigate(['/test/seleccionar']);
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
