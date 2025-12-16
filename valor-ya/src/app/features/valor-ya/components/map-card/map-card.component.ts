import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredioData } from '../../models/predio-data.model';
import { MCMValorYAResultado, CalcularValorYaResponse } from '../../models/mcm-valor-ya.model';

@Component({
  selector: 'app-map-card',
  imports: [CommonModule],
  templateUrl: './map-card.html',
  styleUrls: ['./map-card.css'],
})
export class MapCardComponent {
  predio = signal<PredioData | undefined>(undefined);
  valorYaResponse = signal<MCMValorYAResultado | CalcularValorYaResponse | undefined>(undefined);

  precioFormateado = computed(() => {
    const response = this.valorYaResponse();
    if (!response) return null;

    if ('resultados' in response && response.resultados?.[0]?.VALOR_AVALUO_PREDIO) {
      return this.formatCurrency(response.resultados[0].VALOR_AVALUO_PREDIO);
    }

    if ('data' in response && response.data?.VALOR_YA) {
      return this.formatCurrency(response.data.VALOR_YA);
    }

    return null;
  });

  @Input() set predioData(value: PredioData | undefined) {
    this.predio.set(value);
  }

  @Input() set valorYaData(value: MCMValorYAResultado | CalcularValorYaResponse | undefined) {
    this.valorYaResponse.set(value);
  }

  @Output() closeCard = new EventEmitter<void>();

  onClose() {
    this.closeCard.emit();
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
