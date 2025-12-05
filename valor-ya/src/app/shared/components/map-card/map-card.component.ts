import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredioData } from '../../../core/models/predio-data.model';
import { MCMValorYAResultado } from '../../../core/models/mcm-valor-ya.model';

@Component({
  selector: 'app-map-card',
  imports: [CommonModule],
  templateUrl: './map-card.html',
  styleUrls: ['./map-card.css'],
})
export class MapCardComponent {
  predio = signal<PredioData | undefined>(undefined);
  valorYaResponse = signal<MCMValorYAResultado | undefined>(undefined);

  precioFormateado = computed(() => {
    const response = this.valorYaResponse();
    if (response?.resultados?.[0]?.VALOR_AVALUO_PREDIO) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(response.resultados[0].VALOR_AVALUO_PREDIO);
    }
    return null;
  });

  @Input() set predioData(value: PredioData | undefined) {
    this.predio.set(value);
  }

  @Input() set valorYaData(value: MCMValorYAResultado | undefined) {
    this.valorYaResponse.set(value);
  }

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
