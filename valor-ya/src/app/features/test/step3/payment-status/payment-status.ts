import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StepperComponent } from '../../../../shared/components/ui/stepper/stepper';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ContainerContentComponent } from '../../../../shared/components/layout/container-content/container-content';
import { TestStepperService, TestStep } from '../../services/test-stepper.service';
import { TestStateService } from '../../services/test-state.service';
import { ComprasService } from '../../../valor-ya/services/compras.service';

export type PaymentStatus = 'success' | 'failure' | 'pending' | 'review';

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
  selector: 'test-payment-status',
  imports: [CommonModule, StepperComponent, ValoryaDescription, ContainerContentComponent],
  templateUrl: './payment-status.html',
  styleUrls: ['./payment-status.css'],
})
export class PaymentStatusComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stepperService = inject(TestStepperService);
  public readonly stateService = inject(TestStateService);
  private readonly comprasService = inject(ComprasService);
  status = signal<PaymentStatus>('pending');
  transactionId = signal<string | null>(null);
  isLoading = signal(true);

  private readonly statusConfigs: Record<PaymentStatus, StatusConfig> = {
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
        this.processAutomaticUpdates();
      } else {
        this.router.navigate(['/test/seleccionar']);
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

  private processAutomaticUpdates(): void {
    const paymentContextStr = localStorage.getItem('test-payment-context');
    if (!paymentContextStr) return;

    const paymentContext = JSON.parse(paymentContextStr);

    if (this.status() === 'success') {
      if (paymentContext.chip && paymentContext.dev_reference) {
        this.stateService.restoreFromPayment(paymentContext.chip);
        const pagoId = Number(paymentContext.dev_reference);
        const compraId = Number(paymentContext.compraId);
        this.updatePaymentStatus(pagoId, compraId);
      }
    } else if (paymentContext.dev_reference) {
      const pagoId = Number(paymentContext.dev_reference);
      const compraId = paymentContext.compraId ? Number(paymentContext.compraId) : undefined;
      this.updatePaymentStatus(pagoId, compraId);
    }
  }

  private updatePaymentStatus(pagoId: number, compraId?: number): void {
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
        next: () => {
          if (this.status() === 'success' && compraId) {
            this.crearFactura(compraId);
          }
        },
        error: (err) => console.error('[Test] Error al actualizar estado de pago:', err),
      });
  }

  private crearFactura(compraId: number): void {
    this.comprasService.crearFactura({ compraId }).subscribe({
      next: () => {},
      error: (err) => console.error('[Test] Error al crear factura:', err),
    });
  }

  onPrimaryAction(): void {
    const config = this.currentConfig();
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
