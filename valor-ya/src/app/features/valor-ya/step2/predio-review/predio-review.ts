import { Component, inject, OnInit, signal, effect, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { ValorYaStepperService, ValorYaStep } from '../../services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../services/valor-ya-state.service';
import { PredioService } from '../../services/predio.service';
import { MCMValorYaService } from '../../services/mcm-valor-ya.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { AuthModalService } from '../../../../core/auth/services/auth-modal.service';
import { PredioData } from '../../models/predio-data.model';
import { StepperComponent } from '../../../../shared/components/ui/stepper/stepper';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';
import { PredioInfoCardComponent } from '../../components/predio-info-card/predio-info-card';
import { MapComponent } from '../../components/map';
import { ValoryaDescription } from '../../components/valorya-description/valorya-description';
import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { ContainerContentComponent } from '../../../../shared/components/layout/container-content/container-content';

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
  private readonly stepperService = inject(ValorYaStepperService);
  public stateService = inject(ValorYaStateService);
  private readonly predioService = inject(PredioService);
  private readonly mcmValorYaService = inject(MCMValorYaService);
  private readonly authService = inject(AuthService);
  private readonly authModalService = inject(AuthModalService);
  private mapComponent?: MapComponent;
  private loginSubscription?: Subscription;
  private readonly pendingContinue = signal(false);
  private mapInitialized = false;

  @ViewChild(MapComponent)
  set mapSetter(map: MapComponent) {
    this.mapComponent = map;
    if (map) {
      this.mapReady.set(true);
    }
  }

  public readonly predioData = signal<PredioData | undefined>(undefined);
  public readonly errorMessage = signal<string>('');
  public readonly isLoading = signal<boolean>(true);
  public readonly mapReady = signal<boolean>(false);
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

      if (data?.coordenadasPoligono && ready && !this.mapInitialized) {
        this.mapInitialized = true;
        this.updateMapWithData(data);
      }
    });
  }

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.SOLICITUD);

    this.loginSubscription = this.authModalService.onLoginSuccess$.subscribe(() => {
      if (this.pendingContinue()) {
        this.pendingContinue.set(false);
        // Después del login, ejecutar las validaciones completas de nuevo
        this.onContinuar();
      }
    });

    const tipo = this.stateService.tipoBusqueda();
    const valor = this.stateService.valorBusqueda();

    if (!tipo || !valor) {
      this.router.navigate(['/valor-ya/seleccionar']);
      return;
    }

    this.realizarConsulta(tipo, valor);
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }

  private updateMapWithData(data: PredioData): void {
    if (data.coordenadasPoligono) {
      this.mapComponent!.ubicarLotePorCoordenadas(
        data.coordenadasPoligono,
        data.direccion,
        data,
        this.stateService.valorYaResponse()
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
      case TipoBusqueda.FMI: {
        const [zona, matricula] = valor.split('-');
        if (!zona || !matricula) {
          this.errorMessage.set('El formato del FMI es inválido.');
          this.isLoading.set(false);
          return;
        }
        consulta$ = this.predioService.consultarPorFMI(zona, matricula);
        break;
      }
      default:
        this.router.navigate(['/valor-ya/seleccionar']);
        return;
    }

    consulta$.subscribe({
      next: (data) => {
        // Validar primero si el predio es elegible para ValorYa (solo PH con códigos 037, 038, 048, 049, 051)
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
      'Por el momento, ValorYa solo está disponible para ciertos tipos de predios (códigos de uso 037, 038, 048, 049, 051). ' +
        'Estamos trabajando para ampliar este servicio a otros tipos de predios.\n\n' +
        'Si tienes dudas, contáctanos:\n' +
        '📞 +57 601 234 7600 ext. 7600\n' +
        '✉️ buzon-correspondencia@catastrobogota.gov.co'
    );
    this.modalIconType.set('warning');
    this.modalButtonText.set('Nueva Consulta');
  }

  onNoEsCorrecta(): void {
    this.router.navigate(['/valor-ya/complementar']);
  }

  onContinuar(): void {
    const predio = this.predioData();

    if (!predio?.loteid || !predio?.chip) {
      this.errorMessage.set('No hay información completa del predio');
      return;
    }

    this.isValidatingAvailability.set(true);
    this.errorMessage.set('');

    this.validarValorYaVsAvaluo(predio);
  }

  private validarValorYaVsAvaluo(predio: PredioData): void {
    if (!predio.valorAvaluo) {
      this.mostrarErrorServicioNoDisponible();
      return;
    }

    const valorAvaluo = parseFloat(predio.valorAvaluo);
    if (isNaN(valorAvaluo) || valorAvaluo <= 0) {
      this.mostrarErrorServicioNoDisponible();
      return;
    }

    this.mcmValorYaService.calcularValorYa(predio.chip!).subscribe({
      next: (response) => {
        const valorYa = response.data?.VALOR_YA;
        if (!valorYa || isNaN(valorYa)) {
          this.mostrarErrorServicioNoDisponible();
          return;
        }

        if (valorYa < valorAvaluo) {
          this.isValidatingAvailability.set(false);
          this.showModal.set(true);
          this.modalTitle.set('Información no disponible');
          this.modalMessage.set(
            'No se puede mostrar resultado, No hay suficiente informacion para determinar el valor de su propiedad'
          );
          this.modalIconType.set('error');
          this.modalButtonText.set('Aceptar');
          return;
        }

        const codigoUso = predio.codigoUso;

        if (!this.predioService.esCodigoUsoValido(codigoUso)) {
          this.isValidatingAvailability.set(false);
          this.showPredioNoElegibleModal();
          return;
        }

        const requiereValidacionMCM = codigoUso === '037' || codigoUso === '038';

        if (requiereValidacionMCM) {
          this.validarConexionMCM(predio);
        } else {
          this.isValidatingAvailability.set(false);
          this.verificarAutenticacionYContinuar(predio);
        }
      },
      error: () => {
        this.mostrarErrorServicioNoDisponible();
      },
    });
  }

  private validarConexionMCM(predio: PredioData): void {
    this.mcmValorYaService.testConexion().subscribe({
      next: (conexionResponse) => {
        if (conexionResponse.estado !== 'CONECTADO') {
          this.mostrarErrorServicioNoDisponible();
          return;
        }
        this.validarMinimoOfertas(predio);
      },
      error: () => {
        this.mostrarErrorServicioNoDisponible();
      },
    });
  }

  private validarMinimoOfertas(predio: PredioData): void {
    this.mcmValorYaService.validarMinimoOfertas([predio.chip!]).subscribe({
      next: () => {
        this.isValidatingAvailability.set(false);
        this.verificarAutenticacionYContinuar(predio);
      },
      error: () => {
        this.mostrarErrorSinOfertas();
      },
    });
  }

  private verificarAutenticacionYContinuar(predio: PredioData): void {
    if (!this.authService.isAuthenticated()) {
      this.pendingContinue.set(true);
      this.authModalService.openLoginModal();
      return;
    }

    this.navegarAlPago(predio);
  }

  private navegarAlPago(predio: PredioData): void {
    localStorage.setItem('valorya-predio-data', JSON.stringify(predio));
    this.stepperService.setStep(ValorYaStep.PROCESO);
    this.router.navigate(['/valor-ya/pago']);
  }

  private mostrarErrorServicioNoDisponible(): void {
    this.isValidatingAvailability.set(false);
    this.showModal.set(true);
    this.modalTitle.set('Servicio no disponible');
    this.modalMessage.set(
      'El sistema de valoración no está disponible en este momento. Por favor, intente más tarde.'
    );
    this.modalIconType.set('error');
    this.modalButtonText.set('Aceptar');
  }

  private mostrarErrorSinOfertas(): void {
    this.isValidatingAvailability.set(false);
    this.showModal.set(true);
    this.modalTitle.set('Información no disponible');
    this.modalMessage.set(
      'No podemos calcular el valor de tu predio.\n\n' +
        'Contáctanos:\n\n' +
        '📞 +57 601 234 7600 ext. 7600\n\n' +
        '✉️ buzon-correspondencia@catastrobogota.gov.co'
    );
    this.modalIconType.set('error');
    this.modalButtonText.set('Aceptar');
  }

  onVolver(): void {
    this.stateService.reset();
    this.stepperService.setStep(ValorYaStep.INICIO);
    this.router.navigate(['/valor-ya/seleccionar']);
  }

  onCloseModal(): void {
    this.showModal.set(false);

    // Si el predio no es elegible, redirigir al step1
    if (!this.isPredioElegible()) {
      this.onVolver();
    }
  }
}
