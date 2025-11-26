import {
  Component,
  inject,
  OnInit,
  signal,
  effect,
  ViewChild,
  AfterViewInit,
  EnvironmentInjector,
  createComponent,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ValorYaStepperService, ValorYaStep } from '../../services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../services/valor-ya-state.service';
import { PredioService } from '../../../../shared/services/predio.service';
import { MCMValorYaService } from '../../services/mcm-valor-ya.service';
import { PredioData } from '../../../../core/models/predio-data.model';
import { StepperComponent } from '../../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { PredioInfoCardComponent } from '../../../../shared/components/predio-info-card/predio-info-card';
import { MapComponent } from '../../../../shared/components/map';
import { ValoryaDescription } from '../../../../shared/components/valorya-description/valorya-description';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ContainerContentComponent } from '../../../../shared/components/container-content/container-content';
import { MapCardComponent } from '../../../../shared/components/map-card/map-card.component';

@Component({
  selector: 'app-predio-review',
  imports: [
    StepperComponent,
    ButtonComponent,
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
  private stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);
  private predioService = inject(PredioService);
  private mcmValorYaService = inject(MCMValorYaService);
  private injector = inject(EnvironmentInjector);

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
    this.stepperService.setStep(ValorYaStep.SOLICITUD);

    const tipo = this.stateService.tipoBusqueda();
    const valor = this.stateService.valorBusqueda();

    if (!tipo || !valor) {
      this.router.navigate(['/valor-ya/seleccionar']);
      return;
    }

    this.realizarConsulta(tipo, valor);
  }

  ngAfterViewInit(): void {}
  private updateMapWithData(data: PredioData): void {
    if (data.coordenadasPoligono) {
      // Crear instancia del componente de tarjeta dinámicamente
      const componentRef = createComponent(MapCardComponent, {
        environmentInjector: this.injector,
      });

      componentRef.setInput('predioData', data);
      componentRef.setInput('valorYaData', this.stateService.valorYaResponse());

      componentRef.instance.close.subscribe(() => {
        this.mapComponent?.closeTooltip();
      });

      componentRef.changeDetectorRef.detectChanges();

      const popupContent = componentRef.location.nativeElement;

      this.mapComponent!.ubicarLotePorCoordenadas(
        data.coordenadasPoligono,
        data.direccion,
        popupContent
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

    localStorage.setItem('valorya-predio-data', JSON.stringify(predio));

    this.isValidatingAvailability.set(true);
    this.errorMessage.set('');

    // Paso 1: Verificar conexión con la API
    this.mcmValorYaService.testConexion().subscribe({
      next: (conexionResponse) => {
        if (conexionResponse.estado !== 'CONECTADO') {
          this.isValidatingAvailability.set(false);
          this.showModal.set(true);
          this.modalTitle.set('Servicio no disponible');
          this.modalMessage.set(
            'El sistema de valoración no está disponible en este momento. Por favor, intente más tarde.'
          );
          this.modalIconType.set('error');
          this.modalButtonText.set('Aceptar');
          return;
        }

        // Paso 2: Validar mínimo de ofertas
        this.mcmValorYaService.validarMinimoOfertas([predio.chip!]).subscribe({
          next: (validacionResponse) => {
            this.isValidatingAvailability.set(false);
            this.stepperService.setStep(ValorYaStep.PROCESO);
            this.router.navigate(['/valor-ya/pago']);
          },
          error: (error) => {
            this.isValidatingAvailability.set(false);
            this.showModal.set(true);
            this.modalTitle.set('Información no disponible');
            this.modalMessage.set(
              'No podemos calcular el valor de tu predio. Contáctanos al +57 601 234 7600 ext. 7600 o escríbenos a buzon-correspondencia@catastrobogota.gov.co'
            );
            this.modalIconType.set('error');
            this.modalButtonText.set('Aceptar');
          },
        });
      },
      error: (error) => {
        this.isValidatingAvailability.set(false);
        this.showModal.set(true);
        this.modalTitle.set('Servicio no disponible');
        this.modalMessage.set(
          'El sistema de valoración no está disponible en este momento. Por favor, intente más tarde.'
        );
        this.modalIconType.set('error');
        this.modalButtonText.set('Aceptar');
      },
    });
  }

  onVolver(): void {
    this.stateService.reset();
    this.stepperService.setStep(ValorYaStep.INICIO);
    this.router.navigate(['/valor-ya/seleccionar']);
  }

  onCloseModal(): void {
    this.showModal.set(false);
  }
}
