import { Component, inject, OnInit, signal, effect, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { TestStepperService, TestStep } from '../../../../core/services/test-stepper.service';
import { TestStateService, TipoBusqueda } from '../../../../core/services/test-state.service';
import { PredioService } from '../../../../shared/services/predio.service';
import { McmService } from '../../../../shared/services/mcm.service';
import { MCMValorYaService } from '../../../../shared/services/mcm-valor-ya.service';
import { PredioData } from '../../../../core/models/predio-data.model';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
// import { ButtonComponent } from '../../../../shared/components/button/button';
import { PredioInfoCardComponent } from '../../../../shared/components/predio-info-card/predio-info-card';
import { MapComponent } from '../../../../shared/components/map';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';

@Component({
  selector: 'app-predio-review',
  imports: [
    StepperComponent,
    // ButtonComponent,
    PredioInfoCardComponent,
    MapComponent,
    ValoryaDescription,
    ModalComponent,
    ContainerContentComponent,
  ],
  templateUrl: './predio-review.html',
  styleUrls: ['./predio-review.css'],
})
export class PredioReviewComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private stepperService = inject(TestStepperService);
  public stateService = inject(TestStateService);
  private predioService = inject(PredioService);
  private mcmService = inject(McmService);
  private mcmTestService = inject(MCMValorYaService);

  private mapComponent?: MapComponent;

  @ViewChild(MapComponent)
  set mapSetter(map: MapComponent) {
    this.mapComponent = map;
    if (map) {
      this.mapReady.set(true);

      const data = this.predioData();
      if (data?.coordenadasPoligono) {
        this.updateMapWithData(data);
      }
    }
  }

  public readonly predioData = signal<PredioData | undefined>(undefined);
  public readonly errorMessage = signal<string>('');
  public readonly isLoading = signal<boolean>(true);
  public readonly mapReady = signal<boolean>(false);
  public readonly isProcessingMCM = signal<boolean>(false);
  public readonly isValidatingAvailability = signal<boolean>(false);
  public readonly showModal = signal<boolean>(false);
  public readonly modalMessage = signal<string>('');
  public readonly modalTitle = signal<string>('Advertencia');
  public readonly modalIconType = signal<'success' | 'warning' | 'error'>('warning');
  public readonly modalButtonText = signal<string>('Aceptar');

  constructor() {
    effect(() => {
      const data = this.predioData();
      const ready = this.mapReady();
      if (data?.coordenadasPoligono && ready) {
        this.updateMapWithData(data);
      }
    });
  }

  ngOnInit(): void {
    this.stepperService.setStep(TestStep.SOLICITUD);

    const tipo = this.stateService.tipoBusqueda();
    const valor = this.stateService.valorBusqueda();

    if (!tipo || !valor) {
      this.router.navigate(['/test/seleccionar']);
      return;
    }

    this.realizarConsulta(tipo, valor);
  }

  ngAfterViewInit(): void {}

  private updateMapWithData(data: PredioData): void {
    if (data.coordenadasPoligono) {
      this.mapComponent!.ubicarLotePorCoordenadas(
        data.coordenadasPoligono,
        data.loteid,
        data.direccion
      );
    }
  }
  private realizarConsulta(tipo: TipoBusqueda, valor: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.predioData.set(undefined);

    let consulta$: Observable<PredioData>;

    switch (tipo) {
      case TipoBusqueda.CHIP:
        consulta$ = this.predioService.consultarPorChip(valor);
        break;
      case TipoBusqueda.DIRECCION:
        consulta$ = this.predioService.consultarPorDireccion(valor);
        break;
      case TipoBusqueda.FMI:
        const [zona, matricula] = valor.split('-');
        consulta$ = this.predioService.consultarPorFMI(zona, matricula);
        break;
      default:
        this.router.navigate(['/test/seleccionar']);
        return;
    }

    consulta$.subscribe({
      next: (data) => {
        this.predioData.set(data);
        this.stateService.setPredioData(data, tipo, valor);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(
          error.message ||
            'Error al consultar el predio. Por favor, verifique los datos e intente nuevamente.'
        );
        this.isLoading.set(false);
      },
    });
  }

  // Informacion complementaria a discusion
  onNoEsCorrecta(): void {
    this.router.navigate(['/test/complementar']);
  }

  onContinuar(): void {
    const predio = this.predioData();

    if (!predio || !predio.loteid || !predio.chip) {
      this.errorMessage.set('No hay información completa del predio');
      return;
    }

    // For test feature, skip validation and go directly to procesarMCM
    this.procesarMCM(predio);

    /* Comentado para test - validación original de endpoint
    this.isValidatingAvailability.set(true);
    this.errorMessage.set('');

    this.mcmTestService.procesarChip(predio.chip).subscribe({
      next: (response) => {
        this.isValidatingAvailability.set(false);

        if (response.status !== 'success') {
          this.showModal.set(true);
          this.modalTitle.set('Error en verificación');
          this.modalMessage.set(
            'No se pudo verificar el status del predio. El cálculo del avalúo no está disponible en este momento. Por favor, intente más tarde.'
          );
          this.modalIconType.set('error');
          this.modalButtonText.set('Aceptar');
          return;
        }

        this.procesarMCM(predio);
      },
      error: (error) => {
        this.isValidatingAvailability.set(false);
        this.showModal.set(true);
        this.modalTitle.set('Error de conexión');
        this.modalMessage.set(
          'Error al verificar la disponibilidad del cálculo. El servicio no está disponible.'
        );
        this.modalIconType.set('error');
        this.modalButtonText.set('Aceptar');
      },
    });
    */
  }

  private procesarMCM(predio: PredioData): void {
    this.isProcessingMCM.set(true);
    this.errorMessage.set('');

    const tipoUnidad = this.stateService.tipoUnidadSeleccionada();

    this.mcmService
      .consultarMCM({
        loteId: predio.loteid!,
        datosEndpoint: predio,
        tipoUnidad: tipoUnidad?.descripcionUnidad,
      })
      .subscribe({
        next: (datosGuardados) => {
          this.stateService.setDatosComplementarios(datosGuardados);
          this.isProcessingMCM.set(false);
          this.stepperService.setStep(TestStep.PROCESO);
          this.router.navigate(['/test/pago']);
        },
        error: (error) => {
          this.errorMessage.set(`Error al procesar los datos: ${error.message}`);
          this.isProcessingMCM.set(false);
        },
      });
  }

  onVolver(): void {
    this.stateService.reset();
    this.stepperService.setStep(TestStep.INICIO);
    this.router.navigate(['/test/seleccionar']);
  }

  onCloseModal(): void {
    this.showModal.set(false);
  }
}
