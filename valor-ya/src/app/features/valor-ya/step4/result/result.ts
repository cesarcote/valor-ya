import {
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
  EnvironmentInjector,
  createComponent,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ValorYaStateService } from '../../services/valor-ya-state.service';
import { MCMValorYAResultado } from '../../../../core/models/mcm-valor-ya.model';
import { ValorYaStepperService, ValorYaStep } from '../../services/valor-ya-stepper.service';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { MCMValorYaService } from '../../services/mcm-valor-ya.service';
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
export class ResultComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);
  private apiService = inject(MCMValorYaService);
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
    this.stepperService.setStep(ValorYaStep.RESPUESTA);

    const chip = this.stateService.predioData()?.chip;
    if (!chip) {
      console.error('No se encontró el CHIP del predio para consultar resultados');
      this.errorLoadingResult.set('No se encontró información del predio');
      return;
    }

    this.isLoadingResult.set(true);

    // 1. Intentar cargar desde localStorage primero (Optimización)
    const storedData = localStorage.getItem('valorya-predio-data');
    if (storedData) {
      try {
        const predioData: PredioData = JSON.parse(storedData);
        if (predioData.chip === chip) {
          this.stateService.setPredioData(predioData, this.stateService.tipoBusqueda()!, chip);
          this.loadValorYaResults(chip);
          return;
        }
      } catch (e) {
        console.warn('Error parsing stored predio data', e);
      }
    }

    // 2. Si no hay datos en local, consultar API (Fallback)
    this.predioService.consultarPorChip(chip).subscribe({
      next: (predioData) => {
        this.stateService.setPredioData(predioData, this.stateService.tipoBusqueda()!, chip);
        this.loadValorYaResults(chip);
      },
      error: (err) => {
        console.error('Error al consultar datos del predio:', err);
        this.errorLoadingResult.set('Error al cargar la información del predio.');
        this.isLoadingResult.set(false);
      },
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    // Limpiar datos temporales al salir del paso de resultados
    localStorage.removeItem('valorya-predio-data');
  }

  private loadValorYaResults(chip: string): void {
    this.apiService.procesarChip(chip).subscribe({
      next: (resp) => {
        this.apiResponse.set(resp);
        this.stateService.setValorYaResponse(resp);
        this.isLoadingResult.set(false);

        // Intentar renderizar mapas
        this.tryRenderMapPredio();
        this.tryRenderMapOfertas();
      },
      error: (err) => {
        console.error('Error al obtener resultados del avalúo:', err);
        this.errorLoadingResult.set('No se pudieron cargar los resultados del avalúo');
        this.isLoadingResult.set(false);
      },
    });
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

    this.isDownloading.set(true);

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
