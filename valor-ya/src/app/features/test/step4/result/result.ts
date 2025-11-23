import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TestStateService } from '../../services/test-state.service';
import { MCMValorYAResultado } from '../../../../core/models/mcm-valor-ya.model';
import { MCMValorYaService } from '../../../valor-ya/services/mcm-valor-ya.service';
import { TestStepperService, TestStep } from '../../services/test-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { MCM_MOCK_RESPONSE } from '../../data/mcm-mock';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';
import { ReporteService } from '../../../../shared/services/reporte.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TestMapComponent } from '../../components/test-map/test-map';
import { McmMapService } from '../../services/mcm-map.service';

@Component({
  selector: 'app-result',
  imports: [
    CommonModule,
    StepperComponent,
    ButtonComponent,
    ValoryaDescription,
    ContainerContentComponent,
    TestMapComponent,
  ],
  templateUrl: './result.html',
  styleUrls: ['./result.css'],
})
export class ResultComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(TestStepperService);
  public stateService = inject(TestStateService);
  private apiService = inject(MCMValorYaService);
  private reporteService = inject(ReporteService);
  private notificationService = inject(NotificationService);
  private mcmMapService = inject(McmMapService);

  private mapComponent?: TestMapComponent;

  @ViewChild(TestMapComponent)
  set mapSetter(map: TestMapComponent) {
    this.mapComponent = map;
    if (map && this.apiResponse()) {
      setTimeout(() => this.visualizarMcmMock(), 300);
    }
  }

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

    // Para TEST: Simular respuesta usando el mock importado
    this.isLoadingResult.set(true);

    setTimeout(() => {
      // Usar el mock importado y actualizar el CHIP del predio
      const mockResponse: MCMValorYAResultado = {
        ...MCM_MOCK_RESPONSE,
        resultados: MCM_MOCK_RESPONSE.resultados.map((r) => ({
          ...r,
          CHIP_PREDIO: chip,
          DIRECCION_REAL_PREDIO:
            this.stateService.predioData()?.direccion || r.DIRECCION_REAL_PREDIO,
        })),
      };

      this.apiResponse.set(mockResponse);
      this.stateService.setValorYaResponse(mockResponse);
      this.isLoadingResult.set(false);

      if (this.mapComponent) {
        setTimeout(() => this.visualizarMcmMock(), 300);
      }
    }, 1000);

    /* Código original comentado - descomentar para usar endpoint real
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
    */
  }

  onDescargarAvaluo(): void {
    const predioData = this.stateService.predioData();
    if (!predioData?.chip) {
      console.error('No se encontró el chip del predio');
      alert('Error: No se puede descargar el avalúo sin información del predio.');
      return;
    }

    const tipoPredio = predioData.tipoPredio || 'OTRO';
    if (!tipoPredio) {
      console.error('No se encontró el tipo de predio');
      alert('Error: No se puede descargar el avalúo sin tipo de predio.');
      return;
    }

    const datos = this.reporteService.generarDatosMockReporte(predioData.chip, tipoPredio);

    this.isDownloading.set(true);
    console.log('Generando reporte de avalúo para chip:', predioData.chip);

    this.reporteService.generarReporteValorYa(datos).subscribe({
      next: (blob) => {
        this.isDownloading.set(false);
        console.log('Reporte generado exitosamente');

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ValorYa-${predioData.chip}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.notificationService.success('¡Avalúo descargado exitosamente!');
      },
      error: (error) => {
        this.isDownloading.set(false);
        console.error('Error generando reporte:', error);
        this.notificationService.error('Error generando reporte');
      },
    });
  }

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/test/seleccionar']);
  }

  get resultadoPrincipal() {
    const response = this.apiResponse();

    if (response && Array.isArray(response.resultados) && response.resultados.length > 0) {
      return response.resultados[0];
    }
    return null;
  }

  get metadatos() {
    const response = this.apiResponse();
    return response?.metadatos || null;
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

  private visualizarMcmMock(): void {
    if (this.mapComponent && this.apiResponse()) {
      this.mcmMapService.visualizarMCM(this.mapComponent, this.apiResponse());
    }
  }
}
