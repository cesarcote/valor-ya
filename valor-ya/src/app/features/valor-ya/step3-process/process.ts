import {
  Component,
  inject,
  OnInit,
  signal,
  effect,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ValorYaStepperService, ValorYaStep } from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import { PredioService } from '../../../shared/services/predio.service';
import { PredioData } from '../../../core/models/predio-data.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';
import { PredioInfoCardComponent } from '../../../shared/components/predio-info-card/predio-info-card';
import { MapComponent } from '../../../shared/components/map';

@Component({
  selector: 'app-process',
  imports: [StepperComponent, ButtonComponent, PredioInfoCardComponent, MapComponent],
  templateUrl: './process.html',
  styleUrls: ['./process.css'],
})
export class Process implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);
  private predioService = inject(PredioService);

  // State as Signals
  public readonly predioData = signal<PredioData | undefined>(undefined);
  public readonly errorMessage = signal<string>('');
  public readonly isLoading = signal<boolean>(true);

  private map!: MapComponent;

  constructor() {
    // Effect to update the map when predioData signal changes
    effect(() => {
      const data = this.predioData();
      if (data?.coordenadasPoligono && this.map) {
        this.map.ubicarLotePorCoordenadas(
          data.coordenadasPoligono,
          data.loteid
        );
      }
    });
  }

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.PROCESO);

    const tipo = this.stateService.tipoBusqueda();
    const valor = this.stateService.valorBusqueda();

    if (!tipo || !valor) {
      this.router.navigate(['/valor-ya/inicio']);
      return;
    }

    this.realizarConsulta(tipo, valor);

    this.map = new MapComponent();
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
        this.router.navigate(['/valor-ya/solicitud']);
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
    this.stepperService.setStep(ValorYaStep.RESPUESTA);
    this.router.navigate(['/valor-ya/respuesta']);
  }
}
