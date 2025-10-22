import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ValorYaStepperService, ValorYaStep } from '../../../core/services/valor-ya-stepper.service';
import { ValorYaStateService, TipoBusqueda } from '../../../core/services/valor-ya-state.service';
import { PredioService } from '../../../shared/services/predio.service';
import { PredioData } from '../../../core/models/predio-data.model';
import { StepperComponent } from '../../../shared/components/stepper/stepper';
import { ButtonComponent } from '../../../shared/components/button/button';
import { PredioInfoCardComponent } from '../../../shared/components/predio-info-card/predio-info-card';

@Component({
  selector: 'app-process',
  imports: [StepperComponent, ButtonComponent, PredioInfoCardComponent],
  templateUrl: './process.html',
  styleUrls: ['./process.css'],
})
export class ProcessComponent implements OnInit {
  private router = inject(Router);
  private stepperService = inject(ValorYaStepperService);
  private stateService = inject(ValorYaStateService);
  private predioService = inject(PredioService);

  predioData?: PredioData;
  errorMessage: string = '';

  ngOnInit(): void {
    this.stepperService.setStep(ValorYaStep.PROCESO);

    const state = this.stateService.getState();

    if (!state.tipoBusqueda || !state.valorBusqueda) {
      this.router.navigate(['/valor-ya/inicio']);
      return;
    }

    this.realizarConsulta(state.tipoBusqueda, state.valorBusqueda);
  }

  realizarConsulta(tipo: TipoBusqueda, valor: string): void {
    this.errorMessage = '';

    let consulta$;

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
        this.predioData = data;
        this.stateService.setPredioData(data, tipo, valor);
      },
      error: (error) => {
        console.error('Error al consultar el predio:', error);
        this.errorMessage = 'Error al consultar el predio. Por favor, intente nuevamente.';
      },
    });
  }

  onVolver(): void {
    this.stateService.setMostrarResultado(false);
    this.stepperService.setStep(ValorYaStep.SOLICITUD);
    this.router.navigate(['/valor-ya/solicitud']);
  }

  onNuevaBusqueda(): void {
    this.stateService.setMostrarResultado(false);
    this.stepperService.setStep(ValorYaStep.SOLICITUD);
    this.router.navigate(['/valor-ya/solicitud']);
  }

  onContinuar(): void {
    this.stepperService.setStep(ValorYaStep.RESPUESTA);
    this.router.navigate(['/valor-ya/respuesta']);
  }
}
