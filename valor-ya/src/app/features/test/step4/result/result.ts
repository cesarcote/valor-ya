import {
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
  EnvironmentInjector,
  createComponent,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TestStateService } from '../../services/test-state.service';
import { MCMValorYAResultado } from '../../../../core/models/mcm-valor-ya.model';
import { TestStepperService, TestStep } from '../../services/test-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { MCM_MOCK_RESPONSE } from '../../data/mcm-mock';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';
import { ReporteService } from '../../../../shared/services/reporte.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MapComponent } from '../../../../shared/components/map';
import { MapCardComponent } from '../../../../shared/components/map-card/map-card.component';
import { PredioService } from '../../../../shared/services/predio.service';
import { PredioData } from '../../../../core/models/predio-data.model';

@Component({
  selector: 'app-result',
  imports: [
    CommonModule,
    StepperComponent,
    ButtonComponent,
    ValoryaDescription,
    ContainerContentComponent,
    MapComponent,
  ],
  templateUrl: './result.html',
  styleUrls: ['./result.css'],
})
export class ResultComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private stepperService = inject(TestStepperService);
  public stateService = inject(TestStateService);
  private reporteService = inject(ReporteService);
  private notificationService = inject(NotificationService);
  private injector = inject(EnvironmentInjector);
  private predioService = inject(PredioService);

  @ViewChild('mapPredio')
  set mapPredioSetter(map: MapComponent) {
    this.mapPredio = map;
    this.tryRenderMapPredio();
  }

  @ViewChild('mapOfertas')
  set mapOfertasSetter(map: MapComponent) {
    this.mapOfertas = map;
    this.tryRenderMapOfertas();
  }

  private mapPredio?: MapComponent;
  private mapOfertas?: MapComponent;

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

    // 1. Consultar información del predio (coordenadas)
    this.predioService.consultarPorChip(chip).subscribe({
      next: (predioData) => {
        // Actualizar el estado con los datos completos (incluyendo coordenadas)
        this.stateService.setPredioData(predioData, this.stateService.tipoBusqueda()!, chip);

        // 2. Simular/Obtener respuesta de ValorYa
        setTimeout(() => {
          const mockResponse: MCMValorYAResultado = {
            ...MCM_MOCK_RESPONSE,
            resultados: MCM_MOCK_RESPONSE.resultados.map((r) => ({
              ...r,
              CHIP_PREDIO: chip,
              DIRECCION_REAL_PREDIO: predioData.direccion || r.DIRECCION_REAL_PREDIO,
            })),
          };

          this.apiResponse.set(mockResponse);
          this.stateService.setValorYaResponse(mockResponse);
          this.isLoadingResult.set(false);

          // Intentar renderizar mapas
          this.tryRenderMapPredio();
          this.tryRenderMapOfertas();
        }, 1000);
      },
      error: (err) => {
        console.error('Error al consultar datos del predio:', err);
        this.errorLoadingResult.set('Error al cargar la información del predio.');
        this.isLoadingResult.set(false);
      },
    });
  }

  ngAfterViewInit(): void {}

  private tryRenderMapPredio(): void {
    if (
      this.mapPredio &&
      this.stateService.predioData()?.coordenadasPoligono &&
      this.apiResponse()
    ) {
      this.renderizarMapaPredio(this.mapPredio, this.stateService.predioData()!);
    }
  }

  private tryRenderMapOfertas(): void {
    if (this.mapOfertas && this.apiResponse()) {
      this.renderizarMapaOfertas(this.mapOfertas, this.apiResponse()!);
    }
  }

  private renderizarMapaPredio(map: MapComponent, data: PredioData): void {
    // Crear tarjeta dinámica
    const componentRef = createComponent(MapCardComponent, {
      environmentInjector: this.injector,
    });

    componentRef.setInput('predioData', data);
    componentRef.setInput('valorYaData', this.apiResponse());

    componentRef.instance.close.subscribe(() => {
      map.closeTooltip();
    });

    componentRef.changeDetectorRef.detectChanges();
    const popupContent = componentRef.location.nativeElement;

    map.ubicarLotePorCoordenadas(data.coordenadasPoligono!, data.direccion, popupContent);
  }

  private renderizarMapaOfertas(map: MapComponent, response: MCMValorYAResultado): void {
    // Aquí deberíamos pintar las ofertas.
    // Como no tenemos coordenadas exactas de las ofertas en el mock actual (solo POINT_X/Y que podrían ser planas),
    // por ahora centraremos en el predio y quizás añadiremos marcadores dummy si tuviéramos lat/lng.
    // Asumiremos que POINT_X_OFERTA y POINT_Y_OFERTA son coordenadas que podríamos convertir,
    // pero para este ejemplo usaremos el centro del predio como referencia visual.

    const predioData = this.stateService.predioData();
    if (predioData?.coordenadasPoligono) {
      // Pintar el polígono del predio como referencia (quizás con otro color)
      map.ubicarLotePorCoordenadas(predioData.coordenadasPoligono, predioData.direccion);
    }

    // TODO: Iterar sobre response.resultados y pintar ofertas si tuviéramos lat/lng válidas.
  }

  async onDescargarAvaluo(): Promise<void> {
    const predioData = this.stateService.predioData();
    if (!predioData?.chip) {
      alert('Error: No se puede descargar el avalúo sin información del predio.');
      return;
    }

    const tipoPredio = predioData.tipoPredio || 'OTRO';
    this.isDownloading.set(true);

    // Capturar imágenes de los mapas
    let imagenBase64: string | undefined;
    let imagenBase64Ofertas: string | undefined;

    try {
      if (this.mapPredio) {
        imagenBase64 = (await this.mapPredio.captureMapAsBase64()) || undefined;
      }
      if (this.mapOfertas) {
        imagenBase64Ofertas = (await this.mapOfertas.captureMapAsBase64()) || undefined;
      }
    } catch (error) {
      console.warn('Error capturando mapas:', error);
    }

    const datos = this.reporteService.generarDatosMockReporte(predioData.chip, tipoPredio);

    if (imagenBase64) datos.imagenBase64 = imagenBase64;
    if (imagenBase64Ofertas) datos.imagenBase64Ofertas = imagenBase64Ofertas;

    this.reporteService.generarReporteValorYa(datos).subscribe({
      next: (blob) => {
        this.isDownloading.set(false);
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
