import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ValorYaStateService } from '../../../core/services/valor-ya-state.service';
import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../core/services/valor-ya-stepper.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ValoryaDescription } from '../../../shared/components/valorya-description/valorya-description';

interface ValorYaApiResponse {
  mensaje: string;
  metadatos: {
    chips_procesados: number;
    chips_solicitados: number;
    ofertas_utilizadas: number;
    tiempo_procesamiento_segundos: number;
    timestamp: string;
    vigencia_liquidacion: number;
    vigencia_resolucion: number;
  };
  resultados: Array<{
    CHIP_PREDIO: string;
    CEDULA_CATASTRAL_PREDIO: string;
    DIRECCION_REAL_PREDIO: string;
    CODIGO_LOCALIDAD_PREDIO: string;
    CODIGO_SECTOR_PREDIO: string;
    AREA_CONSTRUIDA_PREDIO: number;
    AREA_TERRENO_OFERTA: number;
    EDAD_PREDIO: number;
    VALOR_AVALUO_PREDIO: number;
    CV: number;
    LIM_INFERIOR: number;
    LIM_SUPERIOR: number;
    MEDIA: number;
    MEDIANA: number;
    MINIMO: number;
    MAXIMO: number;
    COMENTARIO: string;
    [key: string]: any;
  }>;
  status: string;
}

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

  isDownloading = signal(false);

  // Señal para almacenar la respuesta del API
  apiResponse = signal<ValorYaApiResponse | null>(null);

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);

    // TODO: Obtener respuesta del API desde el servicio de estado
    // Por ahora, usamos datos de ejemplo
    this.loadMockData();
  }

  private loadMockData(): void {
    // Datos de ejemplo - reemplazar con llamada real al API
    const mockResponse: ValorYaApiResponse = {
      mensaje: 'CHIPs procesados exitosamente',
      metadatos: {
        chips_procesados: 3,
        chips_solicitados: 1,
        ofertas_utilizadas: 62501,
        tiempo_procesamiento_segundos: 0.33,
        timestamp: '2025-11-06T20:29:32.854201',
        vigencia_liquidacion: 2025,
        vigencia_resolucion: 2025,
      },
      resultados: [
        {
          CHIP_PREDIO: 'AAA0036YERJ',
          CEDULA_CATASTRAL_PREDIO: '8A 36 17 167',
          DIRECCION_REAL_PREDIO: 'CL 9 37A 03 OF 305',
          CODIGO_LOCALIDAD_PREDIO: '16',
          CODIGO_SECTOR_PREDIO: '004208',
          AREA_CONSTRUIDA_PREDIO: 37.4,
          AREA_TERRENO_OFERTA: 9.7,
          EDAD_PREDIO: 42,
          VALOR_AVALUO_PREDIO: 81345000.0,
          CV: 1.65,
          LIM_INFERIOR: 2138045.92,
          LIM_SUPERIOR: 2210005.61,
          MEDIA: 2174025.76,
          MEDIANA: 2165820.64,
          MINIMO: 2142857.14,
          MAXIMO: 2213399.5,
          COMENTARIO: 'CV menor a 7.5%',
        },
      ],
      status: 'success',
    };

    this.apiResponse.set(mockResponse);
  }

  onDescargarAvaluo(): void {
    this.isDownloading.set(true);
    console.log('Descargando avalúo...');

    // Aquí iría la lógica para descargar el PDF del avalúo
    setTimeout(() => {
      this.isDownloading.set(false);
      alert('La descarga del avalúo comenzará en breve...');
    }, 1500);
  }

  onNuevaConsulta(): void {
    this.stateService.reset();
    this.stepperService.reset();
    this.router.navigate(['/valor-ya/inicio']);
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
