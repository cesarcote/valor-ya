import { Component, inject, OnInit, signal, effect, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import {
  ValorYaStepperService,
  ValorYaStep,
} from '../../../../core/services/valor-ya-stepper.service';
import {
  ValorYaStateService,
  TipoBusqueda,
} from '../../../../core/services/valor-ya-state.service';
import { PredioService } from '../../../../shared/services/predio.service';
import { McmService } from '../../../../shared/services/mcm.service';
import { MCMValorYaService } from '../../../../shared/services/mcm-valor-ya.service';
import { PredioData } from '../../../../core/models/predio-data.model';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { PredioInfoCardComponent } from '../../../../shared/components/predio-info-card/predio-info-card';
import { MapComponent } from '../../../../shared/components/map';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';

@Component({
  selector: 'app-predio-review',
  imports: [
    StepperComponent,
    ButtonComponent,
    PredioInfoCardComponent,
    MapComponent,
    ValoryaDescription,
  ],
  templateUrl: './predio-review.html',
  styleUrls: ['./predio-review.css'],
})
export class PredioReviewComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);
  private predioService = inject(PredioService);
  private mcmService = inject(McmService);
  private mcmValorYaService = inject(MCMValorYaService);

  private mapComponent?: MapComponent;

  @ViewChild(MapComponent)
  set mapSetter(map: MapComponent) {
    this.mapComponent = map;
    if (map) {
      this.mapReady.set(true);
      // If we already have data, update the map immediately
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

  constructor() {
    // Effect to update the map when predioData or mapReady changes
    effect(() => {
      const data = this.predioData();
      const ready = this.mapReady();
      if (data?.coordenadasPoligono && ready) {
        this.updateMapWithData(data);
      }
    });
  }

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.SOLICITUD);

    const tipo = this.stateService.tipoBusqueda();
    const valor = this.stateService.valorBusqueda();

    if (!tipo || !valor) {
      this.router.navigate(['/valor-ya/seleccionar']);
      return;
    }

    this.realizarConsulta(tipo, valor);
  }

  ngAfterViewInit(): void {
    // Map ready is now set via the setter when the component is available
  }

  private updateMapWithData(data: PredioData): void {
    if (data.coordenadasPoligono) {
      this.mapComponent!.ubicarLotePorCoordenadas(data.coordenadasPoligono, data.loteid);
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
        this.router.navigate(['/valor-ya/seleccionar']);
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

  onNoEsCorrecta(): void {
    this.router.navigate(['/valor-ya/complementar']);
  }

  onContinuar(): void {
    const predio = this.predioData();

    if (!predio || !predio.loteid || !predio.chip) {
      this.errorMessage.set('No hay información completa del predio');
      return;
    }

    // Primero validar disponibilidad del cálculo
    this.isValidatingAvailability.set(true);
    this.errorMessage.set('');

    this.mcmValorYaService.procesarChip(predio.chip).subscribe({
      next: (response) => {
        this.isValidatingAvailability.set(false);

        if (response.status !== 'success') {
          this.errorMessage.set(
            'El cálculo del avalúo no está disponible en este momento. Por favor, intente más tarde.'
          );
          return;
        }

        // Si la validación es exitosa, proceder con la consulta MCM
        this.procesarMCM(predio);
      },
      error: (error) => {
        this.isValidatingAvailability.set(false);
        this.errorMessage.set(
          'Error al verificar la disponibilidad del cálculo. El servicio no está disponible.'
        );
      },
    });
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
          this.stepperService.setStep(ValorYaStep.PROCESO);
          this.router.navigate(['/valor-ya/pago']);
        },
        error: (error) => {
          this.errorMessage.set(`Error al procesar los datos: ${error.message}`);
          this.isProcessingMCM.set(false);
        },
      });
  }

  onVolver(): void {
    this.stateService.reset();
    this.stepperService.setStep(ValorYaStep.INICIO);
    this.router.navigate(['/valor-ya/seleccionar']);
  }
}
