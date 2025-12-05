import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  signal,
  effect,
  EnvironmentInjector,
  createComponent,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { TestStepperService, TestStep } from '../../services/test-stepper.service';
import { TestStateService, TipoBusqueda } from '../../services/test-state.service';
import { PredioService } from '../../../../core/services/predio.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthModalService } from '../../../../core/services/auth-modal.service';
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
export class PredioReviewComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly stepperService = inject(TestStepperService);
  public readonly stateService = inject(TestStateService);
  private readonly predioService = inject(PredioService);
  private readonly authService = inject(AuthService);
  private readonly authModalService = inject(AuthModalService);
  private readonly injector = inject(EnvironmentInjector);
  private mapComponent?: MapComponent;
  private loginSubscription?: Subscription;
  private readonly pendingContinue = signal(false);

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
  public readonly isPredioElegible = signal<boolean>(true);
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

    this.loginSubscription = this.authModalService.onLoginSuccess$.subscribe(() => {
      if (this.pendingContinue()) {
        this.pendingContinue.set(false);
        this.onContinuar();
      }
    });

    const tipo = this.stateService.tipoBusqueda();
    const valor = this.stateService.valorBusqueda();

    if (!tipo || !valor) {
      this.router.navigate(['/test/seleccionar']);
      return;
    }

    this.realizarConsulta(tipo, valor);
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
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
      case TipoBusqueda.FMI: {
        const [zona, matricula] = valor.split('-');
        consulta$ = this.predioService.consultarPorFMI(zona, matricula);
        break;
      }
      default:
        this.router.navigate(['/test/seleccionar']);
        return;
    }

    consulta$.subscribe({
      next: (data) => {
        // Validar primero si el predio es elegible para ValorYa (solo PH con códigos 037 o 038)
        const esElegible = this.predioService.esCodigoUsoValido(data.codigoUso);
        this.isPredioElegible.set(esElegible);

        if (!esElegible) {
          this.isLoading.set(false);
          this.showPredioNoElegibleModal();
          return;
        }

        // Solo mostrar info del predio si es elegible
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

  private showPredioNoElegibleModal(): void {
    this.showModal.set(true);
    this.modalTitle.set('Predio no elegible');
    this.modalMessage.set(
      'Por el momento, ValorYa solo está disponible para predios en Propiedad Horizontal (apartamentos y casas PH). ' +
        'Estamos trabajando para ampliar este servicio a otros tipos de predios.\n' +
        'Si tienes dudas, contáctanos:' +
        '\n📞 +57 601 234 7600 ext. 7600' +
        '✉️ buzon-correspondencia@catastrobogota.gov.co'
    );
    this.modalIconType.set('warning');
    this.modalButtonText.set('Nueva Consulta');
  }

  onNoEsCorrecta(): void {
    this.router.navigate(['/test/complementar']);
  }

  onContinuar(): void {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.pendingContinue.set(true);
      this.authModalService.openLoginModal();
      return;
    }

    const predio = this.predioData();

    if (!predio?.loteid || !predio?.chip) {
      this.errorMessage.set('No hay información completa del predio');
      return;
    }

    localStorage.setItem('test-predio-data', JSON.stringify(predio));

    this.procesarMCM(predio);
  }

  private procesarMCM(predio: PredioData): void {
    this.isProcessingMCM.set(true);
    this.errorMessage.set('');

    const datosMock = {
      id: Date.now(),
      loteId: predio.loteid!,
      tipoPredio: predio?.tipoPredio || 'OTRO',
      numeroHabitaciones: undefined,
      numeroBanos: undefined,
      areaConstruida: undefined,
      edad: undefined,
      estrato: undefined,
      numeroAscensores: undefined,
      numeroParqueaderos: undefined,
      numeroDepositos: undefined,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    setTimeout(() => {
      this.stateService.setDatosComplementarios(datosMock);
      this.isProcessingMCM.set(false);
      this.stepperService.setStep(TestStep.PROCESO);
      this.router.navigate(['/test/pago']);
    }, 300);
  }

  onVolver(): void {
    this.stateService.reset();
    this.stepperService.setStep(TestStep.INICIO);
    this.router.navigate(['/test/seleccionar']);
  }

  onCloseModal(): void {
    this.showModal.set(false);

    // Si el predio no es elegible, redirigir al step1
    if (!this.isPredioElegible()) {
      this.onVolver();
    }
  }

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
}
