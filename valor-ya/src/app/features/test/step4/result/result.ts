import {
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
  EnvironmentInjector,
  createComponent,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TestStateService } from '../../services/test-state.service';
import { TestStepperService, TestStep } from '../../services/test-stepper.service';
import { ReporteService } from '../../../../core/services/reporte.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { PredioService } from '../../../../core/services/predio.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';
import { MCMValorYAResultado } from '../../../../core/models/mcm-valor-ya.model';
import { MCM_MOCK_RESPONSE } from '../../data/mcm-mock';
import { MapComponent } from '../../../../shared/components/map';
import { MapCardComponent } from '../../../../shared/components/map-card/map-card.component';
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
export class ResultComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly stepperService = inject(TestStepperService);
  public readonly stateService = inject(TestStateService);
  private readonly reporteService = inject(ReporteService);
  private readonly notificationService = inject(NotificationService);
  private readonly injector = inject(EnvironmentInjector);
  private readonly predioService = inject(PredioService);

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

    const storedData = localStorage.getItem('test-predio-data');
    if (storedData) {
      try {
        const predioData: PredioData = JSON.parse(storedData);
        if (predioData.chip === chip) {
          this.stateService.setPredioData(predioData, this.stateService.tipoBusqueda()!, chip);
          this.loadValorYaResults(chip, predioData);
          return;
        }
      } catch (e) {
        console.warn('Error parsing stored predio data', e);
      }
    }

    // 2. (Fallback)
    this.predioService.consultarPorChip(chip).subscribe({
      next: (predioData) => {
        this.stateService.setPredioData(predioData, this.stateService.tipoBusqueda()!, chip);
        this.loadValorYaResults(chip, predioData);
      },
      error: (err) => {
        console.error('Error al consultar datos del predio:', err);
        this.errorLoadingResult.set('Error al cargar la información del predio.');
        this.isLoadingResult.set(false);
      },
    });
  }

  private loadValorYaResults(chip: string, predioData: PredioData): void {
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

      this.tryRenderMapPredio();
      this.tryRenderMapOfertas();
    }, 1000);
  }

  ngOnDestroy(): void {
    localStorage.removeItem('test-predio-data');
  }

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
    if (!response.resultados || response.resultados.length === 0) return;

    const predioBase = response.resultados[0];
    const coloresOfertas = ['#2563eb', '#10b981', '#f9bc16ff'];

    // 1. Marcador del Predio a Valorar (Pin Rojo)
    map.addMarker({
      lat: predioBase.POINT_Y_PREDIO,
      lng: predioBase.POINT_X_PREDIO,
      tooltipContent: '<strong>Predio a Valorar</strong>',
      tooltipOptions: {
        permanent: true,
        direction: 'top',
        offset: [0, -35],
      },
      color: '#e3192f',
      markerType: 'pin',
    });

    // 2. Marcadores de las Ofertas (Círculos de colores)
    response.resultados.forEach((oferta, index) => {
      map.addMarker({
        lat: oferta.POINT_Y_OFERTA,
        lng: oferta.POINT_X_OFERTA,
        tooltipContent: `<strong>Oferta ${index + 1}</strong>`,
        tooltipOptions: {
          permanent: true,
          direction: 'top',
          className: 'offer-tooltip',
        },
        color: coloresOfertas[index % coloresOfertas.length],
        markerType: 'circle',
      });
    });

    // 3. Centrar el mapa en el predio
    map.setView(predioBase.POINT_Y_PREDIO, predioBase.POINT_X_PREDIO, 16);
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

    const datos = this.reporteService.generarDatosReporte(predioData.chip, tipoPredio, this.apiResponse()!);

    if (imagenBase64) datos.imagenBase64 = imagenBase64;
    if (imagenBase64Ofertas) datos.imagenBase64Ofertas = imagenBase64Ofertas;

    this.reporteService.generarReporteValorYa(datos).subscribe({
      next: (blob: Blob) => {
        this.isDownloading.set(false);
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ValorYa-${predioData.chip}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        globalThis.URL.revokeObjectURL(url);
        this.notificationService.success('¡Avalúo descargado exitosamente!');
      },
      error: (error: any) => {
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
