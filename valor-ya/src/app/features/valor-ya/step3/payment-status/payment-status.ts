import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ValorYaStateService } from '../../../../core/services/valor-ya-state.service';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';

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
  imports: [CommonModule, ContainerContentComponent],
  templateUrl: './payment-status.html',
  styleUrls: ['./payment-status.css'],
})
export class PaymentStatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public stateService = inject(ValorYaStateService);

  status = signal<PaymentStatus>('pending');
  transactionId = signal<string | null>(null);
  isLoading = signal(true);

  // Configuraciones por cada estado
  private statusConfigs: Record<PaymentStatus, StatusConfig> = {
    success: {
      title: '¡Pago Exitoso!',
      message:
        'Tu pago ha sido procesado correctamente. Recibirás un correo electrónico con los detalles de tu transacción.',
      icon: '✓',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      primaryAction: { label: 'Ver Documento', route: '/valor-ya/respuesta' },
      secondaryAction: { label: 'Nueva Consulta', route: '/valor-ya/seleccionar' },
      showDetails: true,
    },
    failure: {
      title: 'Pago Rechazado',
      message:
        'Tu pago no pudo ser procesado. Por favor verifica tus datos de pago e intenta nuevamente.',
      icon: '✕',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      primaryAction: { label: 'Intentar Nuevamente', route: '/valor-ya/pago' },
      secondaryAction: { label: 'Volver al Inicio', route: '/valor-ya/seleccionar' },
      showDetails: true,
    },
    pending: {
      title: 'Pago Pendiente',
      message:
        'Tu pago está siendo procesado. Esto puede tomar algunos minutos. Te notificaremos por correo electrónico cuando se complete.',
      icon: '⏳',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      primaryAction: { label: 'Volver al Inicio', route: '/valor-ya/seleccionar' },
      showDetails: true,
    },
    review: {
      title: 'Pago en Revisión',
      message:
        'Tu pago está siendo revisado por nuestro equipo. Te contactaremos pronto con el resultado.',
      icon: '🔍',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      primaryAction: { label: 'Volver al Inicio', route: '/valor-ya/seleccionar' },
      showDetails: true,
    },
  };

  // Computed para obtener la configuración actual
  currentConfig = computed(() => this.statusConfigs[this.status()]);

  // Datos adicionales que vienen de PayU (query params)
  paymentData = signal<PaymentData>({});

  ngOnInit(): void {
    this.loadPaymentStatus();
  }

  private loadPaymentStatus(): void {
    // Obtener el estado de la URL
    this.route.params.subscribe((params) => {
      const status = params['status'] as PaymentStatus;
      if (this.isValidStatus(status)) {
        this.status.set(status);
      } else {
        // Si el status no es válido, redirigir al inicio
        this.router.navigate(['/valor-ya/seleccionar']);
        return;
      }
    });

    // Obtener parámetros adicionales de PayU
    this.route.queryParams.subscribe((params) => {
      this.transactionId.set(params['transaction_id'] || params['x_transaction_id'] || null);

      // Capturar todos los parámetros que envía PayU
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

      // Simular carga
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

    // Si es éxito, guardar datos antes de navegar
    if (this.status() === 'success') {
      // Aquí puedes guardar información adicional en el state service
      // this.stateService.setPaymentData(this.paymentData());
    }

    this.router.navigate([config.primaryAction.route]);
  }

  onSecondaryAction(): void {
    const config = this.currentConfig();
    if (config.secondaryAction) {
      // Reset state si vuelve al inicio
      if (config.secondaryAction.route === '/valor-ya/seleccionar') {
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
