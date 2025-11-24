import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TestStateService, TipoBusqueda } from '../../services/test-state.service';
import { TestStepperService, TestStep } from '../../services/test-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';

type PaymentStatus = 'success' | 'failure' | 'pending' | 'review';

interface PaymentData {
  referenceCode?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  signature?: string;
  responseCode?: string;
  authorizationCode?: string;
  transactionDate?: string;
}

interface StatusConfig {
  title: string;
  message: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  primaryAction: { label: string; route: string };
  secondaryAction?: { label: string; route: string };
  showDetails: boolean;
}

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule, StepperComponent, ValoryaDescription, ContainerContentComponent],
  templateUrl: './payment-status.html',
  styleUrls: ['./payment-status.css'],
})
export class PaymentStatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stepperService = inject(TestStepperService);
  public stateService = inject(TestStateService);

  status = signal<PaymentStatus>('pending');
  transactionId = signal<string | null>(null);
  isLoading = signal(true);

  private statusConfigs: Record<PaymentStatus, StatusConfig> = {
    success: {
      title: '¡Pago Exitoso!',
      message:
        'Tu pago ha sido procesado correctamente. Recibirás un correo electrónico con los detalles de tu transacción.',
      icon: '✓',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      primaryAction: { label: 'Ver Documento', route: '/test/respuesta' },
      secondaryAction: { label: 'Nueva Consulta', route: '/test/seleccionar' },
      showDetails: true,
    },
    failure: {
      title: 'Pago Rechazado',
      message:
        'Tu pago no pudo ser procesado. Por favor verifica tus datos de pago e intenta nuevamente.',
      icon: '✕',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      primaryAction: { label: 'Intentar Nuevamente', route: '/test/pago' },
      secondaryAction: { label: 'Volver al Inicio', route: '/test/seleccionar' },
      showDetails: true,
    },
    pending: {
      title: 'Pago Pendiente',
      message:
        'Tu pago está siendo procesado. Esto puede tomar algunos minutos. Te notificaremos por correo electrónico cuando se complete.',
      icon: '⏳',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      primaryAction: { label: 'Volver al Inicio', route: '/test/seleccionar' },
      showDetails: true,
    },
    review: {
      title: 'Pago en Revisión',
      message:
        'Tu pago está siendo revisado por nuestro equipo. Te contactaremos pronto con el resultado.',
      icon: '🔍',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      primaryAction: { label: 'Volver al Inicio', route: '/test/seleccionar' },
      showDetails: true,
    },
  };

  currentConfig = computed(() => this.statusConfigs[this.status()]);

  paymentData = signal<PaymentData>({});

  ngOnInit(): void {
    this.stepperService.setStep(TestStep.PROCESO);
    this.loadPaymentStatus();
  }

  private loadPaymentStatus(): void {
    this.route.params.subscribe((params) => {
      const status = params['status'] as PaymentStatus;
      if (this.isValidStatus(status)) {
        this.status.set(status);
      } else {
        this.router.navigate(['/test/seleccionar']);
        return;
      }
    });

    // Obtener parámetros adicionales de PayU
    this.route.queryParams.subscribe((params) => {
      this.transactionId.set(params['transaction_id'] || params['x_transaction_id'] || null);

      const payuParams = {
        referenceCode: params['reference_code'] || params['x_ref_payco'],
        transactionId: params['transaction_id'] || params['x_transaction_id'],
        amount: params['amount'] || params['x_amount'],
        currency: params['currency'] || params['x_currency_code'],
        signature: params['signature'] || params['x_signature'],
        responseCode: params['response_code'] || params['x_cod_response'],
        authorizationCode: params['authorization_code'] || params['x_approval_code'],
        transactionDate: params['transaction_date'] || params['x_transaction_date'],
        // Agregar más campos según la documentación de PayU
      };

      this.paymentData.set(payuParams);

      setTimeout(() => {
        this.isLoading.set(false);
      }, 1000);
    });
  }

  private isValidStatus(status: string): status is PaymentStatus {
    return ['success', 'failure', 'pending', 'review'].includes(status);
  }

  onPrimaryAction(): void {
    const config = this.currentConfig();

    // Si es éxito, validar contexto de pago
    if (this.status() === 'success') {
      const paymentContextStr = localStorage.getItem('test-payment-context');

      if (!paymentContextStr) {
        // No hay contexto de pago, redirigir al inicio
        console.warn('[Test] No se encontró contexto de pago en localStorage');
        this.router.navigate(['/test/seleccionar']);
        return;
      }

      const paymentContext = JSON.parse(paymentContextStr);

      if (!paymentContext.chip || !paymentContext.dev_reference) {
        // Datos incompletos, redirigir al inicio
        console.warn('[Test] Datos incompletos en contexto de pago:', paymentContext);
        this.router.navigate(['/test/seleccionar']);
        return;
      }

      console.log('[Test] Contexto de pago válido:', paymentContext);

      // Restaurar datos mínimos al state service para que el guard permita acceso
      this.stateService.setPredioData(
        { chip: paymentContext.chip } as any,
        TipoBusqueda.CHIP,
        paymentContext.chip
      );

      // Navegar a result
      this.router.navigate([config.primaryAction.route]);
      return;
    }

    this.router.navigate([config.primaryAction.route]);
  }

  onSecondaryAction(): void {
    const config = this.currentConfig();
    if (config.secondaryAction) {
      // Reset state si vuelve al inicio
      if (config.secondaryAction.route === '/test/seleccionar') {
        this.stateService.reset();
      }
      this.router.navigate([config.secondaryAction.route]);
    }
  }

  // Helper para mostrar información del predio
  getPredioInfo() {
    return this.stateService.predioData();
  }
}
