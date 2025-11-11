import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ValorYaStateService } from '../../../core/services/valor-ya-state.service';
import { MCMValorYAResultado } from '../../../core/models/mcm-valor-ya.model';
import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ValoryaDescription } from '../../../shared/components/valorya-description/valorya-description';
import { MCMValorYaService } from '../../../shared/services/mcm-valor-ya.service';

@Component({
  selector: 'app-response',
  imports: [CommonModule, StepperComponent, ButtonComponent, ValoryaDescription],
  templateUrl: './response.html',
  styleUrls: ['./response.css'],
})
export class ResponseComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);
  private apiService = inject(MCMValorYaService);

  isDownloading = signal(false);

  // Señal para almacenar la respuesta del API
  apiResponse = signal<MCMValorYAResultado | null>(null);

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);

    // Obtener respuesta de la API desde el servicio de estado
    const response = this.stateService.valorYaResponse();
    if (response) {
      this.apiResponse.set(response);
    } else {
      // Si no hay respuesta, mostrar mensaje de carga
      console.warn('No se encontró respuesta de la API');
    }
  }

  onDescargarAvaluo(): void {
    const predioData = this.stateService.predioData();
    if (!predioData?.chip) {
      console.error('No se encontró el chip del predio');
      alert('Error: No se puede descargar el avalúo sin información del predio.');
      return;
    }

    this.isDownloading.set(true);
    console.log('Simulando descarga de avalúo para chip:', predioData.chip);

    // Simular tiempo de descarga
    setTimeout(() => {
      this.isDownloading.set(false);
      console.log('Descarga simulada completada exitosamente');
      alert('¡Avalúo descargado exitosamente! (Simulación)');
    }, 2000);
  }

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/valor-ya/seleccionar']);
  }

  // Obtener primer resultado (el principal)
  get resultadoPrincipal() {
    const response = this.apiResponse();
    return response?.resultados?.[0] || null;
  }

  get metadatos() {
    return this.apiResponse()?.metadatos || null;
  }

  // Formatear valores para mostrar
  formatCurrency(value: number | null | undefined): string {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatNumber(value: number | null | undefined): string {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatInteger(value: number | null | undefined): string {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-CO').format(value);
  }
}
