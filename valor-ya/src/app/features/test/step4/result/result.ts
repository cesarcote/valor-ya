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
import { ReporteService } from '../../../../shared/services/reporte.service';
import { NotificationService } from '../../../../shared/services/notification.service';

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
  private reporteService = inject(ReporteService);
  private notificationService = inject(NotificationService);

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

    // Para TEST: Simular respuesta sin llamar al endpoint
    this.isLoadingResult.set(true);

    setTimeout(() => {
      const mockResponse: MCMValorYAResultado = {
        mensaje: 'CHIPs procesados exitosamente',
        metadatos: {
          chips_procesados: 3,
          chips_solicitados: 1,
          ofertas_utilizadas: 62500,
          tiempo_procesamiento_segundos: 0.32,
          timestamp: new Date().toISOString(),
          vigencia_liquidacion: 2025,
          vigencia_resolucion: 2025,
        },
        resultados: [
          {
            AREA_CONSTRUIDA_OFERTA: 40.3,
            AREA_CONSTRUIDA_PREDIO: 37.4,
            AREA_TERRENO_OFERTA: 9.7,
            ASIMETRIA: 0.97,
            BARMANPRE_PREDIO: '0042081122',
            CEDULA_CATASTRAL_PREDIO: '8A 36 17 167',
            CHIP_OFERTA: 'AAA0036TMWF',
            CHIP_PREDIO: chip,
            CLASE_PREDIO_PREDIO: 'P',
            CODIGO_ESTRATO_OFERTA: 0,
            CODIGO_ESTRATO_PREDIO: 0,
            CODIGO_LOCALIDAD_PREDIO: '16',
            CODIGO_SECTOR_PREDIO: '004208',
            CODIGO_USO_PREDIO: '045',
            CODIGO_ZONA_FISICA_PREDIO: '6893015154321',
            COMENTARIO: 'CV menor a 7.5%',
            CV: 1.65,
            DESVIACION: 35979.84,
            DIRECCION_REAL_OFERTA: 'KR 38 10 90 OF 549',
            DIRECCION_REAL_PREDIO:
              this.stateService.predioData()?.direccion || 'CL 9 37A 03 OF 305',
            EDAD_PREDIO: 42,
            GRUPO: 'M03',
            LIM_INFERIOR: 2138045.92,
            LIM_SUPERIOR: 2210005.61,
            MAXIMO: 2213399.5,
            MEDIA: 2174025.76,
            MEDIANA: 2165820.64,
            MINIMO: 2142857.14,
            OBSERVACION_ZONA: 'IGUAL SECTOR',
            POINT_X_OFERTA: -75.00135493,
            POINT_X_PREDIO: -75.00233052,
            POINT_Y_OFERTA: 3.71203906,
            POINT_Y_PREDIO: 3.71021333,
            PUNTAJE_OFERTA: 73,
            PUNTAJE_PREDIO: 49,
            VALOR_AVALUO_PREDIO: 81308563,
            VALOR_INTEGRAL_OFERTA: 2213399.5,
            VALOR_INTEGRAL_PREDIO: 5095842.5,
            VETUSTEZ_OFERTA: 1999,
          },
        ],
        status: 'success',
      };

      this.apiResponse.set(mockResponse);
      this.stateService.setValorYaResponse(mockResponse);
      this.isLoadingResult.set(false);
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
}
