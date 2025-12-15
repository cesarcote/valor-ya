import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ValorYaStateService } from '../../services/valor-ya-state.service';
import { ValorYaStepperService, ValorYaStep } from '../../services/valor-ya-stepper.service';
import { MCMValorYaService } from '../../services/mcm-valor-ya.service';
import { ReporteService } from '../../services/reporte.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingService } from '../../../../shared/services/loading.service';
import { StepperComponent } from '../../../../shared/components/ui/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';
import { ValoryaDescription } from '../../components/valorya-description/valorya-description';
import { ContainerContentComponent } from '../../../../shared/components/layout/container-content/container-content';
import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { LoadingComponent } from '../../../../shared/components/ui/loading/loading';
import { MapComponent } from '../../components/map';
import { CalcularValorYaResponse, MCMValorYAResultado } from '../../models/mcm-valor-ya.model';
import { PredioData } from '../../models/predio-data.model';

@Component({
  selector: 'app-result',
  imports: [
    CommonModule,
    StepperComponent,
    ButtonComponent,
    ValoryaDescription,
    ContainerContentComponent,
    MapComponent,
    ModalComponent,
    LoadingComponent,
  ],
  templateUrl: './result.html',
  styleUrls: ['./result.css'],
})
export class ResultComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly stepperService = inject(ValorYaStepperService);
  public readonly stateService = inject(ValorYaStateService);
  private readonly apiService = inject(MCMValorYaService);
  private readonly reporteService = inject(ReporteService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);

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

  // Modal de error
  showModal = signal(false);
  modalTitle = signal('');
  modalMessage = signal('');
  modalIconType = signal<'success' | 'warning' | 'error'>('error');
  modalButtonText = signal('Aceptar');

  valorYaResumen = signal<CalcularValorYaResponse | null>(null);
  ofertasResponse = signal<MCMValorYAResultado | null>(null);

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);

    const chip = this.stateService.predioData()?.chip;
    if (!chip) {
      console.error('No se encontró el CHIP del predio para consultar resultados');
      this.errorLoadingResult.set('No se encontró información del predio');
      return;
    }

    this.isLoadingResult.set(true);

    // Cargar datos del predio desde localStorage
    const storedData = localStorage.getItem('valorya-predio-data');

    if (storedData) {
      try {
        const predioData: PredioData = JSON.parse(storedData);
        if (predioData.chip === chip) {
          const tipoBusqueda = this.stateService.tipoBusqueda()!;
          this.stateService.setPredioData(predioData, tipoBusqueda, chip);
          this.loadValorYaResults(chip);
          return;
        }
      } catch (e) {
        console.warn('Error parsing stored predio data', e);
      }
    }

    // Si no hay datos en localStorage, mostrar error
    this.errorLoadingResult.set('Error al cargar la información del predio.');
    this.isLoadingResult.set(false);
  }

  private loadValorYaResults(chip: string): void {
    // Primero validar conexión con el servicio MCM
    this.apiService.testConexion().subscribe({
      next: (conexionResponse) => {
        if (conexionResponse.estado !== 'CONECTADO') {
          this.mostrarErrorSistema();
          return;
        }
        // Conexión OK, cargar resultados
        this.cargarResultadosValorYa(chip);
      },
      error: () => {
        this.mostrarErrorSistema();
      },
    });
  }

  private cargarResultadosValorYa(chip: string): void {
    // Cargar resumen para mostrar datos y generar reporte
    this.apiService.calcularValorYa(chip).subscribe({
      next: (resumen: CalcularValorYaResponse) => {
        this.valorYaResumen.set(resumen);
        this.isLoadingResult.set(false);
        this.tryRenderMapPredio();
      },
      error: (err: any) => {
        console.error('Error al obtener resultados del avalúo:', err);
        this.mostrarErrorSistema();
      },
    });

    // Cargar datos de ofertas/predios circundantes para el mapa
    this.apiService.procesarChip(chip).subscribe({
      next: (resp: MCMValorYAResultado) => {
        this.ofertasResponse.set(resp);
        this.tryRenderMapOfertas();
      },
      error: (err: any) => {
        console.warn('Error al obtener ofertas para el mapa:', err);
      },
    });
  }

  private tryRenderMapPredio(): void {
    if (
      this.mapPredio &&
      this.stateService.predioData()?.coordenadasPoligono &&
      this.valorYaResumen()
    ) {
      this.renderizarMapaPredio(this.mapPredio, this.stateService.predioData()!);
    }
  }

  private tryRenderMapOfertas(): void {
    const ofertas = this.ofertasResponse();
    if (this.mapOfertas && ofertas) {
      this.renderizarMapaOfertas(this.mapOfertas, ofertas);
    }
  }

  private renderizarMapaPredio(map: MapComponent, data: PredioData): void {
    map.ubicarLotePorCoordenadas(
      data.coordenadasPoligono!,
      data.direccion,
      data,
      this.valorYaResumen() ?? undefined
    );
  }

  private renderizarMapaOfertas(map: MapComponent, response: MCMValorYAResultado): void {
    if (!response.resultados || response.resultados.length === 0) return;

    const predioBase = response.resultados[0];
    const coloresOfertas = ['#2563eb', '#10b981', '#f9bc16ff', '#8b5cf6', '#f97316'];

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

    // 2. Marcadores de los Predios Circundantes (máximo 5)
    const prediosCircundantes = response.resultados.slice(0, 5);
    prediosCircundantes.forEach((oferta, index) => {
      map.addMarker({
        lat: oferta.POINT_Y_OFERTA,
        lng: oferta.POINT_X_OFERTA,
        tooltipContent: `<strong>Predio ${index + 1}</strong>`,
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
    const valorYaResponse = this.valorYaResumen();

    if (!predioData?.chip) {
      console.error('No se encontró el chip del predio');
      this.notificationService.error(
        'Error: No se puede descargar el avalúo sin información del predio.'
      );
      return;
    }

    if (!valorYaResponse) {
      console.error('No hay respuesta de ValorYa disponible');
      this.notificationService.error('Error: No se encontraron los datos del avalúo.');
      return;
    }

    this.isDownloading.set(true);
    this.loadingService.show();

    let imagenBase64 = '';
    let imagenBase64Ofertas = '';

    try {
      if (this.mapPredio) {
        imagenBase64 = (await this.mapPredio.captureMapAsBase64()) || '';
      }
      if (this.mapOfertas) {
        imagenBase64Ofertas = (await this.mapOfertas.captureMapAsBase64()) || '';
      }
    } catch (error) {
      console.warn('Error capturando mapas:', error);
    }

    const datos = {
      chip: predioData.chip || '',
      imagenBase64,
      imagenBase64Ofertas,
    };

    console.log('Generando reporte de avalúo para chip:', predioData.chip);

    this.reporteService.generarReporteValorYa(datos).subscribe({
      next: (blob: Blob) => {
        this.isDownloading.set(false);
        this.loadingService.hide();
        console.log('Reporte generado exitosamente');

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
        this.loadingService.hide();
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

  /**
   * Getter para el resumen de ValorYa
   */
  get resumen() {
    return this.valorYaResumen()?.data || null;
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

  private mostrarErrorSistema(): void {
    this.isLoadingResult.set(false);
    this.showModal.set(true);
    this.modalTitle.set('Error en el sistema');
    this.modalMessage.set(
      'Tu pago fue procesado exitosamente, pero el sistema de valoración presenta inconvenientes en este momento.\n\n' +
        'Contacta a nuestro equipo y atenderemos tu caso.\n\n' +
        '📞 +57 601 234 7600 ext. 7600\n\n' +
        '✉️ buzon-correspondencia@catastrobogota.gov.co'
    );
    this.modalIconType.set('error');
    this.modalButtonText.set('Entendido');
  }

  onCloseModal(): void {
    this.showModal.set(false);
  }
}
