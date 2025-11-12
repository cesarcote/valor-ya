import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TestStateService } from '../../../../core/services/test-state.service';
import { MCMValorYAResultado } from '../../../../core/models/mcm-valor-ya.model';
import { TestStepperService, TestStep } from '../../../../core/services/test-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { MCMValorYaService } from '../../../../shared/services/mcm-valor-ya.service';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';

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
  private stepperService = inject(TestStepperService);
  public stateService = inject(TestStateService);
  private apiService = inject(MCMValorYaService);

  isDownloading = signal(false);
  isLoadingResult = signal(false);
  errorLoadingResult = signal('');

  apiResponse = signal<MCMValorYAResultado | null>(null);

  ngOnInit(): void {
    this.stepperService.setStep(TestStep.RESPUESTA);

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

    this.isDownloading.set(true);
    console.log('Simulando descarga de avalúo para chip:', predioData.chip);

    setTimeout(() => {
      this.isDownloading.set(false);
      console.log('Descarga simulada completada exitosamente');
      alert('¡Avalúo descargado exitosamente! (Simulación)');
    }, 2000);
  }

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/test/seleccionar']);
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
