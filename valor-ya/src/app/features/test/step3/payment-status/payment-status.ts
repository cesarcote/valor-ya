import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TestStateService } from '../../services/test-state.service';
import { TestStepperService, TestStep } from '../../services/test-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ComprasService } from '../../../../shared/services/compras.service';

type PaymentStatus = 'success' | 'failure' | 'pending' | 'review';

interface StatusConfig {
  title: string;
  message: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  primaryAction: { label: string; route: string };
  secondaryAction?: { label: string; route: string };
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
  private comprasService = inject(ComprasService);

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
    },
    pending: {
      title: 'Pago Pendiente',
      message:
        'Tu pago está siendo procesado. Esto puede tomar algunos minutos. Te notificaremos por correo electrónico cuando se complete.',
      icon: '⏳',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      primaryAction: { label: 'Volver al Inicio', route: '/test/seleccionar' },
    },
    review: {
      title: 'Pago en Revisión',
      message:
        'Tu pago está siendo revisado por nuestro equipo. Te contactaremos pronto con el resultado.',
      icon: '🔍',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      primaryAction: { label: 'Volver al Inicio', route: '/test/seleccionar' },
    },
  };

  currentConfig = computed(() => this.statusConfigs[this.status()]);

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

    this.route.queryParams.subscribe((params) => {
      this.transactionId.set(params['transaction_id'] || params['x_transaction_id'] || null);
      setTimeout(() => this.isLoading.set(false), 1000);
    });
  }

  private isValidStatus(status: string): status is PaymentStatus {
    return ['success', 'failure', 'pending', 'review'].includes(status);
  }

  private updatePaymentStatus(): void {
    const pagoId = this.stateService.pagoId();

    if (!pagoId) {
      console.warn('[Test] No se encontró pagoId para actualizar');
      return;
    }

    const statusMap = {
      success: { estadoPago: 'EXITOSO' as const, estadoCompra: 'COMPRADO_CON_PAGO' as const },
      failure: { estadoPago: 'RECHAZADO' as const, estadoCompra: 'COMPRADA_SIN_PAGO' as const },
      pending: { estadoPago: 'PENDIENTE' as const, estadoCompra: 'REGISTRADA' as const },
      review: { estadoPago: 'PENDIENTE' as const, estadoCompra: 'REGISTRADA' as const },
    };

    const mapping = statusMap[this.status()];

    this.comprasService
      .actualizarCompraPago({
        pagoId,
        estadoPago: mapping.estadoPago,
        estadoCompra: mapping.estadoCompra,
      })
      .subscribe({
        next: (response) => console.log('[Test] ✅ Estado de pago actualizado:', response),
        error: (error) => console.error('[Test] ❌ Error al actualizar estado de pago:', error),
      });
  }

  onPrimaryAction(): void {
    const config = this.currentConfig();

    if (this.status() === 'success') {
      const paymentContextStr = localStorage.getItem('test-payment-context');

      if (!paymentContextStr) {
        console.warn('[Test] No se encontró contexto de pago en localStorage');
        this.router.navigate(['/test/seleccionar']);
        return;
      }

      const paymentContext = JSON.parse(paymentContextStr);

      if (!paymentContext.chip || !paymentContext.dev_reference) {
        console.warn('[Test] Datos incompletos en contexto de pago:', paymentContext);
        this.router.navigate(['/test/seleccionar']);
        return;
      }

      this.stateService.restoreFromPayment(paymentContext.chip);
      this.updatePaymentStatus();
      localStorage.removeItem('test-payment-context');
      this.router.navigate([config.primaryAction.route]);
      return;
    }

    this.updatePaymentStatus();
    this.router.navigate([config.primaryAction.route]);
  }

  onSecondaryAction(): void {
    const config = this.currentConfig();
    if (config.secondaryAction) {
      if (config.secondaryAction.route === '/test/seleccionar') {
        this.stateService.reset();
      }
      this.router.navigate([config.secondaryAction.route]);
    }
  }

  getPredioInfo() {
    return this.stateService.predioData();
  }
}
