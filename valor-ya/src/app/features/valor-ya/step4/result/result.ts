import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ValorYaStateService } from '../../../../core/services/valor-ya-state.service';
import { MCMValorYAResultado } from '../../../../core/models/mcm-valor-ya.model';
import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../../core/services/valor-ya-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { MCMValorYaService } from '../../../../shared/services/mcm-valor-ya.service';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';
import { ReporteService } from '../../../../shared/services/reporte.service';

@Component({
  selector: 'app-result',
  imports: [
    CommonModule,
    StepperComponent,
    ButtonComponent,
    ValoryaDescription,
    ContainerContentComponent,
  ],
  templateUrl: './result.html',
  styleUrls: ['./result.css'],
})
export class ResultComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);
  private apiService = inject(MCMValorYaService);
  private reporteService = inject(ReporteService);

  isDownloading = signal(false);
  isLoadingResult = signal(false);
  errorLoadingResult = signal('');

  apiResponse = signal<MCMValorYAResultado | null>(null);

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);

    const chip = this.stateService.predioData()?.chip;
    if (!chip) {
      console.error('No se encontró el CHIP del predio para consultar resultados');
      this.errorLoadingResult.set('No se encontró información del predio');
      return;
    }

    this.isLoadingResult.set(true);
    this.apiService.procesarChip(chip).subscribe({
      next: (resp) => {
        this.apiResponse.set(resp);
        this.stateService.setValorYaResponse(resp);
        this.isLoadingResult.set(false);
      },
      error: (err) => {
        console.error('Error al obtener resultados del avalúo:', err);
        this.errorLoadingResult.set('No se pudieron cargar los resultados del avalúo');
        this.isLoadingResult.set(false);
      },
    });
  }

  onDescargarAvaluo(): void {
    const predioData = this.stateService.predioData();
    if (!predioData?.chip) {
      console.error('No se encontró el chip del predio');
      alert('Error: No se puede descargar el avalúo sin información del predio.');
      return;
    }

    const tipoPredio = this.stateService.tipoUnidadSeleccionada()?.descripcionUnidad;
    if (!tipoPredio) {
      console.error('No se encontró el tipo de predio');
      alert('Error: No se puede descargar el avalúo sin tipo de predio.');
      return;
    }

    const datos = this.reporteService.generarDatosMockReporte(predioData.chip, tipoPredio);

    this.isDownloading.set(true);
    console.log('Generando reporte de avalúo para chip:', predioData.chip);

    this.reporteService.generarReporteValorYa(datos).subscribe({
      next: (resp) => {
        this.isDownloading.set(false);
        if (resp.success) {
          console.log('Reporte generado exitosamente');
          if (resp.reportUrl) {
            window.open(resp.reportUrl, '_blank');
          } else {
            alert('Reporte generado, pero no se pudo descargar automáticamente.');
          }
        } else {
          alert('Error generando reporte: ' + resp.message);
        }
      },
      error: (error) => {
        this.isDownloading.set(false);
        console.error('Error generando reporte:', error);
        alert('Error generando reporte');
      },
    });
  }

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/valor-ya/seleccionar']);
  }

  get resultadoPrincipal() {
    const response = this.apiResponse();
    return response?.resultados?.[0] || null;
  }

  get metadatos() {
    return this.apiResponse()?.metadatos || null;
  }

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
