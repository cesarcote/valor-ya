import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TipoBusqueda, ValorYaStateService } from '../../services/valor-ya-state.service';
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

  public isMcmApplicable(): boolean {
    const codigoUso = this.stateService.predioData()?.codigoUso;
    return codigoUso === '037' || codigoUso === '038';
  }

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);

    this.isLoadingResult.set(true);

    // Cargar datos del predio desde localStorage
    const storedData = localStorage.getItem('valorya-predio-data');

    if (storedData) {
      try {
        const predioData: PredioData = JSON.parse(storedData);
        const chip = predioData.chip;
        if (chip) {
          const tipoBusqueda = this.stateService.tipoBusqueda() ?? TipoBusqueda.CHIP;
          this.stateService.setPredioData(predioData, tipoBusqueda, chip);
          this.loadValorYaResults(chip);
          return;
        }
      } catch (e) {
        console.warn('Error parsing stored predio data', e);
      }
    }

    // Fallback: usar chip restaurado desde sessionStorage (valorya-resultado-state)
    const chipFallback = this.stateService.predioData()?.chip;
    if (chipFallback) {
      this.loadValorYaResults(chipFallback);
      return;
    }

    // Si no hay datos en localStorage, mostrar error
    this.errorLoadingResult.set('Error al cargar la información del predio.');
    this.isLoadingResult.set(false);
  }

  private loadValorYaResults(chip: string): void {
    // Solo validar conexión MCM si aplica (códigos 037/038).
    if (!this.isMcmApplicable()) {
      this.cargarResultadosValorYa(chip);
      return;
    }

    this.apiService.testConexion().subscribe({
      next: (conexionResponse) => {
        if (conexionResponse.estado !== 'CONECTADO') {
          this.mostrarErrorSistema();
          return;
        }
        this.cargarResultadosValorYa(chip);
      },
      error: () => this.mostrarErrorSistema(),
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

    // Cargar datos de ofertas/predios circundantes SOLO si aplica MCM (037/038)
    if (this.isMcmApplicable()) {
      this.apiService.procesarChip(chip).subscribe({
        next: (resp: MCMValorYAResultado) => {
          this.ofertasResponse.set(resp);
          this.tryRenderMapOfertas();
        },
        error: (err: any) => {
          console.warn('Error al obtener ofertas para el mapa:', err);
        },
      });
    } else {
      this.ofertasResponse.set(null);
    }
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
    if (!this.isMcmApplicable()) return;
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
    const chipPredioEvaluado = this.stateService.predioData()?.chip?.trim();
    const chipPredio = predioBase.CHIP_PREDIO?.trim();

    map.clearMarker();

    map.addMarker(
      {
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
      },
      { replace: false }
    );

    const chipsVistos = new Set<string>();
    const coordenadasVistas = new Set<string>();
    const prediosCircundantes: typeof response.resultados = [];

    const descartes = {
      sinChipOferta: 0,
      sinCoordenadasValidas: 0,
      esPredioEvaluado: 0,
      repetido: 0,
      repetidoCoordenada: 0,
      agregado: 0,
    };

    for (const resultado of response.resultados) {
      if (prediosCircundantes.length >= 5) break;

      const chipOferta = resultado.CHIP_OFERTA?.trim();
      if (!chipOferta) {
        descartes.sinChipOferta += 1;
        continue;
      }

      const ofertaLat = Number(resultado.POINT_Y_OFERTA);
      const ofertaLng = Number(resultado.POINT_X_OFERTA);
      if (!Number.isFinite(ofertaLat) || !Number.isFinite(ofertaLng)) {
        descartes.sinCoordenadasValidas += 1;
        continue;
      }

      const keyCoordenada = `${ofertaLat.toFixed(6)},${ofertaLng.toFixed(6)}`;
      if (coordenadasVistas.has(keyCoordenada)) {
        descartes.repetidoCoordenada += 1;
        continue;
      }

      const esPredioEvaluado = chipOferta === chipPredio || chipOferta === chipPredioEvaluado;
      if (esPredioEvaluado) {
        descartes.esPredioEvaluado += 1;
        continue;
      }

      if (chipsVistos.has(chipOferta)) {
        descartes.repetido += 1;
        continue;
      }

      chipsVistos.add(chipOferta);
      coordenadasVistas.add(keyCoordenada);
      prediosCircundantes.push(resultado);
      descartes.agregado += 1;
    }

    if (prediosCircundantes.length < 5) {
      console.warn(
        `Solo se encontraron ${prediosCircundantes.length} predios circundantes únicos de ${response.resultados.length} resultados (se esperaban 5)`
      );
      console.log('CHIP predio evaluado:', chipPredioEvaluado);
      console.log('CHIP_PREDIO del primer resultado:', chipPredio);
      console.log(
        'CHIPs de ofertas filtradas:',
        prediosCircundantes.map((r) => r.CHIP_OFERTA?.trim())
      );
    }

    let numeroPredio = 1;
    for (const oferta of prediosCircundantes) {
      const ofertaLat = Number(oferta.POINT_Y_OFERTA);
      const ofertaLng = Number(oferta.POINT_X_OFERTA);
      if (!Number.isFinite(ofertaLat) || !Number.isFinite(ofertaLng)) continue;

      const index = numeroPredio - 1;
      map.addMarker(
        {
          lat: ofertaLat,
          lng: ofertaLng,
          tooltipContent: `<strong>Predio ${numeroPredio}</strong>`,
          tooltipOptions: {
            permanent: true,
            direction: 'top',
            className: 'offer-tooltip',
          },
          color: coloresOfertas[index % coloresOfertas.length],
          markerType: 'circle',
        },
        { replace: false }
      );

      numeroPredio += 1;
    }

    // 3. Centrar automáticamente mostrando predio + ofertas (igual que el botón de centrar)
    map.centerOnPredio(true);
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
        // Para el reporte: centrar antes de capturar (pero restaurar la vista original después)
        const predioViewBefore = this.mapPredio.getViewState();
        this.mapPredio.centerOnPredio(false);
        await new Promise((resolve) => setTimeout(resolve, 350));
        imagenBase64 = (await this.mapPredio.captureMapAsBase64()) || '';
        this.mapPredio.restoreViewState(predioViewBefore, false);
        if (!imagenBase64) {
          console.warn('No se pudo capturar el mapa del predio');
        }
      }
      if (this.mapOfertas && this.ofertasResponse()) {
        // Para el reporte: centrar antes de capturar (pero restaurar la vista original después)
        const ofertasViewBefore = this.mapOfertas.getViewState();
        this.mapOfertas.centerOnPredio(false);
        await new Promise((resolve) => setTimeout(resolve, 350));
        imagenBase64Ofertas = (await this.mapOfertas.captureMapAsBase64()) || '';
        this.mapOfertas.restoreViewState(ofertasViewBefore, false);
        if (!imagenBase64Ofertas) {
          console.warn('No se pudo capturar el mapa de ofertas');
        }
      }
    } catch (error) {
      console.warn('Error capturando mapas:', error);
    }

    if (!imagenBase64) {
      this.isDownloading.set(false);
      this.loadingService.hide();
      this.notificationService.error(
        'No se pudo capturar el mapa del predio. Por favor, intente nuevamente.'
      );
      return;
    }

    const datos = {
      chip: predioData.chip || '',
      imagenBase64: imagenBase64,
      imagenBase64Ofertas: imagenBase64Ofertas ? imagenBase64Ofertas : null,
    };

    console.log('Generando reporte de avalúo para chip:', predioData.chip);
    console.log('Datos del reporte:', {
      chip: datos.chip,
      tieneImagenPredio: !!datos.imagenBase64,
      tieneImagenOfertas: !!datos.imagenBase64Ofertas,
      tamañoImagenPredio: datos.imagenBase64?.length || 0,
      tamañoImagenOfertas: datos.imagenBase64Ofertas ? datos.imagenBase64Ofertas.length : 0,
    });

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
      error: async (error: any) => {
        this.isDownloading.set(false);
        this.loadingService.hide();
        console.error('Error generando reporte:', error);

        let errorMessage = 'Error generando reporte';
        if (error.error instanceof Blob) {
          try {
            const text = await error.error.text();
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('Mensaje del servidor:', errorData);
          } catch (e) {
            console.error('No se pudo leer el mensaje de error del servidor');
          }
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.notificationService.error(errorMessage);
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
